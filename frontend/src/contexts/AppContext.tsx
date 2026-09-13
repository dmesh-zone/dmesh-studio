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

import React, { createContext, ReactNode, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ConfigContext } from './ConfigContext';
import { AppConfig, UserProfile } from '../types';

export type AppContextType = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  config: AppConfig;
  setUser: (user: UserProfile | null) => void;
  updateConfig: (config: Partial<AppConfig>) => void;
  logout: () => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const configContext = useContext(ConfigContext);

  if (!authContext) {
    throw new Error('AppContextProvider must be used within an AuthProvider');
  }

  if (!configContext) {
    throw new Error('AppContextProvider must be used within an AppConfigProvider');
  }

  const { user, isAuthenticated, setUser, logout } = authContext;
  const { config, updateConfig } = configContext;

  const contextValue: AppContextType = {
    user,
    isAuthenticated,
    config,
    setUser,
    updateConfig,
    logout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
