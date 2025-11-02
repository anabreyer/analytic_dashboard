/**
 * Header Component
 * Navigation and branding header
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BarChart3, 
  Menu, 
  X, 
  TrendingUp,
  Store,
  Settings,
  HelpCircle 
} from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                Nola Analytics
              </span>
              <span className="text-xs text-gray-500">
                Inteligência para Restaurantes
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/stores"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Store className="h-4 w-4" />
              Lojas
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Ajuda
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/stores"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Store className="h-4 w-4" />
                Lojas
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle className="h-4 w-4" />
                Ajuda
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}