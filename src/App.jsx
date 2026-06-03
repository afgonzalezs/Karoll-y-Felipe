import { useMemo, useEffect, useState, useRef } from "react";
import { siteContent } from "./config/siteContent";
import { useEnvelope } from "./hooks/useEnvelope";
import { getInvitedName, getToken, getGuest } from "./utils/getInvitedName";
import {
  nosotrosPhotos, familiaPhotos, gatitosPhotos,
  juliana_firmaLibro, juliana_primerConcierto, juliana_teatroMayor,
  juliana_primerMovistar, juliana_segundoMovistar,
} from "./config/photos";
import WorldClock from "./components/WorldClock";
import PhotoCarousel from "./components/PhotoCarousel";
import EnvelopeIntro from "./components/EnvelopeIntro";
import Countdown from "./components/Countdown";
import MapView from "./components/MapView";
import PinterestLink from "./components/PinterestLink";
import MusicPlayer from "./components/MusicPlayer";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, deleteDoc } from "firebase/firestore";

const c = siteContent;

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    const observe = () =>
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => obs.observe(el));
    observe();
    let raf;
    const mut = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(observe); });
    mut.observe(document.body, { childList: true, subtree: true });
    return () => { obs.disconnect(); mut.disconnect(); cancelAnimationFrame(raf); };
  }, []);
}

function Nav({ musicSrc, musicTrigger }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`top-nav${scrolled ? " scrolled" : ""}`}>
      <span className={`nav-brand${scrolled ? " dark" : ""}`}>F &amp; K</span>
      <div className="nav-right">
        <MusicPlayer src={musicSrc} autoPlayTrigger={musicTrigger} inline dark={scrolled} />
        <a href="#rsvp" className={`btn-nav${scrolled ? " dark" : ""}`}>Confirmar</a>
      </div>
    </nav>
  );
}

const REACTIONS = ["❤️", "😂", "😍", "🔥", "💃"];

function Lightbox({ photos, startIndex, invitado, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [myReaction, setMyReaction] = useState(null);
  const [counts, setCounts] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const commentsEndRef = useRef(null);
  const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex(i => (i + 1) % photos.length);

  const photoId = (url) => url.split("/").pop().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

  useEffect(() => {
    const pid = photoId(photos[index]);
    const unsubR = onSnapshot(collection(db, `reactions_${pid}`), (snap) => {
      const c = {};
      let mine = null;
      snap.docs.forEach(d => {
        const { type } = d.data();
        c[type] = (c[type] || 0) + 1;
        if (d.id === invitado) mine = type;
      });
      setCounts(c);
      setMyReaction(mine);
    });
    const q = query(collection(db, `comments_${pid}`), orderBy("timestamp", "asc"));
    const unsubC = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubR(); unsubC(); };
  }, [index, photos, invitado]);

  useEffect(() => {
    if (showComments) commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments, showComments]);

  const react = async (e, emoji) => {
    e.stopPropagation();
    const pid = photoId(photos[index]);
    const ref = doc(db, `reactions_${pid}`, invitado);
    if (myReaction === emoji) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { invitado, type: emoji, photoUrl: photos[index], timestamp: serverTimestamp() });
    }
  };

  const sendComment = async (e) => {
    e.stopPropagation();
    if (!newComment.trim() || sending) return;
    setSending(true);
    const pid = photoId(photos[index]);
    await addDoc(collection(db, `comments_${pid}`), {
      invitado,
      text: newComment.trim(),
      timestamp: serverTimestamp(),
    });
    setNewComment("");
    setSending(false);
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Cerrar">✕</button>
      <button className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Anterior">&#8249;</button>
      <img className="lightbox-img" src={photos[index]} alt="" onClick={e => e.stopPropagation()} />
      <button className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Siguiente">&#8250;</button>

      <div className="lightbox-bottom" onClick={e => e.stopPropagation()}>
        {showComments && (
          <div className="lb-comments">
            <div className="lb-comments-list">
              {comments.length === 0
                ? <p className="lb-no-comments">Sé el primero en comentar 🤍</p>
                : comments.map(c => (
                  <div key={c.id} className="lb-comment">
                    <span className="lb-comment-author">{c.invitado}</span>
                    <span className="lb-comment-text">{c.text}</span>
                  </div>
                ))
              }
              <div ref={commentsEndRef} />
            </div>
            <div className="lb-comment-input">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendComment(e)}
                placeholder="Escribe algo..."
                maxLength={200}
              />
              <button onClick={sendComment} disabled={sending || !newComment.trim()}>
                {sending ? "…" : "↑"}
              </button>
            </div>
          </div>
        )}

        <div className="lb-actions">
          <div className="lightbox-reactions">
            {REACTIONS.map(emoji => (
              <button key={emoji} className={`reaction-btn${myReaction === emoji ? " active" : ""}`} onClick={e => react(e, emoji)}>
                <span className="reaction-emoji">{emoji}</span>
                {counts[emoji] > 0 && <span className="reaction-count">{counts[emoji]}</span>}
              </button>
            ))}
          </div>
          <button className={`lb-comment-toggle${showComments ? " active" : ""}`} onClick={() => setShowComments(s => !s)}>
            💬 {comments.length > 0 && <span>{comments.length}</span>}
          </button>
        </div>
      </div>

      <span className="lightbox-counter">{index + 1} / {photos.length}</span>
    </div>
  );
}

