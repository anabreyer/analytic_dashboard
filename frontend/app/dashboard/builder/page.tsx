/**
 * Dashboard Builder Page
 * Standalone page for custom dashboard creation
 */

'use client'

import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder'
import { Button } from '@tremor/react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardBuilderPage() {
  const router = useRouter()
  
  const dashboardTemplates = [
    {
      id: 'owner',
      name: 'Visão do Proprietário',
      description: 'Foco em métricas financeiras',
      widgets: [
        { id: '1', type: 'metric-card' as const, title: 'Faturamento', config: {}, position: { x: 20, y: 20 }, size: { width: 300, height: 150 } },
        { id: '2', type: 'line-chart' as const, title: 'Evolução', config: {}, position: { x: 340, y: 20 }, size: { width: 600, height: 350 } },
      ]
    },
    {
      id: 'manager',
      name: 'Visão do Gerente',
      description: 'Foco operacional',
      widgets: [
        { id: '1', type: 'bar-chart' as const, title: 'Pedidos', config: {}, position: { x: 20, y: 20 }, size: { width: 400, height: 300 } },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Builder
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Crie seu dashboard personalizado
            </p>
          </div>
          <Button
            onClick={() => router.push('/')}
            variant="secondary"
            icon={ArrowLeft}
          >
            Voltar
          </Button>
        </div>

        {/* Builder */}
        <DashboardBuilder
          templates={dashboardTemplates}
          onSave={(widgets) => {
            console.log('Saving dashboard:', widgets)
            localStorage.setItem('customDashboard', JSON.stringify(widgets))
            alert('Dashboard salvo com sucesso!')
          }}
        />
      </div>
    </div>
  )
}