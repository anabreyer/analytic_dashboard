/**
 * UI Components Index
 * Consolidated UI components with proper client-side rendering
 */

'use client'

import React, { useState } from 'react'
import { Button, Card, Title, Text } from '@tremor/react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * LoadingSpinner Component
 * Simple loading spinner animation
 */

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

/**
 * LoadingCard Component
 * Skeleton loader for metric cards
 */

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

/**
 * RefreshButton Component
 * Manual refresh button for data
 */

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="secondary"
      icon={RefreshCw}
      className={isRefreshing ? 'animate-spin' : ''}
    >
      {isRefreshing ? 'Atualizando...' : 'Atualizar'}
    </Button>
  )
}

/**
 * ErrorBoundary Component
 * Catches and displays errors gracefully
 */

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <Title>Oops! Algo deu errado</Title>
            </div>
            <Text className="mb-4">
              Encontramos um erro inesperado. Por favor, tente recarregar a página.
            </Text>
            {this.state.error && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <Text className="text-xs font-mono text-gray-600">
                  {this.state.error.message}
                </Text>
              </div>
            )}
            <Button
              onClick={this.handleReset}
              icon={RefreshCw}
              color="red"
              variant="primary"
            >
              Recarregar Página
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}