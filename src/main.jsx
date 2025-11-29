import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'   // ← this line is new/correct

Amplify.configure(outputs)   // ← this must come BEFORE rendering

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)