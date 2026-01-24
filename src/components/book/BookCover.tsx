import { Box, Text } from '@mantine/core'
import {
  getBookColor,
  getBookInitials,
  getContrastColor,
  getBookPattern,
} from '../../utils/bookCover'

interface BookCoverProps {
  title: string
  size?: 'sm' | 'md' | 'lg'
}

// sm size matches title (20px) + author (14px) + badge row (20px) + gaps (8px) = ~62px
const SIZES = {
  sm: { width: 40, height: 62, fontSize: 16, spineWidth: 6, pageWidth: 3 },
  md: { width: 48, height: 72, fontSize: 16, spineWidth: 7, pageWidth: 4 },
  lg: { width: 60, height: 90, fontSize: 16, spineWidth: 8, pageWidth: 5 },
}

// Darken a hex color by a percentage
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max((num >> 16) - amt, 0)
  const G = Math.max(((num >> 8) & 0x00ff) - amt, 0)
  const B = Math.max((num & 0x0000ff) - amt, 0)
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`
}

export function BookCover({ title, size = 'sm' }: BookCoverProps) {
  const backgroundColor = getBookColor(title)
  const textColor = getContrastColor(backgroundColor)
  const initials = getBookInitials(title)
  const dimensions = SIZES[size]
  const spineColor = darkenColor(backgroundColor, 15)
  const spineShadowColor = darkenColor(backgroundColor, 25)
  const pattern = getBookPattern(title, backgroundColor)

  return (
    <Box
      style={{
        position: 'relative',
        width: dimensions.width + dimensions.spineWidth + dimensions.pageWidth,
        height: dimensions.height,
        minWidth: dimensions.width + dimensions.spineWidth + dimensions.pageWidth,
        perspective: '300px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Book spine - left side */}
      <Box
        style={{
          position: 'absolute',
          left: 0,
          top: 1,
          width: dimensions.spineWidth,
          height: dimensions.height - 2,
          background: `linear-gradient(to right, ${spineShadowColor} 0%, ${spineColor} 50%, ${spineColor} 100%)`,
          borderRadius: '3px 0 0 3px',
          transform: 'rotateY(-15deg)',
          transformOrigin: 'right center',
          boxShadow: `-2px 0 4px rgba(0,0,0,0.2)`,
        }}
      />

      {/* Main book cover */}
      <Box
        style={{
          position: 'absolute',
          left: dimensions.spineWidth - 1,
          top: 0,
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor,
          borderRadius: '2px 4px 4px 2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            2px 2px 4px rgba(0,0,0,0.15),
            4px 4px 8px rgba(0,0,0,0.1),
            inset -1px 0 2px rgba(0,0,0,0.1),
            inset 2px 0 4px rgba(255,255,255,0.15)
          `,
          background: `
            linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.05) 100%),
            ${pattern},
            ${backgroundColor}
          `,
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
            textShadow: textColor === '#FFFFFF'
              ? '0 1px 2px rgba(0,0,0,0.3)'
              : '0 1px 1px rgba(255,255,255,0.3)',
          }}
        >
          {initials}
        </Text>
      </Box>

      {/* Page edges - right side */}
      <Box
        style={{
          position: 'absolute',
          right: 0,
          top: 2,
          width: dimensions.pageWidth,
          height: dimensions.height - 4,
          background: `repeating-linear-gradient(
            to bottom,
            #f8f6f3 0px,
            #f8f6f3 1px,
            #e8e6e3 1px,
            #e8e6e3 2px
          )`,
          borderRadius: '0 2px 2px 0',
          boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.1)',
        }}
      />

      {/* Bottom shadow for 3D lift effect */}
      <Box
        style={{
          position: 'absolute',
          left: dimensions.spineWidth,
          bottom: -2,
          width: dimensions.width - 4,
          height: 4,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
          filter: 'blur(2px)',
          transform: 'scaleX(0.9)',
        }}
      />
    </Box>
  )
}
