const http = require('http');

http.get('http://localhost:3000/api/youtube/explore', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json.trending.slice(0, 2), null, 2));
    } catch(e) {}
  });
});
