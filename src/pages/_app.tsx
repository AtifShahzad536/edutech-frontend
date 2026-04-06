import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { useEffect } from 'react'
import { applyTheme } from '@/utils/theme'
import { useAppSelector } from '@/hooks/useRedux'
import { initializePerformanceMonitoring } from '@/utils/performance'
import { useAuthSync } from '@/hooks/useAuthSync'
import RoleGuard from '@/components/auth/RoleGuard'

type CustomAppProps = AppProps & {
  Component: {
    allowedRoles?: ('student' | 'instructor' | 'admin')[];
    requireAuth?: boolean;
    noLayout?: boolean;
  }
}

function AppInner({ Component, pageProps }: CustomAppProps) {
  const router = useRouter()
  const { theme } = useAppSelector((state) => state.ui)

  // Initialize auth sync
  useAuthSync()

  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring()

    // Apply theme
    const themeMode = theme === 'dark' ? 'dark' : 'light'
    applyTheme(
      themeMode === 'dark'
        ? require('@/utils/theme').darkTheme
        : require('@/utils/theme').lightTheme
    )

    // Preload critical resources
    if (typeof window !== 'undefined') {
      // Preload critical fonts
      const preloadFont = (href: string) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = href
        link.as = 'font'
        link.type = 'font/woff2'
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      }

      // Preload Poppins font
      preloadFont(
        'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap'
      )

      // Preload critical images
      const preloadImages = () => {
        const criticalImages = ['/images/logo.svg', '/images/hero-bg.jpg']

        criticalImages.forEach((src) => {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.href = src
          link.as = 'image'
          document.head.appendChild(link)
        })
      }

      // Defer image preloading
      setTimeout(preloadImages, 1000)
    }
  }, [theme])

  return (
    <RoleGuard 
      allowedRoles={Component.allowedRoles} 
      requireAuth={Component.requireAuth ?? (router.pathname.startsWith('/student') || router.pathname.startsWith('/instructor') || router.pathname.startsWith('/admin'))}
    >
      <Component {...pageProps} />
    </RoleGuard>
  )
}

import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'

function MyApp(props: AppProps) {
  return (
    <Provider store={store}>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderRadius: '12px',
            padding: '12px 24px',
          },
        }}
      />
      <AppInner {...props} />
    </Provider>
  )
}

export default MyApp
