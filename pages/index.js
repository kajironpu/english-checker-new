import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const problemsDB = [ /* ← ここはそのまま */ ];

function EnglishCheckerComponent() {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [corrected, setCorrected] = useState('');
  const [score, setScore] = useState('');
  const [advice, setAdvice] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    loadRandomProblem();
  }, []);

  const loadRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * problemsDB.length);
    setCurrentProblem(problemsDB[randomIndex]);
    setShowHints(false);
  };

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('お使いのブラウザは音声認識をサポートしていません。Chrome等をご利用ください。');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer((prev) => prev + ' ' + transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      alert('音声認識エラー: ' + event.error);
    };

    recognition.start();
  };

  const handleCheck = async () => {
    if (!userAnswer.trim()) return alert('回答を入力してください。');

    setIsChecking(true);
    setCorrected('');
    setScore('');
    setAdvice('添削中...');

    try {
      const context = currentProblem
        ? `元の日本語文: "${currentProblem.japanese}" レベル: ${currentProblem.level} 期待される表現のヒント: ${currentProblem.hints.join(', ')}`
        : '';

      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userAnswer.trim(), context }),
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
      setAdvice(`エラー: ${error.message}`);
      let fallback = userAnswer;
      if (!/^[A-Z]/.test(userAnswer.trim()))
        fallback = fallback.charAt(0).toUpperCase() + fallback.slice(1);
      if (!/\.$/.test(userAnswer.trim())) fallback += '.';
      setCorrected(fallback);
      setScore('--/100');
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = () => {
    loadRandomProblem();
    setUserAnswer('');
    setCorrected('');
    setScore('');
    setAdvice('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>英作文・添削ツール</h2>

      {/* 問題表示 */}
      <h3>
        問題{' '}
        {currentProblem && (
          <span
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              borderRadius: '12px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor:
                currentProblem.level === 'beginner'
                  ? '#4CAF50'
                  : currentProblem.level === 'intermediate'
                  ? '#FF9800'
                  : '#F44336',
            }}
          >
            {currentProblem.level.toUpperCase()}
          </span>
        )}
      </h3>
      <div
        style={{
          backgroundColor: '#e8f4fd',
          padding: '15px',
          borderRadius: '8px',
          borderLeft: '4px solid #2196F3',
          marginBottom: '20px',
        }}
      >
        {currentProblem ? currentProblem.japanese : '問題を読み込んでいます...'}
      </div>

      {showHints && currentProblem && (
        <div
          style={{
            backgroundColor: '#fff3cd',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid #ffeaa7',
          }}
        >
          <strong>ヒント:</strong> {currentProblem.hints.join(', ')}
        </div>
      )}

      {/* 回答エリア */}
      <h3>あなたの答え</h3>
      <textarea
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px',
          minHeight: '80px',
          marginBottom: '10px',
        }}
        placeholder="ここに英語で答えてください"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <button
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onClick={handleVoiceInput}
        >
          🎤 音声入力
        </button>
        {currentProblem && (
          <button
            style={{
              background: '#ffc107',
              color: '#212529',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onClick={() => setShowHints(!showHints)}
          >
            💡 {showHints ? 'ヒントを隠す' : 'ヒントを見る'}
          </button>
        )}
      </div>

      {/* ボタン群 */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            background: isChecking
              ? '#cccccc'
              : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            opacity: isChecking ? 0.7 : 1,
          }}
          onClick={handleCheck}
          disabled={isChecking}
        >
          {isChecking ? '添削中...' : '添削する'}
        </button>
        <button
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            color: '#8b4513',
            fontWeight: 'bold',
          }}
          onClick={handleNext}
        >
          次の問題
        </button>
      </div>

      {/* 添削結果 */}
      {(corrected || score || advice) && (
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
          }}
        >
          {corrected && (
            <p>
              <strong>添削後:</strong>{' '}
              <span style={{ color: '#28a745', fontWeight: 500 }}>{corrected}</span>
            </p>
          )}
          {score && (
            <p>
              <strong>スコア:</strong>{' '}
              <span style={{ color: '#007bff', fontWeight: 'bold', fontSize: '18px' }}>
                {score}
              </span>
            </p>
          )}
          {advice && (
            <p>
              <strong>アドバイス:</strong>{' '}
              <span style={{ color: '#6f42c1', fontStyle: 'italic' }}>{advice}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// SSRを完全に無効化
export default dynamic(() => Promise.resolve(EnglishCheckerComponent), { ssr: false });
