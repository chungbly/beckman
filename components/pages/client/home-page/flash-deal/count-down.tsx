"use client";
import moment from "moment-timezone";
import { useEffect, useState } from "react";

interface CountdownProps {
  endTime: string;
}

export default function Countdown({ endTime }: CountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const now = moment.tz("Asia/Ho_Chi_Minh");
      const localEndTime = moment.tz(endTime, "Asia/Ho_Chi_Minh");
      const difference = localEndTime.diff(now);
      if (difference > 0) {
        const totalHours = Math.floor(difference / (1000 * 60 * 60));
        setTimeLeft({
          hours: totalHours,
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!mounted) {
    return (
      <div className="flex gap-1 text-sm sm:text-lg">
        <span className="bg-white text-black px-2 py-1 rounded">00</span>
        <span className="text-black py-1">:</span>
        <span className="bg-white text-black px-2 py-1 rounded">00</span>
        <span className="text-black py-1">:</span>
        <span className="bg-white text-black px-2 py-1 rounded">00</span>
      </div>
    );
  }

  return (
    <div className="flex gap-1 text-sm sm:text-lg">
      <span className="bg-white text-black px-2 py-1 rounded">
        {String(timeLeft.hours).padStart(2, "0")}
      </span>
      <span className="text-black py-1">:</span>
      <span className="bg-white text-black px-2 py-1 rounded">
        {String(timeLeft.minutes).padStart(2, "0")}
      </span>
      <span className="text-black py-1">:</span>
      <span className="bg-white text-black px-2 py-1 rounded">
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
