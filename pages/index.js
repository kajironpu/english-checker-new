import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function EnglishChecker() {
  const [problem, setProblem] = useState('問題を読み込んでいます...');
  const [userAnswer, setUserAnswer] = useState('');
  const [corrected, setCorrected] = useState('');
  const [score, setScore] = useState('');
  const [advice, setAdvice] = useState('');

  // 音声入力機能
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(transcript);
      };
      recognition.start();
    } else {
      alert('音声認識がサポートされていません');
    }
  };

  // 添削機能（仮の実装）
  const handleCheck = () => {
    setCorrected('Sample corrected text');
    setScore('85/100');
    setAdvice('Good job! Consider using more varied vocabulary.');
  };

  // 次の問題
  const handleNext = () => {
    setProblem('新しい問題がロードされました...');
    setUserAnswer('');
    setCorrected('');
    setScore('');
    setAdvice('');
  };

  return (
    <div className={styles.container}>
      <h2>英作文・添削ツール</h2>
      <h3>問題</h3>
      <p className={styles.problem}>{problem}</p>
      
      <h3>あなたの答え</h3>
      <textarea
        className={styles.userAnswer}
        placeholder="ここに英語で答えてください"
        rows="2"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />
      
      <button className={styles.voiceInputBtn} onClick={handleVoiceInput}>
        🎤 音声入力
      </button>
      
      <div className={styles.buttonGroup}>
        <button className={styles.checkBtn} onClick={handleCheck}>
          添削する
        </button>
        <button className={styles.nextBtn} onClick={handleNext}>
          次の問題
        </button>
      </div>
      
      <div className={styles.result}>
        <p><strong>添削後:</strong> <span className={styles.corrected}>{corrected}</span></p>
        <p><strong>スコア:</strong> <span className={styles.score}>{score}</span></p>
        <p><strong>アドバイス:</strong> <span className={styles.advice}>{advice}</span></p>
      </div>
    </div>
  );
}