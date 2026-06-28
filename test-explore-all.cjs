const http = require('http');

http.get('http://localhost:3000/api/youtube/explore', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        console.log(Object.keys(json));
        for (const key of Object.keys(json)) {
            const arr = json[key];
            if (Array.isArray(arr) && arr.length > 0) {
                console.log(key, arr.length, arr[0].thumbnail);
            }
        }
    } catch(e) {}
  });
});
