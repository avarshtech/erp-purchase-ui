/**
 * Color Palette Constants
 * Common color hex map for displaying color attributes across the application.
 * Used in ItemFormLayer, VariantSelectionModal, POLineItemsTable, PODetailModal, etc.
 */

// Standard color hex map for common color names
export const COLOR_HEX_MAP = {
  // Reds
  red: "#FF0000",
  crimson: "#DC143C",
  maroon: "#800000",
  "dark red": "#8B0000",
  "indian red": "#CD5C5C",
  "fire brick": "#B22222",
  
  // Pinks
  pink: "#FFC0CB",
  "hot pink": "#FF69B4",
  "deep pink": "#FF1493",
  "light pink": "#FFB6C1",
  "pale violet red": "#DB7093",
  
  // Oranges
  orange: "#FFA500",
  "dark orange": "#FF8C00",
  coral: "#FF7F50",
  tomato: "#FF6347",
  "orange red": "#FF4500",
  peach: "#FFCBA4",
  
  // Yellows
  yellow: "#FFFF00",
  gold: "#FFD700",
  golden: "#FFD700",
  lemon: "#FFF44F",
  "light yellow": "#FFFFE0",
  "pale goldenrod": "#EEE8AA",
  khaki: "#F0E68C",
  
  // Greens
  green: "#008000",
  lime: "#00FF00",
  "dark green": "#006400",
  "forest green": "#228B22",
  "sea green": "#2E8B57",
  mint: "#98FF98",
  olive: "#808000",
  "olive drab": "#6B8E23",
  "yellow green": "#9ACD32",
  "spring green": "#00FF7F",
  "medium spring green": "#00FA9A",
  
  // Teals/Cyans
  teal: "#008080",
  cyan: "#00FFFF",
  aqua: "#00FFFF",
  turquoise: "#40E0D0",
  "dark cyan": "#008B8B",
  "light cyan": "#E0FFFF",
  "medium turquoise": "#48D1CC",
  
  // Blues
  blue: "#0000FF",
  navy: "#000080",
  "dark blue": "#00008B",
  "medium blue": "#0000CD",
  "royal blue": "#4169E1",
  "sky blue": "#87CEEB",
  "light sky blue": "#87CEFA",
  "deep sky blue": "#00BFFF",
  "dodger blue": "#1E90FF",
  "steel blue": "#4682B4",
  "light steel blue": "#B0C4DE",
  "powder blue": "#B0E0E6",
  "cornflower blue": "#6495ED",
  
  // Purples/Violets
  purple: "#800080",
  violet: "#EE82EE",
  magenta: "#FF00FF",
  fuchsia: "#FF00FF",
  lavender: "#E6E6FA",
  plum: "#DDA0DD",
  orchid: "#DA70D6",
  "medium purple": "#9370DB",
  "blue violet": "#8A2BE2",
  "dark violet": "#9400D3",
  "dark orchid": "#9932CC",
  indigo: "#4B0082",
  "dark magenta": "#8B008B",
  
  // Browns
  brown: "#A52A2A",
  chocolate: "#D2691E",
  "saddle brown": "#8B4513",
  sienna: "#A0522D",
  peru: "#CD853F",
  tan: "#D2B48C",
  "rosy brown": "#BC8F8F",
  "sandy brown": "#F4A460",
  coffee: "#6F4E37",
  rust: "#B7410E",
  
  // Neutrals
  white: "#FFFFFF",
  "off white": "#FAF9F6",
  ivory: "#FFFFF0",
  cream: "#FFFDD0",
  beige: "#F5F5DC",
  linen: "#FAF0E6",
  "antique white": "#FAEBD7",
  "floral white": "#FFFAF0",
  "ghost white": "#F8F8FF",
  "mint cream": "#F5FFFA",
  snow: "#FFFAFA",
  "honeydew": "#F0FFF0",
  
  // Grays
  silver: "#C0C0C0",
  gray: "#808080",
  grey: "#808080",
  "light gray": "#D3D3D3",
  "light grey": "#D3D3D3",
  "dark gray": "#A9A9A9",
  "dark grey": "#A9A9A9",
  "dim gray": "#696969",
  "dim grey": "#696969",
  charcoal: "#36454F",
  "slate gray": "#708090",
  "slate grey": "#708090",
  
  // Black
  black: "#000000",
  
  // Metallics
  "rose gold": "#B76E79",
  bronze: "#CD7F32",
  copper: "#B87333",
  
  // Multi-color
  multi: "linear-gradient(90deg, red, orange, yellow, green, blue, purple)",
  rainbow: "linear-gradient(90deg, red, orange, yellow, green, blue, purple)",
  multicolor: "linear-gradient(90deg, red, orange, yellow, green, blue, purple)",
  
  // Emerald/Jade
  emerald: "#50C878",
  jade: "#00A86B",
};

