import { useRef, useState, useEffect } from "react";

export default function MusicPlayer({ src, autoPlayTrigger, inline = false, dark = false }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (autoPlayTrigger && src && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [autoPlayTrigger, src]);

  if (!src) return null;

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        className={`music-player-btn${isPlaying ? " is-playing" : ""}${inline ? " music-player-inline" : ""}${dark ? " dark" : ""}`}
        onClick={toggle}
        aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
        title={isPlaying ? "Pausar música" : "Reproducir música"}
      >
        {isPlaying ? (
          <span className="music-bars" aria-hidden="true">
            <span /><span /><span />
          </span>
        ) : (
          <span aria-hidden="true">♪</span>
        )}
      </button>
    </>
  );
}
