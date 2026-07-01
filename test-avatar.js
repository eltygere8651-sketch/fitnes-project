async function test() {
  const fetch = (await import("node-fetch")).default;
  const url = "https://yt3.ggpht.com/ytc/AIdro_k6yF4_Z3_sZ_v_p_n_n_n_n_n_n_n_n_n_n_n_n_n=s68-c-k-c0x00ffffff-no-rj";
  const cleanUrl = url.split("=")[0];
  console.log("cleanUrl", cleanUrl);
  // fetch it
  const res = await fetch(cleanUrl);
  console.log(res.status);
}
test();
