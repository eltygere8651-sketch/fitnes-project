const http = require('http');

http.get("http://localhost:3000/api/youtube/explore?country=ES", res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Trends sections count:", json.trends?.length);
      if (json.trends && json.trends.length > 0) {
        console.log("First section:", json.trends[0].title);
        console.log("First item:", json.trends[0].data[0]);
      }
    } catch(e) { console.log(e); }
  });
});
