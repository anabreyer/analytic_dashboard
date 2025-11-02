/**
 * Root Layout for Nola Analytics - WITH DARK MODE SUPPORT
 * Sets up providers, fonts, and global layout structure
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nola Analytics - Inteligência para Restaurantes',
  description: 'Plataforma de analytics em tempo real para restaurantes, processando 500k+ vendas com insights automáticos',
  keywords: 'analytics, restaurantes, dashboard, insights, vendas, iFood, Rappi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </main>
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
              © 2024 Nola Analytics - Transformando dados em decisões
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}