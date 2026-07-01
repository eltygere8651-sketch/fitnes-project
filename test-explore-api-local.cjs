const http = require('http');

http.get("http://localhost:3000/api/youtube/explore?country=ES", res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Top 100 first item:", json.top100?.[0]);
      console.log("Trending first item:", json.trending?.[0]);
      console.log("Daily first item:", json.dailyTop?.[0]);
    } catch(e) { console.log(e); console.log(data.substring(0,200)); }
  });
});
