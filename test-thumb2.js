async function test() {
  const fetch = (await import("node-fetch")).default;
  const url = "https://i.ytimg.com/vi/fcnDmrtj6Sk/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBh8GhLGGRn7EtfFowOfFjWuAylTQ";
  const cleanUrl = url.split("?")[0];
  console.log("cleanUrl", cleanUrl);
  const res = await fetch(cleanUrl);
  console.log(res.status);
}
test();
