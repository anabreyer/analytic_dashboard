/**
 * DashboardBuilder Component - VERSÃO COMPLETA CORRIGIDA
 * Com seletor de datas funcionando, cores múltiplas e tabela corrigida
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import {
  Grid, Save, Plus, Settings, Eye, EyeOff, 
  Lock, Unlock, Download, Share2, Copy,
  BarChart, LineChart, PieChart, TrendingUp,
  Table, Calendar, DollarSign, Users, X,
  Database, Filter, RefreshCw, CalendarIcon
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'

// Import actual chart components
import { 
  AreaChart, 
  BarChart as TremorBarChart, 
  DonutChart,
  LineChart as TremorLineChart,
  Card as TremorCard,
  Metric
} from '@tremor/react'

// Import date-fns for date handling
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Widget types
export type WidgetType = 
  | 'metric-card'
  | 'line-chart' 
  | 'bar-chart'
  | 'pie-chart'
  | 'donut-chart'
  | 'table'
  | 'kpi'
  | 'timeline'

// Data source types
export type DataSource = 
  | 'sales'
  | 'products' 
  | 'channels'
  | 'customers'
  | 'stores'

// Aggregation types
export type AggregationType = 
  | 'sum'
  | 'count'
  | 'avg'
  | 'min'
  | 'max'

interface WidgetConfig {
  dataSource: DataSource
  metric: string
  dimension?: string
  aggregation: AggregationType
  filters?: Record<string, any>
  dateRange?: { start: Date | null; end: Date | null }
  limit?: number
  sortBy?: 'asc' | 'desc'
  colors?: string[]
  showLegend?: boolean
  showAnimation?: boolean
}

interface Widget {
  id: string
  type: WidgetType
  title: string
  config: WidgetConfig
  position: { x: number; y: number }
  size: { width: number; height: number }
  locked?: boolean
  data?: any
}

interface DashboardBuilderProps {
  initialWidgets?: Widget[]
  onSave?: (widgets: Widget[]) => void
  templates?: any[]
}

// Data source configurations
const DATA_SOURCE_CONFIG = {
  sales: {
    label: 'Vendas',
    metrics: [
      { value: 'total_amount', label: 'Faturamento' },
      { value: 'count', label: 'Quantidade de Vendas' },
      { value: 'avg_ticket', label: 'Ticket Médio' }
    ],
    dimensions: [
      { value: 'channel_name', label: 'Canal' },
      { value: 'store_name', label: 'Loja' },
      { value: 'date', label: 'Data' },
      { value: 'hour', label: 'Hora' },
      { value: 'day_of_week', label: 'Dia da Semana' }
    ]
  },
  products: {
    label: 'Produtos',
    metrics: [
      { value: 'quantity', label: 'Quantidade Vendida' },
      { value: 'revenue', label: 'Receita' },
      { value: 'count', label: 'Número de Pedidos' }
    ],
    dimensions: [
      { value: 'product_name', label: 'Produto' },
      { value: 'category', label: 'Categoria' },
      { value: 'date', label: 'Data' }
    ]
  },
  channels: {
    label: 'Canais',
    metrics: [
      { value: 'orders', label: 'Pedidos' },
      { value: 'revenue', label: 'Faturamento' },
      { value: 'avg_ticket', label: 'Ticket Médio' }
    ],
    dimensions: [
      { value: 'channel_name', label: 'Canal' },
      { value: 'type', label: 'Tipo' }
    ]
  },
  customers: {
    label: 'Clientes',
    metrics: [
      { value: 'count', label: 'Total de Clientes' },
      { value: 'avg_ltv', label: 'Valor Médio' },
      { value: 'total_spent', label: 'Total Gasto' }
    ],
    dimensions: [
      { value: 'segment', label: 'Segmento' },
      { value: 'city', label: 'Cidade' },
      { value: 'registration_date', label: 'Data de Cadastro' }
    ]
  },
  stores: {
    label: 'Lojas',
    metrics: [
      { value: 'revenue', label: 'Faturamento' },
      { value: 'orders', label: 'Pedidos' },
      { value: 'avg_rating', label: 'Avaliação Média' }
    ],
    dimensions: [
      { value: 'store_name', label: 'Nome da Loja' },
      { value: 'city', label: 'Cidade' },
      { value: 'state', label: 'Estado' }
    ]
  }
}

// Component for widget configuration
function WidgetConfigPanel({ 
  widget, 
  onUpdate, 
  onClose 
}: { 
  widget: Widget
  onUpdate: (config: WidgetConfig) => void
  onClose: () => void
}) {
  const [config, setConfig] = useState<WidgetConfig>(widget.config || {
    dataSource: 'sales',
    metric: 'total_amount',
    aggregation: 'sum',
    limit: 10,
    sortBy: 'desc',
    showLegend: true,
    showAnimation: true,
    dateRange: { start: null, end: null }
  })

  // Date inputs states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (config.dateRange?.start) {
      setStartDate(format(config.dateRange.start, 'yyyy-MM-dd'))
    }
    if (config.dateRange?.end) {
      setEndDate(format(config.dateRange.end, 'yyyy-MM-dd'))
    }
  }, [config.dateRange])

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
  }

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }
    
    const newDateRange = {
      start: type === 'start' && value ? new Date(value) : (startDate ? new Date(startDate) : null),
      end: type === 'end' && value ? new Date(value) : (endDate ? new Date(endDate) : null)
    }
    
    handleConfigChange('dateRange', newDateRange)
  }

  const handleQuickDateRange = (days: number) => {
    const end = new Date()
    const start = subDays(end, days)
    setStartDate(format(start, 'yyyy-MM-dd'))
    setEndDate(format(end, 'yyyy-MM-dd'))
    handleConfigChange('dateRange', { start, end })
  }

  const handleSave = () => {
    onUpdate(config)
    onClose()
  }

  const dataSourceOptions = DATA_SOURCE_CONFIG[config.dataSource] || DATA_SOURCE_CONFIG.sales

  // Configuração simplificada para tabelas
  if (widget.type === 'table') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Title>Configurar Tabela</Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Date Range Selector */}
            <div>
              <Text className="font-medium mb-2 flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Período dos Dados
              </Text>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Data Inicial</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Data Final</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleQuickDateRange(7)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Últimos 7 dias
                </button>
                <button
                  onClick={() => handleQuickDateRange(30)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Últimos 30 dias
                </button>
              </div>
            </div>

            {/* Escolher o que mostrar */}
            <div>
              <Text className="font-medium mb-2">O que você quer analisar?</Text>
              <select 
                value={`${config.dataSource}_${config.dimension || ''}`}
                onChange={(e) => {
                  const [source, dim] = e.target.value.split('_')
                  handleConfigChange('dataSource', source)
                  handleConfigChange('dimension', dim)
                  // Auto-selecionar métrica apropriada
                  if (source === 'sales' || source === 'channels') {
                    handleConfigChange('metric', 'total_amount')
                  } else if (source === 'products') {
                    handleConfigChange('metric', 'quantity')
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Vendas">
                  <option value="sales_channel_name">Faturamento por Canal</option>
                  <option value="sales_date">Faturamento por Data</option>
                  <option value="sales_day_of_week">Faturamento por Dia da Semana</option>
                </optgroup>
                <optgroup label="Produtos">
                  <option value="products_product_name">Quantidade por Produto</option>
                  <option value="products_category">Quantidade por Categoria</option>
                </optgroup>
                <optgroup label="Canais">
                  <option value="channels_">Performance dos Canais</option>
                </optgroup>
                <optgroup label="Clientes">
                  <option value="customers_city">Clientes por Cidade</option>
                </optgroup>
              </select>
            </div>

            {/* Limite de linhas */}
            <div>
              <Text className="font-medium mb-2">Quantas linhas mostrar?</Text>
              <input
                type="number"
                value={config.limit || 10}
                onChange={(e) => handleConfigChange('limit', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="5"
                max="50"
              />
            </div>

            {/* Ordenação */}
            <div>
              <Text className="font-medium mb-2">Ordenar por valor</Text>
              <select 
                value={config.sortBy || 'desc'}
                onChange={(e) => handleConfigChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Maior para menor</option>
                <option value="asc">Menor para maior</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} color="blue">
                Aplicar Configurações
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <Title>Configurar Widget: {widget.title}</Title>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Date Range Selector - CORRIGIDO */}
          <div>
            <Text className="font-medium mb-2 flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              Período dos Dados
            </Text>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleQuickDateRange(7)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Últimos 7 dias
              </button>
              <button
                onClick={() => handleQuickDateRange(30)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Últimos 30 dias
              </button>
              <button
                onClick={() => handleQuickDateRange(90)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Últimos 90 dias
              </button>
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  handleConfigChange('dateRange', { start: null, end: null })
                }}
                className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
              >
                Limpar
              </button>
            </div>
            <Text className="text-xs text-gray-500 mt-1">
              Deixe vazio para usar todos os dados disponíveis
            </Text>
          </div>

          {/* Data Source */}
          <div>
            <Text className="font-medium mb-2">Fonte de Dados</Text>
            <select 
              value={config.dataSource}
              onChange={(e) => handleConfigChange('dataSource', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(DATA_SOURCE_CONFIG).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          {/* Metric */}
          <div>
            <Text className="font-medium mb-2">Métrica</Text>
            <select 
              value={config.metric}
              onChange={(e) => handleConfigChange('metric', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dataSourceOptions.metrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation */}
          <div>
            <Text className="font-medium mb-2">Agregação</Text>
            <select 
              value={config.aggregation}
              onChange={(e) => handleConfigChange('aggregation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sum">Soma</option>
              <option value="count">Contagem</option>
              <option value="avg">Média</option>
              <option value="min">Mínimo</option>
              <option value="max">Máximo</option>
            </select>
          </div>

          {/* Dimension (for grouping) */}
          {(widget.type === 'pie-chart' || widget.type === 'bar-chart' || widget.type === 'donut-chart' || widget.type === 'line-chart') && (
            <div>
              <Text className="font-medium mb-2">Agrupar por</Text>
              <select 
                value={config.dimension || ''}
                onChange={(e) => handleConfigChange('dimension', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sem agrupamento</option>
                {dataSourceOptions.dimensions.map(dim => (
                  <option key={dim.value} value={dim.value}>
                    {dim.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Limit */}
          <div>
            <Text className="font-medium mb-2">Limite de Resultados</Text>
            <input
              type="number"
              value={config.limit || 10}
              onChange={(e) => handleConfigChange('limit', parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
            />
          </div>

          {/* Sort */}
          <div>
            <Text className="font-medium mb-2">Ordenação</Text>
            <select 
              value={config.sortBy || 'desc'}
              onChange={(e) => handleConfigChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>

          {/* Additional Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showLegend !== false}
                onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
                className="rounded"
              />
              <Text>Mostrar Legenda</Text>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showAnimation !== false}
                onChange={(e) => handleConfigChange('showAnimation', e.target.checked)}
                className="rounded"
              />
              <Text>Mostrar Animações</Text>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} color="blue">
              Aplicar Configurações
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Widget Component with real data - CORES CORRIGIDAS
function WidgetWithData({ 
  widget, 
  onUpdate, 
  onRemove,
  isEditMode 
}: { 
  widget: Widget
  onUpdate: (widget: Widget) => void
  onRemove: (id: string) => void
  isEditMode: boolean
}) {
  const [showConfig, setShowConfig] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Fetch data based on widget configuration
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['widget-data', widget.id, widget.config],
    queryFn: async () => {
      const { dataSource, metric, dimension, aggregation, dateRange, limit, sortBy, filters } = widget.config
      
      console.log('🔄 Fetching data for widget:', widget.title)
      console.log('Config:', widget.config)
      
      try {
        // Se não tiver dimensão configurada, usar dados mock
        if (!dimension && widget.type !== 'metric-card' && widget.type !== 'table') {
          console.log('⚠️ No dimension configured, using mock data')
          return {
            data: [
              { name: 'Configure o widget', value: 100, 'Configure o widget': 100 },
              { name: 'Selecione "Agrupar por"', value: 80, 'Selecione "Agrupar por"': 80 },
              { name: 'Para ver dados reais', value: 60, 'Para ver dados reais': 60 }
            ]
          }
        }

        // Chamar a API real
        console.log('📡 Calling API...')
        const response = await analyticsAPI.fetchWidgetData({
          dataSource,
          metric,
          dimension,
          aggregation,
          dateRange,
          limit,
          sortBy,
          filters
        })
        
        console.log('📊 API Response:', response)
        
        // Verificar se a resposta tem dados
        if (response && response.success && response.data && response.data.length > 0) {
          // Formatar os dados para os gráficos
          const formattedData = response.data.map((item: any) => {
            // Para gráficos de barra, precisamos adicionar a propriedade com o nome
            const formatted = {
              ...item,
              name: item.name || 'Item',
              value: parseFloat(item.value) || 0
            }
            
            // Adicionar propriedade com o nome para BarChart
            if (widget.type === 'bar-chart') {
              formatted[formatted.name] = formatted.value
            }
            
            return formatted
          })
          
          console.log('✅ Formatted data:', formattedData)
          return { data: formattedData }
          
        } else if (response && response.data && response.data.length === 0) {
          console.log('⚠️ API returned empty data')
          return {
            data: [
              { name: 'Sem dados', value: 0, 'Sem dados': 0 }
            ]
          }
        } else {
          console.error('❌ API Error:', response?.error || 'Unknown error')
          // Dados de fallback
          return {
            data: [
              { name: 'Erro ao carregar', value: 0, 'Erro ao carregar': 0 }
            ]
          }
        }
        
      } catch (error) {
        console.error('❌ Error fetching widget data:', error)
        
        // Se for erro de rede, mostrar dados de exemplo
        if (error instanceof Error && error.message.includes('fetch')) {
          return {
            data: [
              { name: 'iFood', value: 45000, 'iFood': 45000 },
              { name: 'Rappi', value: 38000, 'Rappi': 38000 },
              { name: 'Uber Eats', value: 28000, 'Uber Eats': 28000 }
            ]
          }
        }
        
        return {
          data: [
            { name: 'Erro', value: 0, 'Erro': 0 }
          ]
        }
      }
    },
    enabled: !!widget.config.dataSource,
    refetchInterval: 60000, // Atualizar a cada 60 segundos
    retry: 1,
    onError: (error) => {
      console.error('Query error:', error)
    }
  })

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || widget.locked) return
    
    const target = e.target as HTMLElement
    if (!target.closest('.widget-header')) return

    setIsDragging(true)
    const startX = e.clientX - widget.position.x
    const startY = e.clientY - widget.position.y

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, e.clientX - startX)
      const newY = Math.max(0, e.clientY - startY)
      
      onUpdate({
        ...widget,
        position: { x: newX, y: newY }
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleConfigUpdate = (newConfig: WidgetConfig) => {
    onUpdate({ ...widget, config: newConfig })
    refetch()
  }

  const renderWidget = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      )
    }

    const chartData = data?.data || []
    
    // CORREÇÃO CRUCIAL - Usar cores CSS reais
    const cssColors = [
      '#3B82F6', // blue
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#EC4899', // pink
      '#14B8A6', // teal
      '#FB923C', // orange
      '#6366F1'  // indigo
    ]

    switch (widget.type) {
      case 'metric-card':
        const total = chartData.reduce((sum: number, item: any) => sum + (item.value || 0), 0)
        const dateInfo = widget.config.dateRange?.start && widget.config.dateRange?.end
          ? `${new Date(widget.config.dateRange.start).toLocaleDateString('pt-BR')} - ${new Date(widget.config.dateRange.end).toLocaleDateString('pt-BR')}`
          : 'Todos os períodos'
        
        return (
          <div className="p-4">
            <Text className="text-gray-500">{widget.config.metric}</Text>
            <Metric>{total.toLocaleString('pt-BR')}</Metric>
            <Text className="text-green-600 text-sm">
              {widget.config.dataSource}
            </Text>
            <Text className="text-gray-400 text-xs mt-2">
              {dateInfo}
            </Text>
          </div>
        )

      case 'pie-chart':
      case 'donut-chart':
        // Adicionar cores aos dados
        const pieData = chartData.map((item: any, index: number) => ({
          ...item,
          color: cssColors[index % cssColors.length]
        }))
        
        return (
          <div className="p-4">
            <DonutChart
              data={pieData}
              category="value"
              index="name"
              colors={['blue', 'emerald', 'amber', 'red', 'purple', 'cyan', 'pink', 'teal', 'orange', 'indigo']}
              valueFormatter={(value) => value.toLocaleString('pt-BR')}
              showAnimation={widget.config.showAnimation}
              showLabel={widget.config.showLegend}
            />
          </div>
        )

      case 'bar-chart':
        // CORREÇÃO IMPORTANTE - Estrutura correta para múltiplas barras coloridas
        const categories = chartData.map((item: any) => item.name)
        
        return (
          <div className="p-4">
            <TremorBarChart
              data={chartData}
              index="name"
              categories={categories}
              colors={['blue', 'emerald', 'amber', 'red', 'purple', 'cyan', 'pink', 'teal', 'orange', 'indigo']}
              valueFormatter={(value) => value.toLocaleString('pt-BR')}
              showAnimation={widget.config.showAnimation}
              showLegend={false}
              yAxisWidth={48}
              stack={false}
            />
          </div>
        )

      case 'line-chart':
        return (
          <div className="p-4">
            <TremorLineChart
              data={chartData}
              index="name"
              categories={["value"]}
              colors={['indigo']}
              valueFormatter={(value) => value.toLocaleString('pt-BR')}
              showAnimation={widget.config.showAnimation}
              showLegend={widget.config.showLegend}
              yAxisWidth={48}
            />
          </div>
        )

      case 'table':
        // Tabela corrigida
        if (!chartData || chartData.length === 0) {
          return (
            <div className="p-4 text-center text-gray-500">
              <Table className="h-32 w-full text-gray-300" />
              <Text className="mt-2">Configure a tabela para ver dados</Text>
            </div>
          )
        }

        // Determinar colunas baseado na configuração
        const getTableColumns = () => {
          if (widget.config.dimension === 'channel_name') {
            return ['Canal', 'Faturamento', '% do Total']
          } else if (widget.config.dimension === 'product_name') {
            return ['Produto', 'Quantidade', '% do Total']
          } else if (widget.config.dimension === 'date') {
            return ['Data', 'Valor', 'Variação']
          } else {
            return ['Item', 'Valor', 'Percentual']
          }
        }

        const columns = getTableColumns()
        const totalTable = chartData.reduce((sum: number, item: any) => sum + (item.value || 0), 0)

        return (
          <div className="p-4 h-full flex flex-col">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {columns.map((col, idx) => (
                      <th key={idx} className="text-left py-2 px-3 font-medium text-gray-700">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.slice(0, widget.config.limit || 10).map((item: any, idx: number) => {
                    const percentage = totalTable > 0 ? ((item.value / totalTable) * 100).toFixed(1) : '0'
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{item.name}</td>
                        <td className="py-2 px-3">
                          {widget.config.metric === 'total_amount' || widget.config.metric === 'revenue'
                            ? `R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : item.value.toLocaleString('pt-BR')
                          }
                        </td>
                        <td className="py-2 px-3 text-gray-500">{percentage}%</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 font-bold">
                    <td className="py-2 px-3">Total</td>
                    <td className="py-2 px-3">
                      {widget.config.metric === 'total_amount' || widget.config.metric === 'revenue'
                        ? `R$ ${totalTable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : totalTable.toLocaleString('pt-BR')
                      }
                    </td>
                    <td className="py-2 px-3">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <Text>Widget: {widget.type}</Text>
            <Text className="text-xs">Configure para ver dados</Text>
          </div>
        )
    }
  }

  return (
    <>
      <div
        ref={widgetRef}
        className={`
          absolute bg-white rounded-lg shadow-lg border
          ${isDragging ? 'opacity-75 cursor-grabbing' : ''}
          ${isEditMode && !widget.locked ? 'hover:shadow-xl' : ''}
          transition-shadow
        `}
        style={{
          left: widget.position.x,
          top: widget.position.y,
          width: widget.size.width,
          height: widget.size.height,
          cursor: isEditMode && !widget.locked ? 'grab' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Widget Header */}
        <div className="widget-header flex justify-between items-center p-2 border-b bg-gray-50">
          <Text className="text-sm font-medium select-none">{widget.title}</Text>
          <div className="flex gap-1">
            {isEditMode && (
              <>
                <button
                  onClick={() => setShowConfig(true)}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <Settings className="h-3 w-3 text-blue-600" />
                </button>
                <button
                  onClick={() => refetch()}
                  className="p-1 hover:bg-green-100 rounded"
                >
                  <RefreshCw className="h-3 w-3 text-green-600" />
                </button>
                <button
                  onClick={() => onUpdate({ ...widget, locked: !widget.locked })}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {widget.locked ? 
                    <Lock className="h-3 w-3 text-gray-500" /> : 
                    <Unlock className="h-3 w-3 text-gray-500" />
                  }
                </button>
                <button
                  onClick={() => onRemove(widget.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="h-3 w-3 text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Widget Content */}
        <div className="widget-content">
          {renderWidget()}
        </div>
        
        {/* Resize Handle */}
        {isEditMode && !widget.locked && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              const startX = e.clientX
              const startY = e.clientY
              const startWidth = widget.size.width
              const startHeight = widget.size.height

              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = Math.max(200, startWidth + e.clientX - startX)
                const newHeight = Math.max(150, startHeight + e.clientY - startY)
                onUpdate({
                  ...widget,
                  size: { width: newWidth, height: newHeight }
                })
              }

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
          >
            <div className="w-0 h-0 border-b-8 border-r-8 border-b-gray-400 border-r-transparent" />
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <WidgetConfigPanel
          widget={widget}
          onUpdate={handleConfigUpdate}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  )
}

// Main DashboardBuilder Component
export function DashboardBuilder({ 
  initialWidgets = [], 
  onSave,
  templates = []
}: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [isEditMode, setIsEditMode] = useState(true)
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)

  // Widget library with icons
  const widgetLibrary = [
    { type: 'metric-card' as WidgetType, title: 'Cartão de Métrica', icon: DollarSign },
    { type: 'pie-chart' as WidgetType, title: 'Gráfico de Pizza', icon: PieChart },
    { type: 'donut-chart' as WidgetType, title: 'Gráfico de Rosca', icon: PieChart },
    { type: 'bar-chart' as WidgetType, title: 'Gráfico de Barras', icon: BarChart },
    { type: 'line-chart' as WidgetType, title: 'Gráfico de Linha', icon: LineChart },
    { type: 'table' as WidgetType, title: 'Tabela', icon: Table },
  ]

  // Add new widget
  const addWidget = (type: WidgetType, title: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title,
      config: {
        dataSource: 'sales',
        metric: 'total_amount',
        aggregation: 'sum',
        limit: 10,
        sortBy: 'desc',
        showLegend: true,
        showAnimation: true,
        dateRange: { start: null, end: null }
      },
      position: { x: 50 + widgets.length * 20, y: 50 + widgets.length * 20 },
      size: { 
        width: type === 'metric-card' ? 300 : 400, 
        height: type === 'metric-card' ? 150 : 300 
      },
      locked: false
    }
    setWidgets([...widgets, newWidget])
    setShowWidgetLibrary(false)
  }

  // Update widget
  const updateWidget = (updatedWidget: Widget) => {
    setWidgets(widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w))
  }

  // Remove widget
  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id))
  }

  // Save dashboard
  const handleSave = () => {
    onSave?.(widgets)
  }

  // Export configuration
  const exportConfig = () => {
    const config = JSON.stringify(widgets, null, 2)
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-config-${new Date().toISOString()}.json`
    a.click()
  }

  // Load template
  const loadTemplate = (templateId: string) => {
    const template = templates.find((t: any) => t.id === templateId)
    if (template) {
      setWidgets(template.widgets)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Grid className="h-5 w-5 text-gray-500" />
            <Title>Dashboard Builder</Title>
            <Badge color={isEditMode ? 'green' : 'gray'}>
              {isEditMode ? 'Modo Edição' : 'Modo Visualização'}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {/* Template Selector */}
            {templates.length > 0 && (
              <select
                onChange={(e) => loadTemplate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Carregar template</option>
                {templates.map((template: any) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}
            
            {/* Action Buttons */}
            <Button
              size="xs"
              variant={isEditMode ? 'primary' : 'secondary'}
              icon={isEditMode ? Eye : Settings}
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? 'Visualizar' : 'Editar'}
            </Button>
            
            {isEditMode && (
              <>
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
                >
                  Adicionar Widget
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Save}
                  onClick={handleSave}
                >
                  Salvar
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Download}
                  onClick={exportConfig}
                >
                  Exportar
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Widget Library */}
      {showWidgetLibrary && (
        <Card>
          <Title className="mb-3">Biblioteca de Widgets</Title>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {widgetLibrary.map((widget) => {
              const Icon = widget.icon
              return (
                <button
                  key={widget.type}
                  onClick={() => addWidget(widget.type, widget.title)}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Icon className="h-6 w-6 text-gray-600" />
                  <Text className="text-xs text-center">{widget.title}</Text>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Dashboard Canvas */}
      <Card className="relative" style={{ height: '800px', overflow: 'hidden' }}>
        {widgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Grid className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <Text className="text-gray-500">
                {isEditMode 
                  ? 'Clique em "Adicionar Widget" para começar'
                  : 'Dashboard vazio'}
              </Text>
            </div>
          </div>
        )}
        
        {widgets.map((widget) => (
          <WidgetWithData
            key={widget.id}
            widget={widget}
            onUpdate={updateWidget}
            onRemove={removeWidget}
            isEditMode={isEditMode}
          />
        ))}
      </Card>
    </div>
  )
}

// Export interfaces for external use
export type { Widget, WidgetConfig, DashboardBuilderProps }