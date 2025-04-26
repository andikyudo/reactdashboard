function MapPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Peta</h1>
      <p className="text-muted-foreground">
        Halaman peta interaktif.
      </p>
      
      <div className="border rounded-lg p-8 bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Fitur Peta</h2>
          <p className="text-gray-600 mb-6">
            Ini adalah halaman peta sederhana.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Lokasi</h3>
              <p className="text-sm text-gray-600">Lihat lokasi penting dan tempat menarik di sekitar Anda.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Navigasi</h3>
              <p className="text-sm text-gray-600">Dapatkan petunjuk arah dan navigasi ke tujuan Anda.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Pencarian</h3>
              <p className="text-sm text-gray-600">Cari lokasi, alamat, dan tempat menarik dengan mudah.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
