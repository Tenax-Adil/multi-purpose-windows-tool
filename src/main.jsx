import React, { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, Play, Pause, Square, ChevronRight, Inbox } from 'lucide-react'
import './index.css'
import App from './App.jsx'


class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff8080', background: '#220000', height: '100vh', fontFamily: 'monospace' }}>
          <h2>React Crashed!</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {this.state.error?.toString()}
            <br />
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return <ErrorBoundary><App /></ErrorBoundary>
}

const container = document.getElementById('root')
// Cache the root so HMR re-renders don't create a second root
if (!container._reactRoot) {
  container._reactRoot = createRoot(container)
}
container._reactRoot.render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
