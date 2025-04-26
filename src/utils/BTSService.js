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

		console.log("Fetching BTS data from URL:", url);

		// Lakukan request ke API dengan mode CORS
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			mode: "cors",
		});

		// Log response status
		console.log(
			"BTS API response status:",
			response.status,
			response.statusText
		);

		// Jika response tidak OK, throw error
		if (!response.ok) {
			let errorMessage = `HTTP error! status: ${response.status}`;
			try {
				const errorData = await response.json();
				errorMessage = errorData.message || errorMessage;
			} catch (e) {
				// Jika tidak bisa parse JSON, gunakan pesan error default
			}
			throw new Error(errorMessage);
		}

		// Parse response JSON
		const data = await response.json();
		console.log("BTS data received:", data);
		return data;
	} catch (error) {
		console.error("Error fetching BTS data:", error);
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

		console.log("Fetching BTS count from URL:", url);

		// Lakukan request ke API dengan mode CORS
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			mode: "cors",
		});

		// Log response status
		console.log(
			"BTS count API response status:",
			response.status,
			response.statusText
		);

		// Jika response tidak OK, throw error
		if (!response.ok) {
			let errorMessage = `HTTP error! status: ${response.status}`;
			try {
				const errorData = await response.json();
				errorMessage = errorData.message || errorMessage;
			} catch (e) {
				// Jika tidak bisa parse JSON, gunakan pesan error default
			}
			throw new Error(errorMessage);
		}

		// Parse response JSON
		const data = await response.json();
		console.log("BTS count received:", data);
		return data.count;
	} catch (error) {
		console.error("Error fetching BTS count:", error);
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

		console.log("Fetching BTS info from URL:", url);

		// Lakukan request ke API dengan mode CORS
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			mode: "cors",
		});

		// Log response status
		console.log(
			"BTS info API response status:",
			response.status,
			response.statusText
		);

		// Jika response tidak OK, throw error
		if (!response.ok) {
			let errorMessage = `HTTP error! status: ${response.status}`;
			try {
				const errorData = await response.json();
				errorMessage = errorData.message || errorMessage;
			} catch (e) {
				// Jika tidak bisa parse JSON, gunakan pesan error default
			}
			throw new Error(errorMessage);
		}

		// Parse response JSON
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching BTS info:", error);
		throw error;
	}
};
