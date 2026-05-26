import AnimatedSection from "../AnimatedSection";

export default function CoupleGallerySection({ photos }) {
  return (
    <AnimatedSection id="galeria-couple" className="container">
      <h2>Nuestras fotos</h2>
      <p className="story-intro">
        Reemplaza estas fotos subiendo tus archivos a <code>src/assets/photos/gallery</code>.
      </p>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <figure className="photo-card" key={`${photo}-${index}`}>
            <img src={photo} alt={`Recuerdo ${index + 1}`} loading="lazy" />
          </figure>
        ))}
      </div>
    </AnimatedSection>
  );
}
