import L from 'leaflet';

// Kelas PulsingDot untuk marker kustom
export class PulsingDot extends L.DivIcon {
  constructor(options) {
    const category = options.category || 'default';
    
    super({
      className: `pulsing-dot-container ${category}`,
      html: `<div class="pulsing-dot ${category}"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -6]
    });
  }
}

// Fungsi untuk membuat marker PulsingDot
export function createPulsingDotMarker(latlng, options = {}) {
  return L.marker(latlng, {
    icon: new PulsingDot(options)
  });
}
