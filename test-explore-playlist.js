async function test() {
  const res = await fetch('http://localhost:3000/api/youtube/explore');
  const d = await res.json();
  const firstCategory = Object.keys(d)[0];
  const firstPlaylist = d[firstCategory][0];
  console.log("Fetching playlist:", firstPlaylist.id);
  const plRes = await fetch('http://localhost:3000/api/youtube/playlist?id=' + firstPlaylist.id);
  console.log("Status:", plRes.status);
  const plBody = await plRes.text();
  console.log("Body:", plBody.substring(0, 500));
}

test();
