import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // This line was failing before!
import './index.css'
import 'leaflet/dist/leaflet.css'; // Critical for map to work

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)