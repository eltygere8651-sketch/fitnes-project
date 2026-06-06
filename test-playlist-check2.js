async function test() {
  const res = await fetch('http://localhost:3000/api/youtube/playlist?id=PLFgquLnL59alCl_2evIMD7TE0qXGcg-zL');
  console.log("Status:", res.status);
  const txt = await res.text();
  console.log("Body:", txt.substring(0, 500));
}

test();
