import React from 'react';

export const Dashboard = () => {
  const days = [
    { label: 'L', active: false },
    { label: 'M', active: false },
    { label: 'M', active: false },
    { label: 'J', active: true },
    { label: 'V', active: false },
    { label: 'S', active: false },
    { label: 'D', active: false },
  ];

  return (
    <div className="w-full flex flex-col items-center pt-8">
      <div className="w-full max-w-sm bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-2xl">
        
        {/* Weekly consistency header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black tracking-widest text-[11px] sm:text-xs">
            CONSTANCIA SEMANAL
          </h3>
          <span className="text-emerald-500 font-bold tracking-widest text-sm">
            4 / 7 DÍAS
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex justify-between items-end h-24 sm:h-28 px-2 gap-4">
          {days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3 flex-1">
              <div className="w-full bg-[#1A1A1A] rounded-md h-full relative overflow-hidden flex flex-col justify-end">
                {day.active && (
                  <div className="w-full bg-emerald-500 h-1/2 rounded-md" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider">
                {day.label}
              </span>
            </div>
          ))}
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6 pb-2">
          <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
            RACHA:
          </span>
          <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-md flex items-center justify-center gap-1.5 border border-emerald-500/20">
            <span className="text-xs">⚡</span>
            <span className="text-[11px] sm:text-xs font-bold tracking-wider">4 Días</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-between items-center border-t border-white/5 pt-6 pb-2">
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase">
              CALORIAS TOTALES
            </span>
            <span className="text-white font-black tracking-widest text-base">
              675 Kcal
            </span>
          </div>

          <div className="flex flex-col gap-1 items-center">
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase">
              EJERCICIOS HECHOS
            </span>
            <span className="text-white font-black tracking-widest text-base">
              13 Ejs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
