import { useMemo, useEffect, useState } from "react";
import { siteContent } from "./config/siteContent";
import { useEnvelope } from "./hooks/useEnvelope";
import { getInvitedName } from "./utils/getInvitedName";
import EnvelopeIntro from "./components/EnvelopeIntro";
import Countdown from "./components/Countdown";
import MapView from "./components/MapView";
import PinterestLink from "./components/PinterestLink";

const c = siteContent;

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`top-nav${scrolled ? " scrolled" : ""}`}>
      <span className={`nav-brand${scrolled ? " dark" : ""}`}>F &amp; K</span>
      <a href="#rsvp" className={`btn-nav${scrolled ? " dark" : ""}`}>Confirmar</a>
    </nav>
  );
}

export default function App() {
  const invitedName = useMemo(() => getInvitedName(), []);
  const { isUntying, isOpened, hideEnvelope, isAnimatingOpen, envelopeScreenClass, invitationClass, openInvitation } = useEnvelope();
  useReveal();

  return (
    <>
      {!hideEnvelope && (
        <EnvelopeIntro
          invitedName={invitedName}
          isUntying={isUntying}
          isOpened={isOpened}
          isAnimatingOpen={isAnimatingOpen}
          envelopeScreenClass={envelopeScreenClass}
          onOpen={openInvitation}
        />
      )}

      {/* Slides fijas en el fondo — se ven detrás de la hero section */}
      <div className="hero-slide" style={{ backgroundImage: "url('/photos/proposal.jpg')" }} />
      <div className="hero-slide" style={{ backgroundImage: "url('/photos/kiss.jpg')", backgroundPosition: "center 30%" }} />
      <div className="hero-slide" style={{ backgroundImage: "url('/photos/engaged.jpg')", backgroundPosition: "center top" }} />

      <div className={invitationClass}>
        <Nav />

        {/* ── HERO (transparente — muestra las slides de fondo) ── */}
        <section className="hero-section">
          <div className="hero-body">
            <div className="hero-collage">
              <div className="hc-row">
                <span className="hc-date">21 · 09</span>
              </div>
              <div className="hc-row">
                <h1 className="hc-name1">Felipe</h1>
              </div>
              <div className="hc-row hc-row-start">
                <span className="hc-small">Se casan</span>
                <h1 className="hc-name2">y Karoll</h1>
                <span className="hc-spark">✦</span>
              </div>
            </div>
            <p className="hero-caption">
              Nos emociona anunciarte que celebraremos nuestra boda el 21 de septiembre de 2026 en Bogotá. Sería un honor tenerte presente en este día tan especial para nosotros.
            </p>

          </div>
          <div className="scroll-cue" aria-hidden="true">
            <div className="scroll-line" />
          </div>
        </section>

        {/* ── HISTORIA (bold section morado) ── */}
        <section className="bold-section">
          <img src="/photos/embrace.jpg" className="bold-photo-strip" alt="" />
          <div className="bold-strip-header">
            <span className="bold-strip-title">Nuestra historia</span>
            <a href="#rsvp" className="bold-strip-link">Confirmar asistencia &rarr;</a>
          </div>
          <span className="bold-section-deco" aria-hidden="true">2026</span>
          <div className="bold-section-content">
            <span className="bold-eyebrow reveal">Desde 2013</span>
            <h2 className="bold-title reveal d1">
              Una historia de amor<br />que empieza desde siempre.
            </h2>
            {c.story.paragraphs.map((p, i) => (
              <p key={i} className={`bold-text reveal d${i + 2}`}>{p}</p>
            ))}
          </div>
          <div className="story-photos reveal d3">
            <img src="/photos/selfie.jpg"  className="story-img" alt="" loading="lazy" />
            <img src="/photos/embrace.jpg" className="story-img tall" alt="" loading="lazy" />
          </div>
        </section>

        {/* ── PHOTO CAROUSEL ── */}
        <div className="photo-grid" ref={el => {
          if (!el) return;
          let isDown = false, startX, scrollLeft;
          el.onmousedown = e => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
          el.onmouseleave = () => isDown = false;
          el.onmouseup = () => isDown = false;
          el.onmousemove = e => { if (!isDown) return; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5; };
        }}>
          <img src="/photos/kiss.jpg"         alt="" loading="lazy" />
          <img src="/photos/engaged.jpg"     alt="" loading="lazy" />
          <img src="/photos/proposal.jpg"    alt="" loading="lazy" />
          <img src="/photos/ocean.jpg"       alt="" loading="lazy" />
          <img src="/photos/ring.jpg"        alt="" loading="lazy" />
          <img src="/photos/pool.jpg"        alt="" loading="lazy" />
          <img src="/photos/mountains.jpg"   alt="" loading="lazy" />
          <img src="/photos/lights.jpg"      alt="" loading="lazy" />
          <img src="/photos/viewpoint.jpg"   alt="" loading="lazy" />
          <img src="/photos/tender.jpg"      alt="" loading="lazy" />
          <img src="/photos/park.jpg"        alt="" loading="lazy" />
          <img src="/photos/ocean.jpg"       alt="" loading="lazy" />
          <img src="/photos/warm.jpg"        alt="" loading="lazy" />
          <img src="/photos/graduation2.jpg" alt="" loading="lazy" />
          <img src="/photos/lake.jpg"        alt="" loading="lazy" />
          <img src="/photos/redlips.jpg"     alt="" loading="lazy" />
          <img src="/photos/colombia.jpg"    alt="" loading="lazy" />
          <img src="/photos/beachkiss.jpg"   alt="" loading="lazy" />
          <img src="/photos/cenote.jpg"      alt="" loading="lazy" />
          <img src="/photos/engaged.jpg"     alt="" loading="lazy" />
        </div>

        {/* ── DETALLES ── */}
        <section className="section section-center section-dark">
          <span className="eyebrow reveal">El gran día</span>
          <div className="divider center reveal d1" />
          <h2 className="reveal d1">{c.event.type}</h2>
          <div className="event-card reveal d2">
            <p><strong>{c.event.dateLongLabel}</strong></p>
            <span className="event-time">{c.event.timeLabel}</span>
            <p style={{ marginTop: "1.2rem" }}><strong>{c.event.placeName}</strong></p>
            <p>{c.event.address}</p>
            <p style={{ marginTop: "0.8rem", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(248,245,242,0.5)" }}>{c.event.note}</p>
            <Countdown />
          </div>
        </section>

        {/* ── UBICACIÓN ── */}
        <section className="section section-center section-dark">
          <span className="eyebrow reveal">Dónde nos vemos</span>
          <div className="divider center reveal d1" />
          <h2 className="reveal d1">Cómo llegar</h2>
          <MapView />
          <p className="body-text reveal d3">{c.location.indications}</p>
          <a href={c.location.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-link reveal d3">
            Abrir en Google Maps
          </a>
        </section>

        {/* ── DRESS CODE ── */}
        <section className="bold-section light">
          <span className="bold-section-deco" aria-hidden="true">FK</span>
          <div className="bold-section-content">
            <span className="bold-eyebrow reveal">Dress Code</span>
            <h2 className="bold-title reveal d1">{c.dressCode.style}</h2>
            <p className="bold-text reveal d2" style={{ marginTop: "1.2rem", opacity: 0.7 }}>Para ellas</p>
            <div className="swatches reveal d2">
              {c.dressCode.ellas.swatches.map(col => (
                <div key={col} className="swatch" style={{ background: col }} title={col} />
              ))}
            </div>
            <PinterestLink href={c.dressCode.ellas.url} label="Ver inspiración para ellas" preview={c.dressCode.ellas.preview} />

            <p className="bold-text reveal d3" style={{ marginTop: "1.8rem", opacity: 0.7 }}>Para ellos</p>
            <div className="swatches reveal d3">
              {c.dressCode.ellos.swatches.map(col => (
                <div key={col} className="swatch" style={{ background: col }} title={col} />
              ))}
            </div>
            <PinterestLink href={c.dressCode.ellos.url} label="Ver inspiración para ellos" preview={c.dressCode.ellos.preview} />
          </div>
        </section>

        {/* ── REGALOS ── */}
        <section className="section section-center section-purple">
          <span className="eyebrow reveal">Regalos</span>
          <div className="divider reveal d1" />
          <h2 className="reveal d1">Con amor</h2>
          <h2 className="reveal d1" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)" }}>{c.gifts.title}</h2>
          <div className="divider center reveal d2" style={{ background: "rgba(248,245,242,0.25)" }} />
          {c.gifts.lines.map((line, i) => (
            <p key={i} className="body-text reveal d2" style={{ color: "rgba(248,245,242,0.8)", marginTop: "1rem" }}>{line}</p>
          ))}
        </section>

        {/* ── GALERÍA ── */}
        <section className="gallery-section">
          <span className="eyebrow reveal">Comparte el momento</span>
          <div className="divider reveal d1" />
          <h2 className="reveal d1">Galería del día</h2>
          <p className="body-text reveal d2" style={{ marginTop: "1rem" }}>
            ¡Queremos ver el día desde tus ojos! Sube tus fotos y videos al álbum compartido — cada recuerdo que compartas lo atesoraremos para siempre. 🤍
          </p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(c.gallery.url)}&color=c724ff&bgcolor=ffffff`}
            className="gallery-qr reveal d2"
            alt="QR Google Photos"
          />
          <br />
          <a href={c.gallery.url} target="_blank" rel="noopener noreferrer" className="btn-gallery reveal d3">
            Subir mis fotos ↗
          </a>
          <p className="gallery-hint reveal d3">o escanea el QR con tu cámara</p>
        </section>

        {/* ── RSVP ── */}
        <section id="rsvp" className="section section-center section-dark">
          <span className="eyebrow reveal">¿Vas a estar?</span>
          <div className="divider center reveal d1" />
          <h2 className="reveal d1">Confirmar asistencia</h2>
          <form className="rsvp-form reveal d2" onSubmit={e => e.preventDefault()}>
            <div className="field">
              <label>Nombre completo</label>
              <input type="text" defaultValue={invitedName} placeholder="Tu nombre" />
            </div>
            <div className="field">
              <label>¿Asistirás?</label>
              <select>
                <option value="yes">Sí, allá estaré 🎉</option>
                <option value="no">No podré ir</option>
              </select>
            </div>
            <div className="field">
              <label>Un mensaje para guardar por siempre</label>
              <p style={{ fontSize: "0.8rem", color: "rgba(248,245,242,0.7)", lineHeight: 1.7, marginBottom: "0.6rem", textAlign: "left" }}>
                Para esta nueva etapa tus palabras son muy valiosas para nosotros. Si quieres compartir un mensaje o un consejo, con mucho amor lo guardaremos para siempre. 🤍
              </p>
              <textarea rows={4} placeholder="Escribe aquí tu mensaje o consejo..." />
            </div>
            <button type="submit" className="btn-submit">Confirmar asistencia</button>
          </form>
        </section>

        {/* ── FINAL ── */}
        <section className="final-section">
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <span className="eyebrow final-eyebrow reveal">Gracias</span>
            <div className="divider final-divider reveal d1" />
            <h2 className="reveal d1">Felipe &amp; Karoll</h2>
            <p className="final-text reveal d2">{c.finalMessage}</p>
            <p className="final-text reveal d3" style={{ opacity: 0.3, fontSize: "0.72rem", marginTop: "3rem" }}>
              21 · 09 · 2026
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
