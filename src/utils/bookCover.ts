// Pastel colors for book covers
const PASTEL_COLORS = [
  '#FFB3BA', // Light pink
  '#FFDFBA', // Light peach
  '#FFFFBA', // Light yellow
  '#BAFFC9', // Light green
  '#BAE1FF', // Light blue
  '#E0BBE4', // Light purple
  '#FEC8D8', // Rose pink
  '#D4F0F0', // Mint
  '#CCE2CB', // Sage
  '#B6CFB6', // Pale green
  '#F6D6D6', // Blush
  '#C9B1FF', // Lavender
  '#FFDAC1', // Light coral
  '#B5EAD7', // Seafoam
  '#C7CEEA', // Periwinkle
  '#E2F0CB', // Lime cream
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
 * Generate 3-letter initials from a book title
 * - If title has multiple words: First letter of each of first 3 words (e.g., "The Great Gatsby" → "TGG")
 * - If title has 2 words: First letter of each + first letter again (e.g., "American Gods" → "AGa")
 * - If title has 1 word: First 3 letters (e.g., "Dune" → "Dun")
 */
export function getBookInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return '???'
  }

  if (words.length === 1) {
    // Single word: first 3 letters
    const word = words[0]
    return word.substring(0, 3).padEnd(3, word[0] || '?')
  }

  if (words.length === 2) {
    // Two words: first letter of each + first letter again
    const first = words[0][0] || '?'
    const second = words[1][0] || '?'
    const third = words[0][1]?.toLowerCase() || first.toLowerCase()
    return `${first.toUpperCase()}${second.toUpperCase()}${third}`
  }

  // Three or more words: first letter of first 3 words
  return words
    .slice(0, 3)
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
