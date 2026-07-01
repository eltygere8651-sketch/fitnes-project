async function test() {
  const url = "https://www.youtube.com/playlist?list=PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw";
  const pRes = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
  console.log(pRes.status);
  const text = await pRes.text();
  const match = text.match(/<meta property="og:image" content="([^"]+)"/);
  console.log(match ? match[1] : "not found");
}
test();
