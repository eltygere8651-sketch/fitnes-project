const fs = require('fs');

let code = fs.readFileSync('src/components/GymMusicPlayer.tsx', 'utf8');

const replacements = [
  {
    from: `<div className="space-y-3 px-1 pt-2">
                                          <div className="flex items-center justify-between px-2">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                              Top Tendencias
                                            </p>
                                          </div>
                                          <Carousel className="gap-3 pb-4 snap-x px-2">`,
    to: `<div className="space-y-3 px-1 pt-2">
                                          <Carousel 
                                            title={
                                              <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                                Top Tendencias
                                              </p>
                                            }
                                            className="gap-3 pb-4 snap-x px-2">`
  },
  {
    from: `<div className="space-y-3 px-1">
                                          <div className="flex items-center justify-between px-2">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                              Top Diario
                                            </p>
                                          </div>
                                          <Carousel className="gap-3 pb-4 snap-x px-2">`,
    to: `<div className="space-y-3 px-1">
                                          <Carousel 
                                            title={
                                              <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                                Top Diario
                                              </p>
                                            }
                                            className="gap-3 pb-4 snap-x px-2">`
  },
  {
    from: `<div className="space-y-3 px-1">
                                          <div className="flex items-center justify-between px-2">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                              Las 100 canciones más populares
                                            </p>
                                          </div>
                                          <Carousel className="gap-3 pb-4 snap-x px-2">`,
    to: `<div className="space-y-3 px-1">
                                          <Carousel 
                                            title={
                                              <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                                                Las 100 canciones más populares
                                              </p>
                                            }
                                            className="gap-3 pb-4 snap-x px-2">`
  },
  {
    from: `<div className="space-y-3 pt-2">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-[#1ED760] px-1">
                                            🏋️ Entrenamiento & Gym
                                          </p>
                                          <Carousel className="gap-3 pb-2 snap-x">`,
    to: `<div className="space-y-3 pt-2">
                                          <Carousel 
                                            title={
                                              <p className="text-[10px] font-black uppercase tracking-widest text-[#1ED760] px-1">
                                                🏋️ Entrenamiento & Gym
                                              </p>
                                            }
                                            className="gap-3 pb-2 snap-x px-1">`
  },
  {
    from: `<div className="space-y-3 pt-2">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 px-1">
                                            🧘 Relajación & Enfoque
                                          </p>
                                          <Carousel className="gap-3 pb-2 snap-x">`,
    to: `<div className="space-y-3 pt-2">
                                          <Carousel 
                                            title={
                                              <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 px-1">
                                                🧘 Relajación & Enfoque
                                              </p>
                                            }
                                            className="gap-3 pb-2 snap-x px-1">`
  },
  {
    from: `<div className="space-y-3 pt-2">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 px-1">
                                            🔥 Ritmos Latinos
                                          </p>
                                          <Carousel className="gap-3 pb-2 snap-x">`,
    to: `<div className="space-y-3 pt-2">
                                          <Carousel 
                                            title={
                                              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 px-1">
                                                🔥 Ritmos Latinos
                                              </p>
                                            }
                                            className="gap-3 pb-2 snap-x px-1">`
  }
];

for (let r of replacements) {
  code = code.replace(r.from, r.to);
}

fs.writeFileSync('src/components/GymMusicPlayer.tsx', code);
console.log('Done');
