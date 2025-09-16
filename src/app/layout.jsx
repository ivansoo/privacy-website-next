import React from 'react'
import './globals.css'
import './header-footer.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'privacy.qrconsult.ru',
  description: 'Privacy landing recreated as Next.js components',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
