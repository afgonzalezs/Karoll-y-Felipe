import AnimatedSection from "../AnimatedSection";

export default function EventDetailsSection({ event }) {
  return (
    <AnimatedSection id="detalles" className="section-highlight">
      <div className="container">
        <h2>Detalles del evento</h2>
        <div className="cards">
          <article className="card">
            <h3>Tipo</h3>
            <p>{event.type}</p>
          </article>
          <article className="card">
            <h3>Fecha</h3>
            <p>{event.dateLongLabel}</p>
          </article>
          <article className="card">
            <h3>Hora</h3>
            <p>{event.timeLabel}</p>
          </article>
          <article className="card">
            <h3>Lugar</h3>
            <p>{event.placeName}</p>
            <p>{event.address}</p>
          </article>
          <article className="card card-note">
            <h3>Nota</h3>
            <p>{event.note}</p>
          </article>
        </div>
      </div>
    </AnimatedSection>
  );
}
