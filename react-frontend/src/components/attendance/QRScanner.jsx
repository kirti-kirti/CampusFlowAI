import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Scan, X } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Scan className="text-primary" size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Identity Scanner</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Position QR within frame</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-90"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="aspect-square relative overflow-hidden bg-black">
          <Scanner
            onScan={(result) => {
              if (result && result.length > 0) {
                onScan(result[0].rawValue);
              }
            }}
            onError={(error) => console.error(error)}
            styles={{
              container: { width: '100%', height: '100%' },
              video: { objectFit: 'cover' }
            }}
            components={{
              audio: false,
              finder: true
            }}
          />
          
          {/* Custom Scanning Animation Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary/50 rounded-3xl shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-line" />
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex flex-col items-center text-center">
          <p className="text-xs font-bold text-slate-500 max-w-[240px] leading-relaxed">
            Scanning for active sessions... Ensure you are within range of the terminal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
