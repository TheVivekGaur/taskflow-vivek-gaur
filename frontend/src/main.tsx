import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

async function enableMocking() {
  // Always enable MSW since we have no real backend
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
