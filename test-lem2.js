async function test() {
  const pRes = await fetch("https://yt.lemnoslife.com/playlists?part=snippet&id=PLMC9KNkIncKvYin_USF1qoJQnIyMAfRxl");
  console.log(pRes.status);
  const text = await pRes.text();
  console.log(text.substring(0, 500));
}
test();
