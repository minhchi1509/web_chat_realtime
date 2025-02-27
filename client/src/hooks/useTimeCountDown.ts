import { useCallback, useEffect, useState } from 'react';

const useTimeCountDown = (time: number) => {
  const [remainingTime, setRemainingTime] = useState<number>(time);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (remainingTime > 0) {
      timer = setTimeout(() => {
        setRemainingTime((prevRemainingTime) => prevRemainingTime - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [remainingTime]);

  useEffect(() => {
    setRemainingTime(time);
  }, [time]);

  return { remainingTime, formatTime: formatTime(remainingTime) };
};

export default useTimeCountDown;
