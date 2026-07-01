const http = require('http');

http.get("http://localhost:3000/api/youtube/explore?country=ES", res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("workout:", json.workout?.map(x=>x.title));
      console.log("focus:", json.focus?.map(x=>x.title));
      console.log("party:", json.party?.map(x=>x.title));
    } catch(e) { console.log(e); }
  });
});
