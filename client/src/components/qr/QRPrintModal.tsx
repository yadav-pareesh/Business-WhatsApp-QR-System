import React, { useState } from 'react';
import { Printer, Download, Sparkles, X, Check } from 'lucide-react';
import { Business } from '../../types';
import { downloadDataUrl, downloadSvg } from '../../utils/qr';

interface QRPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  qrDataUrl: string;
  qrSvgString: string;
}

type TemplateType = 'table_tent' | 'counter_stand' | 'a4_poster' | 'business_card';

export const QRPrintModal: React.FC<QRPrintModalProps> = ({
  isOpen,
  onClose,
  business,
  qrDataUrl,
  qrSvgString,
}) => {
  const [template, setTemplate] = useState<TemplateType>('table_tent');
  const [tableNumber, setTableNumber] = useState('04');
  const [headline, setHeadline] = useState('Scan to View Menu & Order on WhatsApp');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm no-print" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl border border-slate-100 my-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between no-print">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                Print-Ready QR Card Designer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate high-resolution printable table stands, counter tents, and wall posters.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-5 no-print">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Card Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'table_tent', label: 'Table Stand (4"×6")', desc: 'For dining tables' },
                    { id: 'counter_stand', label: 'Counter Stand (5"×7")', desc: 'For billing cash desk' },
                    { id: 'a4_poster', label: 'A4 Wall Poster', desc: 'Door / wall display' },
                    { id: 'business_card', label: 'Wallet Card', desc: 'Pocket takeaway card' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id as TemplateType)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        template === t.id
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{t.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {template === 'table_tent' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Table / Room Number Badge
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. Table 12, Booth 3"
                    className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Heading / Tagline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Scan to View Menu & Order"
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <button
                  onClick={handlePrint}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print Now
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadDataUrl(qrDataUrl, `${business.slug}-qr.png`)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => downloadSvg(qrSvgString, `${business.slug}-qr.svg`)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download SVG
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview Area (Also becomes print area!) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-100/70 p-6 rounded-2xl border border-slate-200/60 overflow-hidden">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 no-print">
                Live Preview
              </div>

              {/* Printable Stand Container */}
              <div
                className={`print-area bg-white text-slate-900 border-2 border-slate-300 shadow-xl rounded-2xl flex flex-col items-center justify-between text-center overflow-hidden transition-all ${
                  template === 'table_tent'
                    ? 'w-72 p-6'
                    : template === 'counter_stand'
                    ? 'w-80 p-8'
                    : template === 'a4_poster'
                    ? 'w-96 p-10'
                    : 'w-64 p-5'
                }`}
                style={{ borderColor: business.primaryColor }}
              >
                {/* Brand Banner */}
                <div className="w-full flex flex-col items-center gap-1 mb-2">
                  {business.logo ? (
                    <img
                      src={business.logo}
                      alt={business.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm"
                      style={{ backgroundColor: business.primaryColor }}
                    >
                      {business.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <h4 className="font-extrabold text-slate-900 text-lg leading-tight mt-1">
                    {business.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{business.category}</p>
                </div>

                {/* Table badge if applicable */}
                {template === 'table_tent' && tableNumber && (
                  <div
                    className="my-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: business.primaryColor }}
                  >
                    {tableNumber.toUpperCase()}
                  </div>
                )}

                {/* QR Code Graphic */}
                <div className="my-3 p-3 bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-sm flex flex-col items-center">
                  <img
                    src={qrDataUrl}
                    alt={`${business.name} QR Code`}
                    className={template === 'a4_poster' ? 'w-56 h-56' : 'w-44 h-44'}
                  />
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    whatsappqr.in/business/{business.slug}
                  </div>
                </div>

                {/* Tagline & Instructions */}
                <div className="mt-2 space-y-1">
                  <div className="font-extrabold text-sm text-slate-900">{headline}</div>
                  <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <span>1. Scan camera</span>
                    <span>→</span>
                    <span>2. Select items</span>
                    <span>→</span>
                    <span>3. Send WhatsApp</span>
                  </div>
                </div>

                {/* WhatsApp Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Instant Direct WhatsApp Ordering
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
