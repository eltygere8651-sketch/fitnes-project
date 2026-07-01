async function test() {
  const pRes = await fetch("https://yt.lemnoslife.com/playlists?part=snippet&id=PLKo_mI1-7i5eL0R3L01q4x7yC_8TjP1wV");
  console.log(pRes.status);
  const data = await pRes.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
