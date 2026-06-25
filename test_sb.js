import https from 'https';

https.get('https://sponsor.ajay.app/api/skipSegments?videoID=sOnqjkJTMaA&categories=["music_offtopic"]', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
