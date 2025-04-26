import L from 'leaflet';

// Fungsi untuk membuat sektor cell ID
export function createCellSectors(map, latlng, radius, numSectors = 6, options = {}) {
  const { color = 'rgba(255, 0, 255, 0.5)', fillColor = 'rgba(255, 0, 255, 0.1)' } = options;
  
  // Buat container untuk semua sektor
  const container = L.layerGroup().addTo(map);
  
  // Buat lingkaran utama dengan animasi radar
  const circle = L.circle(latlng, {
    radius: radius,
    color: color,
    fillColor: fillColor,
    fillOpacity: 0.1,
    weight: 1,
    className: 'radar-circle'
  }).addTo(container);
  
  // Tambahkan elemen sweep radar
  const icon = L.divIcon({
    className: 'radar-container',
    html: `<div class="radar-sweep" style="width: ${radius * 2}px; height: ${radius * 2}px;"></div>`,
    iconSize: [radius * 2, radius * 2],
    iconAnchor: [radius, radius]
  });
  
  L.marker(latlng, { icon }).addTo(container);
  
  // Buat sektor-sektor
  const sectorAngle = 360 / numSectors;
  
  for (let i = 0; i < numSectors; i++) {
    // Hitung sudut untuk sektor ini
    const startAngle = i * sectorAngle;
    const endAngle = (i + 1) * sectorAngle;
    
    // Buat sektor dengan polygon
    const sectorPoints = getSectorPoints(latlng, radius, startAngle, endAngle, 10);
    
    const sector = L.polygon(sectorPoints, {
      color: color,
      fillColor: `hsl(${(i * 360 / numSectors) % 360}, 70%, 60%)`,
      fillOpacity: 0.2,
      weight: 1
    }).addTo(container);
    
    // Tambahkan label sektor
    const labelAngle = startAngle + sectorAngle / 2;
    const labelDistance = radius * 0.7;
    const labelPoint = getPointAtDistance(latlng, labelDistance, labelAngle);
    
    const labelIcon = L.divIcon({
      className: 'sector-label',
      html: `<div>${i + 1}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
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
  const angleRad = (angle - 90) * Math.PI / 180;
  
  // Konversi jarak dari meter ke derajat (perkiraan)
  const lat = center.lat || center[0];
  const lng = center.lng || center[1];
  
  // Faktor konversi (perkiraan)
  const latFactor = 1 / 111000; // 1 derajat = sekitar 111 km
  const lngFactor = 1 / (111000 * Math.cos(lat * Math.PI / 180));
  
  // Hitung offset
  const latOffset = distance * Math.cos(angleRad) * latFactor;
  const lngOffset = distance * Math.sin(angleRad) * lngFactor;
  
  // Hitung koordinat baru
  return [lat + latOffset, lng + lngOffset];
}
