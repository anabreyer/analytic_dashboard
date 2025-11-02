/**
 * RefreshButton Component
 * Manual refresh button for data
 */

'use client'

import { Button } from '@tremor/react'
import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

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