const http = require('http');
http.get('http://localhost:3000/api/youtube/explore', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const lists = ['trending', 'dailyTop', 'top100', 'workout', 'focus', 'trends', 'latin', 'party'];
      lists.forEach(list => {
        console.log("=== " + list + " ===");
        if (data[list] && data[list].length) {
            data[list].slice(0, 5).forEach(x => {
                console.log(x.id, x.thumbnail);
            });
        }
      });
    } catch(e) {
      console.log("Error parsing:", e.message);
    }
  });
}).on('error', e => console.error(e));
