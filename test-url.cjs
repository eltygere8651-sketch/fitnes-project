const http = require('https');
http.get("https://i.ytimg.com/vi/fcnDmrtj6Sk/hq720.jpg", res => {
  console.log(res.statusCode);
});
