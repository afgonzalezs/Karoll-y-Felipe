import { useEffect, useRef } from "react";

const LAT  =  4.6534757;
const LNG  = -74.0585037;
const NAME = "Restaurante La Herencia";

export default function MapView() {
  const el  = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!window.L || map.current) return;

    map.current = window.L.map(el.current, {
      center: [LAT, LNG],
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    // Tiles minimalistas CartoDB Light
    window.L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map.current);

    // Pin morado personalizado
    const pin = window.L.divIcon({
      html: `
        <div style="
          width:18px; height:18px;
          background:#c724ff;
          border-radius:50%;
          border:3px solid #fff;
          box-shadow:0 2px 12px rgba(199,36,255,0.6);
        "></div>`,
      className: "",
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    window.L.marker([LAT, LNG], { icon: pin })
      .addTo(map.current)
      .bindPopup(`<strong>${NAME}</strong>`)
      .openPopup();

    return () => { map.current.remove(); map.current = null; };
  }, []);

  return <div ref={el} className="map-leaflet" />;
}
