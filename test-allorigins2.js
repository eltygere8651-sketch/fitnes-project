async function test() {
  const pRes = await fetch("https://api.allorigins.win/raw?url=https%3A%2F%2Fm.youtube.com%2Fplaylist%3Flist%3DPLMC9KNkIncKvYin_USF1qoJQnIyMAfRxl");
  console.log(pRes.status);
  const text = await pRes.text();
  const match = text.match(/<meta property="og:image" content="([^"]+)"/);
  console.log(match ? match[1] : "not found");
}
test();
