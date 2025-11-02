/**
 * IntelligentInsights Component
 * AI-powered insights generation with actionable recommendations
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Badge, Button, ProgressBar } from '@tremor/react'
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, 
  Lightbulb, Target, Clock, ChevronRight,
  RefreshCw, Download, Share2, Sparkles
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly' | 'prediction'
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  impact: {
    metric: string
    value: number
    potential: number
    confidence: number
  }
  actions: {
    primary: string
    secondary?: string
    steps?: string[]
  }
  timeframe: string
  data?: any
  createdAt: Date
}

interface IntelligentInsightsProps {
  filters?: Record<string, any>
  onActionClick?: (insight: Insight, action: string) => void
}

export function IntelligentInsights({ filters, onActionClick }: IntelligentInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)
  const [insightFilter, setInsightFilter] = useState<string>('all')
  
  // Generate mock insights based on data patterns
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [
      {
        id: '1',
        type: 'opportunity',
        priority: 'critical',
        category: 'Vendas',
        title: 'Quinta à noite no iFood tem potencial inexplorado',
        description: 'Suas vendas caem 45% nas quintas após 20h no iFood, enquanto Rappi mantém volume. Análise indica demanda existe mas você está perdendo para concorrentes.',
        impact: {
          metric: 'Receita Potencial',
          value: 3500,
          potential: 8000,
          confidence: 87
        },
        actions: {
          primary: 'Criar promoção "Quinta Feliz" exclusiva iFood',
          secondary: 'Ajustar tempo de preparo para horário de pico',
          steps: [
            'Configurar desconto de 20% após 20h nas quintas',
            'Destacar pratos rápidos no cardápio',
            'Adicionar 1 entregador extra neste período',
            'Monitorar conversão por 2 semanas'
          ]
        },
        timeframe: 'Implementar esta semana',
        createdAt: new Date()
      },
      {
        id: '2',
        type: 'warning',
        priority: 'high',
        category: 'Clientes',
        title: '15 clientes VIP estão prestes a churnar',
        description: 'Identificamos 15 clientes com LTV > R$2000 que não compram há 25+ dias. Padrão histórico mostra que após 30 dias, taxa de retorno cai para 12%.',
        impact: {
          metric: 'LTV em Risco',
          value: 30000,
          potential: 3600,
          confidence: 92
        },
        actions: {
          primary: 'Enviar cupom personalizado de 25% hoje',
          secondary: 'Ligar pessoalmente para top 5',
          steps: [
            'Segmentar lista de 15 clientes',
            'Enviar SMS: "Sentimos sua falta, [Nome]!"',
            'Oferecer prato favorito com desconto',
            'Follow-up em 3 dias se não converter'
          ]
        },
        timeframe: 'Ação imediata necessária',
        createdAt: new Date()
      },
      {
        id: '3',
        type: 'trend',
        priority: 'medium',
        category: 'Produtos',
        title: 'Hambúrguer Vegano crescendo 300% ao mês',
        description: 'Demanda por opções veganas triplicou nos últimos 30 dias. Você tem apenas 2 opções enquanto concorrentes têm média de 8.',
        impact: {
          metric: 'Oportunidade Mensal',
          value: 5000,
          potential: 15000,
          confidence: 78
        },
        actions: {
          primary: 'Adicionar 3 novos pratos veganos',
          secondary: 'Criar combo vegano',
          steps: [
            'Testar 3 receitas esta semana',
            'Fotografar profissionalmente',
            'Lançar com 30% desc. primeira semana',
            'Destacar no topo do cardápio'
          ]
        },
        timeframe: 'Próximas 2 semanas',
        createdAt: new Date()
      },
      {
        id: '4',
        type: 'anomaly',
        priority: 'high',
        category: 'Operações',
        title: 'Tempo de entrega aumentou 40% às terças',
        description: 'Detectamos aumento anormal no tempo de entrega às terças (média 65min vs 45min outros dias). Correlação com mudança de equipe.',
        impact: {
          metric: 'Cancelamentos',
          value: 12,
          potential: 3,
          confidence: 95
        },
        actions: {
          primary: 'Realocar staff mais experiente às terças',
          secondary: 'Treinar equipe de terça',
          steps: [
            'Identificar gargalo específico',
            'Adicionar 1 pessoa no preparo',
            'Pré-preparar ingredientes segunda à noite',
            'Monitorar métricas em tempo real'
          ]
        },
        timeframe: 'Resolver até próxima terça',
        createdAt: new Date()
      },
      {
        id: '5',
        type: 'prediction',
        priority: 'medium',
        category: 'Financeiro',
        title: 'Previsão: Queda de 25% no faturamento domingo',
        description: 'Modelo preditivo indica queda baseada em: jogo do Brasil às 16h + chuva prevista + histórico similar.',
        impact: {
          metric: 'Faturamento Esperado',
          value: 12000,
          potential: 9000,
          confidence: 72
        },
        actions: {
          primary: 'Criar "Combo Jogo" com entrega garantida',
          secondary: 'Boost em marketing sábado',
          steps: [
            'Preparar estoque extra de bebidas',
            'Promoção "Peça antes do jogo"',
            'Contratar 2 entregadores extras',
            'Push notification às 14h'
          ]
        },
        timeframe: 'Preparar até sábado',
        createdAt: new Date()
      },
      {
        id: '6',
        type: 'opportunity',
        priority: 'low',
        category: 'Marketing',
        title: 'Melhor horário para posts: 11:30 e 18:45',
        description: 'Análise de engajamento mostra picos de conversão nestes horários. Seus posts atuais são às 9h e 15h.',
        impact: {
          metric: 'Conversão Posts',
          value: 2.3,
          potential: 5.8,
          confidence: 83
        },
        actions: {
          primary: 'Reagendar posts para horários ideais',
          secondary: 'Testar stories às 11:30',
          steps: [
            'Programar posts da semana',
            'Criar conteúdo "na hora do almoço"',
            'Usar hashtags de horário (#AlmoçoPerfeito)',
            'Medir CTR por 2 semanas'
          ]
        },
        timeframe: 'Ajustar amanhã',
        createdAt: new Date()
      }
    ]
    
    return insights
  }

  const insights = generateInsights()
  
  // Filter insights
  const filteredInsights = insights.filter(insight => {
    if (insightFilter === 'all') return true
    return insight.type === insightFilter
  })

  // Get icon for insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Lightbulb
      case 'warning': return AlertTriangle
      case 'trend': return TrendingUp
      case 'anomaly': return Brain
      case 'prediction': return Target
      default: return Sparkles
    }
  }

  // Get color for priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red'
      case 'high': return 'amber'
      case 'medium': return 'blue'
      case 'low': return 'gray'
      default: return 'gray'
    }
  }

  // Get color for type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'green'
      case 'warning': return 'red'
      case 'trend': return 'blue'
      case 'anomaly': return 'amber'
      case 'prediction': return 'purple'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-500" />
            <div>
              <Title>Insights Inteligentes</Title>
              <Text className="text-gray-500">
                {insights.length} insights acionáveis detectados
              </Text>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="xs" variant="secondary" icon={RefreshCw}>
              Atualizar
            </Button>
            <Button size="xs" variant="secondary" icon={Download}>
              Exportar
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setInsightFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              insightFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({insights.length})
          </button>
          {['opportunity', 'warning', 'trend', 'anomaly', 'prediction'].map(type => {
            const count = insights.filter(i => i.type === type).length
            return (
              <button
                key={type}
                onClick={() => setInsightFilter(type)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  insightFilter === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
              </button>
            )
          })}
        </div>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInsights.map((insight) => {
          const Icon = getInsightIcon(insight.type)
          
          return (
            <Card 
              key={insight.id}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${getTypeColor(insight.type)}-50`}>
                      <Icon className={`h-5 w-5 text-${getTypeColor(insight.type)}-500`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Text className="text-xs text-gray-500">
                          {insight.category}
                        </Text>
                      </div>
                      <Text className="font-semibold text-gray-900">
                        {insight.title}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <Text className="text-sm text-gray-600">
                  {insight.description}
                </Text>

                {/* Impact */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-xs text-gray-500">
                      {insight.impact.metric}
                    </Text>
                    <Badge color="green" size="xs">
                      {insight.impact.confidence}% confiança
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-lg font-bold text-gray-900">
                      R$ {insight.impact.value.toLocaleString()}
                    </Text>
                    <Text className="text-sm text-gray-500">→</Text>
                    <Text className="text-lg font-bold text-green-600">
                      R$ {insight.impact.potential.toLocaleString()}
                    </Text>
                  </div>
                  <ProgressBar 
                    value={(insight.impact.value / insight.impact.potential) * 100}
                    color="green"
                    className="mt-2"
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Text className="text-xs font-semibold text-gray-700">
                    Ação Recomendada:
                  </Text>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <Text className="text-sm text-blue-900">
                      {insight.actions.primary}
                    </Text>
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  </div>
                </div>

                {/* Timeframe */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Text className="text-xs text-gray-500">
                    {insight.timeframe}
                  </Text>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Detailed View Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Modal Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {(() => {
                    const Icon = getInsightIcon(selectedInsight.type)
                    return (
                      <div className={`p-2 rounded-lg bg-${getTypeColor(selectedInsight.type)}-50`}>
                        <Icon className={`h-6 w-6 text-${getTypeColor(selectedInsight.type)}-500`} />
                      </div>
                    )
                  })()}
                  <div>
                    <Title>{selectedInsight.title}</Title>
                    <div className="flex gap-2 mt-1">
                      <Badge color={getPriorityColor(selectedInsight.priority)}>
                        {selectedInsight.priority}
                      </Badge>
                      <Badge color={getTypeColor(selectedInsight.type)}>
                        {selectedInsight.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <Text>{selectedInsight.description}</Text>
                
                {/* Impact Details */}
                <Card className="bg-gray-50">
                  <Title className="text-sm mb-3">Impacto Potencial</Title>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Text className="text-xs text-gray-500">Atual</Text>
                      <Text className="text-xl font-bold">
                        R$ {selectedInsight.impact.value.toLocaleString()}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-xs text-gray-500">Potencial</Text>
                      <Text className="text-xl font-bold text-green-600">
                        R$ {selectedInsight.impact.potential.toLocaleString()}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-xs text-gray-500">Confiança</Text>
                      <Text className="text-xl font-bold">
                        {selectedInsight.impact.confidence}%
                      </Text>
                    </div>
                  </div>
                </Card>

                {/* Action Steps */}
                <div>
                  <Title className="text-sm mb-3">Plano de Ação</Title>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <Text className="font-semibold text-blue-900">
                        Ação Principal
                      </Text>
                      <Text className="text-sm text-blue-700">
                        {selectedInsight.actions.primary}
                      </Text>
                    </div>
                    
                    {selectedInsight.actions.secondary && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <Text className="font-semibold text-gray-700">
                          Ação Secundária
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {selectedInsight.actions.secondary}
                        </Text>
                      </div>
                    )}
                    
                    {selectedInsight.actions.steps && (
                      <div>
                        <Text className="font-semibold text-gray-700 mb-2">
                          Passos Detalhados:
                        </Text>
                        <ol className="space-y-2">
                          {selectedInsight.actions.steps.map((step, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <Text className="text-sm">{step}</Text>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      onActionClick?.(selectedInsight, 'execute')
                      setSelectedInsight(null)
                    }}
                  >
                    Executar Ação
                  </Button>
                  <Button
                    variant="secondary"
                    icon={Share2}
                    onClick={() => {
                      onActionClick?.(selectedInsight, 'share')
                    }}
                  >
                    Compartilhar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedInsight(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}