import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getBalance } from "../services/unwiredLabsApi";

const ApiBalance = () => {
	const [balanceData, setBalanceData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);

	const fetchBalanceData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getBalance();

			if (data.status === "ok") {
				setBalanceData({
					geolocation: data.balance_geolocation || 0,
					geocoding: data.balance_geocoding || 0,
				});
				setLastUpdated(new Date());
			} else {
				setError(data.message || "Tidak dapat memuat data saldo");
			}
		} catch (err) {
			setError(err.message || "Terjadi kesalahan saat memuat data saldo");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBalanceData();

		// Refresh data setiap 30 menit
		const intervalId = setInterval(fetchBalanceData, 30 * 60 * 1000);

		return () => clearInterval(intervalId);
	}, []);

	// Format waktu terakhir diperbarui
	const formatLastUpdated = () => {
		if (!lastUpdated) return "Belum pernah";

		return lastUpdated.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	return (
		<Card className='w-full'>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<CardTitle className='text-lg'>Saldo API Unwired Labs</CardTitle>
					<Button
						variant='outline'
						size='sm'
						onClick={fetchBalanceData}
						disabled={loading}
					>
						<RefreshCw
							className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{loading && !balanceData ? (
					<div className='flex items-center justify-center p-4'>
						<Loader2 className='h-6 w-6 animate-spin text-primary' />
						<span className='ml-2'>Memuat data saldo...</span>
					</div>
				) : error ? (
					<div className='text-red-500 p-2'>
						<p>{error}</p>
						<Button
							variant='outline'
							size='sm'
							className='mt-2'
							onClick={fetchBalanceData}
						>
							Coba Lagi
						</Button>
					</div>
				) : balanceData ? (
					<div className='space-y-4'>
						<div>
							<div className='flex justify-between mb-1'>
								<span className='text-sm font-medium'>Geolocation API</span>
								<span className='text-sm font-medium'>
									{balanceData.geolocation} permintaan
								</span>
							</div>
							<Progress
								value={
									balanceData.geolocation > 1000
										? 100
										: balanceData.geolocation / 10
								}
							/>
						</div>

						<div>
							<div className='flex justify-between mb-1'>
								<span className='text-sm font-medium'>Geocoding API</span>
								<span className='text-sm font-medium'>
									{balanceData.geocoding} permintaan
								</span>
							</div>
							<Progress
								value={
									balanceData.geocoding > 1000
										? 100
										: balanceData.geocoding / 10
								}
							/>
						</div>

						<div className='text-xs text-muted-foreground pt-2'>
							<p>Terakhir diperbarui: {formatLastUpdated()}</p>
							<p className='mt-1'>
								Saldo direset setiap hari pada pukul 00:00 UTC.
							</p>
						</div>
					</div>
				) : (
					<p className='text-muted-foreground'>
						Tidak ada data saldo yang tersedia.
					</p>
				)}
			</CardContent>
		</Card>
	);
};

export default ApiBalance;
