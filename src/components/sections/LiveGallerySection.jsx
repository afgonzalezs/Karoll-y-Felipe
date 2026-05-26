import AnimatedSection from "../AnimatedSection";

export default function LiveGallerySection({ isLive, eventDateLabel }) {
  return (
    <AnimatedSection id="galeria-vivo" className="section-highlight">
      <div className="container">
        <h2>Galeria en vivo 📸</h2>
        <p className="story-intro">
          Queremos ver nuestra boda desde tus ojos. Durante el evento podras subir tus fotos aqui y construir juntos
          este recuerdo.
        </p>
        {!isLive ? (
          <div className="live-gallery-locked">
            <p>Esta seccion se habilita el dia de la boda ({eventDateLabel}).</p>
          </div>
        ) : (
          <div className="live-gallery-active">
            <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
              <label className="full">
                Subir foto
                <input type="file" accept="image/*" capture="environment" />
              </label>
              <label>
                Nombre (opcional)
                <input type="text" placeholder="Tu nombre" />
              </label>
              <label>
                Mensaje (opcional)
                <input type="text" placeholder="Un mensaje corto" />
              </label>
              <button type="submit" className="btn">
                Compartir foto
              </button>
            </form>
          </div>
        )}
        <div className="qr-tip">
          <p>Escanea y comparte tus fotos con nosotros 📲</p>
        </div>
      </div>
    </AnimatedSection>
  );
}
