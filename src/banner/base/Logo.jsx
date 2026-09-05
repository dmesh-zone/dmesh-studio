import React from 'react';
import { useThemeContext } from '../../ThemeContext';
import logoLight from './logo_light.png';
import logoDark from './logo_dark.png';

export default function Logo() {
    const { mode } = useThemeContext();

    return (
        <img
            src={mode === 'dark' ? logoDark : logoLight}
            alt="DMesh Studio Logo"
            style={{ height: '32px', width: 'auto' }}
        />
    );
}
