import L from "leaflet";

// Kelas TowerIcon untuk marker BTS
export class TowerIcon extends L.DivIcon {
	constructor(options = {}) {
		const { signalStrength = -80, cellRadius = 200 } = options;

		// Normalisasi kekuatan sinyal untuk menentukan ukuran ikon
		// Sinyal biasanya antara -50 dBm (kuat) hingga -110 dBm (lemah)
		const normalizedSignal = Math.min(
			Math.max((signalStrength + 110) / 60, 0),
			1
		);
		const iconSize = 32; // Ukuran ikon tetap 32px

		// Normalisasi radius sel untuk menentukan ukuran lingkaran coverage
		const normalizedRadius = Math.min(Math.max(cellRadius / 1000, 0.1), 1);
		const circleSize = 40 + normalizedRadius * 60; // Ukuran lingkaran antara 40px dan 100px

		super({
			className: "tower-icon-container",
			html: `
        <div class="tower-icon-circle" style="width: ${circleSize}px; height: ${circleSize}px;"></div>
        <div class="tower-icon" style="width: ${iconSize}px; height: ${iconSize}px;"></div>
      `,
			iconSize: [circleSize, circleSize],
			iconAnchor: [circleSize / 2, circleSize / 2],
			popupAnchor: [0, -circleSize / 2],
		});
	}
}

// Fungsi untuk membuat marker TowerIcon
export function createTowerMarker(latlng, options = {}) {
	return L.marker(latlng, {
		icon: new TowerIcon(options),
	});
}
