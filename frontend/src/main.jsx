/**
 * =============================================================================
 * MAIN.JSX - Entry point của ứng dụng React
 * =============================================================================
 * Vị trí: src/main.jsx
 *
 * Chức năng:
 * - Render App component vào DOM
 * - Import global CSS
 *
 * Dependencies: react, react-dom
 * =============================================================================
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Global CSS
import './index.css';

// Note: Slider sử dụng CSS thuần, không cần import slick-carousel

// ============================================================================
// RENDER APP
// ============================================================================
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
