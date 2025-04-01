import React, { useEffect, useState } from 'react';
import '../styles/Counters.css';

const Counter = ({ endValue, label, showPlus }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = endValue / 100; // Ajusta el incremento según la velocidad que desees
    const interval = setInterval(() => {
      start += increment;
      if (start >= endValue) {
        start = endValue;
        clearInterval(interval);
      }
      setCount(Math.floor(start));
    }, 15); // Tiempo en ms, ajusta para acelerar o desacelerar

    return () => clearInterval(interval);
  }, [endValue]);

  return (
    <div className="counter-box">
      <div className="counter-value">{showPlus ? '+' : ''}{count}</div>
      <div className="counter-label">{label}</div>
    </div>
  );
};

export default Counter;
