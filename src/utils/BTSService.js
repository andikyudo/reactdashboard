/**
 * Service untuk mengambil data BTS dari OpenCelliD API
 */

// Fungsi untuk mendapatkan BTS di area tertentu
export const getBTSInArea = async (apiKey, bounds, options = {}) => {
  try {
    const { mcc, mnc, lac, radio, limit = 50, offset = 0 } = options;
    
    // Format bounding box: latmin,lonmin,latmax,lonmax
    const bbox = `${bounds.southWest.lat},${bounds.southWest.lng},${bounds.northEast.lat},${bounds.northEast.lng}`;
    
    // Buat URL untuk API
    let url = `https://opencellid.org/cell/getInArea?key=${apiKey}&BBOX=${bbox}&format=json`;
    
    // Tambahkan parameter opsional jika ada
    if (mcc) url += `&mcc=${mcc}`;
    if (mnc) url += `&mnc=${mnc}`;
    if (lac) url += `&lac=${lac}`;
    if (radio) url += `&radio=${radio}`;
    
    // Tambahkan limit dan offset
    url += `&limit=${limit}&offset=${offset}`;
    
    // Lakukan request ke API
    const response = await fetch(url);
    
    // Jika response tidak OK, throw error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch BTS data');
    }
    
    // Parse response JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching BTS data:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan jumlah BTS di area tertentu
export const getBTSCountInArea = async (apiKey, bounds, options = {}) => {
  try {
    const { mcc, mnc, lac, radio } = options;
    
    // Format bounding box: latmin,lonmin,latmax,lonmax
    const bbox = `${bounds.southWest.lat},${bounds.southWest.lng},${bounds.northEast.lat},${bounds.northEast.lng}`;
    
    // Buat URL untuk API
    let url = `https://opencellid.org/cell/getInAreaSize?key=${apiKey}&BBOX=${bbox}&format=json`;
    
    // Tambahkan parameter opsional jika ada
    if (mcc) url += `&mcc=${mcc}`;
    if (mnc) url += `&mnc=${mnc}`;
    if (lac) url += `&lac=${lac}`;
    if (radio) url += `&radio=${radio}`;
    
    // Lakukan request ke API
    const response = await fetch(url);
    
    // Jika response tidak OK, throw error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch BTS count');
    }
    
    // Parse response JSON
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error fetching BTS count:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan informasi sel BTS berdasarkan MCC, MNC, LAC, dan CellID
export const getBTSInfo = async (apiKey, mcc, mnc, lac, cellid, radio) => {
  try {
    // Buat URL untuk API
    let url = `https://opencellid.org/cell/get?key=${apiKey}&mcc=${mcc}&mnc=${mnc}&lac=${lac}&cellid=${cellid}&format=json`;
    
    // Tambahkan parameter radio jika ada
    if (radio) url += `&radio=${radio}`;
    
    // Lakukan request ke API
    const response = await fetch(url);
    
    // Jika response tidak OK, throw error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch BTS info');
    }
    
    // Parse response JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching BTS info:', error);
    throw error;
  }
};
