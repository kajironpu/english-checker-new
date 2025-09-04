"use client";

import { useState, useEffect } from 'react';

// 問題データベース
const problemsDB = [
  { id: 1, japanese: "私は毎朝7時に起きます。", level: "beginner", hints: ["wake up", "every morning", "at 7 o'clock"] },
  { id: 2, japanese: "昨日、友達と映画を見に行きました。", level: "beginner", hints: ["yesterday", "went to see", "with my friend"] },
  { id: 3, japanese: "来年、日本を訪問する予定です。", level: "intermediate", hints: ["next year", "plan to", "visit"] },
  { id: 4, japanese: "もし時間があったら、その本を読んでみたいです。", level: "intermediate", hints: ["if I had time", "would like to", "try reading"] },
  { id: 5, japanese: "彼女は環境問題について深く考えている。", level: "advanced", hints: ["environmental issues", "thinking deeply", "about"] }
];

export default function EnglishChecker() {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [corrected, setCorrected] = useState('');
  const [score, setScore] = useState('');
  const [advice, setAdvice] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 初回ロードで問題をセット
  useEffect(() => {
    loadRandomProblem();
  }, []);

  const loadRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * problemsDB.length);
    setCurrentProblem(problemsDB[randomIndex]);
    setShowHints(false);
  };

  // 音声入力
  const handleVoiceInput = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(prev => prev + ' ' + transcript);
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

  // 添削API呼び出し
  const handleCheck = async () => {
    if (!userAnswer.trim()) return alert('回答を入力してください。');

    setIsChecking(true);
    setCorrected('');
    setScore('');
    setAdvice('添削中...');

    try {
      const context = currentProblem ? 
        `元の日本語文: "${currentProblem.japanese}" レベル: ${currentProblem.level} 期待される表現のヒント: ${currentProblem.hints.join(', ')}` : '';

      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userAnswer.trim(), context })
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
      if (!/^[A-Z]/.test(userAnswer.trim())) fallback = fallback.charAt(0).toUpperCase() + fallback.slice(1);
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
      <h2 style={{textAlign: 'center', marginBottom: '30px'}}>英作文・添削ツール</h2>
      
      <h3>
        問題 {currentProblem && (
          <span style={{
            marginLeft: '10px',
            padding: '4px 8px',
            borderRadius: '12px',
            color:'white',
            fontSize:'12px',
            fontWeight:'bold',
            backgroundColor: currentProblem.level==='beginner'
              ?'#4CAF50'
              :currentProblem.level==='intermediate'
              ?'#FF9800'
              :'#F44336'
          }}>
            {currentProblem.level.toUpperCase()}
          </span>
        )}
      </h3>

      <div style={{backgroundColor:'#e8f4fd', padding:'15px', borderRadius:'8px', borderLeft:'4px solid #2196F3', marginBottom:'20px'}}>
        {currentProblem ? currentProblem.japanese : '問題を読み込んでいます...'}
      </div>

      {showHints && currentProblem && (
        <div style={{backgroundColor:'#fff3cd', padding:'10px', borderRadius:'5px', marginBottom:'15px', border:'1px solid #ffeaa7'}}>
          <strong>ヒント:</strong> {currentProblem.hints.join(', ')}
        </div>
      )}
      
      <h3>あなたの答え</h3>
      <textarea
        style={{ width:'100%', padding:'12px', border:'2px solid #ddd', borderRadius:'8px', fontSize:'16px', minHeight:'80px', marginBottom:'10px' }}
        placeholder="ここに英語で答えてください"
        value={userAnswer}
        onChange={(e)=>setUserAnswer(e.target.value)}
      />

      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', alignItems:'center' }}>
        <button
          style={{ background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', border:'none', padding:'8px 15px', borderRadius:'20px', cursor:'pointer', fontSize:'14px' }}
          onClick={handleVoiceInput}
        >
          🎤 音声入力
        </button>
        {currentProblem && (
          <button
            style={{background:'#ffc107', color:'#212529', border:'none', padding:'8px 15px', borderRadius:'20px', cursor:'pointer', fontSize:'14px'}}
            onClick={()=>setShowHints(!showHints)}
          >
            💡 {showHints ? 'ヒントを隠す' : 'ヒントを見る'}
          </button>
        )}
      </div>

      <div style={{ display:'flex', gap:'15px', marginBottom:'30px' }}>
        <button
          style={{ flex:1, padding:'12px 20px', border:'none', borderRadius:'8px', fontSize:'16px', cursor:isChecking?'not-allowed':'pointer', background:isChecking?'#cccccc':'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color:'white', opacity:isChecking?0.7:1 }}
          onClick={handleCheck}
          disabled={isChecking}
        >
          {isChecking ? '添削中...' : '添削する'}
        </button>
        <button
          style={{ flex:1, padding:'12px 20px', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', background:'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color:'#8b4513', fontWeight:'bold' }}
          onClick={handleNext}
        >
          次の問題
        </button>
      </div>

      {(corrected || score || advice) && (
        <div style={{ backgroundColor:'#f8f9fa', padding:'20px', borderRadius:'8px', border:'1px solid #e9ecef' }}>
          {corrected && <p><strong>添削後:</strong> <span style={{color:'#28a745', fontWeight:500}}>{corrected}</span></p>}
          {score && <p><strong>スコア:</strong> <span style={{color:'#007bff', fontWeight:'bold', fontSize:'18px'}}>{score}</span></p>}
          {advice && <p><strong>アドバイス:</strong> <span style={{color:'#6f42c1', fontStyle:'italic'}}>{advice}</span></p>}
        </div>
      )}
    </div>
  );
}
