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
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 5000,
          style: {
            background: 'rgba(7, 7, 8, 0.8)',
            backdropFilter: 'blur(16px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '11px',
            fontFamily: 'inherit',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            borderRadius: '16px',
            padding: '16px 24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }
          },
          loading: {
             style: {
               border: '1px solid rgba(99, 102, 241, 0.2)',
             }
          }
        }}
      />
      <AppInner {...props} />
    </Provider>
  )
}

export default MyApp
