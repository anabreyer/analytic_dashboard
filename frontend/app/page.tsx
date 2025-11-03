/**
 * Main Dashboard Page - FIXED VERSION
 * With working advanced filters and profile switching
 */

'use client'

import { useState, useEffect } from 'react'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { ChannelsTable } from '@/components/dashboard/ChannelsTable'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { DateRangePicker } from '@/components/filters/DateRangePicker'
import { StoreSelector } from '@/components/filters/StoreSelector'
import { NaturalLanguageSearch } from '@/components/dashboard/NaturalLanguageSearch'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { Button, Card, Select, SelectItem, Badge } from '@tremor/react'
import { Moon, Sun, FileDown, Filter, Brain, Grid, User, Share2, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { PeriodComparison } from '@/components/dashboard/PeriodComparison'
import { TrendingUp } from 'lucide-react' // Se ainda não tiver

// Import NEW components
import { MultiDimensionalFilter } from '@/components/filters/MultiDimensionalFilter'

import { ProductTimelineChart } from '@/components/dashboard/ProductTimelineChart'

// User profiles configuration
const USER_PROFILES = {
  owner: {
    name: 'Proprietário',
    icon: '👔',
    description: 'Visão completa com foco estratégico',
    permissions: ['all'],
    defaultView: 'financial'
  },
  manager: {
    name: 'Gerente',
    icon: '👨‍💼',
    description: 'Foco operacional e performance',
    permissions: ['operations', 'team', 'products'],
    defaultView: 'operations'
  },
  marketing: {
    name: 'Marketing',
    icon: '📣',
    description: 'Produtos, clientes e campanhas',
    permissions: ['products', 'customers', 'campaigns'],
    defaultView: 'products'
  },
  team: {
    name: 'Equipe',
    icon: '👥',
    description: 'Visão simplificada do dia',
    permissions: ['daily', 'products'],
    defaultView: 'simple'
  }
}

export default function DashboardPage() {
  const router = useRouter()
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  })
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  
  // NEW: Advanced features states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [showProductAnalysis, setShowProductAnalysis] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({})
  const [currentProfile, setCurrentProfile] = useState<keyof typeof USER_PROFILES>('owner')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPeriodComparison, setShowPeriodComparison] = useState(false)

  // Dark mode effect
  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Load saved profile
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile') as keyof typeof USER_PROFILES
    if (savedProfile && USER_PROFILES[savedProfile]) {
      setCurrentProfile(savedProfile)
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Change user profile
  const changeProfile = (profile: keyof typeof USER_PROFILES) => {
    setCurrentProfile(profile)
    localStorage.setItem('userProfile', profile)
    setShowProfileMenu(false)
    
    // Reset filters based on profile
    if (profile === 'team') {
      // Team member sees only today
      const today = new Date()
      setDateRange({ start: today, end: today })
    }
  }

  // Export function
  const handleExport = async () => {
    const [overview, timeline, products, channels] = await Promise.all([
      analyticsAPI.getOverview({ 
        start_date: dateRange.start, 
        end_date: dateRange.end, 
        store_id: selectedStore,
        ...advancedFilters // Pass advanced filters
      }),
      analyticsAPI.getTimeline({ 
        start_date: dateRange.start, 
        end_date: dateRange.end, 
        store_id: selectedStore,
        ...advancedFilters
      }),
      analyticsAPI.getTopProducts({ 
        start_date: dateRange.start, 
        end_date: dateRange.end, 
        store_id: selectedStore,
        ...advancedFilters
      }),
      analyticsAPI.getChannels({ 
        start_date: dateRange.start, 
        end_date: dateRange.end,
        ...advancedFilters
      })
    ])

    let csv = 'NOLA ANALYTICS - DASHBOARD EXPORT\n'
    csv += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n`
    csv += `Perfil: ${USER_PROFILES[currentProfile].name}\n`
    csv += `Período: ${dateRange.start?.toLocaleDateString('pt-BR') || 'Início'} até ${dateRange.end?.toLocaleDateString('pt-BR') || 'Hoje'}\n`
    
    // Add filters summary
    if (Object.keys(advancedFilters).length > 0) {
      csv += `Filtros Aplicados: ${JSON.stringify(advancedFilters)}\n`
    }
    csv += '\n'

    // Rest of export logic...
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `nola_dashboard_${currentProfile}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle save filter
  const handleSaveFilter = (name: string, filters: Record<string, any>) => {
    const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]')
    savedFilters.push({ 
      name, 
      filters, 
      profile: currentProfile,
      createdAt: new Date() 
    })
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters))
  }

  // Get saved filters for current profile
  const getSavedFilters = () => {
    const all = JSON.parse(localStorage.getItem('savedFilters') || '[]')
    return all.filter((f: any) => f.profile === currentProfile)
  }

  // Handle insight action
  const handleInsightAction = (insight: any, action: string) => {
    console.log('Executing insight action:', action, insight)
    
    if (action === 'share') {
      // Share insight via WhatsApp, email, etc
      const text = `Insight: ${insight.title}\n${insight.description}\nImpacto: R$ ${insight.impact.potential}`
      navigator.share?.({ text })
    }
  }

  // Check if user can see component based on profile
  const canSee = (component: string) => {
    const profile = USER_PROFILES[currentProfile]
    if (profile.permissions.includes('all')) return true
    
    const componentPermissions: Record<string, string[]> = {
      'metrics': ['all', 'operations', 'financial'],
      'sales': ['all', 'operations', 'financial'],
      'products': ['all', 'products', 'marketing', 'daily'],
      'channels': ['all', 'operations', 'marketing'],
      'insights': ['all', 'operations', 'marketing'],
      'advanced': ['all', 'operations', 'marketing']
    }
    
    return profile.permissions.some(p => 
      componentPermissions[component]?.includes(p)
    )
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {USER_PROFILES[currentProfile].description}
            </p>
          </div>
          
          {/* Profile Badge */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span className="text-2xl">{USER_PROFILES[currentProfile].icon}</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {USER_PROFILES[currentProfile].name}
              </span>
              <User className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </button>
            
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
                    Trocar Perfil
                  </p>
                  {Object.entries(USER_PROFILES).map(([key, profile]) => (
                    <button
                      key={key}
                      onClick={() => changeProfile(key as keyof typeof USER_PROFILES)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        currentProfile === key ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                    >
                      <span className="text-xl">{profile.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{profile.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {profile.description}
                        </div>
                      </div>
                      {currentProfile === key && (
                        <Badge color="blue" size="xs">Atual</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* Advanced Features Buttons - only for certain profiles */}
          {canSee('advanced') && (
            <>
              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                variant="secondary"
                icon={Filter}
                className={showAdvancedFilters ? 'bg-blue-100 border-blue-500' : ''}
              >
                Filtros
              </Button>
              <Button
                onClick={() => setShowInsights(!showInsights)}
                variant="secondary"
                icon={Brain}
                className={showInsights ? 'bg-purple-100 border-purple-500' : ''}
              >
                Análise de Produto
              </Button>
              <Button
                onClick={() => router.push('/dashboard/builder')}
                variant="secondary"
                icon={Grid}
              >
                Customizar
              </Button>
              <Button
                onClick={() => setShowPeriodComparison(!showPeriodComparison)}
                variant="secondary"
                icon={TrendingUp}
                className={showPeriodComparison ? 'bg-blue-100 border-blue-500' : ''}
              >
                Comparar Períodos
</Button>
            </>
          )}
          
          {/* Share Button */}
          <Button
            onClick={() => {
              const url = `${window.location.origin}?profile=${currentProfile}`
              navigator.clipboard.writeText(url)
              alert('Link copiado! Compartilhe com sua equipe.')
            }}
            variant="secondary"
            icon={Share2}
          >
            Compartilhar
          </Button>
          
          {/* Basic controls */}
          <Button
            onClick={toggleDarkMode}
            variant="secondary"
            icon={darkMode ? Sun : Moon}
          >
            {darkMode ? 'Light' : 'Dark'}
          </Button>
          <Button
            onClick={handleExport}
            variant="secondary"
            icon={FileDown}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Export
          </Button>
          <RefreshButton />
        </div>
      </div>

      {/* Natural Language Search */}
      <NaturalLanguageSearch />

      {/* Basic Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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

      {/* Advanced Filters Section */}
      {showAdvancedFilters && canSee('advanced') && (
        <MultiDimensionalFilter
          onFilterChange={setAdvancedFilters}
          onSaveFilter={handleSaveFilter}
          savedFilters={getSavedFilters()}
        />
      )}

      {/* Product Analysis Section - NOVO */}
      {showProductAnalysis && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Análise de Produto ao Longo do Tempo</h2>
            <button
              onClick={() => setShowProductAnalysis(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          <ProductTimelineChart
            startDate={dateRange.start}
            endDate={dateRange.end}
            storeId={selectedStore}
            filters={advancedFilters}
          />
        </Card>
      )}

{showPeriodComparison && (
  <Card className="border-2 border-purple-200 dark:border-purple-800 mt-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Comparação de Períodos
      </h2>
      <button
        onClick={() => setShowPeriodComparison(false)}
        className="text-gray-500 hover:text-gray-700 text-xl"
      >
        ×
      </button>
    </div>
    <PeriodComparison />
  </Card>
)}
      

      {/* Existing Insights Panel */}
      {canSee('insights') && (
        <InsightsPanel storeId={selectedStore} />
      )}

      {/* Metric Cards - with advanced filters applied */}
      {canSee('metrics') && (
        <MetricCards
          startDate={dateRange.start}
          endDate={dateRange.end}
          storeId={selectedStore}
          // @ts-ignore - Add filters prop
          filters={advancedFilters}
        />
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canSee('sales') && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Evolução de Vendas
            </h2>
            <SalesChart
              startDate={dateRange.start}
              endDate={dateRange.end}
              storeId={selectedStore}
              // @ts-ignore - Add filters prop
              filters={advancedFilters}
            />
          </div>
        )}

        {canSee('products') && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Produtos Mais Vendidos
            </h2>
            <TopProducts
              startDate={dateRange.start}
              endDate={dateRange.end}
              storeId={selectedStore}
              // @ts-ignore - Add filters prop
              filters={advancedFilters}
            />
          </div>
        )}
      </div>

      {/* Channels Performance Table */}
      {canSee('channels') && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance por Canal
          </h2>
          <ChannelsTable
            startDate={dateRange.start}
            endDate={dateRange.end}
            storeId={selectedStore}
            filters={advancedFilters}
          />
        </div>
      )}
    </div>
  )
}