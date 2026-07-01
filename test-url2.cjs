const https = require('https');

https.get("https://i.ytimg.com/vi/fcnDmrtj6Sk/hq720.jpg", res => {
  console.log("Status:", res.statusCode);
});
https.get("https://i.ytimg.com/vi/xqSO21hr3Zk/hqdefault.jpg", res => {
  console.log("Status2:", res.statusCode);
});
