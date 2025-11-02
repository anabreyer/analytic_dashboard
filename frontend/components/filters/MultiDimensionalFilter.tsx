/**
 * MultiDimensionalFilter Component
 * Advanced filtering system with multiple dimensions
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, Select, SelectItem, Button, Badge, Text } from '@tremor/react'
import { 
  Filter, X, Plus, Calendar, Clock, Store, 
  ShoppingBag, Users, MapPin, Tag, TrendingUp,
  Search, Save, Download
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FilterDimension {
  id: string
  label: string
  icon: any
  type: 'select' | 'multiselect' | 'daterange' | 'timerange' | 'number'
  options?: { value: string; label: string }[]
  value?: any
}

interface MultiDimensionalFilterProps {
  onFilterChange: (filters: Record<string, any>) => void
  onSaveFilter?: (name: string, filters: Record<string, any>) => void
  savedFilters?: { name: string; filters: Record<string, any> }[]
}

export function MultiDimensionalFilter({ 
  onFilterChange, 
  onSaveFilter,
  savedFilters = []
}: MultiDimensionalFilterProps) {
  const [activeFilters, setActiveFilters] = useState<FilterDimension[]>([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Available filter dimensions
  const availableDimensions: FilterDimension[] = [
    {
      id: 'dayOfWeek',
      label: 'Dia da Semana',
      icon: Calendar,
      type: 'multiselect',
      options: [
        { value: 'mon', label: 'Segunda' },
        { value: 'tue', label: 'Terça' },
        { value: 'wed', label: 'Quarta' },
        { value: 'thu', label: 'Quinta' },
        { value: 'fri', label: 'Sexta' },
        { value: 'sat', label: 'Sábado' },
        { value: 'sun', label: 'Domingo' },
      ]
    },
    {
      id: 'timeOfDay',
      label: 'Período do Dia',
      icon: Clock,
      type: 'multiselect',
      options: [
        { value: 'morning', label: 'Manhã (6h-12h)' },
        { value: 'afternoon', label: 'Tarde (12h-18h)' },
        { value: 'evening', label: 'Noite (18h-23h)' },
        { value: 'night', label: 'Madrugada (23h-6h)' },
      ]
    },
    {
      id: 'channel',
      label: 'Canal de Venda',
      icon: ShoppingBag,
      type: 'multiselect',
      options: [
        { value: 'ifood', label: 'iFood' },
        { value: 'rappi', label: 'Rappi' },
        { value: 'uber', label: 'Uber Eats' },
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'presencial', label: 'Presencial' },
        { value: 'app', label: 'App Próprio' },
      ]
    },
  ]

  // Add a new filter dimension
  const addFilter = (dimension: FilterDimension) => {
    if (!activeFilters.find(f => f.id === dimension.id)) {
      setActiveFilters([...activeFilters, { ...dimension, value: [] }])
      setShowFilterMenu(false)
    }
  }

  // Remove a filter
  const removeFilter = (id: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== id))
  }

  // Update filter value
  const updateFilterValue = (id: string, value: any) => {
    const updatedFilters = activeFilters.map(f => 
      f.id === id ? { ...f, value } : f
    )
    setActiveFilters(updatedFilters)
  }

  // Apply filters
  useEffect(() => {
    const filterObject = activeFilters.reduce((acc, filter) => {
      if (filter.value && (Array.isArray(filter.value) ? filter.value.length > 0 : true)) {
        acc[filter.id] = filter.value
      }
      return acc
    }, {} as Record<string, any>)
    
    onFilterChange(filterObject)
  }, [activeFilters])

  // Load saved filter
  const loadSavedFilter = (saved: { name: string; filters: Record<string, any> }) => {
    const filters = Object.entries(saved.filters).map(([id, value]) => {
      const dimension = availableDimensions.find(d => d.id === id)
      if (dimension) {
        return { ...dimension, value }
      }
      return null
    }).filter(Boolean) as FilterDimension[]
    
    setActiveFilters(filters)
  }

  // Save current filter
  const saveCurrentFilter = () => {
    if (filterName && onSaveFilter) {
      const filterObject = activeFilters.reduce((acc, filter) => {
        if (filter.value && (Array.isArray(filter.value) ? filter.value.length > 0 : true)) {
          acc[filter.id] = filter.value
        }
        return acc
      }, {} as Record<string, any>)
      
      onSaveFilter(filterName, filterObject)
      setShowSaveDialog(false)
      setFilterName('')
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([])
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <Text className="font-semibold">Filtros Multidimensionais</Text>
            {activeFilters.length > 0 && (
              <Badge color="blue">{activeFilters.length} ativos</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {savedFilters.length > 0 && (
              <Select placeholder="Carregar filtro salvo">
                {savedFilters.map((saved) => (
                  <SelectItem
                    key={saved.name}
                    value={saved.name}
                    onClick={() => loadSavedFilter(saved)}
                  >
                    {saved.name}
                  </SelectItem>
                ))}
              </Select>
            )}
            {activeFilters.length > 0 && (
              <>
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Save}
                  onClick={() => setShowSaveDialog(true)}
                >
                  Salvar
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  color="red"
                  onClick={clearAllFilters}
                >
                  Limpar
                </Button>
              </>
            )}
            <Button
              size="xs"
              variant="primary"
              icon={Plus}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              Adicionar Filtro
            </Button>
          </div>
        </div>

        {/* Filter Menu */}
        {showFilterMenu && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
            {availableDimensions
              .filter(d => !activeFilters.find(f => f.id === d.id))
              .map((dimension) => {
                const Icon = dimension.icon
                return (
                  <button
                    key={dimension.id}
                    onClick={() => addFilter(dimension)}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span>{dimension.label}</span>
                  </button>
                )
              })}
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-3">
            {activeFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <div key={filter.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-[150px]">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <Text className="text-sm">{filter.label}:</Text>
                  </div>
                  
                  {filter.type === 'multiselect' && (
                    <div className="flex-1 flex flex-wrap gap-1">
                      {filter.options?.map((option) => {
                        const isSelected = filter.value?.includes(option.value)
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              const newValue = isSelected
                                ? filter.value.filter((v: string) => v !== option.value)
                                : [...(filter.value || []), option.value]
                              updateFilterValue(filter.id, newValue)
                            }}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="p-1 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="p-3 bg-blue-50 rounded-lg space-y-2">
            <Text className="text-sm font-medium">Salvar configuração de filtros</Text>
            <div className="flex gap-2">
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nome do filtro"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg"
              />
              <Button size="xs" onClick={saveCurrentFilter}>
                Salvar
              </Button>
              <Button 
                size="xs" 
                variant="secondary"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Filter Summary */}
        {activeFilters.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <Text className="text-xs text-blue-700">
              <strong>Filtros aplicados:</strong> {
                activeFilters.map(f => {
                  const values = Array.isArray(f.value) ? f.value : [f.value]
                  const labels = values.map((v: string) => 
                    f.options?.find(o => o.value === v)?.label || v
                  ).join(', ')
                  return `${f.label} (${labels})`
                }).join(' • ')
              }
            </Text>
          </div>
        )}
      </div>
    </Card>
  )
}