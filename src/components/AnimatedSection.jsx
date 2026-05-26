import { useReveal } from "../hooks/useReveal";

export default function AnimatedSection({ id, className = "", children, delay = 0 }) {
  const { ref, isVisible } = useReveal();

  return (
    <section
      id={id}
      ref={ref}
      className={`section ${className} reveal-block ${isVisible ? "is-visible" : ""}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {children}
    </section>
  );
}
