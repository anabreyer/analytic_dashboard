/**
 * Advanced Dashboard Page
 * Complete analytics platform with customizable widgets and AI insights
 * INCLUINDO PRODUCT TIMELINE CHART
 */

'use client'

import { useState, useEffect } from 'react'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@tremor/react'
import { 
  LayoutDashboard, Brain, Filter, Grid, Settings, 
  TrendingUp, Users, Share2, Download, Package 
} from 'lucide-react'

// Import existing components
import { MetricCards } from '@/components/dashboard/MetricCards'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { ChannelsTable } from '@/components/dashboard/ChannelsTable'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { DateRangePicker } from '@/components/filters/DateRangePicker'
import { StoreSelector } from '@/components/filters/StoreSelector'
import { NaturalLanguageSearch } from '@/components/dashboard/NaturalLanguageSearch'

// Import new advanced components
import { MultiDimensionalFilter } from '@/components/filters/MultiDimensionalFilter'
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder'
import { ComparativeDashboard } from '@/components/analytics/ComparativeDashboard'
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics'
import { CustomerJourney } from '@/components/analytics/CustomerJourney'

// NOVO IMPORT DO PRODUCT TIMELINE
import { ProductTimelineChart } from '@/components/dashboard/ProductTimelineChart'

export default function AdvancedDashboardPage() {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  })
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({})
  const [userRole, setUserRole] = useState<'owner' | 'manager' | 'marketing' | 'operations'>('owner')
  
  // Dashboard templates based on user role
  const dashboardTemplates = [
    {
      id: 'owner',
      name: 'Visão do Proprietário',
      description: 'Foco em métricas financeiras e crescimento',
      widgets: [
        { id: '1', type: 'metric-card' as const, title: 'Faturamento Total', config: {}, position: { x: 20, y: 20 }, size: { width: 300, height: 150 } },
        { id: '2', type: 'line-chart' as const, title: 'Evolução de Vendas', config: {}, position: { x: 340, y: 20 }, size: { width: 600, height: 350 } },
        { id: '3', type: 'insights' as const, title: 'Insights Estratégicos', config: {}, position: { x: 20, y: 190 }, size: { width: 300, height: 400 } },
        { id: '4', type: 'pie-chart' as const, title: 'Mix de Canais', config: {}, position: { x: 960, y: 20 }, size: { width: 350, height: 350 } },
      ]
    },
    {
      id: 'manager',
      name: 'Visão do Gerente',
      description: 'Foco em operações e eficiência',
      widgets: [
        { id: '1', type: 'metric-card' as const, title: 'Pedidos Hoje', config: {}, position: { x: 20, y: 20 }, size: { width: 250, height: 150 } },
        { id: '2', type: 'heatmap' as const, title: 'Mapa de Calor - Horários', config: {}, position: { x: 290, y: 20 }, size: { width: 500, height: 300 } },
        { id: '3', type: 'table' as const, title: 'Performance por Turno', config: {}, position: { x: 810, y: 20 }, size: { width: 400, height: 300 } },
      ]
    },
    {
      id: 'marketing',
      name: 'Visão de Marketing',
      description: 'Foco em produtos e clientes',
      widgets: [
        { id: '1', type: 'bar-chart' as const, title: 'Top Produtos', config: {}, position: { x: 20, y: 20 }, size: { width: 500, height: 350 } },
        { id: '2', type: 'funnel' as const, title: 'Funil de Conversão', config: {}, position: { x: 540, y: 20 }, size: { width: 400, height: 350 } },
        { id: '3', type: 'cohort' as const, title: 'Análise de Coorte', config: {}, position: { x: 20, y: 390 }, size: { width: 920, height: 350 } },
      ]
    }
  ]

  // Get template based on role
  const getCurrentTemplate = () => {
    return dashboardTemplates.find(t => t.id === userRole) || dashboardTemplates[0]
  }

  // Handle insight action
  const handleInsightAction = (insight: any, action: string) => {
    console.log('Executing insight action:', action, insight)
    // Implement action execution logic
  }

  // Handle filter save
  const handleSaveFilter = (name: string, filters: Record<string, any>) => {
    // Save to localStorage or backend
    const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]')
    savedFilters.push({ name, filters, createdAt: new Date() })
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters))
  }

  // Load saved filters
  const getSavedFilters = () => {
    return JSON.parse(localStorage.getItem('savedFilters') || '[]')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analytics Platform
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dashboard inteligente e customizável
              </p>
            </div>
            
            {/* Role Selector */}
            <div className="flex items-center gap-4">
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="owner">Proprietário</option>
                <option value="manager">Gerente</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operações</option>
              </select>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Download className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Language Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <NaturalLanguageSearch />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <TabGroup index={activeTabIndex} onIndexChange={setActiveTabIndex}>
          <TabList>
            <Tab icon={LayoutDashboard}>
              Visão Geral
            </Tab>
            
            {/* NOVA TAB DE ANÁLISE DE PRODUTO */}
            <Tab icon={Package}>
              Análise de Produto
            </Tab>
            
            <Tab icon={Grid}>
              Dashboard Custom
            </Tab>
            <Tab icon={TrendingUp}>
              Comparativo
            </Tab>
            <Tab icon={TrendingUp}>
              Preditivo
            </Tab>
            <Tab icon={Users}>
              Jornada Cliente
            </Tab>
          </TabList>

          <TabPanels>
          {/* Overview Tab */}
          <TabPanel className="mt-6 space-y-6">
            {/* Basic Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <DateRangePicker
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onDateChange={(start, end) => setDateRange({ start, end })}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <StoreSelector
                    value={selectedStore}
                    onChange={setSelectedStore}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <MultiDimensionalFilter 
              onFilterChange={setAdvancedFilters}
              onSaveFilter={handleSaveFilter}
              savedFilters={getSavedFilters()}
            />

            {/* Existing Dashboard Components */}
            <MetricCards
              startDate={dateRange.start}
              endDate={dateRange.end}
              storeId={selectedStore}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Evolução de Vendas</h2>
                <SalesChart
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  storeId={selectedStore}
                />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Top Produtos</h2>
                <TopProducts
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  storeId={selectedStore}
                />
              </div>
            </div>

            <ChannelsTable
              startDate={dateRange.start}
              endDate={dateRange.end}
            />
          </TabPanel>

          {/* NOVO TAB PANEL - Product Analysis Tab */}
          <TabPanel className="mt-6 space-y-6">
            {/* Filters for Product Analysis */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <DateRangePicker
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onDateChange={(start, end) => setDateRange({ start, end })}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <StoreSelector
                    value={selectedStore}
                    onChange={setSelectedStore}
                  />
                </div>
              </div>
            </div>

            {/* Multidimensional Filters */}
            <MultiDimensionalFilter 
              onFilterChange={setAdvancedFilters}
              onSaveFilter={handleSaveFilter}
              savedFilters={getSavedFilters()}
            />
            
            {/* Product Timeline Chart Component */}
            <ProductTimelineChart
              startDate={dateRange.start}
              endDate={dateRange.end}
              storeId={selectedStore}
              filters={advancedFilters}
            />
          </TabPanel>


          {/* Custom Dashboard Tab */}
          <TabPanel className="mt-6">
            <DashboardBuilder
              initialWidgets={getCurrentTemplate().widgets}
              onSave={(widgets) => {
                console.log('Saving dashboard:', widgets)
                // Save to backend or localStorage
              }}
              templates={dashboardTemplates}
            />
          </TabPanel>

          {/* Comparative Analysis Tab */}
          <TabPanel className="mt-6">
            <ComparativeDashboard
              dateRange={dateRange}
              storeId={selectedStore}
              filters={advancedFilters}
            />
          </TabPanel>

          {/* Predictive Analytics Tab */}
          <TabPanel className="mt-6">
            <PredictiveAnalytics
              dateRange={dateRange}
              storeId={selectedStore}
            />
          </TabPanel>

          {/* Customer Journey Tab */}
          <TabPanel className="mt-6">
            <CustomerJourney
              dateRange={dateRange}
              storeId={selectedStore}
            />
          </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}