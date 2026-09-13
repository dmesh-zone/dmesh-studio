import React from 'react';
import { Box, Typography, Avatar as MuiAvatar } from '@mui/material';
import { useAppContext } from '../../hooks';

export default function Avatar() {
    const { user } = useAppContext();
    const displayName = user ? user.name : "Demo";

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MuiAvatar
                sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem'
                }}
            >
                {displayName.charAt(0)}
            </MuiAvatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {displayName}
            </Typography>
        </Box>
    );
}
