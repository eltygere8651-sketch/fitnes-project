async function test() {
  const url = "https://www.youtube.com/playlist?list=PLKo_mI1-7i5eL0R3L01q4x7yC_8TjP1wV";
  const pRes = await fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`);
  console.log(pRes.status);
  const text = await pRes.text();
  const match = text.match(/<meta property="og:image" content="([^"]+)"/);
  console.log(match ? match[1] : "not found");
}
test();
