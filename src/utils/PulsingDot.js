import L from "leaflet";

// Kelas PulsingDot untuk marker kustom
export class PulsingDot extends L.DivIcon {
	constructor(options) {
		const category = options.category || "default";

		super({
			className: `pulsing-dot-container ${category}`,
			html: `<div class="pulsing-dot ${category}"></div>`,
			iconSize: [10, 10],
			iconAnchor: [5, 5],
			popupAnchor: [0, -5],
		});
	}
}

// Fungsi untuk membuat marker PulsingDot
export function createPulsingDotMarker(latlng, options = {}) {
	return L.marker(latlng, {
		icon: new PulsingDot(options),
	});
}
