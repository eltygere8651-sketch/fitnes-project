const http = require('http');
http.get('http://localhost:3000/api/youtube/explore', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log("Trends:", data.trends ? data.trends.length : "none");
      if(data.trends) data.trends.forEach((x, i) => i < 5 ? console.log('Trends', x.id, x.isPlaylist, x.title) : null);
      
      console.log("Trending:", data.trending ? data.trending.length : "none");
      if(data.trending) data.trending.forEach((x, i) => i < 5 ? console.log('Trending', x.id, x.isPlaylist, x.title) : null);
      
      console.log("DailyTop:", data.dailyTop ? data.dailyTop.length : "none");
      if(data.dailyTop) data.dailyTop.forEach((x, i) => i < 5 ? console.log('DailyTop', x.id, x.isPlaylist, x.title) : null);

      console.log("Top100:", data.top100 ? data.top100.length : "none");
    } catch(e) {
      console.log("Error parsing:", e.message);
    }
  });
}).on('error', e => console.error(e));
