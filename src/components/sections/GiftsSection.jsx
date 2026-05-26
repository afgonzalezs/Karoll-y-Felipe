import AnimatedSection from "../AnimatedSection";

export default function GiftsSection({ gifts }) {
  return (
    <AnimatedSection id="regalos" className="container">
      <h2>Regalos</h2>
      <p className="story-intro">Tu presencia es nuestro mejor regalo.</p>
      <div className="cards cards-compact">
        {gifts.map((gift) => (
          <article className="card" key={gift.title}>
            <h3>{gift.title}</h3>
            <p>{gift.description}</p>
          </article>
        ))}
      </div>
    </AnimatedSection>
  );
}
