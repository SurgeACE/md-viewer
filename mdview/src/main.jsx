import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Initialize Capacitor plugins when running as native app
async function initCapacitor() {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('capacitor')
      
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      await StatusBar.setBackgroundColor({ color: '#0a0a0a' })
      await StatusBar.setStyle({ style: Style.Dark })

      const { SplashScreen } = await import('@capacitor/splash-screen')
      await SplashScreen.hide()
    }
  } catch {
    // Not running in Capacitor — browser mode
  }
}

initCapacitor()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
