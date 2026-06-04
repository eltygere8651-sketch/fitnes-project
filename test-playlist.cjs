const http = require('http');
http.get('http://localhost:3000/api/youtube/playlist?id=PLDIoUOhQQPlWc-Kd6TCjTRIl0Z6fSQV0X', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log("Returned:", data.length, "tracks");
      if (data.length > 0) {
        console.log(data[0]);
      } else {
        console.log("Data:", data);
      }
    } catch(e) {
      console.log("Error parsing:", e.message);
      console.log(body);
    }
  });
}).on('error', e => console.error(e));
