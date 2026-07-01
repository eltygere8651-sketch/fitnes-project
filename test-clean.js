const cleanImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("i.ytimg.com") || url.includes("yt3.ggpht.com")) {
    return url.split("?")[0];
  }
  return url;
};
