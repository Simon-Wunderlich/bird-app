import { Provider } from '@/src/components/ui/provider';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({ onNeedRefresh() {}, onOfflineReady() {} });

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider>
    <App />
  </Provider>
);
