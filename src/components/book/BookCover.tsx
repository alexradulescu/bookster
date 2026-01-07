import { Box, Text } from '@mantine/core'
import { getBookColor, getBookInitials, getContrastColor } from '../../utils/bookCover'

interface BookCoverProps {
  title: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { width: 32, height: 48, fontSize: 10 },
  md: { width: 40, height: 60, fontSize: 11 },
  lg: { width: 60, height: 90, fontSize: 12 },
}

export function BookCover({ title, size = 'sm' }: BookCoverProps) {
  const backgroundColor = getBookColor(title)
  const textColor = getContrastColor(backgroundColor)
  const initials = getBookInitials(title)
  const dimensions = SIZES[size]

  return (
    <Box
      style={{
        width: dimensions.width,
        height: dimensions.height,
        minWidth: dimensions.width,
        backgroundColor,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }}
    >
      <Text
        style={{
          color: textColor,
          fontSize: dimensions.fontSize,
          fontWeight: 600,
          letterSpacing: 1,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          userSelect: 'none',
        }}
      >
        {initials}
      </Text>
    </Box>
  )
}
