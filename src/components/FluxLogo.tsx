import React from "react";

export function FluxLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`${className} border-2 border-[#1ED760] rounded-full flex items-center justify-center p-[1.5px] bg-[#000000] shadow-[0_0_18px_rgba(30,215,96,0.7)] shrink-0 select-none`}>
      <div className="w-full h-full border border-slate-500/50 rounded-full flex items-center justify-center p-[1.5px]">
        <div className="w-full h-full border-2 border-[#1ED760] rounded-full flex items-center justify-center gap-1.5 px-1 bg-[#000000]">
          <div className="w-1.5 h-1.5 bg-[#1ED760] rounded-full shadow-[0_0_6px_rgba(30,215,96,0.9)]" />
          <div className="w-1.5 h-1.5 bg-[#1ED760] rounded-full shadow-[0_0_6px_rgba(30,215,96,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export function FluxLogoMini({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <div className={`${className} border border-[#1ED760] rounded-full flex items-center justify-center p-[0.8px] bg-[#000000] shrink-0 select-none`}>
      <div className="w-full h-full border-[0.5px] border-slate-500/50 rounded-full flex items-center justify-center p-[0.8px]">
        <div className="w-full h-full border border-[#1ED760] rounded-full flex items-center justify-center gap-[1px] px-[1px] bg-[#000000]">
          <div className="w-[1.5px] h-[1.5px] bg-[#1ED760] rounded-full" />
          <div className="w-[1.5px] h-[1.5px] bg-[#1ED760] rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function FluxLogoLarge({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <div className={`${className} border-4 border-[#1ED760] rounded-full flex items-center justify-center p-[4px] bg-[#000000] shadow-[0_0_40px_rgba(30,215,96,0.8)] shrink-0 select-none`}>
      <div className="w-full h-full border border-slate-500/50 rounded-full flex items-center justify-center p-[4px]">
        <div className="w-full h-full border-4 border-[#1ED760] rounded-full flex items-center justify-center gap-3 px-2 bg-[#000000]">
          <div className="w-3 h-3 bg-[#1ED760] rounded-full shadow-[0_0_12px_rgba(30,215,96,1)]" />
          <div className="w-3 h-3 bg-[#1ED760] rounded-full shadow-[0_0_12px_rgba(30,215,96,1)]" />
        </div>
      </div>
    </div>
  );
}