/**
 * Get hex color code from color name
 * @param {string} colorName - The color name to look up
 * @returns {string|null} - The hex color code or null if not found
 */
export const getColorHex = (colorName) => {
  if (!colorName) return null;
  const normalized = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[normalized] || null;
};

/**
 * Check if a given attribute key is a color attribute
 * @param {string} key - The attribute key to check
 * @returns {boolean} - True if the key represents a color attribute
 */
export const isColorAttribute = (key) => {
  if (!key) return false;
  const lowerKey = key.toLowerCase();
  return lowerKey.includes("color") || lowerKey.includes("colour");
};

/**
 * Color palette as array of objects with name and hex for color pickers
 * Used in ItemFormLayer for color attribute selection
 */
export const COLOR_PALETTE = [
  // Reds & Pinks
  { name: "Red", hex: "#FF0000" },
  { name: "Crimson", hex: "#DC143C" },
  { name: "Dark Red", hex: "#8B0000" },
  { name: "Maroon", hex: "#800000" },
  { name: "Indian Red", hex: "#CD5C5C" },
  { name: "Light Coral", hex: "#F08080" },
  { name: "Salmon", hex: "#FA8072" },
  { name: "Coral", hex: "#FF7F50" },
  { name: "Tomato", hex: "#FF6347" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Deep Pink", hex: "#FF1493" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Fuchsia", hex: "#FF00FF" },
  { name: "Rose", hex: "#FF007F" },
  { name: "Blush", hex: "#DE5D83" },
  
  // Oranges & Yellows
  { name: "Orange", hex: "#FFA500" },
  { name: "Dark Orange", hex: "#FF8C00" },
  { name: "Orange Red", hex: "#FF4500" },
  { name: "Peach", hex: "#FFCBA4" },
  { name: "Apricot", hex: "#FBCEB1" },
  { name: "Tangerine", hex: "#FF9966" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Lemon", hex: "#FFF44F" },
  { name: "Mustard", hex: "#FFDB58" },
  { name: "Amber", hex: "#FFBF00" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Khaki", hex: "#F0E68C" },
  
  // Greens
  { name: "Green", hex: "#008000" },
  { name: "Lime", hex: "#00FF00" },
  { name: "Lime Green", hex: "#32CD32" },
  { name: "Light Green", hex: "#90EE90" },
  { name: "Dark Green", hex: "#006400" },
  { name: "Forest Green", hex: "#228B22" },
  { name: "Sea Green", hex: "#2E8B57" },
  { name: "Spring Green", hex: "#00FF7F" },
  { name: "Mint", hex: "#98FF98" },
  { name: "Olive", hex: "#808000" },
  { name: "Olive Drab", hex: "#6B8E23" },
  { name: "Teal", hex: "#008080" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Sage", hex: "#9DC183" },
  { name: "Hunter Green", hex: "#355E3B" },
  { name: "Jade", hex: "#00A86B" },
  
  // Blues
  { name: "Blue", hex: "#0000FF" },
  { name: "Navy", hex: "#000080" },
  { name: "Navy Blue", hex: "#000080" },
  { name: "Dark Blue", hex: "#00008B" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Light Blue", hex: "#ADD8E6" },
  { name: "Powder Blue", hex: "#B0E0E6" },
  { name: "Steel Blue", hex: "#4682B4" },
  { name: "Cornflower Blue", hex: "#6495ED" },
  { name: "Dodger Blue", hex: "#1E90FF" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Aqua", hex: "#00FFFF" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Aquamarine", hex: "#7FFFD4" },
  { name: "Cobalt", hex: "#0047AB" },
  { name: "Indigo", hex: "#4B0082" },
  { name: "Midnight Blue", hex: "#191970" },
  { name: "Denim", hex: "#1560BD" },
  { name: "Electric Blue", hex: "#7DF9FF" },
  
  // Purples & Violets
  { name: "Purple", hex: "#800080" },
  { name: "Violet", hex: "#EE82EE" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Plum", hex: "#DDA0DD" },
  { name: "Orchid", hex: "#DA70D6" },
  { name: "Lilac", hex: "#C8A2C8" },
  { name: "Mauve", hex: "#E0B0FF" },
  { name: "Thistle", hex: "#D8BFD8" },
  { name: "Dark Violet", hex: "#9400D3" },
  { name: "Dark Orchid", hex: "#9932CC" },
  { name: "Blue Violet", hex: "#8A2BE2" },
  { name: "Medium Purple", hex: "#9370DB" },
  { name: "Grape", hex: "#6F2DA8" },
  { name: "Wine", hex: "#722F37" },
  { name: "Burgundy", hex: "#800020" },
  
  // Browns & Neutrals
  { name: "Brown", hex: "#A52A2A" },
  { name: "Saddle Brown", hex: "#8B4513" },
  { name: "Sienna", hex: "#A0522D" },
  { name: "Chocolate", hex: "#D2691E" },
  { name: "Peru", hex: "#CD853F" },
  { name: "Sandy Brown", hex: "#F4A460" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Wheat", hex: "#F5DEB3" },
  { name: "Coffee", hex: "#6F4E37" },
  { name: "Mocha", hex: "#967969" },
  { name: "Caramel", hex: "#FFD59A" },
  { name: "Rust", hex: "#B7410E" },
  { name: "Copper", hex: "#B87333" },
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Taupe", hex: "#483C32" },
  
  // Whites & Creams
  { name: "White", hex: "#FFFFFF" },
  { name: "Off White", hex: "#FAF9F6" },
  { name: "Snow", hex: "#FFFAFA" },
  { name: "Linen", hex: "#FAF0E6" },
  { name: "Antique White", hex: "#FAEBD7" },
  { name: "Floral White", hex: "#FFFAF0" },
  { name: "Ghost White", hex: "#F8F8FF" },
  { name: "Mint Cream", hex: "#F5FFFA" },
  { name: "Honeydew", hex: "#F0FFF0" },
  
  // Grays
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Gray", hex: "#808080" },
  { name: "Grey", hex: "#808080" },
  { name: "Light Gray", hex: "#D3D3D3" },
  { name: "Dark Gray", hex: "#A9A9A9" },
  { name: "Dim Gray", hex: "#696969" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Slate Gray", hex: "#708090" },
  { name: "Ash", hex: "#B2BEB5" },
  { name: "Gunmetal", hex: "#2A3439" },
  
  // Blacks
  { name: "Black", hex: "#000000" },
  { name: "Onyx", hex: "#353839" },
  { name: "Jet", hex: "#343434" },
  { name: "Ebony", hex: "#555D50" },
  
  // Metallics
  { name: "Golden", hex: "#FFD700" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Platinum", hex: "#E5E4E2" },
  { name: "Champagne", hex: "#F7E7CE" },
  
  // Multi-colors
  { name: "Multi", hex: "linear-gradient(90deg, red, orange, yellow, green, blue, purple)" },
  { name: "Multi Color", hex: "linear-gradient(90deg, red, orange, yellow, green, blue, purple)" },
  { name: "Rainbow", hex: "linear-gradient(90deg, red, orange, yellow, green, blue, purple)" },
  { name: "Assorted", hex: "linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)" },
];

export default COLOR_HEX_MAP;
