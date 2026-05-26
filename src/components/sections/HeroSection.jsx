export default function HeroSection({ content, coverPhoto }) {
  return (
    <header className="hero hero-cover">
      <div className="overlay"></div>
      <div className="hero-photo" style={{ backgroundImage: `linear-gradient(180deg, rgba(42, 23, 43, 0.24), rgba(42, 23, 43, 0.42)), url("${coverPhoto}")` }} aria-hidden="true"></div>
      <nav className="top-nav container">
        <span className="brand">FK</span>
        <a href="#rsvp" className="btn btn-small">
          Confirmar asistencia
        </a>
      </nav>
      <div className="hero-content container">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="event-date">{content.dateLabel}</p>
        <p className="subtitle">{content.subtitle}</p>
        <a href="#detalles" className="btn">
          Ver detalles
        </a>
      </div>
    </header>
  );
}
