// pages/api/check.js
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// 数字を0〜100に正規化
function normalizeScore(scoreText) {
  if (!scoreText) return 70; // デフォルト
  const match = scoreText.match(/(\d{1,3})/); // 0〜999までの数字
  if (!match) return 70;
  let score = parseInt(match[1], 10);
  if (score > 100) score = 100;
  if (score < 0) score = 0;
  return score;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { text, context } = req.body || {};
    if (!text) return res.status(400).json({ error: "No text provided" });

    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(500).json({ error: "GITHUB_TOKEN is not set" });

    const endpoint = "https://models.github.ai/inference";
    const model = "microsoft/Phi-4-mini-reasoning";

    const prompt = `
以下の英文を評価し、JSON形式で返してください。
{
  "corrected": "自然で文法的に正しい英文",
  "score": "100点満点のスコア（整数）",
  "advice": "改善点のアドバイス（日本語で、丁寧に、中学生向けにわかりやすく）。200文字程度で、問題の意図も踏まえてください。"
}
問題文: "${context || ""}"
ユーザーの回答: "${text}"
`;

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        top_p: 1.0,
        max_tokens: 1536,
        model: model
      }
    });

    if (isUnexpected(response)) throw response.body.error;

    const rawText = response.body.choices[0].message.content;

    let result = { corrected: text, score: 70, advice: "AIによる添削結果です。" };

    try {
      // JSONパースを試みる
      const parsed = JSON.parse(rawText.trim());
      result.corrected = parsed.corrected || text;
      result.advice = parsed.advice || "AIによる添削結果です。";
      result.score = typeof parsed.score === "number" ? parsed.score : normalizeScore(parsed.score);
    } catch {
      // JSON パースできなければ、スコアだけ正規化
      result.corrected = rawText.trim() || text;
      result.score = normalizeScore(rawText);
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
