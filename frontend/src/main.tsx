import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"


export const queryClient = new QueryClient()

// Apply the saved theme before first paint (defaults to dark).
document.documentElement.dataset.theme = localStorage.getItem("theme") || "dark"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient} >
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
