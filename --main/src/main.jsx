import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';

const installMediaProtection = () => {
  if (window.__mediaProtectionInstalled) return;

  const isProtectedMedia = (target) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('img, video, canvas, picture, source'));
  };

  document.addEventListener('contextmenu', (event) => {
    if (isProtectedMedia(event.target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, { passive: false });

  document.addEventListener('dragstart', (event) => {
    if (isProtectedMedia(event.target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, { passive: false });

  document.addEventListener('keydown', (event) => {
    const isModifier = event.ctrlKey || event.metaKey || event.altKey;
    if (!isModifier) return;

    const blockedKeys = ['s', 'c', 'p', 'i'];
    if (blockedKeys.includes(event.key.toLowerCase())) {
      const target = event.target;
      if (target && target.closest && target.closest('img, video, canvas')) {
        event.preventDefault();
      }
    }
  });

  window.__mediaProtectionInstalled = true;
};

installMediaProtection();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
