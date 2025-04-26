import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useState } from "react";

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

// Lokasi penting di Jakarta
const locations = [
  { id: 1, name: "Monumen Nasional", position: { lat: -6.1754, lng: 106.8272 } },
  { id: 2, name: "Istana Merdeka", position: { lat: -6.1701, lng: 106.8219 } },
  { id: 3, name: "Taman Mini Indonesia Indah", position: { lat: -6.3024, lng: 106.8951 } },
  { id: 4, name: "Ancol Dreamland", position: { lat: -6.1261, lng: 106.8308 } },
  { id: 5, name: "Museum Nasional", position: { lat: -6.1769, lng: 106.8222 } }
];

function MapPage() {
  // Muat API Google Maps
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "", // Tidak perlu API key untuk penggunaan dasar
  });

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Callback ketika peta dimuat
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  // Callback ketika peta di-unmount
  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Handler untuk klik pada marker
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className='space-y-4'>
      <h1 className='text-3xl font-bold'>Map</h1>
      <p className='text-muted-foreground mb-4'>
        Peta interaktif yang menampilkan lokasi penting di Jakarta.
      </p>

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
            {locations.map(location => (
              <Marker
                key={location.id}
                position={location.position}
                title={location.name}
                onClick={() => handleMarkerClick(location)}
              />
            ))}
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

      {/* Informasi lokasi yang dipilih */}
      {selectedLocation && (
        <div className='bg-white p-4 rounded-lg border mt-4'>
          <h3 className='font-semibold mb-2'>{selectedLocation.name}</h3>
          <p className='text-sm text-gray-600'>
            Latitude: {selectedLocation.position.lat}, Longitude: {selectedLocation.position.lng}
          </p>
        </div>
      )}

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
