import React from 'react';
import { Box, Divider } from '@mui/material';
import { useThemeContext } from '../../ThemeContext';

export default function Banner({ LogoComponent, AvatarComponent, ProductNameComponent }) {
    const { mode } = useThemeContext();
    
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                px: 3,
                height: 64,
                borderBottom: '1px solid',
                borderColor: mode === 'dark' ? '#333333' : '#cccccc',
                backgroundColor: mode === 'dark' ? '#111111' : '#f5f5f5',
                color: mode === 'dark' ? '#ffffff' : '#111111',
                flexShrink: 0
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {LogoComponent && <LogoComponent />}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 2 }}>
                {AvatarComponent && <AvatarComponent />}
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'inherit', opacity: 0.3 }} />
                {ProductNameComponent && <ProductNameComponent />}
            </Box>
        </Box>
    );
}
