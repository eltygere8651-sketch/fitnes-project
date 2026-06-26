const http = require('http');

http.get('http://localhost:3000/api/youtube/playlist-info?id=PLDIoUOhQQPlWc-Kd6TCjTRIl0Z6fSQV0X', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", body);
  });
}).on('error', e => console.error(e));
