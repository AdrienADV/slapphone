import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './app'
import { ThemeProvider } from './components/theme-provider';
import { initTransitions } from '@capgo/capacitor-transitions/react';
import '@capgo/capacitor-transitions';

initTransitions({ platform: 'auto' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
