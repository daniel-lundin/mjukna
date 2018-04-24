module.exports = function(original) {
  if (!original.includes("unpkg.com")) return original;
  return original
    .split("/")
    .slice(3)
    .join("")
    .split("@")[0];
};
