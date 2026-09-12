import React from 'react';
import { Box, RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';

interface EnvironmentSelectorWidgetProps {
    environments: string[];
    envFilter: string;
    setEnvFilter: (env: string) => void;
    showAllOption?: boolean;
    allOptionLabel?: string;
    mode?: 'light' | 'dark';
}

const EnvironmentSelectorWidget: React.FC<EnvironmentSelectorWidgetProps> = ({
    environments,
    envFilter,
    setEnvFilter,
    showAllOption = false,
    allOptionLabel = "All",
    mode = 'light'
}) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff', px: 2, py: '2px', borderRadius: '8px', border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '32px' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mr: 0.5 }}>
                Environment:
            </Typography>
            <RadioGroup row value={envFilter} onChange={(e) => setEnvFilter(e.target.value)} sx={{ gap: 0.5, flexWrap: 'nowrap' }}>
                {showAllOption && (
                    <FormControlLabel
                        value="All"
                        control={<Radio size="small"
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="var(--radio-border, #64748b)" strokeWidth="2" /></svg>}
                            checkedIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="var(--radio-selected-border, #111111)" strokeWidth="2.5" /><circle cx="12" cy="12" r="4" fill="var(--radio-selected-dot, #111111)" /></svg>}
                            sx={{ padding: '2px', '&.Mui-focusVisible': { outline: '2px solid #ff5500', outlineOffset: '2px' } }}
                        />}
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{allOptionLabel}</Typography>}
                        sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.75rem', color: 'text.primary', pr: 0.5 } }}
                    />
                )}
                {environments.map(env => (
                    <FormControlLabel
                        key={env}
                        value={env}
                        control={<Radio size="small"
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="var(--radio-border, #64748b)" strokeWidth="2" /></svg>}
                            checkedIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="var(--radio-selected-border, #111111)" strokeWidth="2.5" /><circle cx="12" cy="12" r="4" fill="var(--radio-selected-dot, #111111)" /></svg>}
                            sx={{ padding: '2px', '&.Mui-focusVisible': { outline: '2px solid #ff5500', outlineOffset: '2px' } }}
                        />}
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{env}</Typography>}
                        sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.75rem', color: 'text.primary', pr: 0.5 } }}
                    />
                ))}
            </RadioGroup>
        </Box>
    );
};

export default EnvironmentSelectorWidget;
