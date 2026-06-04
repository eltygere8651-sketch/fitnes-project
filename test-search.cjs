const http = require('http');
http.get('http://localhost:3000/api/youtube/search?q=top+100+songs+global', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      data.slice(0, 3).forEach(x => {
        console.log("ID:", x.id, "Title:", x.title, "Thumb:", x.thumbnail);
      });
    } catch(e) {
      console.log("Error parsing:", e.message);
    }
  });
}).on('error', e => console.error(e));
