import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import BusinessProviders from './contexts/BusinessProviders';
import AdminProviders from './contexts/AdminProviders';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ThemeProvider>
      <BusinessProviders>
        <AdminProviders>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3200,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-md)',
                },
                success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
                error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
              }}
            />
          </BrowserRouter>
        </AdminProviders>
      </BusinessProviders>
    </ThemeProvider>
  );
}
