


import { useState, useEffect } from "react";

const ZONES = {
  colombia: { label: "Colombia",  tz: "America/Bogota",    flag: "🇨🇴" },
  belgium:  { label: "Bélgica",   tz: "Europe/Brussels",   flag: "🇧🇪" },
  poland:   { label: "Polonia",   tz: "Europe/Warsaw",     flag: "🇵🇱" },
};

const fmt = (tz) =>
  new Date().toLocaleTimeString("es", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export default function WorldClock({ country }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remote = ZONES[country];

  return (
    <div className="world-clock">
      <p className="wc-title">Hora en tiempo real</p>
      <div className="wc-clocks">
        <div className="wc-item">
          <span className="wc-flag">{ZONES.colombia.flag}</span>
          <span className="wc-label">{ZONES.colombia.label}</span>
          <span className="wc-time">{fmt(ZONES.colombia.tz)}</span>
        </div>
        {remote && (
          <div className="wc-item">
            <span className="wc-flag">{remote.flag}</span>
            <span className="wc-label">{remote.label}</span>
            <span className="wc-time">{fmt(remote.tz)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
