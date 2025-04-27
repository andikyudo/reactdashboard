// LocationAPI service untuk mengakses Unwired Labs API
const LOCATION_API_TOKEN = "pk.8ce4becffc336ad8f98bce3b4a1839e9";
// URL API Unwired Labs
const BASE_URL = "https://us1.unwiredlabs.com/v2";

// Cache untuk menyimpan hasil permintaan API
export const btsCache = {
	data: {},
	timestamp: {},

	// Fungsi untuk mendapatkan data dari cache
	get: function (key) {
		const now = Date.now();
		const cacheTime = 30 * 60 * 1000; // 30 menit

		if (this.data[key] && now - this.timestamp[key] < cacheTime) {
			console.log("Using cached BTS data for", key);
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
		})),
	};
};

// Fungsi untuk mencari menara BTS di area tertentu menggunakan Unwired Labs API
export const searchCellTowers = async (bounds) => {
	try {
		console.log("Searching cell towers in bounds:", bounds);

		// Buat URL untuk proxy CORS Anywhere
		const corsProxy = "https://cors-anywhere.herokuapp.com/";
		const apiUrl = `${corsProxy}${BASE_URL}/search`;

		// Buat payload untuk permintaan API
		const payload = {
			token: LOCATION_API_TOKEN,
			radio: "all", // Cari semua jenis radio (GSM, UMTS, LTE, NR)
			mcc: 510, // Indonesia
			mnc: 0, // 0 untuk semua operator
			area: {
				min_lat: bounds.getSouth(),
				max_lat: bounds.getNorth(),
				min_lon: bounds.getWest(),
				max_lon: bounds.getEast(),
			},
		};

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

// Fungsi untuk mendapatkan informasi menara BTS berdasarkan Cell ID menggunakan Unwired Labs API
export const getCellTowerInfo = async (cellInfo) => {
	try {
		console.log("Getting cell tower info for:", cellInfo);

		// Validasi koordinat
		if (
			!cellInfo.lat ||
			!cellInfo.lon ||
			isNaN(parseFloat(cellInfo.lat)) ||
			isNaN(parseFloat(cellInfo.lon))
		) {
			console.warn("Invalid coordinates in cellInfo:", cellInfo);
			throw new Error("Koordinat tidak valid");
		}

		// Simpan koordinat asli untuk digunakan nanti
		const originalLat = parseFloat(cellInfo.lat);
		const originalLon = parseFloat(cellInfo.lon);

		// Buat URL untuk proxy CORS Anywhere
		const corsProxy = "https://cors-anywhere.herokuapp.com/";
		const apiUrl = `${corsProxy}${BASE_URL}/process`;

		// Buat payload untuk permintaan API
		const payload = {
			token: LOCATION_API_TOKEN,
			radio: cellInfo.radio || "lte",
			mcc: cellInfo.mcc || 510,
			mnc: cellInfo.mnc || 10,
			cells: [
				{
					lac: cellInfo.lac,
					cid: cellInfo.cellid,
				},
			],
			address: 1, // Minta alamat dalam respons
		};

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
		if (data.status === "ok") {
			// PENTING: Gunakan koordinat asli dari cellInfo, bukan dari API
			// Ini memastikan detail lokasi sesuai dengan marker pada peta
			return {
				lat: originalLat,
				lon: originalLon,
				accuracy: data.accuracy || cellInfo.accuracy || 100,
				address: data.address || "Alamat tidak tersedia",
			};
		} else {
			throw new Error(`API Error: ${data.message || "Unknown error"}`);
		}
	} catch (error) {
		console.error("Error fetching cell tower info from Unwired Labs:", error);
		console.log("Falling back to generated data");
		// Jika terjadi error, gunakan data fallback dengan koordinat asli
		return generateFallbackCellInfo(cellInfo);
	}
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
		});
	}

	console.log("Generated fallback BTS data:", { cells });
	return { cells };
};

