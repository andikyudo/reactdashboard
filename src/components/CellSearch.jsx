import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { searchCellTowersByParams } from "../services/unwiredLabsApi";

const CellSearch = ({ onSearchComplete, mapInstance }) => {
  const [formData, setFormData] = useState({
    mcc: "510", // Default untuk Indonesia
    mnc: "",
    lac: "",
    cellid: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!formData.mcc.trim()) {
      setError("MCC tidak boleh kosong");
      return;
    }
    
    // Validasi: setidaknya salah satu dari MNC, LAC, atau Cell ID harus diisi
    if (!formData.mnc.trim() && !formData.lac.trim() && !formData.cellid.trim()) {
      setError("Setidaknya salah satu dari MNC, LAC, atau Cell ID harus diisi");
      return;
    }
    
    if (!mapInstance) {
      setError("Peta belum siap");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Searching for BTS with parameters:", formData);
      
      // Dapatkan batas peta saat ini
      const bounds = mapInstance.getBounds();
      console.log("Current map bounds:", bounds);
      
      // Cari BTS berdasarkan parameter
      const result = await searchCellTowersByParams(formData, bounds);
      console.log("Search result:", result);
      
      // Panggil callback dengan hasil pencarian
      if (onSearchComplete) {
        console.log("Calling onSearchComplete with result");
        onSearchComplete(result);
      }
      
      // Tampilkan pesan sukses atau error
      if (result && result.cells && result.cells.length > 0) {
        console.log(`Found ${result.cells.length} BTS with parameters`);
        setError(null);
      } else {
        console.log("No BTS found with parameters");
        setError("Tidak ditemukan BTS dengan parameter yang diberikan");
      }
    } catch (error) {
      console.error("Error searching by parameters:", error);
      setError(`Error: ${error.message || "Gagal mencari BTS"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Cari BTS berdasarkan Parameter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mcc">MCC</Label>
              <Input
                id="mcc"
                name="mcc"
                type="text"
                placeholder="510 (Indonesia)"
                value={formData.mcc}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mnc">MNC</Label>
              <Input
                id="mnc"
                name="mnc"
                type="text"
                placeholder="10 (Telkomsel)"
                value={formData.mnc}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lac">LAC</Label>
              <Input
                id="lac"
                name="lac"
                type="text"
                placeholder="Location Area Code"
                value={formData.lac}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cellid">Cell ID</Label>
              <Input
                id="cellid"
                name="cellid"
                type="text"
                placeholder="Cell ID"
                value={formData.cellid}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mencari...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Cari BTS
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CellSearch;
