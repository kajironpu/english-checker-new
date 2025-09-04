import { useState, useEffect } from 'react';

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

export default function EnglishChecker() {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [corrected, setCorrected] = useState('');
  const [score, setScore] = useState('');
  const [advice, setAdvice] = useState('');
  const [showHints, setShowHints] = useState(false);

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

  // 簡単な添削機能（実装例）
  const handleCheck = () => {
    if (!userAnswer.trim()) {
      alert('回答を入力してください。');
      return;
    }

    // 基本的なスコアリング（実際にはAI APIを使用）
    const wordCount = userAnswer.trim().split(/\s+/).length;
    let baseScore = Math.min(wordCount * 10, 70); // 語数ベース
    
    // 基本的な文法チェック（例）
    const hasCapital = /^[A-Z]/.test(userAnswer.trim());
    const hasPeriod = /\.$/.test(userAnswer.trim());
    
    if (hasCapital) baseScore += 10;
    if (hasPeriod) baseScore += 10;
    
    // 簡単な修正例
    let correctedText = userAnswer;
    if (!hasCapital) {
      correctedText = correctedText.charAt(0).toUpperCase() + correctedText.slice(1);
    }
    if (!hasPeriod) {
      correctedText += '.';
    }

    setCorrected(correctedText);
    setScore(`${Math.min(baseScore, 100)}/100`);
    
    // レベル別のアドバイス
    const level = currentProblem?.level || 'beginner';
    let adviceText = '';
    
    switch(level) {
      case 'beginner':
        adviceText = 'Good start! Try to use simple present or past tense.';
        break;
      case 'intermediate':
        adviceText = 'Nice work! Consider using more complex sentence structures.';
        break;
      case 'advanced':
        adviceText = 'Well done! Focus on nuanced expressions and advanced vocabulary.';
        break;
    }
    
    setAdvice(adviceText);
  };

  // 次の問題
  const handleNext = () => {
    loadRandomProblem();
    setUserAnswer('');
    setCorrected('');
    setScore('');
    setAdvice('');
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    },
    problem: {
      backgroundColor: '#e8f4fd',
      padding: '15px',
      borderRadius: '8px',
      borderLeft: '4px solid #2196F3',
      marginBottom: '20px',
      fontSize: '18px',
      lineHeight: '1.5',
      fontWeight: '500',
    },
    levelBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white',
      marginLeft: '10px',
      backgroundColor: currentProblem?.level === 'beginner' ? '#4CAF50' : 
                      currentProblem?.level === 'intermediate' ? '#FF9800' : '#F44336'
    },
    hints: {
      backgroundColor: '#fff3cd',
      padding: '10px',
      borderRadius: '5px',
      marginBottom: '15px',
      fontSize: '14px',
      border: '1px solid #ffeaa7'
    },
    userAnswer: {
      width: '100%',
      padding: '12px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      resize: 'vertical',
      minHeight: '80px',
      marginBottom: '10px',
    },
    buttonRow: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      alignItems: 'center'
    },
    voiceInputBtn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    hintsBtn: {
      background: '#ffc107',
      color: '#212529',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px',
      marginBottom: '30px',
    },
    checkBtn: {
      flex: 1,
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      color: 'white',
    },
    nextBtn: {
      flex: 1,
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      color: '#8b4513',
      fontWeight: 'bold',
    },
    result: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{textAlign: 'center', color: '#333', marginBottom: '30px'}}>英作文・添削ツール</h2>
      
      <h3 style={{color: '#555', margin: '20px 0 10px 0'}}>
        問題
        {currentProblem && (
          <span style={styles.levelBadge}>
            {currentProblem.level.toUpperCase()}
          </span>
        )}
      </h3>
      
      <div style={styles.problem}>
        {currentProblem ? currentProblem.japanese : '問題を読み込んでいます...'}
      </div>

      {showHints && currentProblem && (
        <div style={styles.hints}>
          <strong>ヒント:</strong> {currentProblem.hints.join(', ')}
        </div>
      )}
      
      <h3 style={{color: '#555', margin: '20px 0 10px 0'}}>あなたの答え</h3>
      <textarea
        style={styles.userAnswer}
        placeholder="ここに英語で答えてください"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />
      
      <div style={styles.buttonRow}>
        <button style={styles.voiceInputBtn} onClick={handleVoiceInput}>
          🎤 音声入力
        </button>
        {currentProblem && (
          <button 
            style={styles.hintsBtn} 
            onClick={() => setShowHints(!showHints)}
          >
            💡 {showHints ? 'ヒントを隠す' : 'ヒントを見る'}
          </button>
        )}
      </div>
      
      <div style={styles.buttonGroup}>
        <button style={styles.checkBtn} onClick={handleCheck}>
          添削する
        </button>
        <button style={styles.nextBtn} onClick={handleNext}>
          次の問題
        </button>
      </div>
      
      {(corrected || score || advice) && (
        <div style={styles.result}>
          {corrected && <p><strong>添削後:</strong> <span style={{color: '#28a745', fontWeight: 500}}>{corrected}</span></p>}
          {score && <p><strong>スコア:</strong> <span style={{color: '#007bff', fontWeight: 'bold', fontSize: '18px'}}>{score}</span></p>}
          {advice && <p><strong>アドバイス:</strong> <span style={{color: '#6f42c1', fontStyle: 'italic'}}>{advice}</span></p>}
        </div>
      )}
    </div>
  );
}