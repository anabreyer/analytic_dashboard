/**
 * TopProducts Component - WITH ADVANCED FILTERS
 * Displays top selling products with advanced filtering
 */

'use client'

import { BarList, Card, Title, Text, Flex, Badge } from '@tremor/react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, Package, Star, Filter } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface TopProductsProps {
  startDate: Date | null
  endDate: Date | null
  storeId: number | null
  limit?: number
  filters?: Record<string, any> // NEW: Advanced filters
}

export function TopProducts({ 
  startDate, 
  endDate, 
  storeId, 
  limit = 10,
  filters = {}
}: TopProductsProps) {
  
  // Build query params with filters
  const buildQueryParams = () => {
    const params: any = {
      start_date: startDate,
      end_date: endDate,
      store_id: storeId,
      limit
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
    if (filters.deliveryZone?.length > 0) {
      params.delivery_zone = filters.deliveryZone
    }
    if (filters.orderSize?.length > 0) {
      params.order_size = filters.orderSize
    }
    
    return params
  }

  // Fetch top products data with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['topProducts', startDate, endDate, storeId, limit, filters],
    queryFn: () => analyticsAPI.getTopProducts(buildQueryParams()),
  })

  // Check if filters are active
  const hasActiveFilters = Object.keys(filters).length > 0 && 
    Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : !!f)

  // Generate filter description
  const getFilterDescription = () => {
    const descriptions = []
    
    if (filters.channel?.length > 0) {
      descriptions.push(`${filters.channel.join(', ')}`)
    }
    
    if (filters.category?.length > 0) {
      const catMap: any = {
        burgers: 'Hambúrgueres',
        pizza: 'Pizzas',
        drinks: 'Bebidas',
        desserts: 'Sobremesas',
        salads: 'Saladas',
        combos: 'Combos'
      }
      const cats = filters.category.map((c: string) => catMap[c] || c).join(', ')
      descriptions.push(cats)
    }
    
    if (filters.customerType?.length > 0) {
      const typeMap: any = {
        new: 'Novos',
        returning: 'Recorrentes',
        vip: 'VIP',
        inactive: 'Inativos'
      }
      const types = filters.customerType.map((t: string) => typeMap[t] || t).join(', ')
      descriptions.push(`Clientes ${types}`)
    }
    
    return descriptions.length > 0 ? descriptions.join(' • ') : 'Filtros aplicados'
  }

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-80 flex items-center justify-center">
        <Text className="text-red-600">Erro ao carregar produtos</Text>
      </div>
    )
  }

  if (data.products.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center">
        <Package className="h-12 w-12 text-gray-300 mb-3" />
        <Text className="text-gray-500">Nenhum produto encontrado</Text>
        {hasActiveFilters && (
          <Text className="text-xs text-gray-400 mt-2">
            Tente ajustar os filtros aplicados
          </Text>
        )}
      </div>
    )
  }

  // Transform data for BarList
  const barListData = data.products.map(product => ({
    name: product.name,
    value: product.revenue,
    sales: product.times_sold,
    customizations: product.top_customizations
  }))

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

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
          <Text className="text-xs text-blue-600 dark:text-blue-400">Total Produtos</Text>
          <Text className="font-semibold text-blue-900 dark:text-blue-100">
            {data.products.length}
          </Text>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
          <Text className="text-xs text-green-600 dark:text-green-400">Receita Total</Text>
          <Text className="font-semibold text-green-900 dark:text-green-100">
            {formatCurrency(data.products.reduce((sum, p) => sum + p.revenue, 0))}
          </Text>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
          <Text className="text-xs text-amber-600 dark:text-amber-400">Vendas Total</Text>
          <Text className="font-semibold text-amber-900 dark:text-amber-100">
            {formatNumber(data.products.reduce((sum, p) => sum + p.times_sold, 0))}
          </Text>
        </div>
      </div>

      {/* Bar List */}
      <BarList 
        data={barListData} 
        valueFormatter={formatCurrency}
        className="mt-4"
      />

      {/* Top 3 Products Details */}
      <div className="space-y-3 mt-6">
        {data.products.slice(0, 3).map((product, index) => (
          <Card key={product.id} className="p-4">
            <Flex>
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 
                    index === 1 ? 'bg-gray-100 dark:bg-gray-800' : 
                    'bg-orange-100 dark:bg-orange-900/20'}
                `}>
                  {index === 0 ? (
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600" />
                  ) : (
                    <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Flex>
                    <Text className="font-semibold">{product.name}</Text>
                    <Badge color={index === 0 ? 'yellow' : 'gray'}>
                      #{index + 1}
                    </Badge>
                  </Flex>
                  <div className="mt-1 space-y-1">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      {formatNumber(product.times_sold)} vendas • {formatCurrency(product.avg_price)} médio
                    </Text>
                    {product.top_customizations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Top adicionais:</Text>
                        {product.top_customizations.map(custom => (
                          <Badge key={custom.name} color="blue" size="xs">
                            {custom.name} ({custom.count})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Text className="font-bold text-lg">{formatCurrency(product.revenue)}</Text>
                <Flex justifyContent="end" className="mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <Text className="text-xs text-green-600 dark:text-green-400">
                    {((product.revenue / data.products.reduce((sum, p) => sum + p.revenue, 0)) * 100).toFixed(1)}%
                  </Text>
                </Flex>
              </div>
            </Flex>
          </Card>
        ))}
      </div>

      {/* Filter impact message */}
      {hasActiveFilters && data.products.length < 3 && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <Text className="text-sm text-yellow-700 dark:text-yellow-300">
              Mostrando apenas {data.products.length} produto{data.products.length > 1 ? 's' : ''} 
              com os filtros aplicados. Ajuste os filtros para ver mais resultados.
            </Text>
          </div>
        </Card>
      )}
    </div>
  )
}