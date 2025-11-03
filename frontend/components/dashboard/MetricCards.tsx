/**
 * MetricCards Component - WITH ADVANCED FILTERS
 * Displays key metrics with comparison to previous period
 */

'use client'

import { Card, Metric, Text, Flex, BadgeDelta, ProgressBar } from '@tremor/react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { 
  ShoppingCart, 
  DollarSign, 
  Receipt, 
  Users,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react'
import { LoadingCard } from '@/components/ui/LoadingCard'

interface MetricCardsProps {
  startDate: Date | null
  endDate: Date | null
  storeId: number | null
  filters?: Record<string, any> // NEW: Advanced filters
}

export function MetricCards({ startDate, endDate, storeId, filters = {} }: MetricCardsProps) {
  // Debug log to track prop changes
  console.log('🏪 MetricCards render - storeId:', storeId, 'filters:', filters)
  
  // Build query params with filters
  const buildQueryParams = () => {
    const params: any = {
      start_date: startDate,
      end_date: endDate
    }
    
    // Only add store_id if it's not null
    if (storeId !== null && storeId !== undefined) {
      params.store_id = storeId
    }
    
    // Add advanced filters - send arrays directly, api.ts will handle conversion
    if (filters.dayOfWeek?.length > 0) {
      params.day_of_week = filters.dayOfWeek
    }
    if (filters.timeOfDay?.length > 0) {
      params.time_of_day = filters.timeOfDay
    }
    if (filters.channel?.length > 0) {
      params.channels = filters.channel  // Note: channels (plural) to match api.ts
    }
    if (filters.category?.length > 0) {
      params.categories = filters.category  // Note: categories (plural) to match api.ts
    }
    if (filters.priceRange?.length > 0) {
      params.price_range = filters.priceRange
    }
    if (filters.customerType?.length > 0) {
      params.customer_type = filters.customerType
    }
    if (filters.deliveryZone?.length > 0) {
      params.delivery_zone = filters.deliveryZone
    }
    if (filters.orderSize?.length > 0) {
      params.order_size = filters.orderSize
    }
    
    // Debug log
    console.log('📊 MetricCards - Building params with storeId:', storeId)
    console.log('📊 MetricCards - Query params:', params)
    
    return params
  }

  // Fetch overview data with filters
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'overview', 
      startDate?.toISOString(), 
      endDate?.toISOString(), 
      storeId, 
      JSON.stringify(filters)
    ],
    queryFn: () => analyticsAPI.getOverview(buildQueryParams()),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  })

  // Check if filters are active
  const hasActiveFilters = Object.keys(filters).length > 0 && 
    Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : !!f)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <LoadingCard key={i} />)}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <Text className="text-red-600">
          Erro ao carregar métricas. Por favor, tente novamente.
        </Text>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Pedidos',
      metric: formatNumber(data.metrics.total_orders.value),
      metricPrev: formatNumber(data.metrics.total_orders.previous),
      delta: data.metrics.total_orders.change,
      deltaType: data.metrics.total_orders.change >= 0 ? 'increase' : 'decrease',
      icon: ShoppingCart,
      color: 'blue' as const,
      progress: Math.min(100, (data.metrics.total_orders.value / 2000) * 100),
    },
    {
      title: 'Faturamento',
      metric: formatCurrency(data.metrics.total_revenue.value),
      metricPrev: formatCurrency(data.metrics.total_revenue.previous),
      delta: data.metrics.total_revenue.change,
      deltaType: data.metrics.total_revenue.change >= 0 ? 'increase' : 'decrease',
      icon: DollarSign,
      color: 'green' as const,
      progress: Math.min(100, (data.metrics.total_revenue.value / 100000) * 100),
    },
    {
      title: 'Ticket Médio',
      metric: formatCurrency(data.metrics.avg_ticket.value),
      metricPrev: formatCurrency(data.metrics.avg_ticket.previous),
      delta: data.metrics.avg_ticket.change,
      deltaType: data.metrics.avg_ticket.change >= 0 ? 'increase' : 'decrease',
      icon: Receipt,
      color: 'amber' as const,
      progress: Math.min(100, (data.metrics.avg_ticket.value / 100) * 100),
    },
    {
      title: 'Clientes Únicos',
      metric: formatNumber(data.metrics.unique_customers.value),
      metricPrev: formatNumber(data.metrics.unique_customers.previous),
      delta: data.metrics.unique_customers.change,
      deltaType: data.metrics.unique_customers.change >= 0 ? 'increase' : 'decrease',
      icon: Users,
      color: 'purple' as const,
      progress: Math.min(100, (data.metrics.unique_customers.value / 500) * 100),
    },
  ]

  return (
    <>
      {/* Filter indicator */}
      {hasActiveFilters && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <Text className="text-sm text-blue-700 dark:text-blue-300">
            Filtros ativos aplicados às métricas
          </Text>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item) => {
          const Icon = item.icon
          const isPositive = item.delta >= 0
          const TrendIcon = isPositive ? TrendingUp : TrendingDown
          
          return (
            <Card
              key={item.title}
              className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Flex alignItems="start">
                <div className="flex-1">
                  <Flex justifyContent="start" alignItems="center" className="gap-2">
                    <Icon className={`h-5 w-5 ${
                      item.color === 'blue' ? 'text-blue-500' :
                      item.color === 'green' ? 'text-green-500' :
                      item.color === 'amber' ? 'text-amber-500' :
                      'text-purple-500'
                    }`} />
                    <Text>{item.title}</Text>
                    {hasActiveFilters && (
                      <Filter className="h-3 w-3 text-gray-400" />
                    )}
                  </Flex>
                  <Metric className="mt-2">{item.metric}</Metric>
                  <Flex justifyContent="start" alignItems="baseline" className="gap-2 mt-4">
                    <BadgeDelta
                      deltaType={item.deltaType as 'increase' | 'decrease'}
                      size="xs"
                    >
                      {formatPercentage(item.delta)}
                    </BadgeDelta>
                    <Text className="text-xs text-gray-500">
                      vs {item.metricPrev}
                    </Text>
                  </Flex>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <TrendIcon 
                    className={`h-5 w-5 ${
                      isPositive ? 'text-green-500' : 'text-red-500'
                    }`} 
                  />
                </div>
              </Flex>
              <ProgressBar
                value={item.progress}
                color={item.color}
                className="mt-3"
              />
            </Card>
          )
        })}
      </div>
    </>
  )
}