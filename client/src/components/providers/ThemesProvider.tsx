'use client';

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps
} from 'next-themes';

const ThemesProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

export default ThemesProvider;
