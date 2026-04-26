import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App.jsx'

let posthogInitialized = false

const initializePostHog = () => {
  if (posthogInitialized) {
    return
  }

  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  if (!posthogKey) {
    console.warn('PostHog not initialized: VITE_POSTHOG_KEY is undefined')
    return
  }

  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
  })

  posthog.capture('test_event_loaded')
  console.log('PostHog initialized')
  posthogInitialized = true
}

initializePostHog()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
