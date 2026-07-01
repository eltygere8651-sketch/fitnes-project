const http = require('http');

http.get("http://localhost:3000/api/youtube/explore?country=ES", res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(Object.keys(json));
      console.log("trends first section title:", json.trends?.[0]?.title);
      console.log("trends first section first item:", json.trends?.[0]?.items?.[0]);
      console.log("trends second section first item:", json.trends?.[1]?.items?.[0]);
    } catch(e) { console.log(e); }
  });
});
