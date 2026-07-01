const http = require('https');

http.get("https://ais-dev-yq53473i73hkntpv553kmj-352265948901.europe-west2.run.app/api/youtube/explore?country=ES", res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Top 100 first item:", json.top100?.[0]);
      console.log("Trending first item:", json.trending?.[0]);
      console.log("Daily first item:", json.dailyTop?.[0]);
    } catch(e) { console.log(e); }
  });
});
