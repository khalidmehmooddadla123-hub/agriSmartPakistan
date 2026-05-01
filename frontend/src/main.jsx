import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import ColdStartNotifier from './components/ColdStartNotifier';
import './i18n';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <ConfirmProvider>
              <App />
              <ColdStartNotifier />
              <Toaster
                position="top-right"
                gutter={10}
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: '#ffffff',
                    color: '#111827',
                    fontWeight: 500,
                    fontSize: 13.5,
                    padding: '12px 14px',
                    borderRadius: 14,
                    boxShadow: '0 10px 25px -5px rgba(16, 24, 40, 0.12), 0 4px 10px -4px rgba(16, 24, 40, 0.08)',
                    border: '1px solid #e5e7eb',
                    maxWidth: 420
                  },
                  success: {
                    iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
                    style: { borderLeft: '4px solid #16a34a' }
                  },
                  error: {
                    duration: 4500,
                    iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
                    style: { borderLeft: '4px solid #dc2626' }
                  },
                  loading: {
                    iconTheme: { primary: '#16a34a', secondary: '#dcfce7' }
                  }
                }}
              />
            </ConfirmProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
