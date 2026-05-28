export default function PhotoCarousel({ eyebrow, title, photos, onOpen }) {
  return (
    <>
      <div className="nosotros-header">
        <span className="nosotros-eyebrow">{eyebrow}</span>
        <h2 className="nosotros-title">{title}</h2>
      </div>
      <div
        className="photo-grid"
        ref={el => {
          if (!el) return;
          let isDown = false, startX, scrollLeft;
          el._dragged = false;
          el.onmousedown = e => { isDown = true; el._dragged = false; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
          el.onmouseleave = () => { isDown = false; };
          el.onmouseup   = () => { isDown = false; };
          el.onmousemove = e => {
            if (!isDown) return;
            if (Math.abs(e.pageX - el.offsetLeft - startX) > 5) el._dragged = true;
            e.preventDefault();
            el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5;
          };
        }}
        onClick={e => {
          if (e.currentTarget._dragged) return;
          const img = e.target.closest("img");
          if (!img) return;
          const imgs = [...e.currentTarget.querySelectorAll("img")];
          onOpen(imgs.map(i => i.src), imgs.indexOf(img));
        }}
      >
        {photos.map((src, i) => (
          <img key={src + i} src={src} alt="" loading="lazy" />
        ))}
      </div>
    </>
  );
}
