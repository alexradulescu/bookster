// Cozy pastel colors for book covers - warm, welcoming tones
const PASTEL_COLORS = [
  '#E8DDD4', // Warm linen
  '#D4C4B5', // Soft taupe
  '#C9D4C5', // Sage mist
  '#DDE4D5', // Pale sage
  '#E8D8D4', // Dusty rose
  '#D8C8C4', // Mauve mist
  '#E4D8C8', // Cream
  '#D4D8D4', // Silver sage
  '#E0D4D8', // Blush gray
  '#D0DCD4', // Seafoam sage
  '#DCD8D0', // Parchment
  '#D8D4DC', // Lavender mist
  '#E4DCD4', // Warm ivory
  '#C8D4CC', // Eucalyptus
  '#DCD0D4', // Rose quartz
  '#D4DCD8', // Morning mist
]

/**
 * Generate a deterministic hash from a string
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Get a consistent pastel color for a book based on its title
 */
export function getBookColor(title: string): string {
  const hash = hashString(title.toLowerCase())
  return PASTEL_COLORS[hash % PASTEL_COLORS.length]
}

/**
 * Generate initials from a book title
 * - If title has 2+ words: First letter of first 2 words (e.g., "Star Force" → "SF")
 * - If title has 1 word: First 3 letters uppercase (e.g., "Alex" → "ALE")
 */
export function getBookInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return '??'
  }

  if (words.length === 1) {
    // Single word: first 3 letters uppercase
    const word = words[0]
    return word.substring(0, 3).toUpperCase()
  }

  // Two or more words: first letter of first 2 words
  return words
    .slice(0, 2)
    .map((w) => w[0] || '?')
    .join('')
    .toUpperCase()
}

/**
 * Calculate contrasting text color based on background color
 * Returns dark or light color based on luminance
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance using sRGB
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Use dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? '#2C3E50' : '#FFFFFF'
}

/**
 * Art-deco inspired SVG patterns for book covers
 * Each pattern is designed to tile seamlessly and look elegant
 */
const ART_DECO_PATTERNS = [
  // Pattern 1: Fan/sunburst rays
  (color: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.75'%3E%3Cpath d='M20 40 L20 20 M20 40 L10 20 M20 40 L30 20 M20 40 L5 25 M20 40 L35 25'/%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E")`,

  // Pattern 2: Chevron/arrow pattern
  (color: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.75' d='M0 12 L12 4 L24 12 M0 20 L12 12 L24 20'/%3E%3C/svg%3E")`,

  // Pattern 3: Geometric diamonds
  (color: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.75'%3E%3Cpath d='M16 0 L32 16 L16 32 L0 16 Z'/%3E%3Cpath d='M16 8 L24 16 L16 24 L8 16 Z'/%3E%3C/g%3E%3C/svg%3E")`,

  // Pattern 4: Concentric arcs/scales
  (color: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='18' viewBox='0 0 36 18'%3E%3Cg fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.75'%3E%3Cpath d='M0 18 Q9 0 18 18 Q27 0 36 18'/%3E%3Cpath d='M0 18 Q9 6 18 18 Q27 6 36 18'/%3E%3C/g%3E%3C/svg%3E")`,

  // Pattern 5: Art deco feathers/leaves
  (color: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.75'%3E%3Cpath d='M14 0 L14 28 M14 14 L6 6 M14 14 L22 6 M14 14 L6 22 M14 14 L22 22'/%3E%3Ccircle cx='14' cy='14' r='2'/%3E%3C/g%3E%3C/svg%3E")`,

  // Pattern 6: Geometric lines with dots
  (color: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='${encodeURIComponent(color)}' stroke='${encodeURIComponent(color)}' stroke-width='0.5'%3E%3Cpath fill='none' d='M0 10 L20 10 M10 0 L10 20'/%3E%3Ccircle cx='10' cy='10' r='1.5'/%3E%3Ccircle cx='0' cy='0' r='1'/%3E%3Ccircle cx='20' cy='0' r='1'/%3E%3Ccircle cx='0' cy='20' r='1'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
]

/**
 * Get a consistent art-deco pattern for a book based on its title
 * Returns an SVG data URL with the pattern in a darkened shade of the book color
 */
export function getBookPattern(title: string, baseColor: string): string {
  // Use a different part of the hash for pattern selection (add suffix to vary from color hash)
  const patternHash = hashString(title.toLowerCase() + 'pattern')
  const patternIndex = patternHash % ART_DECO_PATTERNS.length

  // Darken the base color for the pattern
  const darkenedColor = darkenColorForPattern(baseColor, 20)

  return ART_DECO_PATTERNS[patternIndex](darkenedColor)
}

/**
 * Darken a hex color by a percentage for use in patterns
 */
function darkenColorForPattern(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '')
  const num = parseInt(cleanHex, 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max((num >> 16) - amt, 0)
  const G = Math.max(((num >> 8) & 0x00ff) - amt, 0)
  const B = Math.max((num & 0x0000ff) - amt, 0)
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`
}
