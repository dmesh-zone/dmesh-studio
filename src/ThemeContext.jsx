import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
    // Determine initial mode from localStorage or system preference
    const [mode, setMode] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [primaryColor, setPrimaryColor] = useState(null);

    // Persist mode to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('theme', mode);
        if (mode === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [mode]);

    // Apply config-based theme or base mode
    const theme = useMemo(() => {
        let themeOptions = {
            palette: {
                mode,
                primary: {
                    main: primaryColor || (mode === 'dark' ? '#90caf9' : '#1976d2'), // Use dynamic color, else fallback
                },
                ...(mode === 'dark' && {
                    background: {
                        default: '#000000',
                        paper: '#1e293b',
                    },
                }),
            },
            typography: {
                fontFamily: 'var(--font-family, "Roboto", "Helvetica", "Arial", sans-serif)',
                h1: { fontFamily: 'var(--font-family-heading, var(--font-family, inherit))' },
                h2: { fontFamily: 'var(--font-family-heading, var(--font-family, inherit))' },
                h3: { fontFamily: 'var(--font-family-heading, var(--font-family, inherit))' },
                h4: { fontFamily: 'var(--font-family-heading, var(--font-family, inherit))' },
                h5: { fontFamily: 'var(--font-family-heading, var(--font-family, inherit))' },
                h6: { fontFamily: 'var(--font-family-heading, var(--font-family, inherit))' },
            },
            components: {
                MuiLink: {
                    styleOverrides: {
                        root: {
                            color: 'var(--link-color, #1976d2)',
                            textDecoration: 'underline',
                            textDecorationColor: 'var(--link-color, #1976d2)',
                            '&:hover': {
                                color: 'var(--link-hover-color, #115293)',
                                textDecorationColor: 'var(--link-hover-color, #115293)',
                            }
                        }
                    },
                    defaultProps: {
                        underline: 'hover',
                    }
                }
            }
        };

        return createTheme(themeOptions);
    }, [mode, primaryColor]);

    const toggleTheme = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ mode, setMode, toggleTheme, setPrimaryColor }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
