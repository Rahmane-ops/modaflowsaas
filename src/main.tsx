import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA offline shell & instant updates
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info('[ModaFlow PWA] Une mise à jour de l\'application est disponible.');
  },
  onOfflineReady() {
    console.info('[ModaFlow PWA] ModaFlow est prêt pour le fonctionnement hors-ligne (cache statique).');
  },
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

