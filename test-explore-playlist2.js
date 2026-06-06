async function test() {
  console.log("Fetching proper playlist...");
  const plRes = await fetch('http://localhost:3000/api/youtube/playlist?id=RDCLAK5uy_mN3A7V5V3hR32S-r6OQYZ2vG9FkK2nJwU');
  console.log("Status:", plRes.status);
  const plBody = await plRes.json();
  console.log("Body length:", plBody.length);
}
test();
