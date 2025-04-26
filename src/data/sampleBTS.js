// Data sampel BTS untuk Jakarta
export const sampleBTSData = {
  cells: [
    {
      lat: -6.1754,
      lon: 106.8272,
      mcc: 510,
      mnc: 10,
      lac: 10101,
      cellid: 12345,
      radio: "GSM",
      samples: 42,
      averageSignalStrength: -85
    },
    {
      lat: -6.1701,
      lon: 106.8219,
      mcc: 510,
      mnc: 10,
      lac: 10101,
      cellid: 12346,
      radio: "GSM",
      samples: 38,
      averageSignalStrength: -82
    },
    {
      lat: -6.1769,
      lon: 106.8222,
      mcc: 510,
      mnc: 11,
      lac: 10102,
      cellid: 23456,
      radio: "UMTS",
      samples: 56,
      averageSignalStrength: -78
    },
    {
      lat: -6.1950,
      lon: 106.8233,
      mcc: 510,
      mnc: 11,
      lac: 10102,
      cellid: 23457,
      radio: "UMTS",
      samples: 48,
      averageSignalStrength: -80
    },
    {
      lat: -6.2088,
      lon: 106.8005,
      mcc: 510,
      mnc: 20,
      lac: 10201,
      cellid: 34567,
      radio: "LTE",
      samples: 72,
      averageSignalStrength: -75
    },
    {
      lat: -6.2185,
      lon: 106.8107,
      mcc: 510,
      mnc: 20,
      lac: 10201,
      cellid: 34568,
      radio: "LTE",
      samples: 65,
      averageSignalStrength: -77
    },
    {
      lat: -6.3024,
      lon: 106.8951,
      mcc: 510,
      mnc: 21,
      lac: 10202,
      cellid: 45678,
      radio: "LTE",
      samples: 58,
      averageSignalStrength: -79
    },
    {
      lat: -6.1261,
      lon: 106.8308,
      mcc: 510,
      mnc: 21,
      lac: 10202,
      cellid: 45679,
      radio: "LTE",
      samples: 62,
      averageSignalStrength: -76
    },
    // Tambahkan BTS di sekitar lokasi penting
    {
      lat: -6.1754 + 0.002,
      lon: 106.8272 + 0.002,
      mcc: 510,
      mnc: 10,
      lac: 10101,
      cellid: 12347,
      radio: "GSM",
      samples: 40,
      averageSignalStrength: -83
    },
    {
      lat: -6.1754 - 0.002,
      lon: 106.8272 - 0.002,
      mcc: 510,
      mnc: 10,
      lac: 10101,
      cellid: 12348,
      radio: "GSM",
      samples: 41,
      averageSignalStrength: -84
    },
    {
      lat: -6.1701 + 0.001,
      lon: 106.8219 + 0.001,
      mcc: 510,
      mnc: 11,
      lac: 10102,
      cellid: 23458,
      radio: "UMTS",
      samples: 52,
      averageSignalStrength: -79
    },
    {
      lat: -6.1701 - 0.001,
      lon: 106.8219 - 0.001,
      mcc: 510,
      mnc: 11,
      lac: 10102,
      cellid: 23459,
      radio: "UMTS",
      samples: 50,
      averageSignalStrength: -81
    },
    // Tambahkan BTS di sekitar Monas
    {
      lat: -6.1754 + 0.0015,
      lon: 106.8272 + 0.0015,
      mcc: 510,
      mnc: 20,
      lac: 10201,
      cellid: 34569,
      radio: "LTE",
      samples: 68,
      averageSignalStrength: -76
    },
    {
      lat: -6.1754 - 0.0015,
      lon: 106.8272 - 0.0015,
      mcc: 510,
      mnc: 20,
      lac: 10201,
      cellid: 34570,
      radio: "LTE",
      samples: 70,
      averageSignalStrength: -74
    },
    {
      lat: -6.1754 + 0.001,
      lon: 106.8272 - 0.001,
      mcc: 510,
      mnc: 21,
      lac: 10202,
      cellid: 45680,
      radio: "LTE",
      samples: 60,
      averageSignalStrength: -78
    },
    {
      lat: -6.1754 - 0.001,
      lon: 106.8272 + 0.001,
      mcc: 510,
      mnc: 21,
      lac: 10202,
      cellid: 45681,
      radio: "LTE",
      samples: 61,
      averageSignalStrength: -77
    }
  ]
};
