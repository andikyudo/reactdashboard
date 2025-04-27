import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import "../styles/pulsing-dot.css";
import "../styles/tower-icon.css";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Import PulsingDot
import { createPulsingDotMarker } from "../utils/PulsingDot";
// Import Cell Sector
import { createCellSectors } from "../utils/CellSector";
// Import LocationAPI service
import { btsCache, searchCellTowers } from "../services/locationApi";
// Import Unwired Labs API service
import { searchCellTowers as unwiredSearchCellTowers } from "../services/unwiredLabsApi";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Kategori lokasi
const categories = [
	{ id: "all", name: "Semua" },
	{ id: "landmark", name: "Landmark" },
	{ id: "museum", name: "Museum" },
	{ id: "recreation", name: "Rekreasi" },
	{ id: "government", name: "Pemerintahan" },
];

// Lokasi penting di Jakarta dengan kategori
const locations = [
	{
		id: 1,
		name: "Monumen Nasional",
		position: { lat: -6.1754, lng: 106.8272 },
		category: "landmark",
	},
	{
		id: 2,
		name: "Istana Merdeka",
		position: { lat: -6.1701, lng: 106.8219 },
		category: "government",
	},
	{
		id: 3,
		name: "Taman Mini Indonesia Indah",
		position: { lat: -6.3024, lng: 106.8951 },
		category: "recreation",
	},
	{
		id: 4,
		name: "Ancol Dreamland",
		position: { lat: -6.1261, lng: 106.8308 },
		category: "recreation",
	},
	{
		id: 5,
		name: "Museum Nasional",
		position: { lat: -6.1769, lng: 106.8222 },
		category: "museum",
	},
	{
		id: 6,
		name: "Museum Macan",
		position: { lat: -6.2185, lng: 106.8107 },
		category: "museum",
	},
	{
		id: 7,
		name: "Gedung DPR/MPR",
		position: { lat: -6.2088, lng: 106.8005 },
		category: "government",
	},
	{
		id: 8,
		name: "Patung Selamat Datang",
		position: { lat: -6.195, lng: 106.8233 },
		category: "landmark",
	},
];

// Warna marker berdasarkan kategori
const categoryColors = {
	landmark: "red",
	museum: "purple",
	recreation: "gold",
	government: "orange",
};

// Mode transportasi
const travelModes = [
	{ id: "car", name: "Mobil" },
	{ id: "foot", name: "Jalan Kaki" },
	{ id: "bicycle", name: "Sepeda" },
];

// Fungsi untuk mendapatkan warna berdasarkan operator
// eslint-disable-next-line no-unused-vars
const getOperatorColor = (operator) => {
	const colors = {
		Telkomsel: "rgb(255, 0, 0)", // Merah
		"XL Axiata": "rgb(0, 0, 255)", // Biru
		Indosat: "rgb(255, 165, 0)", // Oranye
		Tri: "rgb(128, 0, 128)", // Ungu
		Axis: "rgb(0, 128, 0)", // Hijau
		Smartfren: "rgb(255, 0, 255)", // Magenta
	};

	return colors[operator] || "rgb(128, 128, 128)"; // Abu-abu sebagai default
};

