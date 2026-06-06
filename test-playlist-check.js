async function test() {
  const res = await fetch('http://localhost:3000/api/youtube/playlist?id=PLFgquLnL59alCl_2evIMD7TE0qXGcg-zL');
  const txt = await res.text();
  console.log(txt.substring(0, 500));
}

test();
