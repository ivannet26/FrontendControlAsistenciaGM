import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "react-loadly/styles.css";
import './index.css'
import App from './App.jsx'
import { instalarInterceptor } from "./services/interceptor.js";
instalarInterceptor();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
