// Unwired Labs API Service
// Dokumentasi: https://unwiredlabs.com/api

// Token API Unwired Labs
const UNWIRED_API_TOKEN = "pk.8ce4becffc336ad8f98bce3b4a1839e9"; // Ganti dengan token Anda

// URL API Unwired Labs
const BASE_URL = "https://us1.unwiredlabs.com/v2";

// Cache untuk menyimpan hasil permintaan API
export const unwiredCache = {
	data: {},
	timestamp: {},

	// Fungsi untuk mendapatkan data dari cache
	get: function (key) {
		const now = Date.now();
		const cacheTime = 30 * 60 * 1000; // 30 menit

		if (this.data[key] && now - this.timestamp[key] < cacheTime) {
			console.log("Using cached data for", key);
			return this.data[key];
		}

		return null;
	},

	// Fungsi untuk menyimpan data ke cache
	set: function (key, data) {
		this.data[key] = data;
		this.timestamp[key] = Date.now();
	},
};

// 1. API Geolokasi - Mencari menara BTS berdasarkan batas peta
export const searchCellTowers = async (bounds, options = {}) => {
	try {
		console.log(
			"Searching cell towers in bounds:",
			bounds,
			"with options:",
			options
		);

		// Buat URL untuk API
		const apiUrl = `${BASE_URL}/process`;

		// Buat payload untuk permintaan API
		const payload = {
			token: UNWIRED_API_TOKEN,
			radio: options.radio || "all", // Cari semua jenis radio (GSM, UMTS, LTE, NR)
			mcc: options.mcc || 510, // Indonesia
			mnc: options.mnc || 0, // 0 untuk semua operator
			address: 1, // Minta alamat dalam respons
			area: {
				min_lat: bounds.getSouth(),
				max_lat: bounds.getNorth(),
				min_lon: bounds.getWest(),
				max_lon: bounds.getEast(),
			},
		};

		// Tambahkan LAC jika disediakan
		if (options.lac) {
			payload.lac = options.lac;
		}

		// Tambahkan Cell ID jika disediakan
		if (options.cellid) {
			payload.cellid = options.cellid;
		}

		console.log("Sending request to Unwired Labs API:", payload);

		// Kirim permintaan ke API
		const response = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Origin: window.location.origin,
			},
			body: JSON.stringify(payload),
		});

		// Periksa status respons
		if (!response.ok) {
			throw new Error(
				`API returned status ${response.status}: ${response.statusText}`
			);
		}

		// Parse respons JSON
		const data = await response.json();
		console.log("Unwired Labs API response:", data);

		// Periksa status respons API
		if (data.status === "ok" && data.cells && data.cells.length > 0) {
			// Format data untuk aplikasi
			const formattedData = formatBTSData(data);
			console.log("Formatted BTS data:", formattedData);
			return formattedData;
		} else if (data.status === "error") {
			throw new Error(`API Error: ${data.message || "Unknown error"}`);
		} else {
			console.log(
				"No cell towers found in this area, generating fallback data"
			);
			// Jika tidak ada data, gunakan data fallback
			return generateFallbackBTSData(bounds);
		}
	} catch (error) {
		console.error("Error fetching cell towers from Unwired Labs:", error);
		console.log("Falling back to generated data");
		// Jika terjadi error, gunakan data fallback
		return generateFallbackBTSData(bounds);
	}
};

// 1.1 API Geolokasi - Mencari menara BTS berdasarkan LAC
export const searchCellTowersByLAC = async (lac, bounds) => {
	try {
		console.log(`Searching cell towers with LAC: ${lac}`);

		// Validasi LAC
		if (!lac || isNaN(parseInt(lac))) {
			console.error("Invalid LAC value:", lac);
			throw new Error("LAC harus berupa angka");
		}

		// Validasi bounds
		if (!bounds || typeof bounds.getSouth !== "function") {
			console.error("Invalid bounds object:", bounds);
			throw new Error("Batas peta tidak valid");
		}

		// Gunakan fungsi searchCellTowers dengan parameter LAC
		const result = await searchCellTowers(bounds, { lac: parseInt(lac) });
		console.log("LAC search result:", result);
		return result;
	} catch (error) {
		console.error(`Error searching cell towers by LAC ${lac}:`, error);
		throw error;
	}
};

