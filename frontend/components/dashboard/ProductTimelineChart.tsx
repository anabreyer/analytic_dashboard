/**
 * ProductTimelineChart Component
 * Mostra a evolução de vendas de um produto específico ao longo do tempo
 */

'use client'

import { Card, Title, Text, AreaChart, Select, SelectItem, Button, Badge, Flex } from '@tremor/react'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { analyticsAPI } from '@/lib/api'
import { TrendingUp, Package, Calendar, Search } from 'lucide-react'
import { LoadingCard } from '@/components/ui/LoadingCard'

interface ProductTimelineChartProps {
  startDate: Date | null
  endDate: Date | null
  storeId: number | null
  filters?: Record<string, any>
}

export function ProductTimelineChart({ 
  startDate, 
  endDate, 
  storeId,
  filters 
}: ProductTimelineChartProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [granularity, setGranularity] = useState('day')

  // Buscar lista de produtos
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-list', storeId],
    queryFn: async () => {
      const response = await analyticsAPI.getProductsList({ store_id: storeId })
      return response
    }
  })

  // Buscar dados do produto selecionado
  const { data: timelineData, isLoading: loadingTimeline } = useQuery({
    queryKey: ['product-timeline', selectedProduct, startDate, endDate, granularity, filters],
    queryFn: async () => {
      if (!selectedProduct) return null
      
      const response = await analyticsAPI.getProductTimeline({
        product_id: selectedProduct,
        start_date: startDate,
        end_date: endDate,
        granularity,
        ...filters
      })
      return response
    },
    enabled: !!selectedProduct
  })

  // Filtrar produtos baseado na busca
  const filteredProducts = productsData?.products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Formatar dados para o gráfico
  const chartData = timelineData?.data?.map(point => ({
    date: new Date(point.period).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    }),
    'Quantidade': point.quantity,
    'Receita': point.revenue,
    'Pedidos': point.orders
  })) || []

  // Calcular métricas resumidas
  const totalQuantity = timelineData?.data?.reduce((sum, d) => sum + d.quantity, 0) || 0
  const totalRevenue = timelineData?.data?.reduce((sum, d) => sum + d.revenue, 0) || 0
  const totalOrders = timelineData?.data?.reduce((sum, d) => sum + d.orders, 0) || 0
  const avgPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0

  if (loadingProducts) {
    return <LoadingCard />
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <Flex justifyContent="start" alignItems="center" className="gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            <Title>Análise de Produto ao Longo do Tempo</Title>
          </Flex>
          <Text className="mt-1">Acompanhe a evolução de vendas de um produto específico</Text>
        </div>

        {/* Seletor de Produto */}
        <div className="space-y-3">
          <div className="flex gap-3">
            {/* Campo de busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Granularidade */}
            <Select
              value={granularity}
              onValueChange={setGranularity}
              placeholder="Período"
              className="w-32"
            >
              <SelectItem value="hour">Hora</SelectItem>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </Select>
          </div>

          {/* Lista de produtos */}
          {searchTerm && (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 20).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product.id)
                      setSearchTerm(product.name)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <Text className="font-medium">{product.name}</Text>
                        <Text className="text-xs text-gray-500">
                          {product.category || 'Sem categoria'}
                        </Text>
                      </div>
                      <Badge color="gray">
                        {product.total_sold || 0} vendidos
                      </Badge>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhum produto encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {/* Produto Selecionado */}
        {selectedProduct && (
          <>
            {/* Métricas do Produto */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <Text className="text-xs text-gray-600">Total Vendido</Text>
                <Text className="text-lg font-bold text-blue-600">
                  {totalQuantity}
                </Text>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <Text className="text-xs text-gray-600">Receita Total</Text>
                <Text className="text-lg font-bold text-green-600">
                  R$ {totalRevenue.toFixed(2)}
                </Text>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <Text className="text-xs text-gray-600">Total de Pedidos</Text>
                <Text className="text-lg font-bold text-amber-600">
                  {totalOrders}
                </Text>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <Text className="text-xs text-gray-600">Preço Médio</Text>
                <Text className="text-lg font-bold text-purple-600">
                  R$ {avgPrice.toFixed(2)}
                </Text>
              </div>
            </div>

            {/* Gráfico */}
            {loadingTimeline ? (
              <div className="h-72 flex items-center justify-center">
                <Text className="text-gray-500">Carregando dados...</Text>
              </div>
            ) : chartData.length > 0 ? (
              <AreaChart
                className="h-72"
                data={chartData}
                index="date"
                categories={["Quantidade"]}
                colors={["blue"]}
                showLegend={true}
                showGridLines={true}
                showAnimation={true}
                curveType="natural"
              />
            ) : (
              <div className="h-72 flex items-center justify-center">
                <Text className="text-gray-500">
                  Nenhuma venda encontrada para este produto no período selecionado
                </Text>
              </div>
            )}
          </>
        )}

        {/* Mensagem quando nenhum produto está selecionado */}
        {!selectedProduct && (
          <div className="h-72 flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-gray-300 mb-3" />
            <Text className="text-gray-500">
              Digite o nome do produto que deseja analisar
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Ex: "Pudim P #019", "X-Burger", "Coca-Cola"
            </Text>
          </div>
        )}
      </div>
    </Card>
  )
}