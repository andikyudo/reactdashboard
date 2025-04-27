import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import React, { useState } from "react";
import { forwardGeocode } from "../services/unwiredLabsApi";

const LocationSearch = ({ onLocationSelect }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSearch = async (e) => {
		e.preventDefault();

		if (!searchQuery.trim()) return;

		try {
			setLoading(true);
			setError(null);
			setSearchResults([]);

			const data = await forwardGeocode(searchQuery);

			if (data.status === "ok" && data.address && data.address.length > 0) {
				setSearchResults(data.address);
			} else if (data.status === "error") {
				setError(data.message || "Tidak dapat menemukan lokasi");
			} else {
				setError("Tidak ada hasil yang ditemukan");
			}
		} catch (err) {
			setError(err.message || "Terjadi kesalahan saat mencari lokasi");
		} finally {
			setLoading(false);
		}
	};

	const handleLocationClick = (location) => {
		if (onLocationSelect) {
			onLocationSelect({
				lat: parseFloat(location.lat),
				lng: parseFloat(location.lon),
				name: location.display_name,
			});
		}
	};

	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle className='text-lg'>Cari Lokasi</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSearch} className='flex gap-2 mb-4'>
					<Input
						type='text'
						placeholder='Masukkan nama lokasi...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						disabled={loading}
						className='flex-1'
					/>
					<Button type='submit' disabled={loading || !searchQuery.trim()}>
						{loading ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<Search className='h-4 w-4' />
						)}
						<span className='ml-2'>Cari</span>
					</Button>
				</form>

				{loading && (
					<div className='flex items-center justify-center p-4'>
						<Loader2 className='h-6 w-6 animate-spin text-primary' />
						<span className='ml-2'>Mencari lokasi...</span>
					</div>
				)}

				{error && (
					<div className='text-red-500 p-2 mb-4'>
						<p>{error}</p>
					</div>
				)}

				{searchResults.length > 0 && (
					<div className='space-y-2'>
						<h3 className='text-sm font-medium'>Hasil Pencarian:</h3>
						<div className='max-h-[300px] overflow-y-auto border rounded-md'>
							{searchResults.map((result, index) => (
								<div
									key={`${result.lat}-${result.lon}-${index}`}
									className='p-2 hover:bg-muted cursor-pointer border-b last:border-b-0'
									onClick={() => handleLocationClick(result)}
								>
									<p className='font-medium'>{result.display_name}</p>
									<div className='flex flex-wrap text-xs text-muted-foreground mt-1'>
										{result.city && <span className='mr-2'>{result.city}</span>}
										{result.state && (
											<span className='mr-2'>{result.state}</span>
										)}
										{result.country && <span>{result.country}</span>}
									</div>
									<div className='text-xs text-muted-foreground mt-1'>
										Koordinat: {result.lat}, {result.lon}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default LocationSearch;