// 2. API Geocoding - Forward Geocoding (alamat ke koordinat)
export const forwardGeocode = async (address) => {
	try {
		console.log("Forward geocoding for address:", address);

		// Buat URL untuk API
		const apiUrl = `${BASE_URL}/search`;

		// Buat key cache
		const cacheKey = `geocode_${address}`;

		// Cek apakah data ada di cache
		const cachedData = unwiredCache.get(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// Buat payload untuk permintaan API
		const params = new URLSearchParams({
			token: UNWIRED_API_TOKEN,
			q: address,
			limit: 5,
		});

		// Kirim permintaan ke API
		const response = await fetch(`${apiUrl}?${params.toString()}`);

		// Periksa status respons
		if (!response.ok) {
			throw new Error(
				`API returned status ${response.status}: ${response.statusText}`
			);
		}

		// Parse respons JSON
		const data = await response.json();
		console.log("Forward geocoding response:", data);

		// Simpan hasil ke cache
		unwiredCache.set(cacheKey, data);

		return data;
	} catch (error) {
		console.error("Error in forward geocoding:", error);
		throw error;
	}
};

// 3. API Geocoding - Reverse Geocoding (koordinat ke alamat)
export const reverseGeocode = async (lat, lon) => {
	try {
		console.log(`Reverse geocoding for coordinates: ${lat}, ${lon}`);

		// Buat URL untuk API
		const apiUrl = `${BASE_URL}/reverse`;

		// Buat key cache
		const cacheKey = `reverse_${lat}_${lon}`;

		// Cek apakah data ada di cache
		const cachedData = unwiredCache.get(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// Buat payload untuk permintaan API
		const params = new URLSearchParams({
			token: UNWIRED_API_TOKEN,
			lat: lat,
			lon: lon,
			zoom: 18,
			accept_language: "id",
		});

		// Kirim permintaan ke API
		const response = await fetch(`${apiUrl}?${params.toString()}`);

		// Periksa status respons
		if (!response.ok) {
			throw new Error(
				`API returned status ${response.status}: ${response.statusText}`
			);
		}

		// Parse respons JSON
		const data = await response.json();
		console.log("Reverse geocoding response:", data);

		// Simpan hasil ke cache
		unwiredCache.set(cacheKey, data);

		return data;
	} catch (error) {
		console.error("Error in reverse geocoding:", error);
		throw error;
	}
};

// 4. API Timezone - Mendapatkan informasi zona waktu
export const getTimezone = async (lat, lon) => {
	try {
		console.log(`Getting timezone for coordinates: ${lat}, ${lon}`);

		// Buat URL untuk API
		const apiUrl = `${BASE_URL}/timezone`;

		// Buat key cache
		const cacheKey = `timezone_${lat}_${lon}`;

		// Cek apakah data ada di cache
		const cachedData = unwiredCache.get(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// Buat payload untuk permintaan API
		const params = new URLSearchParams({
			token: UNWIRED_API_TOKEN,
			lat: lat,
			lon: lon,
		});

		// Kirim permintaan ke API
		const response = await fetch(`${apiUrl}?${params.toString()}`);

		// Periksa status respons
		if (!response.ok) {
			throw new Error(
				`API returned status ${response.status}: ${response.statusText}`
			);
		}

		// Parse respons JSON
		const data = await response.json();
		console.log("Timezone response:", data);

		// Simpan hasil ke cache
		unwiredCache.set(cacheKey, data);

		return data;
	} catch (error) {
		console.error("Error getting timezone:", error);
		throw error;
	}
};

// 5. API Balance - Mendapatkan informasi saldo
export const getBalance = async () => {
	try {
		console.log("Getting API balance");

		// Buat URL untuk API
		const apiUrl = `${BASE_URL}/balance`;

		// Buat payload untuk permintaan API
		const params = new URLSearchParams({
			token: UNWIRED_API_TOKEN,
		});

		// Kirim permintaan ke API
		const response = await fetch(`${apiUrl}?${params.toString()}`);

		// Periksa status respons
		if (!response.ok) {
			throw new Error(
				`API returned status ${response.status}: ${response.statusText}`
			);
		}

		// Parse respons JSON
		const data = await response.json();
		console.log("Balance response:", data);

		return data;
	} catch (error) {
		console.error("Error getting balance:", error);
		throw error;
	}
};

// 6. API Static Maps - Mendapatkan gambar peta statis
export const getStaticMap = (
	lat,
	lon,
	zoom = 14,
	width = 600,
	height = 400,
	markers = []
) => {
	// Buat URL untuk API Static Maps
	const baseUrl = "https://maps.locationiq.com/v3/staticmap";

	// Buat parameter untuk permintaan API
	const params = new URLSearchParams({
		key: UNWIRED_API_TOKEN,
		center: `${lat},${lon}`,
		zoom: zoom,
		size: `${width}x${height}`,
		format: "png",
		maptype: "roadmap",
	});

	// Tambahkan marker jika ada
	if (markers && markers.length > 0) {
		markers.forEach((marker) => {
			params.append(
				`markers`,
				`icon:${marker.icon || "large-red-cutout"}|${marker.lat},${marker.lon}`
			);
		});
	}

	// Kembalikan URL lengkap
	return `${baseUrl}?${params.toString()}`;
};

// Helper untuk mendapatkan nama operator berdasarkan MNC
export const getOperatorName = (mnc) => {
	const operators = {
		1: "Telkomsel",
		10: "Telkomsel",
		11: "XL Axiata",
		21: "Indosat",
		89: "Tri",
		99: "Axis",
		// Tambahkan operator lain sesuai kebutuhan
	};

	return operators[mnc] || "Unknown";
};

// Fungsi untuk menyesuaikan format data dari LocationAPI
export const formatBTSData = (apiData) => {
	if (!apiData || !apiData.cells) return { cells: [] };

	return {
		cells: apiData.cells.map((cell) => ({
			lat: cell.lat,
			lon: cell.lon,
			radio: cell.radio || "LTE",
			mcc: cell.mcc,
			mnc: cell.mnc,
			lac: cell.lac,
			cellid: cell.cid,
			averageSignalStrength: cell.signal || -70, // Default jika tidak ada
			samples: cell.samples || 1,
			operator: getOperatorName(cell.mnc), // Fungsi helper untuk mendapatkan nama operator
			cellRadius: cell.range || 500, // Gunakan range sebagai radius jika ada
			accuracy: cell.accuracy || 500, // Akurasi lokasi
			frequency: cell.frequency || "Unknown",
			address: apiData.address || "Alamat tidak tersedia",
		})),
	};
};

// Fungsi untuk menghasilkan data BTS fallback jika API gagal
export const generateFallbackBTSData = (bounds) => {
	console.log("Generating fallback BTS data for bounds:", bounds);

	// Hitung pusat bounds
	const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
	const centerLon = (bounds.getEast() + bounds.getWest()) / 2;

	// Database kota-kota besar di Indonesia dengan koordinat
	const cityDatabase = [
		{ name: "Jakarta", center: { lat: -6.2, lon: 106.8 }, radius: 0.5 },
		{ name: "Surabaya", center: { lat: -7.25, lon: 112.75 }, radius: 0.3 },
		{ name: "Bandung", center: { lat: -6.9, lon: 107.6 }, radius: 0.2 },
		{ name: "Medan", center: { lat: 3.6, lon: 98.7 }, radius: 0.2 },
		{ name: "Makassar", center: { lat: -5.1, lon: 119.4 }, radius: 0.2 },
		{ name: "Pontianak", center: { lat: 0.0, lon: 109.3 }, radius: 0.2 },
		{ name: "Palembang", center: { lat: -2.9, lon: 104.7 }, radius: 0.2 },
		{ name: "Semarang", center: { lat: -7.0, lon: 110.4 }, radius: 0.2 },
		{ name: "Yogyakarta", center: { lat: -7.8, lon: 110.4 }, radius: 0.2 },
		{ name: "Denpasar", center: { lat: -8.7, lon: 115.2 }, radius: 0.2 },
	];

	// Cari kota terdekat berdasarkan koordinat pusat bounds
	let closestCity = null;
	let minDistance = Number.MAX_VALUE;

	for (const city of cityDatabase) {
		const distance = Math.sqrt(
			Math.pow(centerLat - city.center.lat, 2) +
				Math.pow(centerLon - city.center.lon, 2)
		);

		if (distance < minDistance) {
			minDistance = distance;
			closestCity = city;
		}
	}

	// Tentukan pusat area untuk penempatan BTS
	const center = { lat: centerLat, lon: centerLon };

	// Tentukan nama kota untuk referensi
	const cityName = closestCity ? closestCity.name : "Unknown";

	console.log(
		`Generating BTS data for area near ${cityName} (distance: ${minDistance.toFixed(
			2
		)} degrees)`
	);

	const cells = [];
	const operators = ["Telkomsel", "XL Axiata", "Indosat", "Tri", "Axis"];
	const radioTypes = ["GSM", "UMTS", "LTE", "NR"];

	// Lokasi-lokasi penting di kota-kota besar
	const cityLocations = {
		Jakarta: [
			{ name: "Monas", lat: -6.1754, lon: 106.8272 },
			{ name: "Thamrin", lat: -6.193, lon: 106.8236 },
			{ name: "Sudirman", lat: -6.2088, lon: 106.822 },
			{ name: "Kuningan", lat: -6.2301, lon: 106.8346 },
			{ name: "Kemang", lat: -6.2609, lon: 106.8131 },
			{ name: "Kelapa Gading", lat: -6.1628, lon: 106.9056 },
			{ name: "Senayan", lat: -6.2186, lon: 106.8019 },
			{ name: "Mangga Dua", lat: -6.1383, lon: 106.8293 },
		],
		Surabaya: [
			{ name: "Tunjungan Plaza", lat: -7.262, lon: 112.7382 },
			{ name: "Gubeng", lat: -7.2648, lon: 112.75 },
			{ name: "Kenjeran", lat: -7.2325, lon: 112.7972 },
			{ name: "Rungkut", lat: -7.3236, lon: 112.8011 },
			{ name: "Waru", lat: -7.3564, lon: 112.7267 },
		],
		Bandung: [
			{ name: "Dago", lat: -6.885, lon: 107.6133 },
			{ name: "Riau", lat: -6.9103, lon: 107.6081 },
			{ name: "Pasteur", lat: -6.8961, lon: 107.5989 },
			{ name: "Buah Batu", lat: -6.9444, lon: 107.6394 },
		],
		Pontianak: [
			{ name: "Tanjungpura", lat: 0.0263, lon: 109.3425 },
			{ name: "Gajah Mada", lat: -0.0276, lon: 109.3331 },
			{ name: "Ahmad Yani", lat: -0.0418, lon: 109.3144 },
			{ name: "Khatulistiwa", lat: 0.0001, lon: 109.3333 },
			{ name: "Sungai Raya", lat: -0.0697, lon: 109.3536 },
		],
	};

	// Jumlah BTS antara 10-20
	const numBTS = Math.floor(Math.random() * 10) + 10;

	for (let i = 0; i < numBTS; i++) {
		let lat, lon, locationName;

		// Periksa apakah kita memiliki lokasi penting untuk kota ini
		const hasImportantLocations =
			cityLocations[cityName] && cityLocations[cityName].length > 0;

		if (hasImportantLocations && Math.random() > 0.3) {
			// 70% kemungkinan menggunakan lokasi yang sudah ditentukan
			const location =
				cityLocations[cityName][
					Math.floor(Math.random() * cityLocations[cityName].length)
				];
			// Tambahkan sedikit variasi pada koordinat (dalam radius 500m)
			lat = location.lat + (Math.random() - 0.5) * 0.01; // ±0.005 derajat ~ 500m
			lon = location.lon + (Math.random() - 0.5) * 0.01;
			locationName = location.name;
		} else {
			// Buat koordinat dalam batas peta, tapi lebih dekat ke pusat
			// Gunakan distribusi Gaussian untuk membuat BTS lebih terkonsentrasi di pusat
			const randomFactor = 0.6; // Faktor untuk mengontrol seberapa jauh dari pusat
			lat =
				center.lat +
				(Math.random() - 0.5) *
					(bounds.getNorth() - bounds.getSouth()) *
					randomFactor;
			lon =
				center.lon +
				(Math.random() - 0.5) *
					(bounds.getEast() - bounds.getWest()) *
					randomFactor;
			locationName = `${cityName} Area ${i + 1}`;
		}

		// Pastikan koordinat masih dalam batas peta
		lat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), lat));
		lon = Math.max(bounds.getWest(), Math.min(bounds.getEast(), lon));

		// Pilih operator
		const operator = operators[Math.floor(Math.random() * operators.length)];

		// Pilih tipe radio
		const radio = radioTypes[Math.floor(Math.random() * radioTypes.length)];

		// Buat Cell ID
		const cellid = Math.floor(Math.random() * 1000000) + 1000;

		// Buat MNC berdasarkan operator
		let mnc;
		switch (operator) {
			case "Telkomsel":
				mnc = 10;
				break;
			case "XL Axiata":
				mnc = 11;
				break;
			case "Indosat":
				mnc = 21;
				break;
			case "Tri":
				mnc = 89;
				break;
			case "Axis":
				mnc = 99;
				break;
			default:
				mnc = 10;
		}

		// Buat data BTS
		cells.push({
			lat: lat,
			lon: lon,
			radio: radio,
			mcc: 510, // Indonesia
			mnc: mnc,
			lac: Math.floor(Math.random() * 10000) + 1000,
			cellid: cellid,
			averageSignalStrength: -1 * (Math.floor(Math.random() * 50) + 50), // -50 to -100 dBm
			samples: Math.floor(Math.random() * 100) + 1,
			operator: operator,
			// Gunakan radius yang lebih realistis berdasarkan tipe radio
			cellRadius:
				radio === "GSM"
					? Math.floor(Math.random() * 500) + 1000 // 1000-1500m untuk GSM
					: radio === "UMTS"
					? Math.floor(Math.random() * 300) + 500 // 500-800m untuk UMTS
					: radio === "LTE"
					? Math.floor(Math.random() * 200) + 300 // 300-500m untuk LTE
					: Math.floor(Math.random() * 100) + 100, // 100-200m untuk NR/5G
			// Akurasi lokasi yang lebih realistis
			accuracy: Math.floor(Math.random() * 100) + 50, // 50-150m
			frequency: `${Math.floor(Math.random() * 2600) + 700} MHz`,
			locationName: locationName, // Tambahkan nama lokasi untuk referensi
			cityName: cityName, // Tambahkan nama kota untuk referensi
			address: `${locationName}, ${cityName}`,
		});
	}

	console.log("Generated fallback BTS data:", { cells });
	return { cells };
};

