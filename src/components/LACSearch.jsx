import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { searchCellTowersByLAC } from "../services/unwiredLabsApi";

const LACSearch = ({ onSearchComplete, mapInstance }) => {
	const [lac, setLac] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Periksa apakah mapInstance tersedia
	useEffect(() => {
		console.log("LACSearch component mounted, mapInstance:", mapInstance);
	}, [mapInstance]);

	const handleSearch = async (e) => {
		e.preventDefault();

		console.log("LAC Search initiated with value:", lac);

		if (!lac.trim()) {
			setError("Masukkan LAC (Location Area Code) untuk mencari");
			return;
		}

		if (!mapInstance) {
			console.error("Map instance not available");
			setError("Peta belum siap");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			console.log("Searching for BTS with LAC:", lac);

			// Dapatkan batas peta saat ini
			const bounds = mapInstance.getBounds();
			console.log("Current map bounds:", bounds);

			// Cari BTS berdasarkan LAC
			const result = await searchCellTowersByLAC(lac, bounds);
			console.log("Search result:", result);

			// Panggil callback dengan hasil pencarian
			if (onSearchComplete) {
				console.log("Calling onSearchComplete with result");
				onSearchComplete(result);
			}

			// Tampilkan pesan sukses
			if (result && result.cells && result.cells.length > 0) {
				console.log(`Found ${result.cells.length} BTS with LAC ${lac}`);
				setError(null);
			} else {
				console.log(`No BTS found with LAC ${lac}`);
				setError(`Tidak ditemukan BTS dengan LAC ${lac}`);
			}
		} catch (error) {
			console.error("Error searching by LAC:", error);
			setError(
				`Error: ${error.message || "Gagal mencari BTS berdasarkan LAC"}`
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader className='pb-3'>
				<CardTitle>Cari BTS berdasarkan LAC</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSearch} className='space-y-4'>
					<div className='flex flex-col space-y-2'>
						<label htmlFor='lac' className='text-sm font-medium'>
							Location Area Code (LAC)
						</label>
						<Input
							id='lac'
							type='text'
							placeholder='Masukkan LAC (contoh: 10101)'
							value={lac}
							onChange={(e) => setLac(e.target.value)}
							disabled={loading}
						/>
						{error && <p className='text-sm text-red-500'>{error}</p>}
					</div>

					<Button type='submit' disabled={loading} className='w-full'>
						{loading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Mencari...
							</>
						) : (
							<>
								<Search className='mr-2 h-4 w-4' />
								Cari BTS
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default LACSearch;
