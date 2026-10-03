import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Share2,
  ExternalLink,
  Sparkles,
  Check,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';
import { downloadDataUrl, downloadSvg } from '../../utils/qr';
import { QRPrintModal } from '../../components/qr/QRPrintModal';

export const QRManagementPage: React.FC = () => {
  const { currentBusiness } = useAuthStore();

  const [qrData, setQrData] = useState<{
    businessName: string;
    slug: string;
    publicUrl: string;
    qrDataUrl: string;
    qrSvgString: string;
    scanCount: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    const loadQR = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<any>(`/qr/${currentBusiness.id}`);
        setQrData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadQR();
  }, [currentBusiness]);

  const handleCopy = () => {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!qrData) return;
    if (navigator.share) {
      navigator.share({
        title: qrData.businessName,
        text: 'Scan to view our digital menu and order on WhatsApp!',
        url: qrData.publicUrl,
      });
    } else {
      handleCopy();
    }
  };

  if (isLoading || !qrData || !currentBusiness) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            QR Code & Print Designer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your stable QR destination never changes. Print stands, table tents, or posters.
          </p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-all"
        >
          <Printer className="w-4 h-4" />
          Launch Print Designer
        </button>
      </div>

      {/* Main QR Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left QR Image */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 max-w-[280px] w-full flex flex-col items-center shadow-inner">
            <img
              src={qrData.qrDataUrl}
              alt={`${qrData.businessName} QR Code`}
              className="w-56 h-56 rounded-xl bg-white p-2 shadow-sm"
            />
            <div className="text-[11px] font-mono text-slate-500 mt-2 truncate max-w-full">
              {qrData.publicUrl}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active & Stable QR</span>
          </div>
        </div>

        {/* Right Details & Export Options */}
        <div className="md:col-span-7 space-y-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{qrData.businessName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Updates to your menu prices, images, or WhatsApp number reflect immediately without re-printing!
            </p>
          </div>

          {/* Business Link Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
            <div className="text-xs font-mono text-slate-700 truncate">{qrData.publicUrl}</div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a
                href={qrData.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                title="Preview"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-brand-50/60 border border-brand-200 rounded-xl">
              <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wider">
                Total QR Scans
              </span>
              <div className="text-2xl font-black text-brand-900 mt-0.5">
                {qrData.scanCount}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Resolution
              </span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">300 DPI</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => downloadDataUrl(qrData.qrDataUrl, `${qrData.slug}-qr.png`)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-brand-600" />
              Download PNG
            </button>
            <button
              onClick={() => downloadSvg(qrData.qrSvgString, `${qrData.slug}-qr.svg`)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-brand-600" />
              Download SVG
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-brand-600" />
              Share Link
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Card
            </button>
          </div>
        </div>
      </div>

      {/* QR Print Designer Modal */}
      <QRPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        business={currentBusiness}
        qrDataUrl={qrData.qrDataUrl}
        qrSvgString={qrData.qrSvgString}
      />
    </div>
  );
};
