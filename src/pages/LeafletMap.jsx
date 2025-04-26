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

// Import PulsingDot
import { createPulsingDotMarker } from "../utils/PulsingDot";
// Import Cell Sector
import { createCellSectors } from "../utils/CellSector";
// Import sample BTS data
import { sampleBTSData } from "../data/sampleBTS";

// Perbaiki masalah icon Leaflet (untuk fallback)
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

			// Tambahkan event listener untuk perubahan zoom dan pan
			mapInstanceRef.current.on("moveend", () => {
				console.log("Map moved, showBTS:", showBTS);
				if (showBTS) {
					loadBTSData();
				}
			});

			// Muat BTS secara otomatis setelah peta dimuat
			console.log("Setting up automatic BTS loading");
			setTimeout(() => {
				console.log("Auto-loading BTS data");
				setShowBTS(true);
				loadBTSData();
			}, 2000);
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
		if (showBTS) {
			console.log("Provider changed, reloading BTS data");
			loadBTSData();
		}
		/* eslint-disable react-hooks/exhaustive-deps */
		// Kita sengaja tidak menambahkan loadBTSData dan showBTS sebagai dependencies
		// karena akan menyebabkan re-render yang tidak perlu
	}, [selectedProvider]);

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
		if (!mapInstanceRef.current) return;

		try {
			setIsLoadingBTS(true);
			setBtsError(null);

			// Dapatkan batas peta saat ini
			const bounds = mapInstanceRef.current.getBounds();

			console.log("Current map bounds:", bounds);

			// Gunakan data sampel BTS alih-alih API
			console.log("Using sample BTS data:", sampleBTSData);

			// Pastikan data BTS ada
			if (
				!sampleBTSData ||
				!sampleBTSData.cells ||
				!Array.isArray(sampleBTSData.cells)
			) {
				console.error("Invalid BTS data structure:", sampleBTSData);
				setBtsError("Data BTS tidak valid");
				return;
			}

			// Filter BTS berdasarkan provider yang dipilih
			let filteredBTS = sampleBTSData.cells;

			// Jika provider yang dipilih bukan "all", filter berdasarkan provider
			if (selectedProvider !== "all") {
				filteredBTS = sampleBTSData.cells.filter(
					(bts) => bts.operator === selectedProvider
				);
				console.log(
					`Filtered BTS for provider ${selectedProvider}:`,
					filteredBTS.length
				);
			} else {
				console.log("Showing all BTS providers");
			}

			// Set data BTS
			setBtsCount(sampleBTSData.cells.length);
			setBtsData(filteredBTS);

			// Tambahkan marker BTS ke peta
			addBTSMarkersToMap(filteredBTS);

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
				marker.bindPopup(`
					<div style="min-width: 200px;">
						<h3 style="font-weight: bold; margin-bottom: 5px;">BTS ${bts.radio || ""}</h3>
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
								<td style="padding: 3px 0; font-weight: bold;">LAC:</td>
								<td style="padding: 3px 0;">${bts.lac}</td>
							</tr>
							<tr>
								<td style="padding: 3px 0; font-weight: bold;">Cell ID:</td>
								<td style="padding: 3px 0;">${bts.cellid}</td>
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
								<td style="padding: 3px 0; font-weight: bold;">Samples:</td>
								<td style="padding: 3px 0;">${bts.samples || "N/A"}</td>
							</tr>
						</table>
					</div>
				`);

				// Tambahkan sektor cell ID
				const cellSectors = createCellSectors(
					mapInstanceRef.current,
					[lat, lon],
					bts.cellRadius || 500,
					6, // Jumlah sektor
					{
						color: "rgba(128, 0, 128, 0.5)", // Warna ungu yang lebih lembut
						fillColor: "rgba(128, 0, 128, 0.1)",
					}
				);

				// Simpan marker dan sektor
				btsMarkersRef.current.push(marker);
				// Tambahkan semua layer dari cellSectors ke btsMarkersRef
				if (cellSectors && cellSectors.getLayers) {
					cellSectors.getLayers().forEach((layer) => {
						btsMarkersRef.current.push(layer);
					});
				}
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

	// Toggle tampilan BTS
	const toggleBTSLayer = () => {
		console.log("Toggle BTS layer, current state:", showBTS);
		if (showBTS) {
			// Sembunyikan BTS
			console.log("Hiding BTS");
			clearBTSMarkers();
			setShowBTS(false);
		} else {
			// Tampilkan BTS
			console.log("Showing BTS");
			setShowBTS(true);
			setTimeout(() => {
				console.log("Loading BTS data after toggle");
				loadBTSData();
			}, 100);
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
						>
							{isLoadingBTS
								? "Memuat..."
								: showBTS
								? "Sembunyikan BTS"
								: "Tampilkan BTS"}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{/* Provider Filter */}
					{showBTS && (
						<div className='mb-3 space-y-2'>
							<Label htmlFor='provider-select'>Filter Provider:</Label>
							<Select
								value={selectedProvider}
								onValueChange={setSelectedProvider}
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
						</div>
					)}

					{btsError && (
						<div className='mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm'>
							{btsError}
						</div>
					)}

					{showBTS && btsCount > 0 && (
						<div className='mt-2 p-2 bg-blue-100 text-blue-700 rounded-md text-sm'>
							Menampilkan {btsData.length} dari {btsCount} BTS di area yang
							terlihat.
						</div>
					)}

					{!showBTS && (
						<p className='text-sm text-muted-foreground mt-2'>
							Klik tombol "Tampilkan BTS" untuk melihat lokasi Base Transceiver
							Station (BTS) di area yang terlihat pada peta.
						</p>
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
