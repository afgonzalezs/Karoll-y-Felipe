export default function PinterestLink({ href, label, preview }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="pinterest-link"
    >
      <span className="pinterest-link-text">{label} &rarr;</span>
      <div className="pinterest-popup">
        <img src={preview} alt={label} className="pinterest-popup-img" />
        <p className="pinterest-popup-label">{label}</p>
      </div>
    </a>
  );
}
