"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePrintPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/customer-invoices/${id}`)
        .then(res => {
          setInvoice(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found or access denied.</div>;

  const items = invoice.items ? JSON.parse(invoice.items) : [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white dark:bg-white text-black min-h-screen relative">
      <div className="print:hidden flex justify-between items-center mb-8">
        <Link href="/dashboard/billing" className="flex items-center text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Billing
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </button>
      </div>

      <div className="border border-gray-200 p-8 rounded-lg" id="printable-invoice">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-gray-500">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-primary mb-1">{invoice.dealer?.companyName || 'Swift Volt Dealer'}</h2>
            <p className="text-gray-600 text-sm">Authorized Swift Volt Dealership</p>
            <p className="text-gray-600 text-sm">{invoice.dealer?.user?.email || ''}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wider">Bill To:</h3>
            <p className="font-bold text-gray-900">{invoice.customerName}</p>
            <p className="text-gray-600">{invoice.customerPhone}</p>
            <p className="text-gray-600">{invoice.customerAddress || ''}</p>
          </div>
          <div className="text-right">
            <h3 className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wider">Invoice Details:</h3>
            <p className="text-gray-600"><span className="font-medium">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-600"><span className="font-medium">Status:</span> PAID</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 text-gray-600 font-semibold">Description</th>
                <th className="py-3 text-right text-gray-600 font-semibold">Qty</th>
                <th className="py-3 text-right text-gray-600 font-semibold">Unit Price</th>
                <th className="py-3 text-right text-gray-600 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-4 text-gray-900">{item.description}</td>
                  <td className="py-4 text-right text-gray-700">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-700">₹{item.unitPrice?.toLocaleString()}</td>
                  <td className="py-4 text-right text-gray-900 font-medium">₹{(item.quantity * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
              {/* Fallback for old invoices */}
              {items.length === 0 && invoice.scooterModel && (
                <tr className="border-b border-gray-100">
                  <td className="py-4 text-gray-900">
                    Swift Volt {invoice.scooterModel}
                    <div className="text-sm text-gray-500">Color: {invoice.scooterColor}</div>
                  </td>
                  <td className="py-4 text-right text-gray-700">1</td>
                  <td className="py-4 text-right text-gray-700">₹{invoice.price?.toLocaleString() || invoice.totalAmount?.toLocaleString()}</td>
                  <td className="py-4 text-right text-gray-900 font-medium">₹{invoice.price?.toLocaleString() || invoice.totalAmount?.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal?.toLocaleString() || invoice.price?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-200">
              <span>Tax / GST</span>
              <span>₹{invoice.taxAmount?.toLocaleString() || invoice.gst?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-1">
              <span>Total</span>
              <span>₹{invoice.totalAmount?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">Thank you for choosing Swift Volt! Ride safe.</p>
          <p className="text-gray-400 text-xs mt-1">This is a computer generated invoice and does not require a signature.</p>
        </div>
      </div>
      
      {/* Global styles to ensure printing hides the layout sidebar if necessary */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            padding: 0;
          }
        }
      `}} />
    </div>
  );
}
