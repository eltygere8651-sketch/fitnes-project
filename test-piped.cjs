const https = require('https');

https.get("https://pipedapi.kavin.rocks/playlists/RDCLAK5uy_m-zEtyW9EceXz8eD8X_mG78l1E7F-x5YQ", res => {
  console.log("Status:", res.statusCode);
});
