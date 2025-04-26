import { Autocomplete, DirectionsRenderer, GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useRef, useState } from "react";

// Gaya untuk container peta
const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "0.5rem",
};

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

// Libraries yang dibutuhkan untuk Google Maps
const libraries = ["places", "directions"];

// Warna marker berdasarkan kategori
const categoryColors = {
  landmark: "red",
  museum: "purple",
  recreation: "yellow",
  government: "orange"
};

// Mode transportasi
const travelModes = [
  { id: "DRIVING", name: "Mobil" },
  { id: "WALKING", name: "Jalan Kaki" },
  { id: "BICYCLING", name: "Sepeda" },
  { id: "TRANSIT", name: "Transportasi Umum" }
];

function MapPage() {
  // Muat API Google Maps dengan library places dan directions
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "", // Tidak perlu API key untuk penggunaan dasar
    libraries: libraries,
  });

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // State untuk rute
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [routeInfo, setRouteInfo] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  
  // Ref untuk Autocomplete
  const autocompleteRef = useRef(null);
  const directionsServiceRef = useRef(null);

  // Callback ketika peta dimuat
  const onLoad = useCallback(function callback(map) {
    setMap(map);
    directionsServiceRef.current = new window.google.maps.DirectionsService();
  }, []);

  // Callback ketika peta di-unmount
  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

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
      setDirections(null);
      setRouteInfo(null);
    }
  };

  // Handler untuk Autocomplete
  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        // Dapatkan lokasi dari hasil pencarian
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        // Tambahkan marker untuk hasil pencarian
        setSearchMarker(newLocation);
        
        // Pindahkan peta ke lokasi hasil pencarian
        if (map) {
          map.panTo(newLocation);
          map.setZoom(15);
        }
        
        // Simpan hasil pencarian
        const searchLoc = {
          name: place.name || "Lokasi yang Dicari",
          address: place.formatted_address || "",
          position: newLocation
        };
        
        setSearchResult(searchLoc);
        
        // Set lokasi yang dipilih
        setSelectedLocation(searchLoc);
        
        // Jika origin belum dipilih, set sebagai origin
        if (!origin) {
          setOrigin(searchLoc);
        } 
        // Jika origin sudah dipilih tapi destination belum, set sebagai destination
        else if (!destination) {
          setDestination(searchLoc);
          calculateRoute(origin, searchLoc);
        }
      }
    }
  };

  // Callback ketika Autocomplete dimuat
  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
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
          if (map) {
            map.panTo(userPos);
            map.setZoom(15);
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
            calculateRoute(origin, userLoc);
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

  // Fungsi untuk menghitung rute
  const calculateRoute = (start, end) => {
    if (!directionsServiceRef.current || !start || !end) return;
    
    setIsCalculatingRoute(true);
    
    directionsServiceRef.current.route(
      {
        origin: start.position,
        destination: end.position,
        travelMode: window.google.maps.TravelMode[travelMode]
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Simpan informasi rute
          const route = result.routes[0];
          if (route && route.legs && route.legs[0]) {
            setRouteInfo({
              distance: route.legs[0].distance.text,
              duration: route.legs[0].duration.text,
              startAddress: route.legs[0].start_address,
              endAddress: route.legs[0].end_address
            });
          }
        } else {
          console.error(`Directions request failed: ${status}`);
          alert(`Tidak dapat menghitung rute: ${status}`);
        }
        
        setIsCalculatingRoute(false);
      }
    );
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
    setDirections(null);
    setRouteInfo(null);
  };

  // Filter lokasi berdasarkan kategori
  const filteredLocations = selectedCategory === "all" 
    ? locations 
    : locations.filter(location => location.category === selectedCategory);

  // Mendapatkan URL icon marker berdasarkan kategori
  const getMarkerIcon = (category) => {
    const color = categoryColors[category] || "red";
    return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
  };

  return (
    <div className='space-y-4'>
      <h1 className='text-3xl font-bold'>Map</h1>
      <p className='text-muted-foreground mb-4'>
        Peta interaktif yang menampilkan lokasi penting di Jakarta.
      </p>

      <div className='flex flex-col md:flex-row gap-4 mb-4'>
        {/* Kotak pencarian */}
        {isLoaded && (
          <div className='flex-1'>
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
            >
              <input
                type="text"
                placeholder="Cari lokasi..."
                className='w-full p-2 border rounded-md'
              />
            </Autocomplete>
          </div>
        )}
        
        {/* Tombol lokasi pengguna */}
        <button
          onClick={getUserLocation}
          disabled={isLocating || !isLoaded}
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
      <div className='border rounded-lg overflow-hidden'>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* Render marker untuk setiap lokasi */}
            {filteredLocations.map(location => (
              <Marker
                key={location.id}
                position={location.position}
                title={location.name}
                onClick={() => handleMarkerClick(location)}
                icon={location.category ? getMarkerIcon(location.category) : undefined}
              />
            ))}
            
            {/* Marker untuk hasil pencarian */}
            {searchMarker && (
              <Marker
                position={searchMarker}
                title={searchResult?.name || "Lokasi yang Dicari"}
                onClick={() => handleMarkerClick(searchResult)}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                }}
              />
            )}
            
            {/* Marker untuk lokasi pengguna */}
            {userLocation && (
              <Marker
                position={userLocation}
                title="Lokasi Anda"
                onClick={() => handleMarkerClick({ name: "Lokasi Anda", position: userLocation })}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                }}
              />
            )}
            
            {/* Render rute */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#4285F4",
                    strokeWeight: 5
                  }
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div
            className='flex items-center justify-center'
            style={{ height: "500px" }}
          >
            <p>Loading map...</p>
          </div>
        )}
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
              {routeInfo && routeInfo.startAddress && (
                <p className='text-xs text-gray-500'>{routeInfo.startAddress}</p>
              )}
            </div>
            
            <div>
              <p className='text-sm font-semibold'>Tujuan:</p>
              {destination ? (
                <>
                  <p className='text-sm text-gray-600'>{destination.name}</p>
                  {routeInfo && routeInfo.endAddress && (
                    <p className='text-xs text-gray-500'>{routeInfo.endAddress}</p>
                  )}
                </>
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
                  disabled={isCalculatingRoute}
                  className={`px-3 py-1 rounded-full text-xs ${
                    travelMode === mode.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
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
          {searchResult && searchResult.address && selectedLocation.name === searchResult.name && (
            <p className='text-sm text-gray-600 mb-2'>{searchResult.address}</p>
          )}
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

export default MapPage;
