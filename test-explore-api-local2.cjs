const http = require('http');

http.get("http://localhost:3000/api/youtube/explore?country=ES", res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Trends[0] first item:", json.trends?.[0]?.items?.[0]);
      console.log("Trends[1] first item:", json.trends?.[1]?.items?.[0]);
    } catch(e) { console.log(e); }
  });
});
