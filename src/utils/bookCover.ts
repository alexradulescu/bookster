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
