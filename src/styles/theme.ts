import { createTheme, type MantineColorsTuple } from '@mantine/core'

// Custom primary color (Mantine blue)
const primary: MantineColorsTuple = [
  '#e7f5ff',
  '#d0ebff',
  '#a5d8ff',
  '#74c0fc',
  '#4dabf7',
  '#339af0',
  '#228be6',
  '#1c7ed6',
  '#1971c2',
  '#1864ab',
]

export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    primary,
  },
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
