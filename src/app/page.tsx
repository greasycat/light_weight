import Dashboard from "./components/dashboard";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Home() {
  return (
    <GoogleOAuthProvider clientId="451551445631-muf463qq03bf7s6h6hf7u51hvlh8l64t.apps.googleusercontent.com">
      <Dashboard />
    </GoogleOAuthProvider>
  )
}

import type { Viewport } from 'next'
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}