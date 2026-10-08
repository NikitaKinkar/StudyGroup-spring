import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Fix for sockjs-client global variable issue
if (typeof global === 'undefined') {
  window.global = window;
}

console.log('main.jsx: Script started.');

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('main.jsx: Root element found, creating React root.');
  ReactDOM.createRoot(rootElement).render(
    <App />
  );
} else {
  console.error('main.jsx: Root element with ID "root" not found in the document.');
}
