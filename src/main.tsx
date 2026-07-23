import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initialiseConsentManagement } from './lib/consent';
import './styles.css';
import './home.css';

// Consent defaults and any valid saved choice must be queued before the UI can
// emit analytics events or append a Google-controlled network script.
initialiseConsentManagement();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
