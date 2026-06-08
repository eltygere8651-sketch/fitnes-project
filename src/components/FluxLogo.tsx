import React from "react";

export function FluxLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`${className} border-2 border-[#1ED760] rounded-full flex items-center justify-center p-[1.5px] bg-[#09090b] shadow-[0_0_12px_rgba(30,215,96,0.35)] shrink-0 select-none`}>
      <div className="w-full h-full border border-slate-500 rounded-full flex items-center justify-center p-[1.5px]">
        <div className="w-full h-full border-2 border-[#1ED760] rounded-full flex items-center justify-center gap-1.5 px-1 bg-[#09090b]">
          <div className="w-1.5 h-1.5 bg-[#1ED760] rounded-full shadow-[0_0_4px_rgba(30,215,96,0.6)]" />
          <div className="w-1.5 h-1.5 bg-[#1ED760] rounded-full shadow-[0_0_4px_rgba(30,215,96,0.6)]" />
        </div>
      </div>
    </div>
  );
}

export function FluxLogoMini({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <div className={`${className} border border-[#1ED760] rounded-full flex items-center justify-center p-[0.8px] bg-[#09090b] shrink-0 select-none`}>
      <div className="w-full h-full border-[0.5px] border-slate-500 rounded-full flex items-center justify-center p-[0.8px]">
        <div className="w-full h-full border border-[#1ED760] rounded-full flex items-center justify-center gap-[1px] px-[1px] bg-[#09090b]">
          <div className="w-[1.5px] h-[1.5px] bg-[#1ED760] rounded-full" />
          <div className="w-[1.5px] h-[1.5px] bg-[#1ED760] rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function FluxLogoLarge({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <div className={`${className} border-4 border-[#1ED760] rounded-full flex items-center justify-center p-[4px] bg-[#09090b] shadow-[0_0_30px_rgba(30,215,96,0.4)] shrink-0 select-none`}>
      <div className="w-full h-full border border-slate-500 rounded-full flex items-center justify-center p-[4px]">
        <div className="w-full h-full border-4 border-[#1ED760] rounded-full flex items-center justify-center gap-3 px-2 bg-[#09090b]">
          <div className="w-3 h-3 bg-[#1ED760] rounded-full shadow-[0_0_8px_rgba(30,215,96,0.8)]" />
          <div className="w-3 h-3 bg-[#1ED760] rounded-full shadow-[0_0_8px_rgba(30,215,96,0.8)]" />
        </div>
      </div>
    </div>
  );
}
