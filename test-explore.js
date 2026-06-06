async function test() {
  const res = await fetch('http://localhost:3000/api/youtube/explore');
  const text = await res.text();
  try {
     const d = JSON.parse(text);
     console.log("Keys available:", Object.keys(d));
     if(d.top100) console.log("Top 100 Title 0:", d.top100[0]?.title);
     if(d.top20Tendencias) console.log("Tendencias Title 0:", d.top20Tendencias[0]?.title);
     if(d.dailyTopPlaylists) console.log("Daily Top Playlists:", d.dailyTopPlaylists[0]?.title);
     if(d.trending) console.log("Original trending:", d.trending[0]?.title);
  } catch (e) {
     console.error("Failed to parse explore", text.substring(0, 500));
  }
}
test();
