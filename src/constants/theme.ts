export const theme = {
    colors: {
        background: '#000000',
        surface: '#121212',
        surfaceHighlight: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#888888',
        accent: '#C5A059', // Muted Gold
        border: '#2A2A2A',
        error: '#CF6679',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        h1: {
            fontSize: 48,
            fontWeight: '200', // Thin/Light
            letterSpacing: -1,
            color: '#FFFFFF',
        },
        h2: {
            fontSize: 32,
            fontWeight: '300',
            letterSpacing: 0.5,
            color: '#FFFFFF',
        },
        body: {
            fontSize: 16,
            fontWeight: '400',
            color: '#FFFFFF',
        },
        button: {
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
    },
    layout: {
        borderRadius: 4, // Sharp/Professional
    }
} as const;
