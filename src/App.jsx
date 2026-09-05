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

import './App.css';
import { Box, Tooltip, Typography, IconButton, Divider } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import LayersIcon from '@mui/icons-material/Layers';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';
import { useThemeContext } from './ThemeContext';
import pages from './pages';
import YAML from 'yaml';
import * as MuiIcons from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import pageCustomisationMarkdown from '../PAGE_CUSTOMISATION.md?raw';
import Banner from './banner';

const normalizePath = (path) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return (baseUrl + path).replace(/\/\//g, '/');
};

function App() {
  const [currentView, setCurrentView] = useState('mesh');
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('dmesh-nav-expanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('dmesh-nav-expanded', JSON.stringify(next));
      return next;
    });
  };
  const { mode, setPrimaryColor } = useThemeContext();
  React.useEffect(() => {
    const applyTheme = async () => {
      let themeLink = document.getElementById('theme-link');
      if (!themeLink) {
          themeLink = document.createElement('link');
          themeLink.id = 'theme-link';
          themeLink.rel = 'stylesheet';
      }
      // Always append to head to ensure it's the last stylesheet, overriding index.css
      document.head.appendChild(themeLink);
      
      const baseUrl = import.meta.env.BASE_URL || '/';
      const customThemeUrl = `${baseUrl}themes/custom/${mode}-theme.css`.replace('//', '/');
      const baseThemeUrl = `${baseUrl}themes/base/${mode}-theme.css`.replace('//', '/');
      
      let finalUrl = baseThemeUrl;

      try {
        const response = await fetch(customThemeUrl, { method: 'HEAD' });
        if (response.ok) {
           const contentType = response.headers.get('content-type');
           if (contentType && contentType.includes('text/css')) {
               finalUrl = customThemeUrl;
           }
        }
      } catch (e) {
        console.warn('Could not check for custom theme', e);
      }

      themeLink.href = import.meta.env.DEV ? `${finalUrl}?t=${Date.now()}` : finalUrl;

      // Extract primary color to update MUI theme
      try {
        const cssResponse = await fetch(finalUrl);
        const cssText = await cssResponse.text();
        const match = cssText.match(/--primary-main:\s*(#[0-9a-fA-F]{3,6})/);
        if (match && match[1]) {
            setPrimaryColor(match[1]);
        } else {
            setPrimaryColor(null);
        }
      } catch (e) {
        console.warn('Could not parse CSS for primary color', e);
        setPrimaryColor(null);
      }
    };
    
    applyTheme();
  }, [mode, setPrimaryColor]);

  const [navConfig, setNavConfig] = useState(null);

  React.useEffect(() => {
    Promise.all([
      fetch(normalizePath(`/config/base/config.yaml?t=${Date.now()}`)).then(r => r.ok ? r.text() : ''),
      fetch(normalizePath(`/config/custom/config.yaml?t=${Date.now()}`)).then(r => r.ok ? r.text() : '')
    ]).then(([configText, customConfigText]) => {
        let baseConfig = {};
        let customConfig = {};
        try { if (configText) baseConfig = YAML.parse(configText) || {}; } catch (e) {}
        try { if (customConfigText) customConfig = YAML.parse(customConfigText) || {}; } catch (e) {}
        
        const mergedNav = customConfig.navigation || baseConfig.navigation;
        setNavConfig(mergedNav);
    });
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: 'var(--m3-surface, #f5f5f5)' }}>
      <Banner />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Navigation Drawer/Rail */}
        <Box
        sx={{
          width: isExpanded ? 240 : 72,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: mode === 'dark' ? '#333333' : '#cccccc',
          backgroundColor: mode === 'dark' ? '#000000' : '#ffffff',
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
            onClick={toggleExpanded}
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
          {navConfig?.sections?.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              {sIdx > 0 && (!section.name || section.name === "") && (
                <Divider sx={{ my: 1, borderColor: mode === 'dark' ? '#333333' : '#cccccc' }} />
              )}
              {isExpanded && section.name && section.name !== "" && (
                <Typography variant="overline" sx={{ px: 2, pt: 1, pb: 0.5, color: 'text.secondary', fontWeight: 'bold' }}>
                  {section.name}
                </Typography>
              )}
              {section.pages.map((page) => {
                const IconComponent = MuiIcons[page.icon] || MuiIcons[page.icon + 'Icon'] || LayersIcon;
                return (
                  <Tooltip key={page.id} title={!isExpanded ? page.title : ""} placement="right">
                    <Box
                      onClick={() => setCurrentView(page.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isExpanded ? 'flex-start' : 'center',
                        cursor: 'pointer',
                        px: isExpanded ? 2.5 : 0,
                        height: 48,
                        borderLeft: currentView === page.id ? '3px solid' : '3px solid transparent',
                        borderColor: currentView === page.id ? (mode === 'dark' ? '#ffffff' : '#111111') : 'transparent',
                        backgroundColor: currentView === page.id
                          ? (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
                          : 'transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                        }
                      }}
                    >
                      <IconComponent 
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
                            fontWeight: currentView === page.id ? 700 : 400,
                            color: mode === 'dark' ? '#ffffff' : '#111111',
                            whiteSpace: 'nowrap',
                            opacity: isExpanded ? 1 : 0,
                            transition: 'opacity 0.2s ease',
                          }}
                        >
                          {page.title}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
        {(() => {
          let ActiveComponent = null;
          if (navConfig) {
            for (const section of navConfig.sections) {
              const page = section.pages.find(p => p.id === currentView);
              if (page && pages[page.component]) {
                ActiveComponent = pages[page.component];
                break;
              }
            }
          }
          if (ActiveComponent) {
            return <ActiveComponent isExpanded={isExpanded} />;
          }
          return (
            <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
              <Box sx={{ 
                p: 4, 
                borderRadius: 2, 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
                bgcolor: 'background.paper',
                '& h1, & h2, & h3': { mt: 0, mb: 2 },
                '& p': { mb: 2 },
                '& pre': { p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, overflowX: 'auto' }
              }}>
                <ReactMarkdown>{pageCustomisationMarkdown}</ReactMarkdown>
              </Box>
            </Box>
          );
        })()}
      </Box>
      </Box>
    </Box>
  );
}

export default App;

