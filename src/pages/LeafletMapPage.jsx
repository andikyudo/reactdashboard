import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Perbaiki masalah icon Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Lokasi default (Jakarta, Indonesia)
const center = {
  lat: -6.2088,
  lng: 106.8456,
};

// Kategori lokasi
const categories = [
  { id: "all", name: "Semua" },
  { id: "landmark", name: "Landmark" },
  { id: "museum", name: "Museum" },
  { id: "recreation", name: "Rekreasi" },
  { id: "government", name: "Pemerintahan" }
];

// Lokasi penting di Jakarta dengan kategori
const locations = [
  { 
    id: 1, 
    name: "Monumen Nasional", 
    position: { lat: -6.1754, lng: 106.8272 },
    category: "landmark"
  },
  { 
    id: 2, 
    name: "Istana Merdeka", 
    position: { lat: -6.1701, lng: 106.8219 },
    category: "government"
  },
  { 
    id: 3, 
    name: "Taman Mini Indonesia Indah", 
    position: { lat: -6.3024, lng: 106.8951 },
    category: "recreation"
  },
  { 
    id: 4, 
    name: "Ancol Dreamland", 
    position: { lat: -6.1261, lng: 106.8308 },
    category: "recreation"
  },
  { 
    id: 5, 
    name: "Museum Nasional", 
    position: { lat: -6.1769, lng: 106.8222 },
    category: "museum"
  },
  { 
    id: 6, 
    name: "Museum Macan", 
    position: { lat: -6.2185, lng: 106.8107 },
    category: "museum"
  },
  { 
    id: 7, 
    name: "Gedung DPR/MPR", 
    position: { lat: -6.2088, lng: 106.8005 },
    category: "government"
  },
  { 
    id: 8, 
    name: "Patung Selamat Datang", 
    position: { lat: -6.1950, lng: 106.8233 },
    category: "landmark"
  }
];

// Warna marker berdasarkan kategori
const categoryColors = {
  landmark: "red",
  museum: "purple",
  recreation: "gold",
  government: "orange"
};

// Mode transportasi
const travelModes = [
  { id: "car", name: "Mobil" },
  { id: "foot", name: "Jalan Kaki" },
  { id: "bicycle", name: "Sepeda" }
];