export default function App() {
  const invitedName = useMemo(() => getInvitedName(), []);
  const guest = useMemo(() => getGuest(getToken()), []);
  const isVirtual = guest.virtual === true;
  const isJuliana = useMemo(() => getToken() === "juliana_la_colombiana", []);
  const { isUntying, isOpened, hideEnvelope, isAnimatingOpen, envelopeScreenClass, invitationClass, openInvitation } = useEnvelope();
  const [lightbox, setLightbox] = useState(null);

  // RSVP form
  const token = useMemo(() => getToken(), []);
  const storageKey = `rsvp_confirmado_${token}`;
  const [nombre, setNombre] = useState(localStorage.getItem(storageKey) || invitedName || "");
  const [asiste, setAsiste] = useState("yes");
  const [mensaje, setMensaje] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState(() =>
    localStorage.getItem(storageKey) ? "success" : "idle"
  );

  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setRsvpStatus("loading");
    try {
      await setDoc(doc(db, "rsvp", token), {
        nombre: nombre.trim(),
        asiste: asiste === "yes",
        mensaje: mensaje.trim(),
        token,
        virtual: isVirtual,
        timestamp: serverTimestamp(),
      });
      localStorage.setItem(storageKey, nombre.trim());
      setRsvpStatus("success");
      setTimeout(() => {
        document.querySelector(".final-section")?.scrollIntoView({ behavior: "smooth" });
      }, 600);
    } catch {
      setRsvpStatus("error");
    }
  };

  const resetRsvp = () => {
    localStorage.removeItem(storageKey);
    setRsvpStatus("idle");
  };

  // Mensajes en tiempo real
  const [mensajes, setMensajes] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "rsvp"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMensajes(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.mensaje));
    });
    return () => unsub();
  }, []);

  const openLightbox = (photos, index) => setLightbox({ photos, index });
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
      <div className="hero-slide" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}photos/proposal.jpg')` }} />
      <div className="hero-slide" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}photos/kiss.jpg')`, backgroundPosition: "center 30%" }} />
      <div className="hero-slide" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}photos/engaged.jpg')`, backgroundPosition: "center top" }} />

      <div className={invitationClass}>
        <Nav musicSrc={import.meta.env.BASE_URL + "song.mp3"} musicTrigger={isOpened} />

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
              Nos emociona compartirles que hemos decidido sellar nuestro amor para la eternidad y nada nos haría más felices que celebrar junto a las personas que han sido parte de esta historia.
            </p>

          </div>
          <div className="scroll-cue" aria-hidden="true">
            <div className="scroll-line" />
          </div>
        </section>

        {/* ── SECCIÓN ESPECIAL INVITADOS VIRTUALES ── */}
        {isVirtual && (
          <section className="section section-center section-dark virtual-intro">
            <span className="eyebrow reveal">Con todo nuestro amor</span>
            <div className="divider center reveal d1" />
            <h2 className="reveal d1">Siempre presentes</h2>
            <p className="body-text reveal d2" style={{ color: "rgba(248,245,242,0.85)", maxWidth: 520, margin: "1.2rem auto 0" }}>
              Hay personas que imaginamos abrazando ese día desde el primer momento en que soñamos esta boda.
              Aunque la distancia no nos permita tenerte físicamente con nosotros, sigues siendo parte de esta historia
              y queríamos que recibieras esta invitación con muchísimo amor. 🤍
            </p>
            <WorldClock country={guest.country} />
          </section>
        )}

        {/* ── HISTORIA (bold section morado) ── */}
        <section className="bold-section">
          <img src={import.meta.env.BASE_URL+"photos/Copia_IMG_7637.png"} className="bold-photo-strip" alt="" />
          <div className="bold-strip-header">
            <span className="bold-strip-title">Nuestra historia</span>
            {!isVirtual && <a href="#rsvp" className="bold-strip-link">Confirmar asistencia &rarr;</a>}
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
        </section>

        {/* ── CARRUSELES DE FOTOS ── */}
        <PhotoCarousel
          eyebrow="Una historia desde 2013"
          title="Nosotros"
          photos={nosotrosPhotos}
          onOpen={openLightbox}
        />
        {!isJuliana && (
          <PhotoCarousel
            eyebrow="Los que nos acompañan"
            title="Familia y Amigos"
            photos={familiaPhotos}
            onOpen={openLightbox}
          />
        )}

        {/* ── SECCIÓN ESPECIAL: JULIANA CON NOSOTROS ── */}
        {isJuliana && (
          <>
            <section className="section section-center section-dark">
              <span className="eyebrow reveal">Una historia que nos une</span>
              <div className="divider center reveal d1" />
              <h2 className="reveal d1">Juliana con nosotros</h2>
              <p className="body-text reveal d2" style={{ color: "rgba(248,245,242,0.8)", maxWidth: 520, margin: "1.2rem auto 0" }}>
                Desde el primer concierto en que tu voz nos enamoró, has sido parte de nuestra historia de amor. Gracias por acompañarnos en cada momento. 🤍
              </p>
            </section>

            <PhotoCarousel
              eyebrow="Un regalo muy especial"
              title="La firma del libro"
              photos={juliana_firmaLibro}
              onOpen={openLightbox}
            />

            <PhotoCarousel
              eyebrow="Donde todo comenzó"
              title="El primer concierto"
              photos={juliana_primerConcierto}
              onOpen={openLightbox}
            />

            <PhotoCarousel
              eyebrow="Segundo concierto · Teatro Mayor"
              title="Julio Mario Santo Domingo"
              photos={juliana_teatroMayor}
              onOpen={openLightbox}
            />

            <PhotoCarousel
              eyebrow="Con el criollo glam"
              title="Primer Movistar Arena"
              photos={juliana_primerMovistar}
              onOpen={openLightbox}
            />

            <PhotoCarousel
              eyebrow="Volvimos por más"
              title="Segundo Movistar Arena"
              photos={juliana_segundoMovistar}
              onOpen={openLightbox}
            />
          </>
        )}

        {/* ── DETALLES ── */}
        <section className="section section-center section-dark">
          <span className="eyebrow reveal">El gran día</span>
          <div className="divider center reveal d1" />
          {!isVirtual && <h2 className="reveal d1">{c.event.type}</h2>}
          {!isVirtual && (
            <div className="event-card reveal d2">
              <p><strong>{c.event.dateLongLabel}</strong></p>
              <span className="event-time">{c.event.timeLabel}</span>
              <p style={{ marginTop: "1.2rem" }}><strong>{c.event.placeName}</strong></p>
              <p>{c.event.address}</p>
              <p style={{ marginTop: "0.8rem", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(248,245,242,0.5)" }}>{c.event.note}</p>
            </div>
          )}
          <Countdown />
        </section>

        {/* ── UBICACIÓN ── (solo presenciales) */}
        {!isVirtual && (
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
        )}

        {/* ── DRESS CODE ── (solo presenciales, no Juliana) */}
        {!isVirtual && !isJuliana && (
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
        )}

        {/* ── REGALOS ── (solo presenciales, no Juliana) */}
        {!isVirtual && !isJuliana && <section className="section section-center section-purple">
          <span className="eyebrow reveal">Regalos</span>
          <div className="divider reveal d1" />
          <h2 className="reveal d1">Con amor</h2>
          <h2 className="reveal d1" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)" }}>{c.gifts.title}</h2>
          <div className="divider center reveal d2" style={{ background: "rgba(248,245,242,0.25)" }} />
          {c.gifts.lines.map((line, i) => (
            <p key={i} className="body-text reveal d2" style={{ color: "rgba(248,245,242,0.8)", marginTop: "1rem" }}>{line}</p>
          ))}
        </section>}

        {/* ── GALERÍA ── (no Juliana) */}
        {!isJuliana && <section className="gallery-section">
          <span className="eyebrow reveal">Comparte el momento</span>
          <div className="divider reveal d1" />
          <h2 className="reveal d1">{isVirtual ? "Mándanos un video 🎥" : "Galería del día"}</h2>
          <p className="body-text reveal d2" style={{ marginTop: "1rem" }}>
            {isVirtual
              ? "Nada nos haría más felices que recibir un video tuyo ese día — un saludo, un abrazo desde lejos, unas palabras. Ese recuerdo lo guardaremos para siempre. 🤍"
              : "¡Queremos ver el día desde tus ojos! Sube tus fotos y videos al álbum compartido — cada recuerdo que compartas lo atesoraremos para siempre. 🤍"
            }
          </p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(c.gallery.url)}&color=c724ff&bgcolor=ffffff`}
            className="gallery-qr reveal d2"
            alt="QR Google Photos"
          />
          <br />
          <a href={c.gallery.url} target="_blank" rel="noopener noreferrer" className="btn-gallery reveal d3">
            {isVirtual ? "Subir mi video ↗" : "Subir mis fotos ↗"}
          </a>
          <p className="gallery-hint reveal d3">o escanea el QR con tu cámara</p>
        </section>}

        {/* ── RSVP / MENSAJE VIRTUAL ── */}
        <section id="rsvp" className={`section section-center section-dark${rsvpStatus === "success" ? " rsvp-confirmed" : ""}`}>
          <span className="eyebrow reveal">{isVirtual ? "Déjanos tus palabras" : "¿Vas a estar?"}</span>
          <div className="divider center reveal d1" />
          <h2 className="reveal d1">{isVirtual ? "Un mensaje para nosotros" : "Confirmar asistencia"}</h2>

          {isVirtual && rsvpStatus !== "success" && (
            <p className="body-text reveal d1" style={{ maxWidth: 460, margin: "1rem auto 0" }}>
              Aunque estés lejos, tus palabras estarán con nosotros ese día. Si quieres dejarnos un mensaje de amor o de ánimo, lo guardaremos para siempre. 🤍
            </p>
          )}

          {rsvpStatus === "success" ? (
            <div className="rsvp-success">
              <p className="rsvp-success-icon">🤍</p>
              <p className="rsvp-success-title">¡Gracias, {nombre}!</p>
              <p className="rsvp-success-text">
                {isVirtual
                  ? "Tu mensaje quedó guardado. ¡Los tendremos muy presentes!"
                  : "Tu confirmación quedó guardada. ¡Nos vemos pronto!"}
              </p>
              <button className="btn-cambiar-rsvp" onClick={resetRsvp}>
                ¿Cambió algo? Actualizar respuesta
              </button>
            </div>
          ) : (
            <form className="rsvp-form" onSubmit={handleRsvp}>
              <div className="field">
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  readOnly
                />
              </div>
              {!isVirtual && (
                <p className="adults-only-note">✦ Evento exclusivo para adultos</p>
              )}
              {!isVirtual && (
                <div className="field">
                  <label>¿Asistirás?</label>
                  <select value={asiste} onChange={e => setAsiste(e.target.value)}>
                    <option value="yes">Sí, allá estaré 🎉</option>
                    <option value="no">No podré ir</option>
                  </select>
                  <p className="rsvp-hint">
                    Si sabes con anticipación que no podrás venir, te agradecemos mucho avisarnos — nos ayuda a organizar mejor el día. 🙏
                  </p>
                </div>
              )}
              <div className="field">
                <label>Un mensaje para guardar por siempre</label>
                <p style={{ fontSize: "0.8rem", color: "rgba(248,245,242,0.7)", lineHeight: 1.7, marginBottom: "0.6rem", textAlign: "left" }}>
                  Para esta nueva etapa tus palabras son muy valiosas para nosotros. Si quieres compartir un mensaje o un consejo, con mucho amor lo guardaremos para siempre. 🤍
                </p>
                <textarea
                  rows={4}
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  placeholder="Escribe aquí tu mensaje o consejo..."
                />
              </div>
              {rsvpStatus === "error" && (
                <p style={{ color: "#ff6b6b", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  Hubo un error, intenta de nuevo.
                </p>
              )}
              <button type="submit" className="btn-submit" disabled={rsvpStatus === "loading"}>
                {rsvpStatus === "loading" ? "Guardando..." : isVirtual ? "Enviar mensaje" : "Confirmar asistencia"}
              </button>
            </form>
          )}
        </section>

        {/* ── MURAL DE MENSAJES ── */}
        {mensajes.length > 0 && (
          <section className="section section-center section-dark">
            <span className="eyebrow">Sus palabras</span>
            <div className="divider center" />
            <h2>Lo que nos dicen 🤍</h2>
            <div className="mensajes-grid">
              {mensajes.map(m => (
                <div key={m.id} className="mensaje-card">
                  <p className="mensaje-texto">"{m.mensaje}"</p>
                  <p className="mensaje-autor">— {m.nombre}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── FINAL ── */}
        <section className="final-section">
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <span className="eyebrow final-eyebrow reveal">Gracias</span>
            <div className="divider final-divider reveal d1" />
            <p className="final-text reveal d1" style={{ opacity: 0.45, fontSize: "0.72rem", marginBottom: "2rem" }}>
              Y estos son los otros amores de nuestra vida 🐱
            </p>
          </div>
          <div className="cat-carousel reveal">
            {gatitosPhotos.map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" onClick={() => openLightbox(gatitosPhotos, i)} />
            ))}
          </div>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 className="reveal d1">Felipe &amp; Karoll</h2>
            <p className="final-text reveal d2">{c.finalMessage}</p>
            <p className="final-text reveal d3" style={{ opacity: 0.3, fontSize: "0.72rem", marginTop: "3rem" }}>
              21 · 09 · 2026
            </p>
          </div>
        </section>
      </div>

      {lightbox && <Lightbox photos={lightbox.photos} startIndex={lightbox.index} invitado={invitedName} onClose={() => setLightbox(null)} />}
    </>
  );
}
