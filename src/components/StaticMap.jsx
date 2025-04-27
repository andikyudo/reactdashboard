import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download, Loader2, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getStaticMap } from "../services/unwiredLabsApi";

const StaticMap = ({ lat, lon, markers = [], title = "Peta Statis" }) => {
	const [mapUrl, setMapUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [zoom, setZoom] = useState(14);
	const [size, setSize] = useState({ width: 600, height: 400 });

	useEffect(() => {
		if (lat && lon) {
			generateMap();
		}
	}, [lat, lon, zoom, markers]);

	const generateMap = () => {
		try {
			setLoading(true);
			setError(null);

			// Buat URL peta statis
			const url = getStaticMap(
				lat,
				lon,
				zoom,
				size.width,
				size.height,
				markers
			);
			setMapUrl(url);
		} catch (err) {
			setError(err.message || "Terjadi kesalahan saat membuat peta statis");
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = () => {
		if (!mapUrl) return;

		// Buat link untuk download
		const link = document.createElement("a");
		link.href = mapUrl;
		link.download = `static-map-${lat}-${lon}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleZoomChange = (value) => {
		setZoom(value[0]);
	};

	return (
		<Card className='w-full'>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<CardTitle className='text-lg'>{title}</CardTitle>
					<div className='flex space-x-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={generateMap}
							disabled={loading || !lat || !lon}
						>
							<RefreshCw className='h-4 w-4 mr-1' />
							Refresh
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={handleDownload}
							disabled={loading || !mapUrl}
						>
							<Download className='h-4 w-4 mr-1' />
							Download
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className='mb-4 space-y-2'>
					<div className='flex items-center justify-between'>
						<Label htmlFor='zoom-slider'>Zoom Level: {zoom}</Label>
					</div>
					<Slider
						id='zoom-slider'
						min={1}
						max={18}
						step={1}
						value={[zoom]}
						onValueChange={handleZoomChange}
						disabled={loading}
					/>
				</div>

				{loading ? (
					<div className='flex items-center justify-center p-4 h-[400px] border rounded-md'>
						<Loader2 className='h-6 w-6 animate-spin text-primary' />
						<span className='ml-2'>Memuat peta statis...</span>
					</div>
				) : error ? (
					<div className='text-red-500 p-4 h-[400px] border rounded-md flex flex-col items-center justify-center'>
						<p>{error}</p>
						<Button
							variant='outline'
							size='sm'
							className='mt-2'
							onClick={generateMap}
						>
							Coba Lagi
						</Button>
					</div>
				) : mapUrl ? (
					<div className='border rounded-md overflow-hidden'>
						<img
							src={mapUrl}
							alt='Static Map'
							className='w-full h-auto'
							onError={() => setError("Gagal memuat gambar peta")}
						/>
					</div>
				) : (
					<div className='text-muted-foreground p-4 h-[400px] border rounded-md flex items-center justify-center'>
						Pilih lokasi pada peta untuk melihat peta statis.
					</div>
				)}

				{mapUrl && (
					<div className='mt-2 text-xs text-muted-foreground break-all'>
						<p>URL Peta: {mapUrl}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default StaticMap;
