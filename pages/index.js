import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 問題データベース
const problemsDB = [
  {
    id: 1,
    japanese: "私は毎朝7時に起きます。",
    level: "beginner",
    hints: ["wake up", "every morning", "at 7 o'clock"]
  },
  {
    id: 2,
    japanese: "昨日、友達と映画を見に行きました。",
    level: "beginner",
    hints: ["yesterday", "went to see", "with my friend"]
  },
  {
    id: 3,
    japanese: "来年、日本を訪問する予定です。",
    level: "intermediate",
    hints: ["next year", "plan to", "visit"]
  },
  {
    id: 4,
    japanese: "もし時間があったら、その本を読んでみたいです。",
    level: "intermediate",
    hints: ["if I had time", "would like to", "try reading"]
  },
  {
    id: 5,
    japanese: "彼女は環境問題について深く考えている。",
    level: "advanced",
    hints: ["environmental issues", "thinking deeply", "about"]
  }
];

function EnglishChecker() {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [corrected, setCorrected] = useState('');
  const [score, setScore] = useState('');
  const [advice, setAdvice] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 初回読み込み時に問題をロード
  useEffect(() => {
    loadRandomProblem();
  }, []);

  // ランダムな問題を読み込み
  const loadRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * problemsDB.length);
    setCurrentProblem(problemsDB[randomIndex]);
    setShowHints(false);
  };

  // 音声入力機能
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(prevAnswer => prevAnswer + ' ' + transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert('音声認識エラー: ' + event.error);
      };
      
      recognition.start();
    } else {
      alert('お使いのブラウザは音声認識をサポートしていません。Chrome等をご利用ください。');
    }
  };

  // AI APIを使った添削機能
  const handleCheck = async () => {
    if (!userAnswer.trim()) {
      alert('回答を入力してください。');
      return;
    }

    setIsChecking(true);
    setCorrected('');
    setScore('');
    setAdvice('添削中...');

    try {
      // 問題のコンテキストを追加
      const context = currentProblem ? 
        `元の日本語文: "${currentProblem.japanese}"
レベル: ${currentProblem.level}
期待される表現のヒント: ${currentProblem.hints.join(', ')}` : '';

      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userAnswer.trim(),
          context: context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API呼び出しに失敗しました');
      }

      const result = await response.json();
      
      setCorrected(result.corrected);
      setScore(`${result.score}/100`);
      setAdvice(result.advice);

    } catch (error) {
      console.error('添削エラー:', error);
      setAdvice(`エラーが発生しました: ${error.message}`);
      
      // フォールバック: 簡単な修正を表示
      let fallbackCorrection = userAnswer;
      if (!/^[A-Z]/.test(userAnswer.trim())) {
        fallbackCorrection = fallbackCorrection.charAt(0).toUpperCase() + fallbackCorrection.slice(1);
      }
      if (!/\.$/.test(userAnswer.trim())) {
        fallbackCorrection += '.';
      }
      setCorrected(fallbackCorrection);
      setScore('--/100');
    } finally {
      setIsChecking(false);
    }
  };

  // 次の問題
  const handleNext = () => {
    loadRandomProblem();
    setUserAnswer('');
    setCorrected('');
    setScore('');
    setAdvice('');
  };

  // スタイルオブジェクト（isCheckingに依存するため、コンポーネント内で定義）
  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  };

  const problemStyle = {
    backgroundColor: '#e8f4fd',
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '4px solid #2196F3',
    marginBottom: '20px',
    fontSize: '18px',
    lineHeight: '1.5',
    fontWeight: '500',
  };

  const levelBadgeStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    marginLeft: '10px',
    backgroundColor: currentProblem?.level === 'beginner' ? '#4CAF50' : 
                    currentProblem?.level === 'intermediate' ? '#FF9800' : '#F44336'
  };

  const hintsStyle = {
    backgroundColor: '#fff3cd',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    fontSize: '14px',
    border: '1px solid #ffeaa7'
  };

  const userAnswerStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    resize: 'vertical',
    minHeight: '80px',
    marginBottom: '10px',
  };

  const buttonRowStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    alignItems: 'center'
  };

  const voiceInputBtnStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const hintsBtnStyle = {
    background: '#ffc107',
    color: '#212529',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
  };

  const checkBtnStyle = {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: isChecking ? 'not-allowed' : 'pointer',
    background: isChecking ? '#cccccc' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: 'white',
    opacity: isChecking ? 0.7 : 1,
  };

  const nextBtnStyle = {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    color: '#8b4513',
    fontWeight: 'bold',
  };

  const resultStyle = {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  };

  return (
    <div style={containerStyle}>
      <h2 style={{textAlign: 'center', color: '#333', marginBottom: '30px'}}>英作文・添削ツール</h2>
      
      <h3 style={{color: '#555', margin: '20px 0 10px 0'}}>
        問題
        {currentProblem && (
          <span style={levelBadgeStyle}>
            {currentProblem.level.toUpperCase()}
          </span>
        )}
      </h3>
      
      <div style={problemStyle}>
        {currentProblem ? currentProblem.japanese : '問題を読み込んでいます...'}
      </div>

      {showHints && currentProblem && (
        <div style={hintsStyle}>
          <strong>ヒント:</strong> {currentProblem.hints.join(', ')}
        </div>
      )}
      
      <h3 style={{color: '#555', margin: '20px 0 10px 0'}}>あなたの答え</h3>
      <textarea
        style={userAnswerStyle}
        placeholder="ここに英語で答えてください"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />
      
      <div style={buttonRowStyle}>
        <button style={voiceInputBtnStyle} onClick={handleVoiceInput}>
          🎤 音声入力
        </button>
        {currentProblem && (
          <button 
            style={hintsBtnStyle} 
            onClick={() => setShowHints(!showHints)}
          >
            💡 {showHints ? 'ヒントを隠す' : 'ヒントを見る'}
          </button>
        )}
      </div>
      
      <div style={buttonGroupStyle}>
        <button 
          style={checkBtnStyle} 
          onClick={handleCheck}
          disabled={isChecking}
        >
          {isChecking ? '添削中...' : '添削する'}
        </button>
        <button style={nextBtnStyle} onClick={handleNext}>
          次の問題
        </button>
      </div>
      
      {(corrected || score || advice) && (
        <div style={resultStyle}>
          {corrected && <p><strong>添削後:</strong> <span style={{color: '#28a745', fontWeight: 500}}>{corrected}</span></p>}
          {score && <p><strong>スコア:</strong> <span style={{color: '#007bff', fontWeight: 'bold', fontSize: '18px'}}>{score}</span></p>}
          {advice && <p><strong>アドバイス:</strong> <span style={{color: '#6f42c1', fontStyle: 'italic'}}>{advice}</span></p>}
        </div>
      )}
    </div>
  );
}

// SSRを無効にして、クライアントサイドでのみレンダリング
export default dynamic(() => Promise.resolve(EnglishChecker), {
  ssr: false
});