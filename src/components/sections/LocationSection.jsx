import AnimatedSection from "../AnimatedSection";

export default function LocationSection({ location }) {
  return (
    <AnimatedSection id="ubicacion" className="container">
      <h2>Ubicacion</h2>
      <div className="map-wrap">
        <iframe
          title="Mapa de la boda"
          src={location.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="map-actions">
        <a className="btn" href={location.mapsUrl} target="_blank" rel="noopener noreferrer">
          Como llegar
        </a>
      </div>
      <p className="section-note">{location.indications}</p>
    </AnimatedSection>
  );
}
