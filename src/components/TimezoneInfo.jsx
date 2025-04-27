import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getTimezone } from "../services/unwiredLabsApi";

const TimezoneInfo = ({ lat, lon }) => {
	const [timezoneData, setTimezoneData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchTimezoneData = async () => {
		if (!lat || !lon) return;

		try {
			setLoading(true);
			setError(null);
			const data = await getTimezone(lat, lon);

			if (data.status === "ok" && data.timezone) {
				setTimezoneData(data.timezone);
			} else {
				setError(data.message || "Tidak dapat memuat data zona waktu");
			}
		} catch (err) {
			setError(err.message || "Terjadi kesalahan saat memuat data zona waktu");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (lat && lon) {
			fetchTimezoneData();
		}
	}, [lat, lon]);

	// Format waktu dari offset dalam detik
	const formatOffset = (offsetSec) => {
		const hours = Math.floor(Math.abs(offsetSec) / 3600);
		const minutes = Math.floor((Math.abs(offsetSec) % 3600) / 60);
		const sign = offsetSec >= 0 ? "+" : "-";
		return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}`;
	};

	// Dapatkan waktu lokal berdasarkan offset
	const getLocalTime = (offsetSec) => {
		const now = new Date();
		const utc = now.getTime() + now.getTimezoneOffset() * 60000;
		const localTime = new Date(utc + offsetSec * 1000);
		return localTime.toLocaleTimeString();
	};

	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle className='text-lg'>Informasi Zona Waktu</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className='flex items-center justify-center p-4'>
						<Loader2 className='h-6 w-6 animate-spin text-primary' />
						<span className='ml-2'>Memuat data zona waktu...</span>
					</div>
				) : error ? (
					<div className='text-red-500 p-2'>
						<p>{error}</p>
						<Button
							variant='outline'
							size='sm'
							className='mt-2'
							onClick={fetchTimezoneData}
						>
							Coba Lagi
						</Button>
					</div>
				) : timezoneData ? (
					<div className='space-y-2'>
						<p>
							<strong>Nama Zona:</strong> {timezoneData.name}
						</p>
						<p>
							<strong>Singkatan:</strong> {timezoneData.short_name}
						</p>
						<p>
							<strong>Offset:</strong> {formatOffset(timezoneData.offset_sec)}
						</p>
						<p>
							<strong>Waktu Lokal:</strong>{" "}
							{getLocalTime(timezoneData.offset_sec)}
						</p>
						<p>
							<strong>Daylight Saving:</strong>{" "}
							{timezoneData.now_in_dst ? "Ya" : "Tidak"}
						</p>
					</div>
				) : (
					<p className='text-muted-foreground'>
						Pilih lokasi pada peta untuk melihat informasi zona waktu.
					</p>
				)}
			</CardContent>
		</Card>
	);
};

export default TimezoneInfo;
