/**
 * PeriodComparison Component
 * Compara dois períodos de tempo lado a lado com insights automáticos
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Title,
  Text,
  Button,
  Badge,
  BarChart,
  LineChart,
  DonutChart,
  Metric,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@tremor/react'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Activity,
  ShoppingCart,
  Users,
  DollarSign
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Tipos
interface ComparisonData {
  metric: string
  period1Value: number
  period2Value: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'neutral'
}

interface TimelineData {
  date: string
  period1: number
  period2: number
}

interface CategoryData {
  name: string
  period1: number
  period2: number
  change: number
}

// Configurações de períodos pré-definidos
const PERIOD_PRESETS = {
  TODAY_VS_YESTERDAY: {
    label: 'Hoje vs Ontem',
    getPeriods: () => {
      const today = new Date()
      const yesterday = subDays(today, 1)
      return {
        period1: { start: today, end: today },
        period2: { start: yesterday, end: yesterday }
      }
    }
  },
  THIS_WEEK_VS_LAST: {
    label: 'Esta Semana vs Semana Passada',
    getPeriods: () => {
      const now = new Date()
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
      const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
      return {
        period1: { start: thisWeekStart, end: thisWeekEnd },
        period2: { start: lastWeekStart, end: lastWeekEnd }
      }
    }
  },
  THIS_MONTH_VS_LAST: {
    label: 'Este Mês vs Mês Passado',
    getPeriods: () => {
      const now = new Date()
      const thisMonthStart = startOfMonth(now)
      const thisMonthEnd = endOfMonth(now)
      const lastMonthStart = startOfMonth(subMonths(now, 1))
      const lastMonthEnd = endOfMonth(subMonths(now, 1))
      return {
        period1: { start: thisMonthStart, end: thisMonthEnd },
        period2: { start: lastMonthStart, end: lastMonthEnd }
      }
    }
  },
  LAST_7_DAYS_VS_PREVIOUS: {
    label: 'Últimos 7 dias vs 7 dias anteriores',
    getPeriods: () => {
      const now = new Date()
      const last7DaysEnd = now
      const last7DaysStart = subDays(now, 6)
      const previous7DaysEnd = subDays(now, 7)
      const previous7DaysStart = subDays(now, 13)
      return {
        period1: { start: last7DaysStart, end: last7DaysEnd },
        period2: { start: previous7DaysStart, end: previous7DaysEnd }
      }
    }
  },
  LAST_30_DAYS_VS_PREVIOUS: {
    label: 'Últimos 30 dias vs 30 dias anteriores',
    getPeriods: () => {
      const now = new Date()
      const last30DaysEnd = now
      const last30DaysStart = subDays(now, 29)
      const previous30DaysEnd = subDays(now, 30)
      const previous30DaysStart = subDays(now, 59)
      return {
        period1: { start: last30DaysStart, end: last30DaysEnd },
        period2: { start: previous30DaysStart, end: previous30DaysEnd }
      }
    }
  }
}

export function PeriodComparison() {
  const [selectedPreset, setSelectedPreset] = useState('THIS_MONTH_VS_LAST')
  const [period1, setPeriod1] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() })
  const [period2, setPeriod2] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() })
  const [customMode, setCustomMode] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)

  // Aplicar preset selecionado
  useEffect(() => {
    if (!customMode && PERIOD_PRESETS[selectedPreset as keyof typeof PERIOD_PRESETS]) {
      const periods = PERIOD_PRESETS[selectedPreset as keyof typeof PERIOD_PRESETS].getPeriods()
      setPeriod1(periods.period1)
      setPeriod2(periods.period2)
    }
  }, [selectedPreset, customMode])

  // Query para dados do período 1
  const { data: dataPeriod1, isLoading: loading1, refetch: refetch1 } = useQuery({
    queryKey: ['period-comparison-1', period1],
    queryFn: async () => {
      const response = await analyticsAPI.getOverview({
        start_date: period1.start,
        end_date: period1.end
      })
      return response
    }
  })

  // Query para dados do período 2
  const { data: dataPeriod2, isLoading: loading2, refetch: refetch2 } = useQuery({
    queryKey: ['period-comparison-2', period2],
    queryFn: async () => {
      const response = await analyticsAPI.getOverview({
        start_date: period2.start,
        end_date: period2.end
      })
      return response
    }
  })

  // Query para timeline comparativo
  const { data: timelineData, isLoading: loadingTimeline } = useQuery({
    queryKey: ['period-timeline', period1, period2],
    queryFn: async () => {
      const [timeline1, timeline2] = await Promise.all([
        analyticsAPI.getTimeline({
          start_date: period1.start,
          end_date: period1.end,
          granularity: 'day'
        }),
        analyticsAPI.getTimeline({
          start_date: period2.start,
          end_date: period2.end,
          granularity: 'day'
        })
      ])
      return { timeline1, timeline2 }
    }
  })

  // Query para produtos comparativo
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['period-products', period1, period2],
    queryFn: async () => {
      const [products1, products2] = await Promise.all([
        analyticsAPI.getTopProducts({
          start_date: period1.start,
          end_date: period1.end,
          limit: 10
        }),
        analyticsAPI.getTopProducts({
          start_date: period2.start,
          end_date: period2.end,
          limit: 10
        })
      ])
      return { products1, products2 }
    }
  })

  // Query para canais comparativo
  const { data: channelsData, isLoading: loadingChannels } = useQuery({
    queryKey: ['period-channels', period1, period2],
    queryFn: async () => {
      const [channels1, channels2] = await Promise.all([
        analyticsAPI.getChannels({
          start_date: period1.start,
          end_date: period1.end
        }),
        analyticsAPI.getChannels({
          start_date: period2.start,
          end_date: period2.end
        })
      ])
      return { channels1, channels2 }
    }
  })

  const isLoading = loading1 || loading2 || loadingTimeline || loadingProducts || loadingChannels

  // Calcular métricas de comparação
  const getComparisonMetrics = (): ComparisonData[] => {
    if (!dataPeriod1 || !dataPeriod2) return []

    const metrics1 = dataPeriod1.metrics
    const metrics2 = dataPeriod2.metrics

    return [
      {
        metric: 'Faturamento Total',
        period1Value: metrics1.total_revenue.value,
        period2Value: metrics2.total_revenue.value,
        change: metrics1.total_revenue.value - metrics2.total_revenue.value,
        changePercent: metrics2.total_revenue.value > 0 
          ? ((metrics1.total_revenue.value - metrics2.total_revenue.value) / metrics2.total_revenue.value) * 100
          : 0,
        trend: metrics1.total_revenue.value > metrics2.total_revenue.value ? 'up' : 
               metrics1.total_revenue.value < metrics2.total_revenue.value ? 'down' : 'neutral'
      },
      {
        metric: 'Número de Pedidos',
        period1Value: metrics1.total_orders.value,
        period2Value: metrics2.total_orders.value,
        change: metrics1.total_orders.value - metrics2.total_orders.value,
        changePercent: metrics2.total_orders.value > 0
          ? ((metrics1.total_orders.value - metrics2.total_orders.value) / metrics2.total_orders.value) * 100
          : 0,
        trend: metrics1.total_orders.value > metrics2.total_orders.value ? 'up' :
               metrics1.total_orders.value < metrics2.total_orders.value ? 'down' : 'neutral'
      },
      {
        metric: 'Ticket Médio',
        period1Value: metrics1.avg_ticket.value,
        period2Value: metrics2.avg_ticket.value,
        change: metrics1.avg_ticket.value - metrics2.avg_ticket.value,
        changePercent: metrics2.avg_ticket.value > 0
          ? ((metrics1.avg_ticket.value - metrics2.avg_ticket.value) / metrics2.avg_ticket.value) * 100
          : 0,
        trend: metrics1.avg_ticket.value > metrics2.avg_ticket.value ? 'up' :
               metrics1.avg_ticket.value < metrics2.avg_ticket.value ? 'down' : 'neutral'
      },
      {
        metric: 'Clientes Únicos',
        period1Value: metrics1.unique_customers.value,
        period2Value: metrics2.unique_customers.value,
        change: metrics1.unique_customers.value - metrics2.unique_customers.value,
        changePercent: metrics2.unique_customers.value > 0
          ? ((metrics1.unique_customers.value - metrics2.unique_customers.value) / metrics2.unique_customers.value) * 100
          : 0,
        trend: metrics1.unique_customers.value > metrics2.unique_customers.value ? 'up' :
               metrics1.unique_customers.value < metrics2.unique_customers.value ? 'down' : 'neutral'
      }
    ]
  }

  // Preparar dados do timeline para o gráfico
  const prepareTimelineData = (): TimelineData[] => {
    if (!timelineData) return []
    
    const { timeline1, timeline2 } = timelineData
    const data: TimelineData[] = []
    
    // Combinar dados dos dois períodos
    for (let i = 0; i < Math.max(timeline1.data.length, timeline2.data.length); i++) {
      data.push({
        date: `Dia ${i + 1}`,
        period1: timeline1.data[i]?.revenue || 0,
        period2: timeline2.data[i]?.revenue || 0
      })
    }
    
    return data
  }

  // Preparar dados de produtos para comparação
  const prepareProductsData = (): CategoryData[] => {
    if (!productsData) return []
    
    const { products1, products2 } = productsData
    const productsMap = new Map<string, CategoryData>()
    
    // Adicionar produtos do período 1
    products1.products.forEach((product: any) => {
      productsMap.set(product.name, {
        name: product.name,
        period1: product.revenue,
        period2: 0,
        change: 0
      })
    })
    
    // Adicionar/atualizar com produtos do período 2
    products2.products.forEach((product: any) => {
      const existing = productsMap.get(product.name) || {
        name: product.name,
        period1: 0,
        period2: 0,
        change: 0
      }
      existing.period2 = product.revenue
      existing.change = ((existing.period1 - existing.period2) / (existing.period2 || 1)) * 100
      productsMap.set(product.name, existing)
    })
    
    return Array.from(productsMap.values()).sort((a, b) => (b.period1 + b.period2) - (a.period1 + a.period2)).slice(0, 10)
  }

  // Preparar dados de canais para comparação
  const prepareChannelsData = (): CategoryData[] => {
    if (!channelsData) return []
    
    const { channels1, channels2 } = channelsData
    const channelsMap = new Map<string, CategoryData>()
    
    // Adicionar canais do período 1
    channels1.channels.forEach((channel: any) => {
      channelsMap.set(channel.name, {
        name: channel.name,
        period1: channel.revenue,
        period2: 0,
        change: 0
      })
    })
    
    // Adicionar/atualizar com canais do período 2
    channels2.channels.forEach((channel: any) => {
      const existing = channelsMap.get(channel.name) || {
        name: channel.name,
        period1: 0,
        period2: 0,
        change: 0
      }
      existing.period2 = channel.revenue
      existing.change = ((existing.period1 - existing.period2) / (existing.period2 || 1)) * 100
      channelsMap.set(channel.name, existing)
    })
    
    return Array.from(channelsMap.values())
  }

  // Gerar insights automáticos
  const generateInsights = () => {
    const metrics = getComparisonMetrics()
    const insights = []
    
    if (metrics.length > 0) {
      // Insight de faturamento
      const revenueMetric = metrics[0]
      if (revenueMetric.changePercent > 20) {
        insights.push({
          type: 'success',
          icon: TrendingUp,
          title: 'Crescimento Excepcional!',
          description: `Faturamento aumentou ${revenueMetric.changePercent.toFixed(1)}% em relação ao período anterior.`
        })
      } else if (revenueMetric.changePercent < -20) {
        insights.push({
          type: 'warning',
          icon: TrendingDown,
          title: 'Atenção ao Faturamento',
          description: `Queda de ${Math.abs(revenueMetric.changePercent).toFixed(1)}% no faturamento comparado ao período anterior.`
        })
      }
      
      // Insight de ticket médio
      const ticketMetric = metrics[2]
      if (ticketMetric && ticketMetric.changePercent > 10) {
        insights.push({
          type: 'info',
          icon: ArrowUp,
          title: 'Ticket Médio em Alta',
          description: `Clientes estão gastando ${ticketMetric.changePercent.toFixed(1)}% mais por pedido.`
        })
      }
      
      // Insight de clientes
      const customersMetric = metrics[3]
      if (customersMetric && customersMetric.change > 0) {
        insights.push({
          type: 'success',
          icon: Users,
          title: 'Base de Clientes Crescendo',
          description: `${customersMetric.change} novos clientes únicos comparado ao período anterior.`
        })
      }
    }
    
    return insights
  }

  const handleRefresh = () => {
    refetch1()
    refetch2()
  }

  const comparisonMetrics = getComparisonMetrics()
  const timelineChartData = prepareTimelineData()
  const productsChartData = prepareProductsData()
  const channelsChartData = prepareChannelsData()
  const insights = generateInsights()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-start mb-6">
          <div>
            <Title>Comparação de Períodos</Title>
            <Text>Analise a evolução do seu negócio comparando diferentes períodos</Text>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              icon={RefreshCw}
              onClick={handleRefresh}
            >
              Atualizar
            </Button>
          </div>
        </div>

        {/* Seletor de Períodos */}
        <div className="space-y-4">
          {/* Presets */}
          <div>
            <Text className="mb-2 font-medium">Períodos Rápidos:</Text>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PERIOD_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPreset(key)
                    setCustomMode(false)
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedPreset === key && !customMode
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setCustomMode(true)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  customMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Personalizado
              </button>
            </div>
          </div>

          {/* Datas Selecionadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Text className="font-medium text-blue-900 mb-2">Período Atual</Text>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <Text className="text-blue-700">
                  {format(period1.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(period1.end, 'dd/MM/yyyy', { locale: ptBR })}
                </Text>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text className="font-medium text-gray-900 mb-2">Período Anterior</Text>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <Text className="text-gray-700">
                  {format(period2.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(period2.end, 'dd/MM/yyyy', { locale: ptBR })}
                </Text>
              </div>
            </div>
          </div>

          {/* Seletores Personalizados (se ativo) */}
          {customMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <Text className="font-medium mb-2">Período 1 (Atual)</Text>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={format(period1.start, 'yyyy-MM-dd')}
                    onChange={(e) => setPeriod1({ ...period1, start: new Date(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    value={format(period1.end, 'yyyy-MM-dd')}
                    onChange={(e) => setPeriod1({ ...period1, end: new Date(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <Text className="font-medium mb-2">Período 2 (Comparação)</Text>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={format(period2.start, 'yyyy-MM-dd')}
                    onChange={(e) => setPeriod2({ ...period2, start: new Date(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    value={format(period2.end, 'yyyy-MM-dd')}
                    onChange={(e) => setPeriod2({ ...period2, end: new Date(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            <Text className="ml-3">Carregando dados de comparação...</Text>
          </div>
        </Card>
      )}

      {/* Métricas de Comparação */}
      {!isLoading && comparisonMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparisonMetrics.map((metric, idx) => {
            const Icon = idx === 0 ? DollarSign : 
                        idx === 1 ? ShoppingCart :
                        idx === 2 ? Activity : Users
            
            return (
              <Card key={metric.metric}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <Text className="font-medium">{metric.metric}</Text>
                    </div>
                    <div className="space-y-3">
                      {/* Período Atual */}
                      <div>
                        <Text className="text-xs text-gray-500">Período Atual</Text>
                        <Metric className="text-xl">
                          {metric.metric.includes('Faturamento') || metric.metric.includes('Ticket') 
                            ? `R$ ${metric.period1Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : metric.period1Value.toLocaleString('pt-BR')
                          }
                        </Metric>
                      </div>
                      {/* Período Anterior */}
                      <div>
                        <Text className="text-xs text-gray-500">Período Anterior</Text>
                        <Text className="text-gray-600">
                          {metric.metric.includes('Faturamento') || metric.metric.includes('Ticket')
                            ? `R$ ${metric.period2Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : metric.period2Value.toLocaleString('pt-BR')
                          }
                        </Text>
                      </div>
                    </div>
                  </div>
                  {/* Badge de Mudança */}
                  <Badge
                    color={metric.trend === 'up' ? 'emerald' : metric.trend === 'down' ? 'red' : 'gray'}
                    icon={metric.trend === 'up' ? ArrowUp : metric.trend === 'down' ? ArrowDown : Minus}
                  >
                    {Math.abs(metric.changePercent).toFixed(1)}%
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Insights Automáticos */}
      {!isLoading && insights.length > 0 && (
        <Card>
          <Title className="mb-4">Insights da Comparação</Title>
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              const Icon = insight.icon
              const bgColor = insight.type === 'success' ? 'bg-emerald-50' :
                             insight.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
              const textColor = insight.type === 'success' ? 'text-emerald-900' :
                               insight.type === 'warning' ? 'text-amber-900' : 'text-blue-900'
              const iconColor = insight.type === 'success' ? 'text-emerald-600' :
                               insight.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
              
              return (
                <div key={idx} className={`p-4 rounded-lg ${bgColor}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                    <div>
                      <Text className={`font-medium ${textColor}`}>{insight.title}</Text>
                      <Text className={`text-sm mt-1 ${textColor} opacity-80`}>{insight.description}</Text>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Tabs com Gráficos Comparativos */}
      {!isLoading && (
        <Card>
          <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
            <TabList className="mb-4">
              <Tab>Timeline</Tab>
              <Tab>Produtos</Tab>
              <Tab>Canais</Tab>
              <Tab>Tabela Detalhada</Tab>
            </TabList>
            <TabPanels>
              {/* Timeline */}
              <TabPanel>
                <div className="space-y-4">
                  <div>
                    <Text className="font-medium mb-1">Evolução do Faturamento</Text>
                    <Text className="text-sm text-gray-500">Comparação dia a dia entre os períodos</Text>
                  </div>
                  <LineChart
                    data={timelineChartData}
                    index="date"
                    categories={["period1", "period2"]}
                    colors={["blue", "gray"]}
                    valueFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    showLegend={true}
                    showAnimation={true}
                  />
                </div>
              </TabPanel>

              {/* Produtos */}
              <TabPanel>
                <div className="space-y-4">
                  <div>
                    <Text className="font-medium mb-1">Top 10 Produtos</Text>
                    <Text className="text-sm text-gray-500">Comparação de vendas por produto</Text>
                  </div>
                  <BarChart
                    data={productsChartData}
                    index="name"
                    categories={["period1", "period2"]}
                    colors={["blue", "gray"]}
                    valueFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    showLegend={true}
                    layout="vertical"
                    yAxisWidth={150}
                  />
                </div>
              </TabPanel>

              {/* Canais */}
              <TabPanel>
                <div className="space-y-4">
                  <div>
                    <Text className="font-medium mb-1">Performance por Canal</Text>
                    <Text className="text-sm text-gray-500">Comparação de faturamento por canal de venda</Text>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Período Atual */}
                    <div>
                      <Text className="text-center font-medium mb-3">Período Atual</Text>
                      <DonutChart
                        data={channelsChartData.map(c => ({ name: c.name, value: c.period1 }))}
                        category="value"
                        index="name"
                        valueFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                        colors={["blue", "emerald", "amber", "red", "purple"]}
                        showLabel={true}
                      />
                    </div>
                    {/* Período Anterior */}
                    <div>
                      <Text className="text-center font-medium mb-3">Período Anterior</Text>
                      <DonutChart
                        data={channelsChartData.map(c => ({ name: c.name, value: c.period2 }))}
                        category="value"
                        index="name"
                        valueFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                        colors={["gray", "slate", "zinc", "neutral", "stone"]}
                        showLabel={true}
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Tabela Detalhada */}
              <TabPanel>
                <div className="space-y-4">
                  <div>
                    <Text className="font-medium mb-1">Comparação Detalhada</Text>
                    <Text className="text-sm text-gray-500">Todos os indicadores lado a lado</Text>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Métrica</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Período Atual</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Período Anterior</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Variação</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonMetrics.map((metric, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{metric.metric}</td>
                            <td className="text-right py-3 px-4">
                              {metric.metric.includes('Faturamento') || metric.metric.includes('Ticket')
                                ? `R$ ${metric.period1Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : metric.period1Value.toLocaleString('pt-BR')
                              }
                            </td>
                            <td className="text-right py-3 px-4 text-gray-600">
                              {metric.metric.includes('Faturamento') || metric.metric.includes('Ticket')
                                ? `R$ ${metric.period2Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : metric.period2Value.toLocaleString('pt-BR')
                              }
                            </td>
                            <td className="text-right py-3 px-4">
                              <span className={metric.trend === 'up' ? 'text-emerald-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                                {metric.trend === 'up' && '+'}
                                {metric.metric.includes('Faturamento') || metric.metric.includes('Ticket')
                                  ? `R$ ${metric.change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                  : metric.change.toLocaleString('pt-BR')
                                }
                              </span>
                            </td>
                            <td className="text-right py-3 px-4">
                              <Badge
                                color={metric.trend === 'up' ? 'emerald' : metric.trend === 'down' ? 'red' : 'gray'}
                                size="xs"
                              >
                                {metric.trend === 'up' && '+'}
                                {metric.changePercent.toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>
      )}
    </div>
  )
}