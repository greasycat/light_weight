import Dashboard from "./components/tabs/dashboard";

export default function Home() {
  return (
    <Dashboard />
  )
}

import type { Viewport } from 'next'
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}