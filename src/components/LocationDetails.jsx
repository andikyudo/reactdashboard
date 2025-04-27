import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { reverseGeocode } from "../services/unwiredLabsApi";

const LocationDetails = ({ lat, lon }) => {
	const [locationData, setLocationData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchLocationData = async () => {
		if (!lat || !lon) return;

		try {
			setLoading(true);
			setError(null);
			const data = await reverseGeocode(lat, lon);

			if (data.status === "ok" && data.address) {
				setLocationData(data.address);
			} else {
				setError(data.message || "Tidak dapat memuat detail lokasi");
			}
		} catch (err) {
			setError(err.message || "Terjadi kesalahan saat memuat detail lokasi");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (lat && lon) {
			fetchLocationData();
		}
	}, [lat, lon]);

	return (
		<Card className='w-full'>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<CardTitle className='text-lg'>Detail Lokasi</CardTitle>
					<Button
						variant='outline'
						size='sm'
						onClick={fetchLocationData}
						disabled={loading || !lat || !lon}
					>
						<RefreshCw
							className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className='flex items-center justify-center p-4'>
						<Loader2 className='h-6 w-6 animate-spin text-primary' />
						<span className='ml-2'>Memuat detail lokasi...</span>
					</div>
				) : error ? (
					<div className='text-red-500 p-2'>
						<p>{error}</p>
						<Button
							variant='outline'
							size='sm'
							className='mt-2'
							onClick={fetchLocationData}
						>
							Coba Lagi
						</Button>
					</div>
				) : locationData ? (
					<div className='space-y-2'>
						<div className='flex items-start'>
							<MapPin className='h-5 w-5 text-primary mr-2 mt-0.5' />
							<div>
								<h3 className='font-medium'>{locationData.display_name}</h3>
								<p className='text-xs text-muted-foreground'>
									Koordinat: {lat.toFixed(6)}, {lon.toFixed(6)}
								</p>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-2 mt-4'>
							{locationData.road && (
								<div>
									<p className='text-xs text-muted-foreground'>Jalan</p>
									<p className='text-sm'>{locationData.road}</p>
								</div>
							)}

							{locationData.suburb && (
								<div>
									<p className='text-xs text-muted-foreground'>Area</p>
									<p className='text-sm'>{locationData.suburb}</p>
								</div>
							)}

							{locationData.city && (
								<div>
									<p className='text-xs text-muted-foreground'>Kota</p>
									<p className='text-sm'>{locationData.city}</p>
								</div>
							)}

							{locationData.county && (
								<div>
									<p className='text-xs text-muted-foreground'>Kabupaten</p>
									<p className='text-sm'>{locationData.county}</p>
								</div>
							)}

							{locationData.state && (
								<div>
									<p className='text-xs text-muted-foreground'>Provinsi</p>
									<p className='text-sm'>{locationData.state}</p>
								</div>
							)}

							{locationData.country && (
								<div>
									<p className='text-xs text-muted-foreground'>Negara</p>
									<p className='text-sm'>{locationData.country}</p>
								</div>
							)}

							{locationData.postal_code && (
								<div>
									<p className='text-xs text-muted-foreground'>Kode Pos</p>
									<p className='text-sm'>{locationData.postal_code}</p>
								</div>
							)}
						</div>
					</div>
				) : (
					<p className='text-muted-foreground'>
						Pilih lokasi pada peta untuk melihat detail.
					</p>
				)}
			</CardContent>
		</Card>
	);
};

export default LocationDetails;
