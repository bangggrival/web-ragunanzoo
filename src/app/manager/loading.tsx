import React from 'react';
import AppIcon from '@/components/ui/AppIcon';

export default function ManagerLoading() {
  return (
    <div className="w-full h-[70vh] flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full animate-pulse" />
        
        {/* Main spinner container */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col items-center">
          <AppIcon icon="solar:spinner-linear" className="w-10 h-10 text-green-600 animate-spin" />
        </div>
      </div>
      
      <h3 className="mt-6 text-lg font-black text-slate-800 tracking-tight">
        Memuat Data...
      </h3>
      <p className="text-slate-500 font-medium text-sm mt-1 max-w-[250px] text-center">
        Menyiapkan tampilan untuk Anda, mohon tunggu sebentar.
      </p>
    </div>
  );
}
