async function getInstances() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/TeamPiped/Piped-Instances/main/instances.json");
    const data = await res.json();
    const active = data.filter(i => i.up_to_date && i.locations && i.locations.length > 0);
    console.log(active.map(i => i.api_url).slice(0, 10));
  } catch (e) {
    console.log("Error:", e);
  }
}
getInstances();
