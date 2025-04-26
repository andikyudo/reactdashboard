import { useEffect, useState } from "react";

// Komponen placeholder saat peta sedang dimuat
function MapPlaceholder() {
	return (
		<div className='space-y-4'>
			<h1 className='text-3xl font-bold'>Map</h1>
			<p className='text-muted-foreground mb-4'>
				Peta interaktif sedang dimuat...
			</p>
			<div
				className='border rounded-lg overflow-hidden flex items-center justify-center'
				style={{ height: "500px" }}
			>
				<div className='text-center'>
					<div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4'></div>
					<p>Memuat peta...</p>
				</div>
			</div>
		</div>
	);
}

function MapPage() {
	const [LeafletMap, setLeafletMap] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Hanya import LeafletMap di sisi klien
		if (typeof window !== "undefined") {
			import("./LeafletMap")
				.then((module) => {
					setLeafletMap(() => module.default);
					setIsLoading(false);
				})
				.catch((err) => {
					console.error("Error loading map component:", err);
					setError("Gagal memuat komponen peta. Silakan muat ulang halaman.");
					setIsLoading(false);
				});
		}
	}, []);

	if (isLoading) {
		return <MapPlaceholder />;
	}

	if (error) {
		return (
			<div className='space-y-4'>
				<h1 className='text-3xl font-bold'>Map</h1>
				<div className='p-4 border border-red-300 bg-red-50 text-red-700 rounded-md'>
					{error}
				</div>
			</div>
		);
	}

	// Render komponen LeafletMap jika sudah dimuat
	return LeafletMap ? <LeafletMap /> : null;
}

export default MapPage;
