import React, { createContext, useContext, useState } from 'react';
import { Colors } from '../theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const theme = {
    isDark,
    colors: isDark ? { ...Colors, background: Colors.dark.background, surface: Colors.dark.surface, card: Colors.dark.card, text: Colors.dark.text, textSecondary: Colors.dark.textSecondary, border: Colors.dark.border } : Colors,
    toggle: () => setIsDark(p => !p)
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