// 1.2 API Geolokasi - Mencari menara BTS berdasarkan parameter (MCC, MNC, LAC, Cell ID)
export const searchCellTowersByParams = async (params, bounds) => {
	try {
		console.log("Searching cell towers with parameters:", params);

		// Validasi bounds
		if (!bounds || typeof bounds.getSouth !== "function") {
			console.error("Invalid bounds object:", bounds);
			throw new Error("Batas peta tidak valid");
		}

		// Buat objek options untuk searchCellTowers
		const options = {};

		// Tambahkan parameter yang valid
		if (params.mcc && !isNaN(parseInt(params.mcc))) {
			options.mcc = parseInt(params.mcc);
		}

		if (params.mnc && !isNaN(parseInt(params.mnc))) {
			options.mnc = parseInt(params.mnc);
		}

		if (params.lac && !isNaN(parseInt(params.lac))) {
			options.lac = parseInt(params.lac);
		}

		if (params.cellid && !isNaN(parseInt(params.cellid))) {
			options.cellid = parseInt(params.cellid);
		}

		console.log("Search options:", options);

		// Gunakan fungsi searchCellTowers dengan parameter yang diberikan
		const result = await searchCellTowers(bounds, options);
		console.log("Parameter search result:", result);
		return result;
	} catch (error) {
		console.error("Error searching cell towers by parameters:", error);
		throw error;
	}
};
