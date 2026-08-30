import React from 'react';
import { Box, Typography, Avatar as MuiAvatar } from '@mui/material';

export default function Avatar() {
    // In a real app, this would come from an auth context
    const user = { name: "Demo" };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MuiAvatar
                sx={{
                    bgcolor: 'var(--primary-main, #6750A4)',
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem'
                }}
            >
                {user.name.charAt(0)}
            </MuiAvatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.name}
            </Typography>
        </Box>
    );
}
