import AnimatedSection from "../AnimatedSection";

export default function GuestbookSection() {
  return (
    <AnimatedSection id="guestbook" className="section-highlight">
      <div className="container">
        <h2>Palabras que guardaremos siempre 💞</h2>
        <p className="story-intro">
          Nuestro amor ha tenido pausas y reencuentros... y hoy queremos guardar tambien tus palabras.
        </p>
        <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
          <label>
            Nombre
            <input type="text" placeholder="Tu nombre" />
          </label>
          <label className="full">
            Mensaje
            <textarea rows="4" placeholder="Escribe tu mensaje para nosotros" />
          </label>
          <label className="full">
            Consejo o deseo (opcional)
            <textarea rows="3" placeholder="Un consejo bonito para nuestro matrimonio" />
          </label>
          <button type="submit" className="btn">
            Guardar mensaje
          </button>
        </form>
      </div>
    </AnimatedSection>
  );
}
