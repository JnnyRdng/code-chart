import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { CodeProvider } from './store/code-context.store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CodeProvider>
      <App />
    </CodeProvider>
  </React.StrictMode>,
);
