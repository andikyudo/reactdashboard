// Fungsi untuk melakukan reverse geocoding menggunakan Nominatim API
export const reverseGeocode = async (lat, lon) => {
  try {
    console.log(`Performing reverse geocoding for coordinates: ${lat}, ${lon}`);
    
    // Buat URL untuk Nominatim API
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    
    // Tambahkan header untuk menghindari throttling
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReactDashboard/1.0',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API returned status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Nominatim API response:", data);
    
    // Ekstrak informasi yang relevan
    const result = {
      address: data.display_name,
      city: data.address.city || 
            data.address.town || 
            data.address.village || 
            data.address.county || 
            data.address.state || 
            "Tidak tersedia",
      road: data.address.road || "Jalan tidak diketahui",
      suburb: data.address.suburb || data.address.neighbourhood || "",
      postcode: data.address.postcode || "",
      country: data.address.country || "Indonesia",
      raw: data // Simpan data mentah untuk referensi
    };
    
    return result;
  } catch (error) {
    console.error("Error performing reverse geocoding:", error);
    return null;
  }
};
