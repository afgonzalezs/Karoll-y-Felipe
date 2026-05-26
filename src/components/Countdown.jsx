import { useState, useEffect } from "react";

const WEDDING = new Date("2026-09-21T18:00:00-05:00").getTime();

export default function Countdown() {
  const [time, setTime] = useState(calcTime());

  function calcTime() {
    const diff = WEDDING - Date.now();
    if (diff <= 0) return null;
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const id = setInterval(() => setTime(calcTime()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return <p className="countdown-done">¡Es hoy! 🎉</p>;

  const units = [
    { label: "días",     value: time.days },
    { label: "horas",    value: time.hours },
    { label: "minutos",  value: time.minutes },
    { label: "segundos", value: time.seconds },
  ];

  return (
    <div className="countdown">
      {units.map(({ label, value }) => (
        <div key={label} className="countdown-unit">
          <span className="countdown-num">{String(value).padStart(2, "0")}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
