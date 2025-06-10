export const mixColors = (color1, color2) => {
  const pair = new Set([color1, color2]);

  if (color1 === color2) return color1;
  if (pair.has("blue") && pair.has("yellow")) return "green";
  if (pair.has("blue") && pair.has("red")) return "purple";
  if (pair.has("red") && pair.has("yellow")) return "orange";

  return "brown"; // Default for all other mixes
};
