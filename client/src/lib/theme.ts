export const bubbleTheme = {
  colors: {
    primary: {
      50: '#FFFDE7',
      100: '#FFF9C4',
      200: '#FFF59D',
      300: '#FFF176',
      400: '#FFEE58',
      500: '#FFD700', // Main brand color
      600: '#FFC107',
      700: '#FFB300',
      800: '#FFA000',
      900: '#FF8F00',
    },
    background: {
      default: '#1A1A1A',
      paper: 'rgba(255, 255, 255, 0.05)',
      bubble: 'rgba(255, 215, 0, 0.1)',
    },
    text: {
      primary: '#E0E0E0',
      secondary: 'rgba(224, 224, 224, 0.7)',
    },
    accent: {
      cream: '#FFF3B0',
      lightYellow: '#FFEE58',
    }
  },
  borderRadius: {
    bubble: '9999px',
    card: '24px',
  },
  shadows: {
    bubble: '0 8px 32px rgba(255, 215, 0, 0.15)',
    card: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  transitions: {
    bubble: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    float: 'transform 3s ease-in-out infinite',
  },
  gradients: {
    yellowGlow: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0) 70%)',
    bubbleCard: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
};
