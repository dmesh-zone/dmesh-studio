import React, { useState, useEffect } from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Paper, Switch, FormGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from './ThemeContext';
import YAML from 'yaml';

const normalizePath = (path: string) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return (baseUrl + path).replace(/\/\//g, '/');
};

const PillSwitch = ({ checked, onChange, disabled }: { checked: boolean, onChange: (c: boolean) => void, disabled?: boolean }) => {
    return (
        <Box 
            onClick={() => { if (!disabled) onChange(!checked) }}
            sx={{
                position: 'relative',
                width: 36,
                height: 20,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                margin: '0 12px 0 8px',
            }}
        >
            {/* Track (Pipe) */}
            <Box sx={{
                width: 36,
                height: 20,
                borderRadius: 10,
                boxSizing: 'border-box',
                backgroundColor: checked ? '#111111' : '#ffffff',
                border: '2px solid #111111',
                transition: 'background-color 0.3s, border-color 0.3s',
                '.mode-dark &': {
                     backgroundColor: checked ? '#ffffff' : '#111111',
                     borderColor: '#ffffff',
                }
            }} />
            {/* Thumb (Perfect Circle) */}
            <Box sx={{
                position: 'absolute',
                width: checked ? 16 : 12,
                height: checked ? 16 : 12,
                borderRadius: '50%',
                backgroundColor: checked ? '#ffffff' : '#111111',
                left: checked ? 'calc(100% - 18px)' : '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                transition: 'left 0.3s, width 0.3s, height 0.3s, background-color 0.3s',
                boxShadow: 'none',
                '.mode-dark &': {
                     backgroundColor: checked ? '#111111' : '#ffffff',
                }
            }} />
        </Box>
    );
};

export default function SettingsView() {
    const { mode, setMode } = useThemeContext();
    const [navConfig, setNavConfig] = useState<any>(null);
    const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});

    useEffect(() => {
        Promise.all([
          fetch(normalizePath(`/config/base/config.yaml?t=${Date.now()}`)).then(r => r.ok ? r.text() : ''),
          fetch(normalizePath(`/config/custom/config.yaml?t=${Date.now()}`)).then(r => r.ok ? r.text() : '')
        ]).then(([configText, customConfigText]) => {
            let baseConfig = {};
            let customConfig = {};
            try { if (configText) baseConfig = YAML.parse(configText) || {}; } catch { /* ignore */ }
            try { if (customConfigText) customConfig = YAML.parse(customConfigText) || {}; } catch { /* ignore */ }
            const mergedNav = (customConfig as any).navigation || (baseConfig as any).navigation;
            setNavConfig(mergedNav);
        });

        try {
            const stored = localStorage.getItem('dmesh-page-visibility');
            if (stored) setPageVisibility(JSON.parse(stored));
        } catch {}
    }, []);

    const togglePage = (pageId: string, defaultVisibility: boolean) => {
        setPageVisibility(prev => {
            const current = prev[pageId] !== undefined ? prev[pageId] : defaultVisibility;
            const next = { ...prev, [pageId]: !current };
            localStorage.setItem('dmesh-page-visibility', JSON.stringify(next));
            window.dispatchEvent(new Event('nav-preferences-changed'));
            return next;
        });
    };

    return (
        <Box sx={{ pt: 1.5, pb: 4, px: 4, height: '100%', overflow: 'auto', bgcolor: 'var(--m3-surface, #f5f5f5)' }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
                Settings
            </Typography>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4 }}>
                    <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: '600' }}>
                            Appearance
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Choose your preferred application theme
                        </Typography>
                    </Box>

                    <RadioGroup
                        row
                        value={mode}
                        onChange={(e) => setMode(e.target.value as any)}
                        sx={{ gap: 2 }}
                    >
                    <FormControlLabel 
                        value="light" 
                        control={
                            <Radio
                                size="small"
                                icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="8" stroke="var(--radio-border, #64748b)" strokeWidth="2" />
                                    </svg>
                                }
                                checkedIcon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="8" stroke="var(--radio-selected-border, #111111)" strokeWidth="2.5" />
                                        <circle cx="12" cy="12" r="4" fill="var(--radio-selected-dot, #111111)" />
                                    </svg>
                                }
                                sx={{
                                    padding: '2px',
                                    '&.Mui-focusVisible': {
                                        outline: '2px solid #ff5500',
                                        outlineOffset: '2px'
                                    }
                                }}
                            />
                        }
                        label="Light"
                        sx={{
                            margin: 0,
                            '& .MuiFormControlLabel-label': {
                                fontSize: '0.875rem',
                                color: 'text.primary',
                                pl: 1
                            }
                        }}
                    />
                    <FormControlLabel 
                        value="dark" 
                        control={
                            <Radio
                                size="small"
                                icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="8" stroke="var(--radio-border, #64748b)" strokeWidth="2" />
                                    </svg>
                                }
                                checkedIcon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="8" stroke="var(--radio-selected-border, #111111)" strokeWidth="2.5" />
                                        <circle cx="12" cy="12" r="4" fill="var(--radio-selected-dot, #111111)" />
                                    </svg>
                                }
                                sx={{
                                    padding: '2px',
                                    '&.Mui-focusVisible': {
                                        outline: '2px solid #ff5500',
                                        outlineOffset: '2px'
                                    }
                                }}
                            />
                        }
                        label="Dark" 
                        sx={{
                            margin: 0,
                            '& .MuiFormControlLabel-label': {
                                fontSize: '0.875rem',
                                color: 'text.primary',
                                pl: 1
                            }
                        }}
                    />
                </RadioGroup>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: '600' }}>
                    Pages
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Show or hide pages in the navigation menu
                </Typography>
                
                {navConfig?.sections?.map((section: any, sIdx: number) => (
                    <Box key={sIdx} sx={{ mb: 2 }}>
                        {section.name && (
                            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                {section.name}
                            </Typography>
                        )}
                        <FormGroup>
                            {section.pages.map((page: any) => {
                                const isVisible = pageVisibility[page.id] !== undefined ? pageVisibility[page.id] : (page.showByDefault !== false);
                                const disabled = page.id === 'settings';
                                return (
                                    <FormControlLabel
                                        key={page.id}
                                        control={
                                            <PillSwitch 
                                                checked={isVisible} 
                                                onChange={() => togglePage(page.id, page.showByDefault !== false)}
                                                disabled={disabled}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                {page.title} {disabled && '(Required)'}
                                            </Typography>
                                        }
                                        sx={{ mb: 1 }}
                                    />
                                );
                            })}
                        </FormGroup>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}
