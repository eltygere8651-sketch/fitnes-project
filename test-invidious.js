const https = require('https');
https.get('https://invidious.jing.rocks/api/v1/search?q=gym+music', {
  headers: { 'Origin': 'https://example.com' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Data length:', data.length, 'CORS:', res.headers['access-control-allow-origin']));
}).on('error', console.error);
