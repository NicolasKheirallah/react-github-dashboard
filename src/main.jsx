import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { initClientMonitoring } from './utils/observability';
import { reportDashboardWebVitals } from './reportWebVitals';
import './index.css';

initClientMonitoring();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportDashboardWebVitals();
