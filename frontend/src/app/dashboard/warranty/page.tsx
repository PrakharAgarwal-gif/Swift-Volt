"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { FileText, Search, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function WarrantyPage() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const [issueDescription, setIssueDescription] = useState('');

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      const res = await api.get('/warranties');
      setWarranties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await api.put(`/warranties/${id}/status`, { status });
      setWarranties(prev => prev.map(w => w.id === id ? res.data : w));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty) return;
    
    try {
      const res = await api.put(`/warranties/${selectedWarranty.id}/claim`, { issueDescription });
      setWarranties(prev => prev.map(w => w.id === selectedWarranty.id ? { ...res.data, vehicle: w.vehicle } : w));
      setClaimModalOpen(false);
      setSelectedWarranty(null);
      setIssueDescription('');
    } catch (err) {
      console.error("Failed to submit claim", err);
    }
  };

  const filteredWarranties = warranties.filter(w => 
    w.vehicle?.chassisNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.vehicle?.scooterModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warranty Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage vehicle warranties and claims.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between">
           <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search by Chassis or Model..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f172a] text-sm focus:ring-primary focus:border-primary" 
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Vehicle</th>
                <th scope="col" className="px-6 py-4 font-semibold">Chassis / Motor</th>
                <th scope="col" className="px-6 py-4 font-semibold">Warranty Period</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarranties.map((w) => (
                <tr key={w.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-primary" />
                    <div>
                      {w.vehicle?.scooterModel}
                      {user?.role === 'ADMIN' && <div className="text-xs text-gray-500 font-normal">{w.dealerName}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs">{w.vehicle?.chassisNumber}</div>
                    <div className="font-mono text-xs text-gray-400">{w.vehicle?.motorNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">Start: {new Date(w.warrantyStartDate).toLocaleDateString()}</div>
                    <div className="text-xs font-medium text-red-500">Exp: {new Date(w.warrantyExpiryDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      w.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                      w.status === 'Claim Requested' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      w.status === 'Claim Approved' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user?.role === 'DEALER' && w.status === 'Active' && (
                      <button onClick={() => { setSelectedWarranty(w); setClaimModalOpen(true); }} className="text-primary hover:text-primary/80 font-medium text-sm">
                        Submit Claim
                      </button>
                    )}
                    {user?.role === 'ADMIN' && (w.status === 'Claim Requested' || w.status === 'Inspection Requested') && (
                      <select 
                        value={w.status}
                        onChange={e => handleStatusChange(w.id, e.target.value)}
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-lg p-1.5 ml-auto"
                      >
                        <option value="Claim Requested">Claim Requested</option>
                        <option value="Inspection Requested">Request Inspection</option>
                        <option value="Claim Approved">Approve Claim</option>
                        <option value="Claim Rejected">Reject Claim</option>
                        <option value="Case Closed">Close Case</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {filteredWarranties.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No warranties found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Modal */}
      {claimModalOpen && selectedWarranty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit Warranty Claim</h3>
            </div>
            <form onSubmit={submitClaim} className="p-6 space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{selectedWarranty.vehicle?.scooterModel}</p>
                <p className="text-sm text-gray-500 mb-4 font-mono">Chassis: {selectedWarranty.vehicle?.chassisNumber}</p>
                
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Description</label>
                <textarea 
                  required 
                  rows={4}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 text-sm" 
                  value={issueDescription} 
                  onChange={e => setIssueDescription(e.target.value)}
                  placeholder="Describe the issue with the vehicle..."
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-800 mt-6">
                <button type="button" onClick={() => setClaimModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
