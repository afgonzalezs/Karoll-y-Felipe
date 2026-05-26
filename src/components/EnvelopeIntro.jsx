export default function EnvelopeIntro({
  invitedName,
  isUntying,
  isOpened,
  isAnimatingOpen,
  envelopeScreenClass,
  onOpen,
}) {
  const wrapperClass = ["envelope-wrapper", isUntying ? "untying" : "", isOpened ? "opened" : ""]
    .filter(Boolean).join(" ");

  return (
    <section className={envelopeScreenClass} aria-label="Abrir invitación">
      <div className={wrapperClass}>
        <p className="envelope-kicker">Invitación especial para</p>
        <p className="env-guest-name">{invitedName}</p>

        <div className="envelope-img-wrapper">
          <img src="/envelope.png" className="envelope-closed-img" alt="" />
          <img src="/envelope-open.png" className="envelope-open-img" alt="" />
          <button
            className="nombres-btn"
            type="button"
            aria-label="Abrir invitación"
            onClick={onOpen}
            disabled={isAnimatingOpen}
          >
            <img src="/nombres.png" className="nombres-img" alt="Felipe y Karoll" />
          </button>
        </div>

        <p className="env-date-strip">21 · 09 · 2026</p>
      </div>
    </section>
  );
}
