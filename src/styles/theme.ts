import { createTheme, type MantineColorsTuple } from '@mantine/core'

// Warm sage green - cozy, welcoming book theme
const sage: MantineColorsTuple = [
  '#f4f7f4', // lightest - almost white with green tint
  '#e8efe8', // very light sage
  '#d4e4d4', // light sage
  '#b8d4b8', // soft sage
  '#9cc49c', // medium sage
  '#7eb07e', // sage
  '#6a9e6a', // primary sage
  '#5a8a5a', // darker sage
  '#4a7a4a', // deep sage
  '#3a6a3a', // darkest sage
]

// Dusty rose accent for warmth
const rose: MantineColorsTuple = [
  '#fdf4f6', // lightest blush
  '#f9e8ec', // light blush
  '#f2d4dc', // soft blush
  '#e8b8c4', // blush
  '#dea0b0', // medium rose
  '#d4889c', // dusty rose
  '#c87088', // primary rose
  '#b86078', // darker rose
  '#a85068', // deep rose
  '#984058', // darkest rose
]

export const theme = createTheme({
  primaryColor: 'sage',
  colors: {
    sage,
    rose,
  },
  fontFamily:
    'Georgia, "Palatino Linotype", "Book Antiqua", Palatino, -apple-system, BlinkMacSystemFont, serif',
  headings: {
    fontFamily:
      'Georgia, "Palatino Linotype", "Book Antiqua", Palatino, -apple-system, BlinkMacSystemFont, serif',
  },
  defaultRadius: 'xl',
  cursorType: 'pointer',
  components: {
    TextInput: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Select: {
      defaultProps: {
        radius: 'xl',
      },
    },
    MultiSelect: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Button: {
      defaultProps: {
        radius: 'xl',
      },
    },
  },
})
