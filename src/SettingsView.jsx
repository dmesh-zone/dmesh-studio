import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Paper } from '@mui/material';
import { useThemeContext } from './ThemeContext';

export default function SettingsView() {
    const { mode, setMode } = useThemeContext();

    return (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto', bgcolor: 'var(--m3-surface, #f5f5f5)' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
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
                        onChange={(e) => setMode(e.target.value)}
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
        </Box>
    );
}