// Fungsi untuk menghasilkan informasi cell fallback jika API gagal
export const generateFallbackCellInfo = (cellInfo) => {
	console.log("Generating fallback cell info for:", cellInfo);

	// Pastikan kita memiliki koordinat yang valid
	const lat = cellInfo.lat || 0;
	const lon = cellInfo.lon || 0;

	// Database kota-kota besar di Indonesia dengan koordinat dan informasi jalan
	const cityDatabase = [
		{
			name: "Jakarta",
			center: { lat: -6.2, lon: 106.8 },
			radius: 0.5, // Radius dalam derajat (sekitar 50km)
			areas: {
				Pusat: [
					"Jalan Thamrin",
					"Jalan Sudirman",
					"Jalan Wahid Hasyim",
					"Jalan Kebon Sirih",
				],
				Selatan: [
					"Jalan TB Simatupang",
					"Jalan Fatmawati",
					"Jalan Kemang Raya",
					"Jalan Casablanca",
				],
				Utara: [
					"Jalan Gunung Sahari",
					"Jalan Mangga Dua",
					"Jalan Sunter",
					"Jalan Pluit",
				],
				Barat: [
					"Jalan Panjang",
					"Jalan Kedoya Raya",
					"Jalan Kebon Jeruk",
					"Jalan Tomang Raya",
				],
				Timur: [
					"Jalan Jatinegara",
					"Jalan Rawamangun",
					"Jalan Pemuda",
					"Jalan Raya Bogor",
				],
			},
		},
		{
			name: "Surabaya",
			center: { lat: -7.25, lon: 112.75 },
			radius: 0.3,
			areas: {
				Pusat: ["Jalan Tunjungan", "Jalan Pemuda", "Jalan Basuki Rahmat"],
				Selatan: [
					"Jalan Raya Margorejo",
					"Jalan Raya Waru",
					"Jalan Ahmad Yani",
				],
				Utara: ["Jalan Perak", "Jalan Rajawali", "Jalan Kembang Jepun"],
				Barat: [
					"Jalan Raya Darmo",
					"Jalan Raya Diponegoro",
					"Jalan Raya Dukuh Kupang",
				],
				Timur: [
					"Jalan Raya Kenjeran",
					"Jalan Raya Mulyosari",
					"Jalan Raya Manyar",
				],
			},
		},
		{
			name: "Bandung",
			center: { lat: -6.9, lon: 107.6 },
			radius: 0.2,
			areas: {
				Pusat: ["Jalan Asia Afrika", "Jalan Braga", "Jalan Merdeka"],
				Selatan: [
					"Jalan Buah Batu",
					"Jalan Soekarno Hatta",
					"Jalan Gatot Subroto",
				],
				Utara: ["Jalan Setiabudi", "Jalan Sukajadi", "Jalan Cihampelas"],
				Barat: ["Jalan Pasir Koja", "Jalan Jamika", "Jalan Astana Anyar"],
				Timur: ["Jalan Ahmad Yani", "Jalan Antapani", "Jalan Surapati"],
			},
		},
		{
			name: "Medan",
			center: { lat: 3.6, lon: 98.7 },
			radius: 0.2,
			areas: {
				Pusat: ["Jalan Pemuda", "Jalan Diponegoro", "Jalan SM Raja"],
				Selatan: [
					"Jalan Gatot Subroto",
					"Jalan Krakatau",
					"Jalan Sisingamangaraja",
				],
				Utara: [
					"Jalan Yos Sudarso",
					"Jalan KH Wahid Hasyim",
					"Jalan Putri Hijau",
				],
				Barat: ["Jalan Setia Budi", "Jalan Kapten Muslim", "Jalan Karya"],
				Timur: ["Jalan Letda Sujono", "Jalan HM Joni", "Jalan Sakti Lubis"],
			},
		},
		{
			name: "Makassar",
			center: { lat: -5.1, lon: 119.4 },
			radius: 0.2,
			areas: {
				Pusat: [
					"Jalan Jenderal Sudirman",
					"Jalan Ahmad Yani",
					"Jalan Penghibur",
				],
				Selatan: [
					"Jalan Tanjung Bunga",
					"Jalan Metro Tanjung Bunga",
					"Jalan Nusantara",
				],
				Utara: [
					"Jalan Urip Sumoharjo",
					"Jalan Perintis Kemerdekaan",
					"Jalan Hertasning",
				],
				Barat: ["Jalan Somba Opu", "Jalan Sulawesi", "Jalan Bontolempangan"],
				Timur: [
					"Jalan AP Pettarani",
					"Jalan Toddopuli Raya",
					"Jalan Antang Raya",
				],
			},
		},
		{
			name: "Pontianak",
			center: { lat: 0.0, lon: 109.3 },
			radius: 0.2,
			areas: {
				Pusat: ["Jalan Tanjungpura", "Jalan Gajah Mada", "Jalan Diponegoro"],
				Selatan: [
					"Jalan Ahmad Yani",
					"Jalan Imam Bonjol",
					"Jalan Parit Haji Husin",
				],
				Utara: ["Jalan Khatulistiwa", "Jalan 28 Oktober", "Jalan Budi Utomo"],
				Barat: [
					"Jalan Veteran",
					"Jalan Gusti Situt Mahmud",
					"Jalan Kom Yos Sudarso",
				],
				Timur: [
					"Jalan Tanjung Raya",
					"Jalan Parit Haji Husin II",
					"Jalan Sultan Hamid II",
				],
			},
		},
		{
			name: "Palembang",
			center: { lat: -2.9, lon: 104.7 },
			radius: 0.2,
			areas: {
				Pusat: [
					"Jalan Jenderal Sudirman",
					"Jalan Kapten A Rivai",
					"Jalan Merdeka",
				],
				Selatan: [
					"Jalan MP Mangkunegara",
					"Jalan Kolonel Atmo",
					"Jalan Demang Lebar Daun",
				],
				Utara: ["Jalan Mayor Zen", "Jalan Jenderal Ahmad Yani", "Jalan Radial"],
				Barat: ["Jalan Basuki Rahmat", "Jalan Veteran", "Jalan Rajawali"],
				Timur: [
					"Jalan KH Wahid Hasyim",
					"Jalan Kol H Burlian",
					"Jalan DI Panjaitan",
				],
			},
		},
	];

	// Jika cellInfo memiliki cityName, gunakan itu untuk mencari kota
	let closestCity = null;

	if (cellInfo.cityName) {
		closestCity = cityDatabase.find((city) => city.name === cellInfo.cityName);
	}

	// Jika tidak ada cityName atau tidak ditemukan, cari kota terdekat berdasarkan koordinat
	if (!closestCity) {
		let minDistance = Number.MAX_VALUE;

		for (const city of cityDatabase) {
			const distance = Math.sqrt(
				Math.pow(lat - city.center.lat, 2) + Math.pow(lon - city.center.lon, 2)
			);

			if (distance < minDistance) {
				minDistance = distance;
				closestCity = city;
			}
		}
	}

	// Jika tidak ada kota yang dekat atau terlalu jauh, gunakan data generik
	if (
		!closestCity ||
		(!cellInfo.cityName &&
			Math.sqrt(
				Math.pow(lat - closestCity.center.lat, 2) +
					Math.pow(lon - closestCity.center.lon, 2)
			) > closestCity.radius)
	) {
		// Gunakan data generik untuk lokasi yang tidak dikenal
		// Coba dapatkan nama kota dari cityName jika tersedia
		const cityNameFromInfo = cellInfo.cityName || "Tidak Diketahui";
		const locationNameFromInfo = cellInfo.locationName || "";

		// Buat alamat yang lebih deskriptif berdasarkan informasi yang tersedia
		let genericAddress;
		if (locationNameFromInfo) {
			genericAddress = `${locationNameFromInfo}, ${cityNameFromInfo}`;
		} else {
			genericAddress = `Jalan Tidak Diketahui No. ${
				Math.floor(Math.random() * 100) + 1
			}, ${cityNameFromInfo}`;
		}

		return {
			lat: lat,
			lon: lon,
			accuracy: cellInfo.accuracy || Math.floor(Math.random() * 100) + 50, // Gunakan akurasi dari cellInfo jika tersedia
			address: genericAddress,
		};
	}

	// Pilih area secara acak dari kota terdekat
	const areas = Object.keys(closestCity.areas);
	const randomArea = areas[Math.floor(Math.random() * areas.length)];

	// Pilih jalan secara acak dari area yang dipilih
	const streets = closestCity.areas[randomArea];
	const randomStreet = streets[Math.floor(Math.random() * streets.length)];

	// Buat nomor jalan
	const number = Math.floor(Math.random() * 100) + 1;

	// Buat alamat
	const address = `${randomStreet} No. ${number}, ${closestCity.name} ${randomArea}`;

	// Buat data lokasi
	const locationDetails = {
		lat: lat,
		lon: lon,
		accuracy: cellInfo.accuracy || Math.floor(Math.random() * 100) + 50, // Gunakan akurasi dari cellInfo jika tersedia
		address: address,
	};

	console.log(
		"Generated fallback cell info for location:",
		closestCity.name,
		locationDetails
	);
	return locationDetails;
};
