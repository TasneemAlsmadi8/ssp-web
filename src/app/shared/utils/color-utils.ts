/**
 * Options to adjust the generated color by setting saturation and lightness.
 */
interface ColorOptions {
  saturation?: number; // A value from 0 to 100 to set the saturation of the color
  lightness?: number; // A value from 0 to 100 to set the lightness of the color
}

/**
 * Converts an HSL color value to RGB. Conversion formula adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and returns r, g, and b in the set [0, 255].
 *
 * @param h - The hue (0 - 1)
 * @param s - The saturation (0 - 1)
 * @param l - The lightness (0 - 1)
 * @returns An array containing the RGB representation [r, g, b]
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Generates a unique color from a given string with specified options for saturation and lightness.
 *
 * The function hashes the input string to generate a unique hue,
 * uses provided or default saturation and lightness values to create a base color,
 * and converts the HSL color to RGB.
 *
 * @param str - The input string to generate a color for.
 * @param options - An object with 'saturation' and 'lightness' keys to adjust the color.
 * @returns A hexadecimal color string.
 */
export function stringToColor(str: string, options: ColorOptions = {}): string {
  const { saturation = 50, lightness = 30 } = options;

  // Inline hash function to generate a unique hue
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  // Generate a unique hue (0 - 1)
  const hue = (hash % 360) / 360;

  // Convert saturation and lightness from percentage to [0, 1] range
  const s = Math.min(100, Math.max(0, saturation)) / 100;
  const l = Math.min(100, Math.max(0, lightness)) / 100;

  // Convert HSL to RGB
  const [r, g, b] = hslToRgb(hue, s, l);

  // Convert the RGB values to a hex string
  const color = `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;

  return color;
}
