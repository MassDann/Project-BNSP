"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expireAt: Date | string;
  onExpire?: () => void;
  className?: string;
  expiredText?: string;
  prefixNode?: React.ReactNode;
}

export default function CountdownTimer({ 
  expireAt, 
  onExpire, 
  className = "text-yellow-500 font-mono font-bold",
  expiredText = "Kedaluwarsa",
  prefixNode
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const targetDate = new Date(expireAt).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff <= 0) {
        setHasExpired(true);
        setTimeLeft(0);
        if (onExpire && !hasExpired) {
          onExpire();
        }
        return 0;
      }
      return diff;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expireAt, onExpire, hasExpired]);

  if (timeLeft === null) return <span className="opacity-50 text-xs">...</span>;

  if (hasExpired) {
    return <span className="text-red-500 font-bold px-2 py-1 bg-red-500/10 rounded border border-red-500/20 text-xs">{expiredText}</span>;
  }

  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex items-center gap-2">
      {prefixNode}
      <span className={className}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
