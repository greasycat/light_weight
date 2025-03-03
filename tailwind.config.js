module.exports = {
  // ... other config
  theme: {
    extend: {
      keyframes: {
        flame: {
          '0%, 100%': {
            transform: 'translateX(-50%) scale(1)',
            opacity: '0.9'
          },
          '50%': {
            transform: 'translateX(-50%) scale(1.1)',
            opacity: '1'
          }
        },
        innerFlame: {
          '0%, 100%': {
            transform: 'translateX(-50%) scale(1)',
            opacity: '0.8'
          },
          '50%': {
            transform: 'translateX(-50%) scale(1.15)',
            opacity: '0.9'
          }
        }
      },
      animation: {
        flame: 'flame 2s ease-in-out infinite',
        innerFlame: 'innerFlame 1.5s ease-in-out infinite'
      }
    }
  }
} 