function LeafletMap() {
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResult, setSearchResult] = useState(null);
	const [userLocation, setUserLocation] = useState(null);
	const [isLocating, setIsLocating] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("all");

	// State untuk rute
	const [origin, setOrigin] = useState(null);
	const [destination, setDestination] = useState(null);
	const [routeInfo, setRouteInfo] = useState(null);
	const [travelMode, setTravelMode] = useState("car");

	// State untuk BTS
	const [showBTS, setShowBTS] = useState(false);
	const [btsData, setBtsData] = useState([]);
	const [btsCount, setBtsCount] = useState(0);
	const [isLoadingBTS, setIsLoadingBTS] = useState(false);
	const [btsError, setBtsError] = useState(null);
	const [selectedProvider, setSelectedProvider] = useState("all");

	// State untuk fitur Unwired Labs
	const [useUnwiredLabs, setUseUnwiredLabs] = useState(false); // Toggle untuk menggunakan API Unwired Labs
	const [selectedBTSLocation, setSelectedBTSLocation] = useState(null); // Lokasi BTS yang dipilih untuk detail
	const [showStaticMap, setShowStaticMap] = useState(false); // Toggle untuk menampilkan peta statis
	const [showApiBalance, setShowApiBalance] = useState(false); // Toggle untuk menampilkan saldo API

	// Daftar provider yang tersedia
	const providers = [
		{ id: "all", name: "Semua Provider" },
		{ id: "Telkomsel", name: "Telkomsel" },
		{ id: "Indosat", name: "Indosat" },
		{ id: "XL Axiata", name: "XL Axiata" },
		{ id: "Tri", name: "Tri (3)" },
		{ id: "Axis", name: "Axis" },
		{ id: "Smartfren", name: "Smartfren" },
	];

	const mapRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const markersRef = useRef([]);
	const btsMarkersRef = useRef([]);
	const routeLayerRef = useRef(null);

	// Inisialisasi peta
	useEffect(() => {
		if (!mapInstanceRef.current && mapRef.current) {
			// Perbaiki masalah icon Leaflet
			let DefaultIcon = L.icon({
				iconUrl: icon,
				shadowUrl: iconShadow,
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
			});

			L.Marker.prototype.options.icon = DefaultIcon;

			// Inisialisasi peta
			const mapInstance = L.map(mapRef.current).setView(
				[-6.2088, 106.8456],
				10
			);

			// Tambahkan tile layer
			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(mapInstance);

			mapInstanceRef.current = mapInstance;

			// Tambahkan marker untuk lokasi
			addMarkersToMap();

			// PENTING: Set showBTS ke true secara default
			setShowBTS(true);

			// Tambahkan event listener untuk perubahan zoom dan pan
			// Gunakan event moveend untuk memperbarui marker BTS secara otomatis
			mapInstanceRef.current.on("moveend", () => {
				console.log("Map moved, updating BTS markers automatically");
				// Selalu muat data BTS saat peta bergerak, tanpa memeriksa showBTS
				// Gunakan setTimeout untuk memastikan state showBTS sudah diperbarui
				setTimeout(() => {
					loadBTSData();
				}, 10);
			});

			// Muat BTS secara otomatis segera setelah peta dimuat
			console.log("Loading BTS data immediately after map initialization");

			// Gunakan setTimeout untuk memastikan state showBTS sudah diperbarui
			setTimeout(() => {
				console.log("Executing delayed BTS data load, showBTS:", showBTS);
				loadBTSData();
			}, 100);
		}

		// Cleanup function
		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
			}
		};
		/* eslint-disable react-hooks/exhaustive-deps */
		// Kita sengaja tidak menambahkan addMarkersToMap, loadBTSData, dan showBTS sebagai dependencies
		// karena akan menyebabkan re-render yang tidak perlu dan kemungkinan infinite loop
	}, []);

	// Tambahkan marker ke peta
	const addMarkersToMap = () => {
		if (!mapInstanceRef.current) return;

		// Hapus marker yang ada
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		// Filter lokasi berdasarkan kategori
		const filteredLocations =
			selectedCategory === "all"
				? locations
				: locations.filter(
						(location) => location.category === selectedCategory
				  );

		// Tambahkan marker baru menggunakan PulsingDot
		filteredLocations.forEach((location) => {
			// Buat marker dengan PulsingDot
			const marker = createPulsingDotMarker(
				[location.position.lat, location.position.lng],
				{ category: location.category }
			)
				.addTo(mapInstanceRef.current)
				.bindPopup(
					`<b>${location.name}</b><br>${
						location.category
							? `Kategori: ${
									categories.find((c) => c.id === location.category)?.name ||
									location.category
							  }`
							: ""
					}`
				);

			marker.on("click", () => {
				handleMarkerClick(location);
			});

			markersRef.current.push(marker);
		});

		// Tambahkan marker untuk hasil pencarian
		if (searchResult) {
			// Buat marker dengan PulsingDot untuk hasil pencarian
			const searchMarker = createPulsingDotMarker(
				[searchResult.position.lat, searchResult.position.lng],
				{ category: "search" }
			)
				.addTo(mapInstanceRef.current)
				.bindPopup(`<b>${searchResult.name}</b>`);

			searchMarker.on("click", () => {
				handleMarkerClick(searchResult);
			});

			markersRef.current.push(searchMarker);
		}

		// Tambahkan marker untuk lokasi pengguna
		if (userLocation) {
			// Buat marker dengan PulsingDot untuk lokasi pengguna
			const userMarker = createPulsingDotMarker(
				[userLocation.lat, userLocation.lng],
				{ category: "user" }
			)
				.addTo(mapInstanceRef.current)
				.bindPopup("<b>Lokasi Anda</b>");

			userMarker.on("click", () => {
				handleMarkerClick({ name: "Lokasi Anda", position: userLocation });
			});

			markersRef.current.push(userMarker);
		}
	};

	// Update marker ketika kategori berubah
	useEffect(() => {
		addMarkersToMap();
		/* eslint-disable react-hooks/exhaustive-deps */
		// Kita sengaja tidak menambahkan addMarkersToMap sebagai dependency
		// karena akan menyebabkan re-render yang tidak perlu
	}, [selectedCategory, searchResult, userLocation]);

	// Update BTS markers ketika provider berubah
	useEffect(() => {
		console.log("Provider changed to:", selectedProvider);

		// Selalu muat data BTS ketika provider berubah, bahkan jika showBTS dimatikan
		// Ini memastikan data selalu difilter dengan benar
		if (btsData && btsData.length > 0) {
			console.log("Filtering existing BTS data for new provider");

			// Jika ada data yang sudah dimuat, filter berdasarkan provider baru
			if (selectedProvider !== "all") {
				// Filter data berdasarkan provider baru
				const filteredBTS = btsData.filter(
					(bts) => bts.operator === selectedProvider
				);
				console.log(
					`Filtered BTS for provider ${selectedProvider}:`,
					filteredBTS.length
				);

				// Update data BTS yang difilter
				setBtsData(filteredBTS);

				// Jika showBTS diaktifkan, perbarui marker
				if (showBTS) {
					clearBTSMarkers();
					addBTSMarkersToMap(filteredBTS);
				}
			} else {
				// Jika provider "all", muat ulang semua data
				console.log("Loading all BTS data for all providers");
				loadBTSData();
			}
		} else {
			// Jika belum ada data, muat data baru
			console.log("No existing BTS data, loading fresh data");
			loadBTSData();
		}
		/* eslint-disable react-hooks/exhaustive-deps */
		// Kita sengaja tidak menambahkan loadBTSData, showBTS, dan btsData sebagai dependencies
		// karena akan menyebabkan re-render yang tidak perlu
	}, [selectedProvider]);

	// Handle perubahan useUnwiredLabs
	useEffect(() => {
		console.log("useUnwiredLabs changed to:", useUnwiredLabs);

		// Reset state terkait BTS
		setSelectedBTSLocation(null);
		setShowStaticMap(false);

		// Jika showBTS aktif, muat ulang data BTS
		if (showBTS) {
			// Hapus marker yang ada
			clearBTSMarkers();

			// Muat ulang data BTS dengan API yang baru
			// Gunakan setTimeout untuk memastikan state sudah diperbarui
			setTimeout(() => {
				console.log("Reloading BTS data after API toggle");
				try {
					loadBTSData();
				} catch (error) {
					console.error("Error loading BTS data after API toggle:", error);
				}
			}, 300);
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [useUnwiredLabs]);

	// Handler untuk klik pada marker
	const handleMarkerClick = (location) => {
		setSelectedLocation(location);

		// Jika origin belum dipilih, set sebagai origin
		if (!origin) {
			setOrigin(location);
		}
		// Jika origin sudah dipilih tapi destination belum, set sebagai destination
		else if (!destination) {
			setDestination(location);
			calculateRoute(origin, location);
		}
		// Jika keduanya sudah dipilih, reset dan set yang baru sebagai origin
		else {
			setOrigin(location);
			setDestination(null);
			setRouteInfo(null);

			// Hapus rute dari peta
			if (routeLayerRef.current && mapInstanceRef.current) {
				mapInstanceRef.current.removeLayer(routeLayerRef.current);
				routeLayerRef.current = null;
			}
		}
	};

	// Fungsi untuk mencari lokasi
	const searchLocation = async (e) => {
		e.preventDefault();
		if (!searchQuery.trim()) return;

		try {
			// Tampilkan indikator loading
			const searchButton = e.target.querySelector('button[type="submit"]');
			if (searchButton) {
				searchButton.disabled = true;
				searchButton.textContent = "Mencari...";
			}

			// Gunakan Nominatim API untuk geocoding dengan parameter tambahan
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					searchQuery
				)}&addressdetails=1&limit=1`
			);
			const data = await response.json();

			if (data && data.length > 0) {
				const result = data[0];
				const newLocation = {
					name: result.display_name,
					position: {
						lat: parseFloat(result.lat),
						lng: parseFloat(result.lon),
					},
				};

				console.log("Lokasi ditemukan:", newLocation);

				// Hapus marker hasil pencarian sebelumnya
				if (searchResult && mapInstanceRef.current) {
					markersRef.current = markersRef.current.filter((marker) => {
						if (
							marker._popup &&
							marker._popup._content.includes(searchResult.name)
						) {
							mapInstanceRef.current.removeLayer(marker);
							return false;
						}
						return true;
					});
				}

				// Update state
				setSearchResult(newLocation);
				setSelectedLocation(newLocation);

				// Tambahkan marker baru untuk hasil pencarian menggunakan PulsingDot
				if (mapInstanceRef.current) {
					const searchMarker = createPulsingDotMarker(
						[newLocation.position.lat, newLocation.position.lng],
						{ category: "search" }
					)
						.addTo(mapInstanceRef.current)
						.bindPopup(`<b>${newLocation.name}</b>`)
						.openPopup();

					searchMarker.on("click", () => {
						handleMarkerClick(newLocation);
					});

					markersRef.current.push(searchMarker);

					// Pindahkan peta ke lokasi hasil pencarian dengan animasi
					mapInstanceRef.current.flyTo(
						[newLocation.position.lat, newLocation.position.lng],
						15,
						{ duration: 1.5 }
					);
				}

				// Jika origin belum dipilih, set sebagai origin
				if (!origin) {
					setOrigin(newLocation);
				}
				// Jika origin sudah dipilih tapi destination belum, set sebagai destination
				else if (!destination) {
					setDestination(newLocation);
					calculateRoute(origin, newLocation);
				}
			} else {
				alert("Lokasi tidak ditemukan. Coba kata kunci yang lebih spesifik.");
			}
		} catch (error) {
			console.error("Error searching location:", error);
			alert("Terjadi kesalahan saat mencari lokasi. Silakan coba lagi.");
		} finally {
			// Kembalikan tombol ke keadaan semula
			const searchButton = e.target.querySelector('button[type="submit"]');
			if (searchButton) {
				searchButton.disabled = false;
				searchButton.textContent = "Cari";
			}
		}
	};

	// Fungsi untuk mendapatkan lokasi pengguna
	const getUserLocation = () => {
		setIsLocating(true);

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const userPos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};

					setUserLocation(userPos);

					// Pindahkan peta ke lokasi pengguna
					if (mapInstanceRef.current) {
						mapInstanceRef.current.setView([userPos.lat, userPos.lng], 15);
					}

					// Buat objek lokasi pengguna
					const userLoc = {
						name: "Lokasi Anda",
						position: userPos,
					};

					// Set lokasi yang dipilih
					setSelectedLocation(userLoc);

					// Jika origin belum dipilih, set sebagai origin
					if (!origin) {
						setOrigin(userLoc);
					}
					// Jika origin sudah dipilih tapi destination belum, set sebagai destination
					else if (!destination) {
						setDestination(userLoc);
						calculateRoute(origin, userLoc);
					}

					setIsLocating(false);
				},
				(error) => {
					console.error("Error getting user location:", error);
					alert(
						"Tidak dapat mendapatkan lokasi Anda. Pastikan Anda telah mengizinkan akses lokasi."
					);
					setIsLocating(false);
				},
				{ enableHighAccuracy: true }
			);
		} else {
			alert("Geolocation tidak didukung oleh browser Anda.");
			setIsLocating(false);
		}
	};

	// Fungsi untuk menghitung rute
	const calculateRoute = async (start, end) => {
		if (!start || !end || !mapInstanceRef.current) return;

		try {
			// Gunakan OSRM untuk mendapatkan rute
			const url = `https://router.project-osrm.org/route/v1/${travelMode}/${start.position.lng},${start.position.lat};${end.position.lng},${end.position.lat}?overview=full&geometries=geojson`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.code === "Ok" && data.routes && data.routes.length > 0) {
				const route = data.routes[0];
				const coordinates = route.geometry.coordinates.map((coord) => [
					coord[1],
					coord[0],
				]);

				// Simpan informasi rute
				setRouteInfo({
					distance: (route.distance / 1000).toFixed(2) + " km",
					duration: Math.round(route.duration / 60) + " menit",
				});

				// Hapus rute lama jika ada
				if (routeLayerRef.current) {
					mapInstanceRef.current.removeLayer(routeLayerRef.current);
				}

				// Tambahkan rute baru ke peta
				routeLayerRef.current = L.polyline(coordinates, {
					color: "#4285F4",
					weight: 5,
				}).addTo(mapInstanceRef.current);

				// Sesuaikan tampilan peta untuk menampilkan seluruh rute
				mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds());
			}
		} catch (error) {
			console.error("Error calculating route:", error);
			alert("Terjadi kesalahan saat menghitung rute");
		}
	};

	// Handler untuk perubahan mode transportasi
	const handleTravelModeChange = (mode) => {
		setTravelMode(mode);
		if (origin && destination) {
			calculateRoute(origin, destination);
		}
	};

	// Handler untuk reset rute
	const resetRoute = () => {
		setOrigin(null);
		setDestination(null);
		setRouteInfo(null);

		// Hapus rute dari peta
		if (routeLayerRef.current && mapInstanceRef.current) {
			mapInstanceRef.current.removeLayer(routeLayerRef.current);
			routeLayerRef.current = null;
		}
	};

	// Fungsi untuk memuat data BTS
	const loadBTSData = async () => {
		if (!mapInstanceRef.current) {
			console.log("Map instance not available, skipping BTS data load");
			return;
		}

		// PENTING: Selalu muat data BTS, bahkan jika showBTS dimatikan
		// Ini memastikan data selalu dimuat saat peta bergerak
		// Kita hanya akan menyembunyikan marker jika showBTS dimatikan
		console.log("Loading BTS data, showBTS state:", showBTS);

		try {
			setIsLoadingBTS(true);
			setBtsError(null);

			// Dapatkan batas peta saat ini
			const bounds = mapInstanceRef.current.getBounds();
			console.log("Current map bounds:", bounds);

			// Dapatkan zoom level saat ini
			const zoomLevel = mapInstanceRef.current.getZoom();
			console.log("Current zoom level:", zoomLevel);

			// Buat key cache berdasarkan bounds dan zoom level
			// Tidak menggunakan selectedProvider untuk memastikan data selalu dimuat
			const cacheKey = `${bounds.getNorth().toFixed(4)}_${bounds
				.getSouth()
				.toFixed(4)}_${bounds.getEast().toFixed(4)}_${bounds
				.getWest()
				.toFixed(4)}_${zoomLevel}`;

			// Cek apakah data ada di cache
			const cachedData = btsCache.get(cacheKey);
			if (cachedData) {
				console.log("Using cached BTS data for current view");

				// Set data BTS dari cache
				setBtsCount(cachedData.cells.length);

				// Filter data berdasarkan provider jika diperlukan
				let filteredBTS = cachedData.cells;
				if (selectedProvider !== "all") {
					filteredBTS = cachedData.cells.filter(
						(bts) => bts.operator === selectedProvider
					);
					console.log(
						`Filtered cached BTS for provider ${selectedProvider}:`,
						filteredBTS.length
					);
				}

				setBtsData(filteredBTS);

				// Hanya tampilkan marker jika showBTS diaktifkan
				if (showBTS) {
					addBTSMarkersToMap(filteredBTS);
				}

				setIsLoadingBTS(false);
				return;
			}

			// Gunakan data BTS dari API
			let btsData;

			try {
				// Pilih API berdasarkan useUnwiredLabs
				if (useUnwiredLabs) {
					try {
						// Gunakan Unwired Labs API
						console.log("Fetching BTS data from Unwired Labs API");
						btsData = await unwiredSearchCellTowers(bounds);
						console.log("Unwired Labs API response processed:", btsData);
					} catch (unwiredError) {
						console.error(
							"Error fetching from Unwired Labs API:",
							unwiredError
						);
						// Fallback ke LocationAPI jika Unwired Labs API gagal
						console.log("Falling back to LocationAPI");
						btsData = await searchCellTowers(bounds);
					}
				} else {
					// Gunakan LocationAPI
					console.log("Fetching BTS data from LocationAPI");
					btsData = await searchCellTowers(bounds);
				}

				console.log("API response processed:", btsData);

				// Jika tidak ada data dari API, tampilkan error
				if (!btsData || !btsData.cells || btsData.cells.length === 0) {
					console.log("No data from API");
					setBtsError("Tidak ada data BTS yang ditemukan di area ini");
					clearBTSMarkers(); // Hapus marker yang ada jika tidak ada data baru
					setIsLoadingBTS(false);
					return;
				}
			} catch (apiError) {
				console.error("Error fetching from API:", apiError);
				setBtsError(`Error: ${apiError.message || "Gagal memuat data BTS"}`);
				clearBTSMarkers();
				setIsLoadingBTS(false);
				return;
			}

			// Pastikan data BTS ada
			if (!btsData || !btsData.cells || !Array.isArray(btsData.cells)) {
				console.error("Invalid BTS data structure:", btsData);
				setBtsError("Data BTS tidak valid");
				clearBTSMarkers();
				setIsLoadingBTS(false);
				return;
			}

			// Simpan semua data ke cache terlebih dahulu
			btsCache.set(cacheKey, { cells: btsData.cells });

			// Set total count
			setBtsCount(btsData.cells.length);

			// Filter BTS berdasarkan provider yang dipilih
			let filteredBTS = btsData.cells;

			// Jika provider yang dipilih bukan "all", filter berdasarkan provider
			if (selectedProvider !== "all") {
				filteredBTS = btsData.cells.filter(
					(bts) => bts.operator === selectedProvider
				);
				console.log(
					`Filtered BTS for provider ${selectedProvider}:`,
					filteredBTS.length
				);
			} else {
				console.log("Showing all BTS providers");
			}

			// Set data BTS yang difilter
			setBtsData(filteredBTS);

			// Hanya tampilkan marker jika showBTS diaktifkan
			if (showBTS) {
				// Tambahkan marker BTS ke peta
				addBTSMarkersToMap(filteredBTS);
			}

			console.log("BTS data loaded successfully");
		} catch (error) {
			console.error("Error loading BTS data:", error);
			setBtsError(`Error: ${error.message || "Gagal memuat data BTS"}`);
			clearBTSMarkers();
		} finally {
			setIsLoadingBTS(false);
		}
	};

	// Fungsi untuk menambahkan marker BTS ke peta
	const addBTSMarkersToMap = (btsItems) => {
		if (!mapInstanceRef.current) return;

		// Hapus marker BTS yang ada
		clearBTSMarkers();

		console.log("Adding BTS markers to map:", btsItems.length);

		// Tambahkan marker baru untuk setiap BTS
		btsItems.forEach((bts) => {
			try {
				// Validasi data BTS
				if (
					!bts.lat ||
					!bts.lon ||
					isNaN(parseFloat(bts.lat)) ||
					isNaN(parseFloat(bts.lon))
				) {
					console.warn("Invalid BTS coordinates:", bts);
					return;
				}

				const lat = parseFloat(bts.lat);
				const lon = parseFloat(bts.lon);

				// Buat marker standar untuk BTS dengan icon tower
				const marker = L.marker([lat, lon], {
					icon: new L.Icon({
						iconUrl:
							"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
						shadowUrl:
							"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
						iconSize: [25, 41],
						iconAnchor: [12, 41],
						popupAnchor: [1, -34],
						shadowSize: [41, 41],
					}),
				}).addTo(mapInstanceRef.current);

				// Tambahkan tooltip untuk informasi singkat
				marker.bindTooltip(
					`${bts.radio || "BTS"} - ${bts.operator || "Unknown"}`,
					{
						permanent: false,
						direction: "top",
						className: "tower-tooltip",
					}
				);

				// Tambahkan popup untuk informasi detail
				const popupContent = `
					<div style="min-width: 200px;">
						<h3 style="font-weight: bold; margin-bottom: 5px;">BTS ${bts.radio || ""}</h3>

						<!-- Highlight LAC dan Cell ID di bagian atas -->
						<div style="background-color: #f0f7ff; border: 1px solid #cce5ff; border-radius: 4px; padding: 8px; margin-bottom: 10px;">
							<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
								<span style="font-weight: bold; color: #0066cc;">LAC:</span>
								<span style="font-weight: bold; color: #0066cc; font-size: 14px;">${
									bts.lac || "N/A"
								}</span>
							</div>
							<div style="display: flex; justify-content: space-between;">
								<span style="font-weight: bold; color: #0066cc;">Cell ID:</span>
								<span style="font-weight: bold; color: #0066cc; font-size: 14px;">${
									bts.cellid || "N/A"
								}</span>
							</div>
						</div>

						<table style="width: 100%; border-collapse: collapse;">
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">Operator:</td>
								<td style="padding: 3px 0;">${bts.operator || "Unknown"}</td>
							</tr>
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">Frequency:</td>
								<td style="padding: 3px 0;">${bts.frequency || "Unknown"}</td>
							</tr>
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">MCC:</td>
								<td style="padding: 3px 0;">${bts.mcc}</td>
							</tr>
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">MNC:</td>
								<td style="padding: 3px 0;">${bts.mnc}</td>
							</tr>
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">Signal:</td>
								<td style="padding: 3px 0;">${bts.averageSignalStrength || "N/A"} dBm</td>
							</tr>
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">Coverage:</td>
								<td style="padding: 3px 0;">${bts.cellRadius || "Unknown"} m</td>
							</tr>
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">Accuracy:</td>
								<td style="padding: 3px 0;">${bts.accuracy || "Unknown"} m</td>
							</tr>
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">Samples:</td>
								<td style="padding: 3px 0;">${bts.samples || "N/A"}</td>
							</tr>
						</table>
						<div style="margin-top: 10px;">
							<button id="btn-get-details-${
								bts.cellid
							}" style="background-color: #6366f1; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
								Dapatkan Detail Lokasi
							</button>
							<div id="location-details-${
								bts.cellid
							}" style="margin-top: 8px; font-size: 12px; display: none;">
								<p><strong>Mencari detail lokasi...</strong></p>
							</div>
						</div>
					</div>
				`;

				marker.bindPopup(popupContent);

				// Tambahkan event listener untuk tombol detail
				marker.on("popupopen", () => {
					// Jika menggunakan Unwired Labs API, simpan lokasi BTS yang dipilih
					if (useUnwiredLabs) {
						setSelectedBTSLocation({
							lat: bts.lat,
							lon: bts.lon,
							operator: bts.operator,
							radio: bts.radio,
							cellid: bts.cellid,
							lac: bts.lac,
							cellRadius: bts.cellRadius,
						});

						// Tampilkan peta statis jika diaktifkan
						setShowStaticMap(true);
					}

					setTimeout(() => {
						const detailButton = document.getElementById(
							`btn-get-details-${bts.cellid}`
						);
						if (detailButton) {
							detailButton.addEventListener("click", async () => {
								const detailsContainer = document.getElementById(
									`location-details-${bts.cellid}`
								);
								if (detailsContainer) {
									detailsContainer.style.display = "block";
									detailsContainer.innerHTML =
										"<p><strong>Mencari detail lokasi...</strong></p>";

									try {
										// Gunakan koordinat BTS yang tepat
										const lat = bts.lat;
										const lon = bts.lon;

										console.log(
											`Getting location details for coordinates: ${lat}, ${lon}`
										);

										// Gunakan Nominatim API langsung untuk reverse geocoding
										// Ini akan memberikan alamat yang tepat berdasarkan koordinat
										const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

										console.log(
											"Fetching address from Nominatim:",
											nominatimUrl
										);

										// Tambahkan header untuk menghindari throttling
										const response = await fetch(nominatimUrl, {
											headers: {
												"User-Agent": "ReactDashboard/1.0",
												"Accept-Language":
													"id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
											},
										});

										if (!response.ok) {
											throw new Error(
												`Nominatim API returned status ${response.status}: ${response.statusText}`
											);
										}

										const data = await response.json();
										console.log("Nominatim response:", data);

										if (data && data.display_name) {
											// Ekstrak informasi yang relevan
											const locationDetails = {
												address: data.display_name,
												city:
													data.address.city ||
													data.address.town ||
													data.address.village ||
													data.address.county ||
													data.address.state ||
													"Tidak tersedia",
												road: data.address.road || "Jalan tidak diketahui",
												suburb:
													data.address.suburb ||
													data.address.neighbourhood ||
													"",
												postcode: data.address.postcode || "",
												country: data.address.country || "Indonesia",
												accuracy: bts.accuracy || 100,
												lat: lat,
												lon: lon,
											};

											// Tampilkan detail lokasi
											detailsContainer.innerHTML = `
												<p><strong>Alamat:</strong> ${locationDetails.address}</p>
												<p><strong>Jalan:</strong> ${locationDetails.road}</p>
												<p><strong>Kota:</strong> ${locationDetails.city}</p>
												<p><strong>Koordinat:</strong> ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>
											`;

											// Tambahkan marker untuk menunjukkan lokasi detail
											const detailMarker = L.marker([lat, lon], {
												icon: new L.Icon({
													iconUrl:
														"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
													shadowUrl:
														"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
													iconSize: [25, 41],
													iconAnchor: [12, 41],
													popupAnchor: [1, -34],
													shadowSize: [41, 41],
												}),
											}).addTo(mapInstanceRef.current);

											// Tambahkan marker ke btsMarkersRef agar bisa dihapus nanti
											btsMarkersRef.current.push(detailMarker);

											// Tambahkan popup ke marker dan buka popup
											detailMarker
												.bindPopup(
													`
												<b>${locationDetails.road}</b><br>
												${locationDetails.suburb ? locationDetails.suburb + ", " : ""}
												${locationDetails.city}
											`
												)
												.openPopup();

											// Tampilkan lingkaran radius jika ada data cellRadius yang valid
											if (
												bts.cellRadius &&
												bts.cellRadius > 0 &&
												bts.cellRadius < 5000
											) {
												const operatorColor = getOperatorColor(bts.operator);

												// Buat lingkaran cakupan dengan radius yang sesuai
												const coverageCircle = L.circle([lat, lon], {
													radius: bts.cellRadius,
													color: operatorColor,
													fillColor: operatorColor,
													fillOpacity: 0.1,
													weight: 1,
												}).addTo(mapInstanceRef.current);

												btsMarkersRef.current.push(coverageCircle);

												// Tambahkan sektor cell ID
												const cellSectors = createCellSectors(
													mapInstanceRef.current,
													[lat, lon],
													bts.cellRadius,
													3, // 3 sektor untuk tampilan yang realistis
													{
														color: operatorColor,
														fillColor: operatorColor
															.replace(")", ", 0.1)")
															.replace("rgb", "rgba"),
														weight: 1,
													}
												);

												// Tambahkan semua layer dari cellSectors ke btsMarkersRef
												if (cellSectors && cellSectors.getLayers) {
													cellSectors.getLayers().forEach((layer) => {
														btsMarkersRef.current.push(layer);
													});
												}
											}

											// Pindahkan peta ke lokasi detail
											mapInstanceRef.current.panTo([lat, lon]);
										} else {
											// Jika Nominatim gagal, tampilkan informasi dasar
											detailsContainer.innerHTML = `
												<p><strong>Alamat:</strong> Tidak tersedia</p>
												<p><strong>Koordinat:</strong> ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>
												<p><strong>Operator:</strong> ${bts.operator || "Tidak tersedia"}</p>
												<p><strong>Radio:</strong> ${bts.radio || "Tidak tersedia"}</p>
											`;

											// Tambahkan marker untuk menunjukkan lokasi
											const detailMarker = L.marker([lat, lon], {
												icon: new L.Icon({
													iconUrl:
														"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
													shadowUrl:
														"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
													iconSize: [25, 41],
													iconAnchor: [12, 41],
													popupAnchor: [1, -34],
													shadowSize: [41, 41],
												}),
											}).addTo(mapInstanceRef.current);

											btsMarkersRef.current.push(detailMarker);
											detailMarker
												.bindPopup(
													`<b>Detail Lokasi</b><br>Koordinat: ${lat.toFixed(
														6
													)}, ${lon.toFixed(6)}`
												)
												.openPopup();

											// Tampilkan lingkaran radius jika ada data cellRadius yang valid
											if (
												bts.cellRadius &&
												bts.cellRadius > 0 &&
												bts.cellRadius < 5000
											) {
												const operatorColor = getOperatorColor(bts.operator);

												// Buat lingkaran cakupan dengan radius yang sesuai
												const coverageCircle = L.circle([lat, lon], {
													radius: bts.cellRadius,
													color: operatorColor,
													fillColor: operatorColor,
													fillOpacity: 0.1,
													weight: 1,
												}).addTo(mapInstanceRef.current);

												btsMarkersRef.current.push(coverageCircle);

												// Tambahkan sektor cell ID
												const cellSectors = createCellSectors(
													mapInstanceRef.current,
													[lat, lon],
													bts.cellRadius,
													3, // 3 sektor untuk tampilan yang realistis
													{
														color: operatorColor,
														fillColor: operatorColor
															.replace(")", ", 0.1)")
															.replace("rgb", "rgba"),
														weight: 1,
													}
												);

												// Tambahkan semua layer dari cellSectors ke btsMarkersRef
												if (cellSectors && cellSectors.getLayers) {
													cellSectors.getLayers().forEach((layer) => {
														btsMarkersRef.current.push(layer);
													});
												}
											}

											// Pindahkan peta ke lokasi detail
											mapInstanceRef.current.panTo([lat, lon]);
										}
									} catch (error) {
										console.error("Error getting location details:", error);

										// Gunakan koordinat BTS yang tepat
										const lat = bts.lat;
										const lon = bts.lon;

										detailsContainer.innerHTML = `
											<p><strong>Gagal mendapatkan detail lokasi</strong></p>
											<p>Error: ${error.message}</p>
											<p><strong>Koordinat:</strong> ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>
											<p><strong>Operator:</strong> ${bts.operator || "Tidak tersedia"}</p>
										`;

										// Tambahkan marker untuk menunjukkan lokasi meskipun terjadi error
										const detailMarker = L.marker([lat, lon], {
											icon: new L.Icon({
												iconUrl:
													"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
												shadowUrl:
													"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
												iconSize: [25, 41],
												iconAnchor: [12, 41],
												popupAnchor: [1, -34],
												shadowSize: [41, 41],
											}),
										}).addTo(mapInstanceRef.current);

										btsMarkersRef.current.push(detailMarker);
										detailMarker
											.bindPopup(
												`<b>Detail Lokasi</b><br>Koordinat: ${lat.toFixed(
													6
												)}, ${lon.toFixed(6)}`
											)
											.openPopup();

										// Tampilkan lingkaran radius jika ada data cellRadius yang valid
										if (
											bts.cellRadius &&
											bts.cellRadius > 0 &&
											bts.cellRadius < 5000
										) {
											const operatorColor = getOperatorColor(bts.operator);

											// Buat lingkaran cakupan dengan radius yang sesuai
											const coverageCircle = L.circle([lat, lon], {
												radius: bts.cellRadius,
												color: operatorColor,
												fillColor: operatorColor,
												fillOpacity: 0.1,
												weight: 1,
											}).addTo(mapInstanceRef.current);

											btsMarkersRef.current.push(coverageCircle);

											// Tambahkan sektor cell ID
											const cellSectors = createCellSectors(
												mapInstanceRef.current,
												[lat, lon],
												bts.cellRadius,
												3, // 3 sektor untuk tampilan yang realistis
												{
													color: operatorColor,
													fillColor: operatorColor
														.replace(")", ", 0.1)")
														.replace("rgb", "rgba"),
													weight: 1,
												}
											);

											// Tambahkan semua layer dari cellSectors ke btsMarkersRef
											if (cellSectors && cellSectors.getLayers) {
												cellSectors.getLayers().forEach((layer) => {
													btsMarkersRef.current.push(layer);
												});
											}
										}

										// Pindahkan peta ke lokasi detail
										mapInstanceRef.current.panTo([lat, lon]);
									}
								}
							});
						}
					}, 100);
				});

				// Tentukan warna berdasarkan operator
				const operatorColor = getOperatorColor(bts.operator);

				// Simpan data radius dan warna untuk digunakan saat marker diklik
				marker.btsData = {
					lat: bts.lat,
					lon: bts.lon,
					cellRadius: bts.cellRadius,
					operatorColor: operatorColor,
				};

				// Tambahkan event listener untuk menampilkan lingkaran radius saat marker diklik
				marker.on("click", function () {
					// Hapus lingkaran radius yang ada (jika ada)
					if (this.coverageCircle) {
						mapInstanceRef.current.removeLayer(this.coverageCircle);
						btsMarkersRef.current = btsMarkersRef.current.filter(
							(layer) => layer !== this.coverageCircle
						);
						this.coverageCircle = null;

						// Hapus sektor cell ID jika ada
						if (this.cellSectors) {
							if (this.cellSectors.getLayers) {
								this.cellSectors.getLayers().forEach((layer) => {
									mapInstanceRef.current.removeLayer(layer);
									btsMarkersRef.current = btsMarkersRef.current.filter(
										(item) => item !== layer
									);
								});
							}
							this.cellSectors = null;
						}
					} else {
						// Tampilkan lingkaran radius jika data valid
						if (
							this.btsData.cellRadius &&
							this.btsData.cellRadius > 0 &&
							this.btsData.cellRadius < 5000
						) {
							// Buat lingkaran cakupan dengan radius yang sesuai
							this.coverageCircle = L.circle(
								[this.btsData.lat, this.btsData.lon],
								{
									radius: this.btsData.cellRadius,
									color: this.btsData.operatorColor,
									fillColor: this.btsData.operatorColor,
									fillOpacity: 0.1,
									weight: 1,
								}
							).addTo(mapInstanceRef.current);

							btsMarkersRef.current.push(this.coverageCircle);

							// Tambahkan sektor cell ID
							this.cellSectors = createCellSectors(
								mapInstanceRef.current,
								[this.btsData.lat, this.btsData.lon],
								this.btsData.cellRadius,
								3, // 3 sektor untuk tampilan yang realistis
								{
									color: this.btsData.operatorColor,
									fillColor: this.btsData.operatorColor
										.replace(")", ", 0.1)")
										.replace("rgb", "rgba"),
									weight: 1,
								}
							);

							// Tambahkan semua layer dari cellSectors ke btsMarkersRef
							if (this.cellSectors && this.cellSectors.getLayers) {
								this.cellSectors.getLayers().forEach((layer) => {
									btsMarkersRef.current.push(layer);
								});
							}
						}
					}
				});

				// Simpan marker
				btsMarkersRef.current.push(marker);
			} catch (error) {
				console.error("Error adding BTS marker:", error, bts);
			}
		});

		console.log("Added BTS markers:", btsMarkersRef.current.length);
	};

	// Fungsi untuk menghapus marker BTS
	const clearBTSMarkers = () => {
		if (!mapInstanceRef.current) return;

		btsMarkersRef.current.forEach((marker) => {
			mapInstanceRef.current.removeLayer(marker);
		});

		btsMarkersRef.current = [];
	};

	// Fungsi untuk mendapatkan warna berdasarkan operator
	const getOperatorColor = (operator) => {
		const colors = {
			Telkomsel: "#FF0000", // Merah
			"XL Axiata": "#0000FF", // Biru
			Indosat: "#FFFF00", // Kuning
			Tri: "#800080", // Ungu
			Axis: "#FFA500", // Oranye
			Smartfren: "#008000", // Hijau
		};

		return colors[operator] || "#808080"; // Abu-abu sebagai default
	};

	// Toggle tampilan BTS
	const toggleBTSLayer = () => {
		console.log("Toggle BTS layer, current state:", showBTS);
		if (showBTS) {
			// Sembunyikan BTS
			console.log("Hiding BTS");
			clearBTSMarkers();
			setShowBTS(false);
			// Reset error jika ada
			setBtsError(null);
		} else {
			// Tampilkan BTS
			console.log("Showing BTS");
			setShowBTS(true);
			// Muat data BTS segera tanpa delay
			// Gunakan data yang sudah ada jika tersedia
			if (btsData && btsData.length > 0) {
				console.log("Using existing BTS data");
				addBTSMarkersToMap(btsData);
			} else {
				console.log("Loading fresh BTS data");
				loadBTSData();
			}
		}
	};

	return (
		<div className='space-y-4'>
			<h1 className='text-3xl font-bold'>Map</h1>
			<p className='text-muted-foreground mb-4'>
				Peta interaktif yang menampilkan lokasi penting di Jakarta.
			</p>

			<div className='flex flex-col md:flex-row gap-4 mb-4'>
				{/* Kotak pencarian */}
				<div className='flex-1'>
					<form onSubmit={searchLocation} className='flex gap-2'>
						<Input
							type='text'
							placeholder='Cari lokasi...'
							className='flex-1'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<Button type='submit'>Cari</Button>
					</form>
				</div>

				{/* Tombol lokasi pengguna */}
				<Button
					onClick={getUserLocation}
					disabled={isLocating}
					variant='secondary'
				>
					{isLocating ? "Mencari lokasi..." : "Lokasi Saya"}
				</Button>
			</div>

			{/* BTS Controls */}
			<Card className='mb-4'>
				<CardHeader className='pb-3'>
					<div className='flex justify-between items-center'>
						<CardTitle className='text-xl'>
							Base Transceiver Station (BTS)
						</CardTitle>
						<Button
							onClick={toggleBTSLayer}
							disabled={isLoadingBTS}
							variant='default'
							className='relative'
						>
							{isLoadingBTS ? (
								<>
									<span className='opacity-50'>Memuat Data BTS</span>
									<span className='absolute inset-0 flex items-center justify-center'>
										<svg
											className='animate-spin h-5 w-5 text-white'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
										>
											<circle
												className='opacity-25'
												cx='12'
												cy='12'
												r='10'
												stroke='currentColor'
												strokeWidth='4'
											></circle>
											<path
												className='opacity-75'
												fill='currentColor'
												d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
											></path>
										</svg>
									</span>
								</>
							) : showBTS ? (
								"Sembunyikan BTS"
							) : (
								"Tampilkan BTS"
							)}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{/* Provider Filter - Selalu tampilkan filter provider */}
					<div className='mb-3 space-y-2'>
						<Label htmlFor='provider-select'>Filter Provider:</Label>
						<Select
							value={selectedProvider}
							onValueChange={setSelectedProvider}
							disabled={isLoadingBTS || !showBTS}
						>
							<SelectTrigger id='provider-select' className='w-full'>
								<SelectValue placeholder='Pilih provider' />
							</SelectTrigger>
							<SelectContent className='select-content'>
								{providers.map((provider) => (
									<SelectItem key={provider.id} value={provider.id}>
										{provider.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{!showBTS && (
							<p className='text-xs text-muted-foreground'>
								Aktifkan tampilan BTS untuk menggunakan filter provider
							</p>
						)}
					</div>

					{/* Toggle untuk API Unwired Labs */}
					<div className='mb-3 space-y-2'>
						<div className='flex items-center justify-between'>
							<Label htmlFor='unwired-toggle'>Gunakan API Unwired Labs:</Label>
							<div className='flex items-center space-x-2'>
								<Switch
									id='unwired-toggle'
									checked={useUnwiredLabs}
									onCheckedChange={(checked) => {
										console.log("Switch toggled to:", checked);
										// Gunakan pendekatan yang lebih sederhana
										try {
											setUseUnwiredLabs(checked);
										} catch (error) {
											console.error("Error setting useUnwiredLabs:", error);
										}
									}}
									disabled={isLoadingBTS}
								/>
							</div>
						</div>
						<p className='text-xs text-muted-foreground'>
							{useUnwiredLabs
								? "Menggunakan API Unwired Labs untuk data BTS"
								: "Menggunakan API default untuk data BTS"}
						</p>

						{useUnwiredLabs && (
							<div className='mt-2 flex flex-wrap gap-2'>
								<Button
									size='sm'
									variant={showApiBalance ? "default" : "outline"}
									onClick={() => setShowApiBalance(!showApiBalance)}
								>
									Saldo API
								</Button>
								<Button
									size='sm'
									variant={showStaticMap ? "default" : "outline"}
									onClick={() => setShowStaticMap(!showStaticMap)}
									disabled={!selectedBTSLocation}
								>
									Peta Statis
								</Button>
							</div>
						)}
					</div>

					{isLoadingBTS && (
						<div className='mt-2 p-2 bg-yellow-50 text-yellow-700 rounded-md text-sm flex items-center'>
							<svg
								className='animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-700'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
							>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
								></path>
							</svg>
							Memuat data BTS untuk area yang terlihat...
						</div>
					)}

					{btsError && !isLoadingBTS && (
						<div className='mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm'>
							{btsError}
						</div>
					)}

					{showBTS && btsCount > 0 && !isLoadingBTS && (
						<div className='mt-2 p-2 bg-blue-100 text-blue-700 rounded-md text-sm'>
							Menampilkan {btsData.length} dari {btsCount} BTS di area yang
							terlihat.
						</div>
					)}

					{!showBTS && !isLoadingBTS && (
						<p className='text-sm text-muted-foreground mt-2'>
							Klik tombol "Tampilkan BTS" untuk melihat lokasi Base Transceiver
							Station (BTS) di area yang terlihat pada peta.
						</p>
					)}

					{showBTS && btsCount === 0 && !btsError && !isLoadingBTS && (
						<div className='mt-2 p-2 bg-gray-100 text-gray-700 rounded-md text-sm'>
							Tidak ada data BTS yang ditemukan di area ini. Coba pindahkan peta
							ke area lain.
						</div>
					)}
				</CardContent>
			</Card>

			{/* Filter kategori */}
			<Card className='mb-4'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-xl'>Filter Kategori</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-wrap gap-2'>
						{categories.map((category) => (
							<Button
								key={category.id}
								onClick={() => setSelectedCategory(category.id)}
								variant={
									selectedCategory === category.id ? "default" : "outline"
								}
								size='sm'
							>
								{category.name}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Container untuk peta */}
			<div
				className='border rounded-lg overflow-hidden'
				style={{ height: "500px" }}
			>
				<div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
			</div>

			{/* Informasi rute */}
			{origin && (
				<div className='bg-white p-4 rounded-lg border mt-4'>
					<div className='flex justify-between items-center mb-2'>
						<h3 className='font-semibold'>Rute Perjalanan</h3>
						<button
							onClick={resetRoute}
							className='px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600'
						>
							Reset Rute
						</button>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
						<div>
							<p className='text-sm font-semibold'>Titik Awal:</p>
							<p className='text-sm text-gray-600'>{origin.name}</p>
						</div>

						<div>
							<p className='text-sm font-semibold'>Tujuan:</p>
							{destination ? (
								<p className='text-sm text-gray-600'>{destination.name}</p>
							) : (
								<p className='text-sm text-gray-600'>Pilih lokasi tujuan</p>
							)}
						</div>
					</div>

					{/* Mode transportasi */}
					<div className='mb-4'>
						<p className='text-sm font-semibold mb-2'>Mode Transportasi:</p>
						<div className='flex flex-wrap gap-2'>
							{travelModes.map((mode) => (
								<button
									key={mode.id}
									onClick={() => handleTravelModeChange(mode.id)}
									className={`px-3 py-1 rounded-full text-xs ${
										travelMode === mode.id
											? "bg-blue-500 text-white"
											: "bg-gray-200 text-gray-800 hover:bg-gray-300"
									}`}
								>
									{mode.name}
								</button>
							))}
						</div>
					</div>

					{/* Informasi jarak dan waktu */}
					{routeInfo && (
						<div className='grid grid-cols-2 gap-4'>
							<div className='bg-gray-100 p-3 rounded-md'>
								<p className='text-xs text-gray-500'>Jarak</p>
								<p className='text-lg font-semibold'>{routeInfo.distance}</p>
							</div>
							<div className='bg-gray-100 p-3 rounded-md'>
								<p className='text-xs text-gray-500'>Waktu Tempuh</p>
								<p className='text-lg font-semibold'>{routeInfo.duration}</p>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Informasi lokasi yang dipilih */}
			{selectedLocation && !origin && (
				<div className='bg-white p-4 rounded-lg border mt-4'>
					<h3 className='font-semibold mb-2'>{selectedLocation.name}</h3>
					{selectedLocation.category && (
						<p className='text-sm text-gray-600 mb-2'>
							Kategori:{" "}
							{categories.find((c) => c.id === selectedLocation.category)
								?.name || selectedLocation.category}
						</p>
					)}
					<p className='text-sm text-gray-600'>
						Latitude: {selectedLocation.position.lat.toFixed(6)}, Longitude:{" "}
						{selectedLocation.position.lng.toFixed(6)}
					</p>
				</div>
			)}

			{/* Legenda kategori */}
			<Card className='mt-4'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-xl'>Legenda</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
						{Object.entries(categoryColors).map(([category]) => (
							<div key={category} className='flex items-center gap-2'>
								<div
									className={`pulsing-dot ${category}`}
									style={{ margin: "0 4px" }}
								></div>
								<span className='text-sm capitalize'>
									{categories.find((c) => c.id === category)?.name || category}
								</span>
							</div>
						))}
						<div className='flex items-center gap-2'>
							<div
								className='pulsing-dot search'
								style={{ margin: "0 4px" }}
							></div>
							<span className='text-sm'>Hasil Pencarian</span>
						</div>
						<div className='flex items-center gap-2'>
							<div
								className='pulsing-dot user'
								style={{ margin: "0 4px" }}
							></div>
							<span className='text-sm'>Lokasi Anda</span>
						</div>
						<div className='flex items-center gap-2'>
							<img
								src='https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png'
								alt='BTS Tower'
								style={{ width: "12px", height: "20px", margin: "0 4px" }}
							/>
							<span className='text-sm'>BTS Tower</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Unwired Labs API Features - Super Simplified */}
			{useUnwiredLabs && (
				<div className='mt-4'>
					<Card>
						<CardHeader>
							<CardTitle>Fitur API Unwired Labs</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-muted-foreground mb-4'>
								Fitur API Unwired Labs berhasil diaktifkan.
							</p>
							<div className='mb-4 p-3 bg-gray-100 rounded-md'>
								<p className='text-sm'>
									Klik marker BTS pada peta untuk melihat detail.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* LAC Search */}
			{useUnwiredLabs && (
				<div className='mt-4'>
					<LACSearch
						mapInstance={mapInstanceRef.current}
						onSearchComplete={(result) => {
							console.log("LAC search completed with result:", result);
							try {
								if (result && result.cells && result.cells.length > 0) {
									console.log(`Processing ${result.cells.length} BTS results`);

									// Tampilkan hasil pencarian
									setBtsData(result.cells);
									setBtsCount(result.cells.length);

									// Hapus marker yang ada
									clearBTSMarkers();

									// Tambahkan marker baru
									addBTSMarkersToMap(result.cells);

									// Sesuaikan tampilan peta untuk menampilkan semua marker
									if (mapInstanceRef.current && result.cells.length > 0) {
										console.log("Adjusting map view to show all markers");
										const bounds = L.latLngBounds(
											result.cells.map((cell) => [cell.lat, cell.lon])
										);
										mapInstanceRef.current.fitBounds(bounds, {
											padding: [50, 50],
										});
									}
								} else {
									console.log("No BTS results found or invalid result format");
								}
							} catch (error) {
								console.error("Error processing LAC search results:", error);
							}
						}}
					/>
				</div>
			)}

			{/* Cell Search */}
			{useUnwiredLabs && (
				<div className='mt-4'>
					<CellSearch
						mapInstance={mapInstanceRef.current}
						onSearchComplete={(result) => {
							console.log("Cell search completed with result:", result);
							try {
								if (result && result.cells && result.cells.length > 0) {
									console.log(`Processing ${result.cells.length} BTS results`);

									// Tampilkan hasil pencarian
									setBtsData(result.cells);
									setBtsCount(result.cells.length);

									// Hapus marker yang ada
									clearBTSMarkers();

									// Tambahkan marker baru
									addBTSMarkersToMap(result.cells);

									// Sesuaikan tampilan peta untuk menampilkan semua marker
									if (mapInstanceRef.current && result.cells.length > 0) {
										console.log("Adjusting map view to show all markers");
										const bounds = L.latLngBounds(
											result.cells.map((cell) => [cell.lat, cell.lon])
										);
										mapInstanceRef.current.fitBounds(bounds, {
											padding: [50, 50],
										});
									}
								} else {
									console.log("No BTS results found or invalid result format");
								}
							} catch (error) {
								console.error("Error processing Cell search results:", error);
							}
						}}
					/>
				</div>
			)}

			{/* Static Map - Removed for simplicity */}

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-lg'>Lokasi</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-sm text-muted-foreground'>
							Lihat lokasi penting dan tempat menarik di sekitar Anda.
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-lg'>Navigasi</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-sm text-muted-foreground'>
							Dapatkan petunjuk arah dan navigasi ke tujuan Anda.
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-lg'>Pencarian</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-sm text-muted-foreground'>
							Cari lokasi, alamat, dan tempat menarik dengan mudah.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default LeafletMap;
