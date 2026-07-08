"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, Plus, Phone, Mail, MapPin } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', vehicleModel: ''
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers/add', formData);
      setShowAddForm(false);
      setFormData({ name: '', phone: '', email: '', address: '', vehicleModel: '' });
      fetchCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer CRM</h1>
          <p className="text-gray-500">Manage your retail customers and leads.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">New Customer Profile</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Full Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email (Optional)</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Vehicle of Interest</label>
              <input value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Address</label>
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">Save Customer</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#0f172a] p-12 text-center rounded-xl border border-gray-100 dark:border-gray-800">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No customers yet</h3>
              <p className="text-gray-500">Get started by adding your first retail customer.</p>
            </div>
          ) : (
            customers.map(customer => (
              <div key={customer.id} className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mr-4">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                    <p className="text-xs text-gray-500">Added {new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {customer.phone}</div>
                  {customer.email && <div className="flex items-center"><Mail className="h-4 w-4 mr-2" /> {customer.email}</div>}
                  {customer.address && <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {customer.address}</div>}
                </div>
                {customer.vehicleModel && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      Interested: {customer.vehicleModel}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
