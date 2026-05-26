import AnimatedSection from "../AnimatedSection";

export default function DressCodeSection({ dressCode }) {
  return (
    <AnimatedSection id="dress-code" className="section-highlight">
      <div className="container">
        <h2>Dress code</h2>
        <div className="cards cards-compact">
          <article className="card">
            <h3>Estilo</h3>
            <p>{dressCode.style}</p>
          </article>
          <article className="card">
            <h3>Colores sugeridos</h3>
            <p>{dressCode.colors}</p>
          </article>
        </div>
      </div>
    </AnimatedSection>
  );
}
