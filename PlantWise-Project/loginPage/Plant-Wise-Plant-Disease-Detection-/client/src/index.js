import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Installed before <App /> renders so every request carries the bearer token
// and an expired session is cleared globally.
import './Services/apiClient';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);