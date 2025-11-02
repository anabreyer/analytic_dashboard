/**
 * SalesChart Component - WITH ADVANCED FILTERS
 * Displays sales timeline with advanced filtering
 */

'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Card, Title, Text, Badge } from '@tremor/react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Filter } from 'lucide-react'

interface SalesChartProps {
  startDate: Date | null
  endDate: Date | null
  storeId: number | null
  filters?: Record<string, any> // NEW: Advanced filters
}

type Granularity = 'hour' | 'day' | 'week' | 'month'

export function SalesChart({ startDate, endDate, storeId, filters = {} }: SalesChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('day')
  
  // Build query params with filters
  const buildQueryParams = () => {
    const params: any = {
      start_date: startDate,
      end_date: endDate,
      store_id: storeId,
      granularity
    }
    
    // Add advanced filters
    if (filters.dayOfWeek?.length > 0) {
      params.day_of_week = filters.dayOfWeek
    }
    if (filters.timeOfDay?.length > 0) {
      params.time_of_day = filters.timeOfDay
    }
    if (filters.channel?.length > 0) {
      params.channels = filters.channel
    }
    if (filters.category?.length > 0) {
      params.categories = filters.category
    }
    if (filters.priceRange?.length > 0) {
      params.price_range = filters.priceRange
    }
    if (filters.customerType?.length > 0) {
      params.customer_type = filters.customerType
    }
    
    return params
  }

  // Fetch timeline data with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['timeline', startDate, endDate, storeId, granularity, filters],
    queryFn: () => analyticsAPI.getTimeline(buildQueryParams()),
  })

  // Refetch when granularity or filters change
  useEffect(() => {
    refetch()
  }, [granularity, filters, refetch])

  // Check if filters are active
  const hasActiveFilters = Object.keys(filters).length > 0 && 
    Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : !!f)

  // Generate filter description
  const getFilterDescription = () => {
    const descriptions = []
    
    if (filters.dayOfWeek?.length > 0) {
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
      const selectedDays = filters.dayOfWeek.map((d: string) => {
        const dayMap: any = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 }
        return days[dayMap[d]]
      }).join(', ')
      descriptions.push(`Dias: ${selectedDays}`)
    }
    
    if (filters.timeOfDay?.length > 0) {
      const periods: any = {
        morning: 'Manhã',
        afternoon: 'Tarde',
        evening: 'Noite',
        night: 'Madrugada'
      }
      const selectedPeriods = filters.timeOfDay.map((t: string) => periods[t]).join(', ')
      descriptions.push(`Período: ${selectedPeriods}`)
    }
    
    if (filters.channel?.length > 0) {
      descriptions.push(`Canais: ${filters.channel.join(', ')}`)
    }
    
    if (filters.customerType?.length > 0) {
      descriptions.push(`Clientes: ${filters.customerType.join(', ')}`)
    }
    
    return descriptions.join(' • ')
  }

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !data || !data.data || data.data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">
          Sem dados para o período selecionado
        </Text>
        {hasActiveFilters && (
          <Text className="text-xs text-gray-400 mt-2">
            Tente ajustar os filtros aplicados
          </Text>
        )}
      </div>
    )
  }

  // Transform data for the chart
  const chartData = data.data.map(point => ({
    date: formatDate(point.period),
    Faturamento: point.revenue,
    Vendas: point.orders,
  }))

  const granularityLabels = {
    hour: 'Hora',
    day: 'Dia',
    week: 'Semana',
    month: 'Mês'
  }

  return (
    <div className="space-y-4">
      {/* Filter indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <Text className="text-xs text-blue-700 dark:text-blue-300">
              {getFilterDescription()}
            </Text>
          </div>
          <Badge color="blue" size="xs">
            Filtrado
          </Badge>
        </div>
      )}

      {/* Custom Tab Implementation */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {Object.entries(granularityLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setGranularity(key as Granularity)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              granularity === key
                ? 'text-blue-600 dark:text-blue-400 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-4">
        {chartData.length > 0 ? (
          <AreaChart
            className="h-72"
            data={chartData}
            index="date"
            categories={["Faturamento"]}
            colors={["indigo"]}
            valueFormatter={formatCurrency}
            showLegend={true}
            showGridLines={true}
            showAnimation={true}
            curveType="monotone"
          />
        ) : (
          <div className="h-72 flex items-center justify-center">
            <Text className="text-gray-500">Nenhum dado disponível</Text>
          </div>
        )}
      </div>

      {/* Summary stats when filtered */}
      {hasActiveFilters && data.data.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Card className="p-2">
            <Text className="text-xs text-gray-500">Total Período</Text>
            <Text className="font-bold">
              {formatCurrency(data.data.reduce((sum, p) => sum + p.revenue, 0))}
            </Text>
          </Card>
          <Card className="p-2">
            <Text className="text-xs text-gray-500">Média Diária</Text>
            <Text className="font-bold">
              {formatCurrency(data.data.reduce((sum, p) => sum + p.revenue, 0) / data.data.length)}
            </Text>
          </Card>
          <Card className="p-2">
            <Text className="text-xs text-gray-500">Total Pedidos</Text>
            <Text className="font-bold">
              {data.data.reduce((sum, p) => sum + p.orders, 0)}
            </Text>
          </Card>
        </div>
      )}
    </div>
  )
}