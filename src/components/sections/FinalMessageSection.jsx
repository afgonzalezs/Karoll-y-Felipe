import AnimatedSection from "../AnimatedSection";

export default function FinalMessageSection({ message }) {
  return (
    <AnimatedSection className="section-highlight">
      <div className="container final-message">
        <h2>Mensaje final</h2>
        <p>{message}</p>
      </div>
    </AnimatedSection>
  );
}
