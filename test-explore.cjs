const http = require('http');
http.get('http://localhost:3000/api/youtube/explore', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log("Trends:");
      if(data.trending) data.trending.forEach(x => console.log(x.id, x.isPlaylist, x.title));
      console.log("Workout:");
      if(data.workout) data.workout.forEach(x => console.log(x.id, x.isPlaylist, x.title));
    } catch(e) {
      console.log("Error parsing:", e.message);
    }
  });
}).on('error', e => console.error(e));
