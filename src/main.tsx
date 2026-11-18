import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './index.css';

// PWA: instala el service worker y se actualiza sola cuando hay una versión nueva.
registerSW({ immediate: true });

const root = document.getElementById('root');
if (!root) throw new Error('Falta el elemento #root en index.html.');

async function start(container: HTMLElement) {
  // Solo desarrollo: ?data=peor (etc.) carga datos de prueba y muestra el selector.
  let devTools: ReactNode = null;
  if (import.meta.env.DEV) {
    const { applyFixtureFromUrl } = await import('./dev/breakFixtures');
    const active = applyFixtureFromUrl();
    if (active) {
      const { BreakToggle } = await import('./dev/BreakToggle');
      devTools = <BreakToggle active={active} />;
    }
  }
  createRoot(container).render(
    <StrictMode>
      <App />
      {devTools}
    </StrictMode>,
  );
}

void start(root);