// Komponen untuk mengubah tampilan peta
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Komponen untuk mencari rute
function RoutingMachine({ origin, destination, travelMode, setRouteInfo }) {
  const map = useMap();
  
  useEffect(() => {
    if (!origin || !destination) return;

    // Gunakan OSRM untuk mendapatkan rute
    const url = `https://router.project-osrm.org/route/v1/${travelMode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          
          // Simpan informasi rute
          setRouteInfo({
            distance: (route.distance / 1000).toFixed(2) + " km",
            duration: Math.round(route.duration / 60) + " menit",
            coordinates: coordinates
          });
        }
      })
      .catch(error => {
        console.error("Error fetching route:", error);
      });
  }, [origin, destination, travelMode, map, setRouteInfo]);

  return null;
}

// Komponen utama
function LeafletMapPage() {
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
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [travelMode, setTravelMode] = useState("car");
  
  const mapRef = useRef(null);

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
    } 
    // Jika keduanya sudah dipilih, reset dan set yang baru sebagai origin
    else {
      setOrigin(location);
      setDestination(null);
      setRouteCoordinates([]);
      setRouteInfo(null);
    }
  };

  // Fungsi untuk mencari lokasi
  const searchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      // Gunakan Nominatim API untuk geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newLocation = {
          name: result.display_name,
          position: { 
            lat: parseFloat(result.lat), 
            lng: parseFloat(result.lon) 
          }
        };
        
        setSearchResult(newLocation);
        setSelectedLocation(newLocation);
        
        // Pindahkan peta ke lokasi hasil pencarian
        if (mapRef.current) {
          mapRef.current.setView([newLocation.position.lat, newLocation.position.lng], 15);
        }
        
        // Jika origin belum dipilih, set sebagai origin
        if (!origin) {
          setOrigin(newLocation);
        } 
        // Jika origin sudah dipilih tapi destination belum, set sebagai destination
        else if (!destination) {
          setDestination(newLocation);
        }
      } else {
        alert("Lokasi tidak ditemukan");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      alert("Terjadi kesalahan saat mencari lokasi");
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
            lng: position.coords.longitude
          };
          
          setUserLocation(userPos);
          
          // Pindahkan peta ke lokasi pengguna
          if (mapRef.current) {
            mapRef.current.setView([userPos.lat, userPos.lng], 15);
          }
          
          // Buat objek lokasi pengguna
          const userLoc = {
            name: "Lokasi Anda",
            position: userPos
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
          }
          
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("Tidak dapat mendapatkan lokasi Anda. Pastikan Anda telah mengizinkan akses lokasi.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation tidak didukung oleh browser Anda.");
      setIsLocating(false);
    }
  };

  // Handler untuk perubahan mode transportasi
  const handleTravelModeChange = (mode) => {
    setTravelMode(mode);
  };

  // Handler untuk reset rute
  const resetRoute = () => {
    setOrigin(null);
    setDestination(null);
    setRouteCoordinates([]);
    setRouteInfo(null);
  };

  // Filter lokasi berdasarkan kategori
  const filteredLocations = selectedCategory === "all" 
    ? locations 
    : locations.filter(location => location.category === selectedCategory);

  // Mendapatkan icon marker berdasarkan kategori
  const getMarkerIcon = (category) => {
    const color = categoryColors[category] || "red";
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Update route coordinates when routeInfo changes
  useEffect(() => {
    if (routeInfo && routeInfo.coordinates) {
      setRouteCoordinates(routeInfo.coordinates);
    }
  }, [routeInfo]);

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
            <input
              type="text"
              placeholder="Cari lokasi..."
              className='flex-1 p-2 border rounded-md'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            >
              Cari
            </button>
          </form>
        </div>
        
        {/* Tombol lokasi pengguna */}
        <button
          onClick={getUserLocation}
          disabled={isLocating}
          className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {isLocating ? 'Mencari lokasi...' : 'Lokasi Saya'}
        </button>
      </div>

      {/* Filter kategori */}
      <div className='mb-4'>
        <h3 className='font-semibold mb-2'>Filter Kategori:</h3>
        <div className='flex flex-wrap gap-2'>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Container untuk peta */}
      <div className='border rounded-lg overflow-hidden' style={{ height: '500px' }}>
        <MapContainer 
          center={[center.lat, center.lng]} 
          zoom={10} 
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => {
            mapRef.current = mapInstance;
          }}
        >
          <ChangeView center={[center.lat, center.lng]} zoom={10} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render marker untuk setiap lokasi */}
          {filteredLocations.map(location => (
            <Marker
              key={location.id}
              position={[location.position.lat, location.position.lng]}
              icon={location.category ? getMarkerIcon(location.category) : DefaultIcon}
              eventHandlers={{
                click: () => handleMarkerClick(location),
              }}
            >
              <Popup>
                <div>
                  <h3 className='font-semibold'>{location.name}</h3>
                  {location.category && (
                    <p className='text-sm'>
                      Kategori: {categories.find(c => c.id === location.category)?.name || location.category}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Marker untuk hasil pencarian */}
          {searchResult && (
            <Marker
              position={[searchResult.position.lat, searchResult.position.lng]}
              icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })}
              eventHandlers={{
                click: () => handleMarkerClick(searchResult),
              }}
            >
              <Popup>
                <div>
                  <h3 className='font-semibold'>{searchResult.name}</h3>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Marker untuk lokasi pengguna */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })}
              eventHandlers={{
                click: () => handleMarkerClick({ name: "Lokasi Anda", position: userLocation }),
              }}
            >
              <Popup>
                <div>
                  <h3 className='font-semibold'>Lokasi Anda</h3>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Render rute */}
          {routeCoordinates.length > 0 && (
            <Polyline 
              positions={routeCoordinates}
              color="#4285F4"
              weight={5}
            />
          )}
          
          {/* Routing Machine */}
          {origin && destination && (
            <RoutingMachine 
              origin={origin.position} 
              destination={destination.position} 
              travelMode={travelMode}
              setRouteInfo={setRouteInfo}
            />
          )}
        </MapContainer>
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
              {travelModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleTravelModeChange(mode.id)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    travelMode === mode.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
              Kategori: {categories.find(c => c.id === selectedLocation.category)?.name || selectedLocation.category}
            </p>
          )}
          <p className='text-sm text-gray-600'>
            Latitude: {selectedLocation.position.lat.toFixed(6)}, Longitude: {selectedLocation.position.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Legenda kategori */}
      <div className='bg-white p-4 rounded-lg border mt-4'>
        <h3 className='font-semibold mb-2'>Legenda:</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded-full' style={{ backgroundColor: color }}></div>
              <span className='text-sm capitalize'>{categories.find(c => c.id === category)?.name || category}</span>
            </div>
          ))}
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 rounded-full bg-blue-500'></div>
            <span className='text-sm'>Hasil Pencarian</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 rounded-full bg-green-500'></div>
            <span className='text-sm'>Lokasi Anda</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
        <div className='bg-white p-4 rounded-lg border'>
          <h3 className='font-semibold mb-2'>Lokasi</h3>
          <p className='text-sm text-gray-600'>
            Lihat lokasi penting dan tempat menarik di sekitar Anda.
          </p>
        </div>
        <div className='bg-white p-4 rounded-lg border'>
          <h3 className='font-semibold mb-2'>Navigasi</h3>
          <p className='text-sm text-gray-600'>
            Dapatkan petunjuk arah dan navigasi ke tujuan Anda.
          </p>
        </div>
        <div className='bg-white p-4 rounded-lg border'>
          <h3 className='font-semibold mb-2'>Pencarian</h3>
          <p className='text-sm text-gray-600'>
            Cari lokasi, alamat, dan tempat menarik dengan mudah.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LeafletMapPage;
