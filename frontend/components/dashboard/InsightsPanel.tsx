/**
 * InsightsPanel Component
 * Displays AI-powered business insights and alerts
 */

'use client'

import { Card, Title, Text, Flex, Badge } from '@tremor/react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI, type Insight } from '@/lib/api'
import { 
  AlertTriangle, 
  TrendingUp, 
  Info, 
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface InsightsPanelProps {
  storeId: number | null
}

export function InsightsPanel({ storeId }: InsightsPanelProps) {
  // Fetch insights
  const { data, isLoading, error } = useQuery({
    queryKey: ['insights', storeId],
    queryFn: () => analyticsAPI.getInsights(storeId),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  if (error || !data || data.insights.length === 0) {
    return null
  }

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return AlertTriangle
      case 'success':
        return TrendingUp
      case 'info':
      default:
        return Info
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'red'
      case 'success':
        return 'green'
      case 'info':
      default:
        return 'blue'
    }
  }

  const getPriorityBadge = (priority: Insight['priority']) => {
    const colors = {
      high: 'red',
      medium: 'yellow',
      low: 'gray'
    }
    const labels = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa'
    }
    
    return (
      <Badge color={colors[priority]} size="xs">
        {labels[priority]} prioridade
      </Badge>
    )
  }

  // Sort insights by priority
  const sortedInsights = [...data.insights].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="space-y-4">
      <Flex>
        <Title>Insights e Alertas</Title>
        <Badge color="gray" size="sm">
          {data.insights.length} {data.insights.length === 1 ? 'insight' : 'insights'}
        </Badge>
      </Flex>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedInsights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type)
          const color = getInsightColor(insight.type)
          
          return (
            <Card 
              key={index}
              className={`
                border-l-4 transform transition-all duration-300 hover:scale-105
                ${color === 'red' ? 'border-l-red-500' : 
                  color === 'green' ? 'border-l-green-500' : 
                  'border-l-blue-500'}
              `}
            >
              <Flex justifyContent="start" className="gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${color === 'red' ? 'bg-red-100' : 
                    color === 'green' ? 'bg-green-100' : 
                    'bg-blue-100'}
                `}>
                  <Icon className={`
                    h-5 w-5
                    ${color === 'red' ? 'text-red-600' : 
                      color === 'green' ? 'text-green-600' : 
                      'text-blue-600'}
                  `} />
                </div>
                <div className="flex-1">
                  <Flex justifyContent="start" className="gap-2 mb-1">
                    {getPriorityBadge(insight.priority)}
                  </Flex>
                  <Text className="font-semibold text-gray-900">
                    {insight.title}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {insight.description}
                  </Text>
                  
                  {insight.metric && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      {insight.metric.current !== undefined && (
                        <Flex>
                          <Text className="text-xs text-gray-500">Atual</Text>
                          <Text className="text-xs font-semibold">
                            {typeof insight.metric.current === 'number' 
                              ? insight.metric.current.toLocaleString('pt-BR')
                              : insight.metric.current}
                          </Text>
                        </Flex>
                      )}
                      {insight.metric.previous !== undefined && (
                        <Flex className="mt-1">
                          <Text className="text-xs text-gray-500">Anterior</Text>
                          <Text className="text-xs font-semibold">
                            {typeof insight.metric.previous === 'number'
                              ? insight.metric.previous.toLocaleString('pt-BR')
                              : insight.metric.previous}
                          </Text>
                        </Flex>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Flex justifyContent="start" alignItems="center" className="gap-2">
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <Text className="text-xs text-gray-700 font-medium">
                        {insight.action}
                      </Text>
                    </Flex>
                  </div>
                </div>
              </Flex>
            </Card>
          )
        })}
      </div>
    </div>
  )
}