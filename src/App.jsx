import { useMemo, useEffect, useState } from "react";
import { siteContent } from "./config/siteContent";
import { useEnvelope } from "./hooks/useEnvelope";
import { getInvitedName } from "./utils/getInvitedName";
import EnvelopeIntro from "./components/EnvelopeIntro";
import Countdown from "./components/Countdown";
import MapView from "./components/MapView";
import PinterestLink from "./components/PinterestLink";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

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

function Lightbox({ photos, startIndex, invitado, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex(i => (i + 1) % photos.length);

  const photoId = (url) => btoa(encodeURIComponent(url)).replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowRight")  next();
      if (e.key === "ArrowLeft")   prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

  useEffect(() => {
    const pid = photoId(photos[index]);
    const q = query(collection(db, "reactions"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(collection(db, `reactions_${pid}`), (snap) => {
      setLikeCount(snap.size);
      setLiked(snap.docs.some(d => d.id === invitado));
    });
    return () => unsub();
  }, [index, photos, invitado]);

  const toggleLike = async (e) => {
    e.stopPropagation();
    const pid = photoId(photos[index]);
    const ref = doc(db, `reactions_${pid}`, invitado);
    if (liked) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { invitado, photoUrl: photos[index], timestamp: serverTimestamp() });
    }
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Cerrar">✕</button>
      <button className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Anterior">&#8249;</button>
      <img
        className="lightbox-img"
        src={photos[index]}
        alt=""
        onClick={e => e.stopPropagation()}
      />
      <button className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Siguiente">&#8250;</button>
      <button className={`lightbox-like${liked ? " liked" : ""}`} onClick={toggleLike} aria-label="Me gusta">
        {liked ? "❤️" : "🤍"} {likeCount > 0 && <span>{likeCount}</span>}
      </button>
      <span className="lightbox-counter">{index + 1} / {photos.length}</span>
    </div>
  );
}

export default function App() {
  const invitedName = useMemo(() => getInvitedName(), []);
  const { isUntying, isOpened, hideEnvelope, isAnimatingOpen, envelopeScreenClass, invitationClass, openInvitation } = useEnvelope();
  const [lightbox, setLightbox] = useState(null);

  // RSVP form
  const [nombre, setNombre] = useState(invitedName || "");
  const [asiste, setAsiste] = useState("yes");
  const [mensaje, setMensaje] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("idle"); // idle | loading | success | error

  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setRsvpStatus("loading");
    try {
      await addDoc(collection(db, "rsvp"), {
        nombre: nombre.trim(),
        asiste: asiste === "yes",
        mensaje: mensaje.trim(),
        token: new URLSearchParams(window.location.search).get("invitado") || "",
        timestamp: serverTimestamp(),
      });
      setRsvpStatus("success");
    } catch {
      setRsvpStatus("error");
    }
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

  const openLightbox = (e) => {
    if (e.currentTarget._dragged) return;
    const img = e.target.closest("img");
    if (!img) return;
    const imgs = [...e.currentTarget.querySelectorAll("img")];
    setLightbox({ photos: imgs.map(i => i.src), index: imgs.indexOf(img) });
  };
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
          <img src={import.meta.env.BASE_URL+"photos/Copia_IMG_7637.png"} className="bold-photo-strip" alt="" />
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
            <img src={import.meta.env.BASE_URL+"photos/selfie.jpg"}  className="story-img" alt="" loading="lazy" />
            <img src={import.meta.env.BASE_URL+"photos/embrace.jpg"} className="story-img tall" alt="" loading="lazy" />
          </div>
        </section>

        {/* ── NOSOTROS + PHOTO CAROUSEL ── */}
        <div className="nosotros-header">
          <span className="nosotros-eyebrow">Una historia desde 2013</span>
          <h2 className="nosotros-title">Nosotros</h2>
        </div>
        <div className="photo-grid" ref={el => {
          if (!el) return;
          let isDown = false, startX, scrollLeft;
          el._dragged = false;
          el.onmousedown = e => { isDown = true; el._dragged = false; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
          el.onmouseleave = () => { isDown = false; };
          el.onmouseup = () => { isDown = false; };
          el.onmousemove = e => { if (!isDown) return; if (Math.abs(e.pageX - el.offsetLeft - startX) > 5) el._dragged = true; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5; };
        }} onClick={openLightbox}>
          <img src={import.meta.env.BASE_URL+"photos/fykfreskq.jpeg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/gradok.jpeg"}        alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7371.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7508.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7573.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7575.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7580.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7581.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7582.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7618.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7637.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_7648.png"}       alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_copia_7573.png"} alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa01.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa02.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa03.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa04.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa05.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa06.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa07.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa08.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa09.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa10.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa11.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa12.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa13.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa14.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa15.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa16.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa17.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa18.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa19.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa20.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa21.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa22.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa23.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa24.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa25.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa26.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa27.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa28.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa29.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa30.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa31.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_wa32.jpeg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_dsc0005.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_img20220308.jpg"} alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/nos_img20220320.jpg"} alt="" loading="lazy" />
        </div>

        {/* ── FAMILIA Y AMIGOS + PHOTO CAROUSEL ── */}
        <div className="nosotros-header">
          <span className="nosotros-eyebrow">Los que nos acompañan</span>
          <h2 className="nosotros-title">Familia y Amigos</h2>
        </div>
        <div className="photo-grid" ref={el => {
          if (!el) return;
          let isDown = false, startX, scrollLeft;
          el._dragged = false;
          el.onmousedown = e => { isDown = true; el._dragged = false; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
          el.onmouseleave = () => { isDown = false; };
          el.onmouseup = () => { isDown = false; };
          el.onmousemove = e => { if (!isDown) return; if (Math.abs(e.pageX - el.offsetLeft - startX) > 5) el._dragged = true; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5; };
        }} onClick={openLightbox}>
          <img src={import.meta.env.BASE_URL+"photos/fam_a0.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a1.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a2.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a20.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a21.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a22.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a24.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a26.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a27.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a28.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a29.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a3.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a32.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a36.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a38.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a39.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a4.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a40.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a41.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a42.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a43.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a44.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a45.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a46.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a47.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a48.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a49.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a5.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a50.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a51.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a52.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a53.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a6.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a8.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_a9.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_every.jpg"}  alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_every2.jpg"} alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f.jpg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f01.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f1.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f17.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f19.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f2.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f20.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_t7.jpg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_t9.jpg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_every3.jpeg"} alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f8.jpeg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f9.jpeg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f10.jpeg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f12.jpeg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f13.jpeg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f21.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f22.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f23.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f24.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f25.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f26.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f27.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f3.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f30.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f31.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f33.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f35.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f36.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f39.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f4.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f40.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f45.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f46.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f47.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f48.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f49.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f5.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f6.jpg"}     alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_f99.jpg"}    alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_t.jpg"}      alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_t10.jpeg"}   alt="" loading="lazy" />
          <img src={import.meta.env.BASE_URL+"photos/fam_t11.jpeg"}   alt="" loading="lazy" />
          
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

          {rsvpStatus === "success" ? (
            <div className="rsvp-success reveal">
              <p className="rsvp-success-icon">🤍</p>
              <p className="rsvp-success-title">¡Gracias, {nombre}!</p>
              <p className="rsvp-success-text">Tu confirmación quedó guardada. ¡Nos vemos pronto!</p>
            </div>
          ) : (
            <form className="rsvp-form reveal d2" onSubmit={handleRsvp}>
              <div className="field">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="field">
                <label>¿Asistirás?</label>
                <select value={asiste} onChange={e => setAsiste(e.target.value)}>
                  <option value="yes">Sí, allá estaré 🎉</option>
                  <option value="no">No podré ir</option>
                </select>
              </div>
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
                {rsvpStatus === "loading" ? "Guardando..." : "Confirmar asistencia"}
              </button>
            </form>
          )}
        </section>

        {/* ── MURAL DE MENSAJES ── */}
        {mensajes.length > 0 && (
          <section className="section section-center section-dark">
            <span className="eyebrow reveal">Sus palabras</span>
            <div className="divider center reveal d1" />
            <h2 className="reveal d1">Lo que nos dicen 🤍</h2>
            <div className="mensajes-grid reveal d2">
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
