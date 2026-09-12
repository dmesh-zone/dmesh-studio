/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { createTheme, ThemeProvider, CssBaseline, ThemeOptions, PaletteMode } from '@mui/material';

type ThemeContextType = {
    mode: PaletteMode;
    setMode: (mode: PaletteMode) => void;
    toggleTheme: () => void;
    setPrimaryColor: (color: string | null) => void;
    configTheme?: any;
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    // Determine initial mode from localStorage or system preference
    const [mode, setMode] = useState<PaletteMode>(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme as PaletteMode;
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
        const themeOptions: ThemeOptions = {
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
                },
                MuiTooltip: {
                    defaultProps: {
                        arrow: true,
                    },
                    styleOverrides: {
                        tooltip: {
                            backgroundColor: '#121212',
                            color: '#ffffff',
                            padding: '12px 16px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: '400',
                            boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
                        },
                        arrow: {
                            color: '#121212',
                        }
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
