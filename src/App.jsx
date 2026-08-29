/*
 * Copyright 2026 Joao Vicente
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import Flow from './Flow';
import DataProductsTable from './DataProductsTable';
import './App.css';
import { Box, Tooltip, Typography, IconButton } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import LayersIcon from '@mui/icons-material/Layers';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';
import { useThemeContext } from './ThemeContext';
import SettingsView from './SettingsView';

function App() {
  const [currentView, setCurrentView] = useState('mesh');
  const [isExpanded, setIsExpanded] = useState(true);
  const { mode } = useThemeContext();
  React.useEffect(() => {
    let themeLink = document.getElementById('theme-link');
    if (!themeLink) {
        themeLink = document.createElement('link');
        themeLink.id = 'theme-link';
        themeLink.rel = 'stylesheet';
        document.head.appendChild(themeLink);
    }
    const baseUrl = import.meta.env.BASE_URL || '/';
    const themeUrl = `${baseUrl}/themes/${mode}-theme.css`.replace('//', '/');
    themeLink.href = import.meta.env.DEV ? `${themeUrl}?t=${Date.now()}` : themeUrl;
  }, [mode]);

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: 'var(--m3-surface, #f5f5f5)' }}>
      {/* Navigation Drawer/Rail */}
      <Box
        sx={{
          width: isExpanded ? 240 : 72,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: mode === 'dark' ? '#333333' : '#cccccc',
          backgroundColor: mode === 'dark' ? '#111111' : '#f5f5f5',
          flexShrink: 0,
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
        }}
      >
        {/* Toggle Expand/Collapse Button - header row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: isExpanded ? 'flex-end' : 'center',
            alignItems: 'center',
            px: isExpanded ? 1.5 : 0,
            height: 48,
            borderBottom: '1px solid',
            borderColor: mode === 'dark' ? '#333333' : '#cccccc',
            flexShrink: 0,
          }}
        >
          <IconButton 
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
            sx={{
              color: mode === 'dark' ? '#ffffff' : '#111111',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              }
            }}
          >
            {isExpanded ? <KeyboardDoubleArrowLeftIcon /> : <KeyboardDoubleArrowRightIcon />}
          </IconButton>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', pt: 1 }}>
          {/* Data Mesh Navigation Target */}
          <Tooltip title={!isExpanded ? "Data Mesh" : ""} placement="right">
            <Box
              onClick={() => setCurrentView('mesh')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                cursor: 'pointer',
                px: isExpanded ? 2.5 : 0,
                height: 48,
                borderLeft: currentView === 'mesh' ? '3px solid' : '3px solid transparent',
                borderColor: currentView === 'mesh' ? (mode === 'dark' ? '#ffffff' : '#111111') : 'transparent',
                backgroundColor: currentView === 'mesh'
                  ? (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
                  : 'transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                }
              }}
            >
              <HubIcon 
                sx={{ 
                  mr: isExpanded ? 2 : 0, 
                  color: mode === 'dark' ? '#ffffff' : '#111111',
                  fontSize: 22,
                  transition: 'margin 0.2s ease'
                }} 
              />
              {isExpanded && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: currentView === 'mesh' ? 700 : 400,
                    color: mode === 'dark' ? '#ffffff' : '#111111',
                    whiteSpace: 'nowrap',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  Data Mesh
                </Typography>
              )}
            </Box>
          </Tooltip>

          {/* Data Products Navigation Target */}
          <Tooltip title={!isExpanded ? "Data Products" : ""} placement="right">
            <Box
              onClick={() => setCurrentView('products')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                cursor: 'pointer',
                px: isExpanded ? 2.5 : 0,
                height: 48,
                borderLeft: currentView === 'products' ? '3px solid' : '3px solid transparent',
                borderColor: currentView === 'products' ? (mode === 'dark' ? '#ffffff' : '#111111') : 'transparent',
                backgroundColor: currentView === 'products'
                  ? (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
                  : 'transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                }
              }}
            >
              <LayersIcon 
                sx={{ 
                  mr: isExpanded ? 2 : 0, 
                  color: mode === 'dark' ? '#ffffff' : '#111111',
                  fontSize: 22,
                  transition: 'margin 0.2s ease'
                }} 
              />
              {isExpanded && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: currentView === 'products' ? 700 : 400,
                    color: mode === 'dark' ? '#ffffff' : '#111111',
                    whiteSpace: 'nowrap',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  Data Products
                </Typography>
              )}
            </Box>
          </Tooltip>
          {/* Settings Navigation Target */}
          <Tooltip title={!isExpanded ? "Settings" : ""} placement="right">
            <Box
              onClick={() => setCurrentView('settings')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                cursor: 'pointer',
                px: isExpanded ? 2.5 : 0,
                height: 48,
                borderLeft: currentView === 'settings' ? '3px solid' : '3px solid transparent',
                borderColor: currentView === 'settings' ? (mode === 'dark' ? '#ffffff' : '#111111') : 'transparent',
                backgroundColor: currentView === 'settings'
                  ? (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
                  : 'transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                }
              }}
            >
              <SettingsIcon 
                sx={{ 
                  mr: isExpanded ? 2 : 0, 
                  color: mode === 'dark' ? '#ffffff' : '#111111',
                  fontSize: 22,
                  transition: 'margin 0.2s ease'
                }} 
              />
              {isExpanded && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: currentView === 'settings' ? 700 : 400,
                    color: mode === 'dark' ? '#ffffff' : '#111111',
                    whiteSpace: 'nowrap',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  Settings
                </Typography>
              )}
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
        {currentView === 'mesh' && <Flow isExpanded={isExpanded} />}
        {currentView === 'products' && <DataProductsTable />}
        {currentView === 'settings' && <SettingsView />}
      </Box>
    </Box>
  );
}

export default App;

