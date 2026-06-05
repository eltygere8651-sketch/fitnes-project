import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const country = "ES";
  const [top100Res, trendingRes, novedadesRes] = await Promise.all([
      yt.search(`Top 100 Canciones ${country} Oficial YouTube Music`, { type: 'playlist' }),
      yt.search(`Éxitos Tendencia ${country} Oficial`, { type: 'playlist' }),
      yt.search(`Novedades ${country} Oficial YouTube Music`, { type: 'playlist' })
    ]);

  console.log("TOP 100", top100Res.playlists?.slice(0, 5).map(p => p.title.text));
  console.log("TRENDING", trendingRes.playlists?.slice(0, 5).map(p => p.title.text));
  console.log("NOVEDADES", novedadesRes.playlists?.slice(0, 5).map(p => p.title.text));
}
run();
