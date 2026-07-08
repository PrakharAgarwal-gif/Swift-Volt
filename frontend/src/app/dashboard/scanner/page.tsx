"use client";

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, X, Search } from 'lucide-react';
import api from '@/lib/api';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined' && !scanResult) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          setScanResult(decodedText);
          scanner.clear();
        },
        (err) => {
          // Ignore frequent scan errors when no QR code is in frame
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [scanResult]);

  useEffect(() => {
    if (scanResult) {
      // Simulate fetching vehicle data based on QR code
      // In reality, this would hit an API like /api/vehicles/scan?chassis=...
      setLoading(true);
      setError('');
      setTimeout(() => {
        setVehicleData({
          model: "Swift Volt X-Pro",
          chassisNumber: scanResult,
          motorNumber: "MOT-" + Math.floor(Math.random() * 10000),
          batteryNumber: "BAT-" + Math.floor(Math.random() * 10000),
          warrantyStatus: "Active",
          dealer: "Current Dealer",
        });
        setLoading(false);
      }, 1000);
    }
  }, [scanResult]);

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Scanner</h1>
        <p className="text-gray-500 text-sm">Scan a vehicle chassis to view details.</p>
      </div>

      {!scanResult ? (
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div id="reader" className="w-full min-h-[300px] bg-black rounded-lg overflow-hidden"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Scan Result</h2>
            <button 
              onClick={() => { setScanResult(null); setVehicleData(null); }}
              className="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm font-mono break-all">
            {scanResult}
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : vehicleData ? (
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 text-primary border-b border-gray-100 dark:border-gray-800 pb-4">
                <QrCode className="h-8 w-8" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{vehicleData.model}</h3>
                  <p className="text-sm text-gray-500">Warranty: <span className="text-green-500 font-medium">{vehicleData.warrantyStatus}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Chassis No.</p>
                  <p className="font-medium dark:text-gray-200">{vehicleData.chassisNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Motor No.</p>
                  <p className="font-medium dark:text-gray-200">{vehicleData.motorNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Battery No.</p>
                  <p className="font-medium dark:text-gray-200">{vehicleData.batteryNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sold By</p>
                  <p className="font-medium dark:text-gray-200">{vehicleData.dealer}</p>
                </div>
              </div>
              <div className="pt-4 flex justify-between">
                <button className="text-primary text-sm font-medium hover:underline">View Service History</button>
                <button className="bg-primary text-white text-sm px-4 py-2 rounded-lg">Register Service</button>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500 p-4">Vehicle not found in database.</div>
          )}
        </div>
      )}
    </div>
  );
}
