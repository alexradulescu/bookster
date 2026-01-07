import { Box, Text } from '@mantine/core'
import { getBookColor, getBookInitials, getContrastColor } from '../../utils/bookCover'

interface BookCoverProps {
  title: string
  size?: 'sm' | 'md' | 'lg'
}

// sm size matches title (20px) + author (14px) + badge row (20px) + gaps (8px) = ~62px
const SIZES = {
  sm: { width: 40, height: 62, fontSize: 16 },
  md: { width: 48, height: 72, fontSize: 16 },
  lg: { width: 60, height: 90, fontSize: 16 },
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
        justifyContent: 'center',
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
