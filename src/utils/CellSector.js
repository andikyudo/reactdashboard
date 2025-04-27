import L from "leaflet";

// Fungsi untuk membuat sektor cell ID
export function createCellSectors(
	map,
	latlng,
	radius,
	numSectors = 3, // Default 3 sektor untuk BTS modern
	options = {}
) {
	const {
		color = "rgba(255, 0, 255, 0.5)",
		fillColor = "rgba(255, 0, 255, 0.1)",
	} = options;

	// Buat container untuk semua sektor
	const container = L.layerGroup().addTo(map);

	// Buat sektor-sektor
	const sectorAngle = 360 / numSectors;

	// Acak rotasi awal untuk membuat sektor lebih realistis
	// BTS biasanya memiliki orientasi yang berbeda-beda
	const initialRotation = Math.floor(Math.random() * 60); // Rotasi acak 0-60 derajat

	for (let i = 0; i < numSectors; i++) {
		// Hitung sudut untuk sektor ini dengan rotasi awal
		const startAngle = initialRotation + i * sectorAngle;
		const endAngle = initialRotation + (i + 1) * sectorAngle;

		// Buat sektor dengan polygon
		// Gunakan 120 derajat untuk sektor (bukan 360/numSectors) untuk membuat sektor yang lebih realistis
		// BTS biasanya memiliki sektor dengan sudut 120 derajat
		const sectorWidth = 120; // Lebar sektor dalam derajat
		const sectorStartAngle = startAngle - sectorWidth / 2;
		const sectorEndAngle = startAngle + sectorWidth / 2;

		const sectorPoints = getSectorPoints(
			latlng,
			radius,
			sectorStartAngle,
			sectorEndAngle,
			15 // Lebih banyak titik untuk kurva yang lebih halus
		);

		// Gunakan warna yang lebih lembut untuk sektor
		// Gunakan warna yang sama dengan parameter color tapi dengan opacity yang berbeda
		const sectorFillColor =
			fillColor || color.replace(")", ", 0.15)").replace("rgb", "rgba");

		const sector = L.polygon(sectorPoints, {
			color: color,
			fillColor: sectorFillColor,
			fillOpacity: 0.15,
			weight: 1,
		}).addTo(container);

		// Tambahkan label sektor
		const labelAngle = startAngle;
		const labelDistance = radius * 0.6;
		const labelPoint = getPointAtDistance(latlng, labelDistance, labelAngle);

		const labelIcon = L.divIcon({
			className: "sector-label",
			html: `<div style="color: ${color}; font-weight: bold; text-shadow: 1px 1px 1px white;">${
				i + 1
			}</div>`,
			iconSize: [20, 20],
			iconAnchor: [10, 10],
		});

		L.marker(labelPoint, { icon: labelIcon }).addTo(container);
	}

	return container;
}

// Fungsi untuk mendapatkan titik-titik yang membentuk sektor
function getSectorPoints(center, radius, startAngle, endAngle, numPoints = 10) {
	const points = [];
	const [lat, lng] = [center.lat || center[0], center.lng || center[1]];

	// Tambahkan titik pusat
	points.push([lat, lng]);

	// Tambahkan titik-titik di sepanjang busur
	for (let i = 0; i <= numPoints; i++) {
		const angle = startAngle + (endAngle - startAngle) * (i / numPoints);
		const point = getPointAtDistance([lat, lng], radius, angle);
		points.push(point);
	}

	// Tambahkan titik pusat lagi untuk menutup polygon
	points.push([lat, lng]);

	return points;
}

// Fungsi untuk mendapatkan titik pada jarak dan sudut tertentu dari titik pusat
function getPointAtDistance(center, distance, angle) {
	// Konversi sudut dari derajat ke radian
	const angleRad = ((angle - 90) * Math.PI) / 180;

	// Konversi jarak dari meter ke derajat (perkiraan)
	const lat = center.lat || center[0];
	const lng = center.lng || center[1];

	// Faktor konversi (perkiraan)
	const latFactor = 1 / 111000; // 1 derajat = sekitar 111 km
	const lngFactor = 1 / (111000 * Math.cos((lat * Math.PI) / 180));

	// Hitung offset
	const latOffset = distance * Math.cos(angleRad) * latFactor;
	const lngOffset = distance * Math.sin(angleRad) * lngFactor;

	// Hitung koordinat baru
	return [lat + latOffset, lng + lngOffset];
}
