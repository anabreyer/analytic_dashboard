/**
 * DashboardBuilder Component
 * Customizable dashboard with drag-and-drop widgets
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, Title, Text, Button, Badge, Select, SelectItem } from '@tremor/react'
import {
  Grid, Save, Plus, Settings, Eye, EyeOff, 
  Lock, Unlock, Download, Share2, Copy,
  BarChart, LineChart, PieChart, TrendingUp,
  Table, Calendar, DollarSign, Users
} from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Widget types
export type WidgetType = 
  | 'metric-card'
  | 'line-chart' 
  | 'bar-chart'
  | 'pie-chart'
  | 'table'
  | 'insights'
  | 'timeline'
  | 'heatmap'
  | 'funnel'
  | 'cohort'

interface Widget {
  id: string
  type: WidgetType
  title: string
  config: any
  position: { x: number; y: number }
  size: { width: number; height: number }
  locked?: boolean
}

interface DashboardTemplate {
  id: string
  name: string
  description: string
  widgets: Widget[]
  role?: string
  isPublic?: boolean
}

interface DashboardBuilderProps {
  initialWidgets?: Widget[]
  onSave?: (widgets: Widget[]) => void
  templates?: DashboardTemplate[]
}

// Widget Component Wrapper
function WidgetWrapper({ 
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
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'widget',
    item: widget,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: isEditMode && !widget.locked
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'widget',
    drop: (item: Widget, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta) {
        const newPosition = {
          x: Math.round(item.position.x + delta.x),
          y: Math.round(item.position.y + delta.y)
        }
        onUpdate({ ...item, position: newPosition })
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const ref = useRef<HTMLDivElement>(null)
  drag(drop(ref))

  const renderWidget = () => {
    // Placeholder widget content based on type
    switch (widget.type) {
      case 'metric-card':
        return (
          <div className="p-4">
            <Text className="text-gray-500">Valor</Text>
            <Text className="text-2xl font-bold">R$ 45,231</Text>
            <Text className="text-green-600 text-sm">+12.3%</Text>
          </div>
        )
      case 'line-chart':
        return (
          <div className="p-4">
            <LineChart className="h-32 w-full text-gray-300" />
          </div>
        )
      case 'bar-chart':
        return (
          <div className="p-4">
            <BarChart className="h-32 w-full text-gray-300" />
          </div>
        )
      case 'pie-chart':
        return (
          <div className="p-4">
            <PieChart className="h-32 w-full text-gray-300" />
          </div>
        )
      case 'table':
        return (
          <div className="p-4">
            <Table className="h-32 w-full text-gray-300" />
          </div>
        )
      default:
        return (
          <div className="p-4">
            <Text>Widget: {widget.type}</Text>
          </div>
        )
    }
  }

  return (
    <div
      ref={ref}
      className={`
        absolute bg-white rounded-lg shadow-lg border
        ${isDragging ? 'opacity-50' : ''}
        ${isOver ? 'border-blue-500' : 'border-gray-200'}
        ${isEditMode ? 'cursor-move' : ''}
      `}
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.width,
        height: widget.size.height,
      }}
    >
      {/* Widget Header */}
      {isEditMode && (
        <div className="flex justify-between items-center p-2 border-b bg-gray-50">
          <Text className="text-sm font-medium">{widget.title}</Text>
          <div className="flex gap-1">
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
              <span className="text-red-500 text-xs">✕</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Widget Content */}
      {renderWidget()}
      
      {/* Resize Handle */}
      {isEditMode && !widget.locked && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
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
  )
}

export function DashboardBuilder({ 
  initialWidgets = [], 
  onSave,
  templates = []
}: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  // Widget library
  const widgetLibrary = [
    { type: 'metric-card' as WidgetType, title: 'Cartão de Métrica', icon: TrendingUp },
    { type: 'line-chart' as WidgetType, title: 'Gráfico de Linha', icon: LineChart },
    { type: 'bar-chart' as WidgetType, title: 'Gráfico de Barras', icon: BarChart },
    { type: 'pie-chart' as WidgetType, title: 'Gráfico de Pizza', icon: PieChart },
    { type: 'table' as WidgetType, title: 'Tabela', icon: Table },
    { type: 'insights' as WidgetType, title: 'Insights IA', icon: TrendingUp },
    { type: 'timeline' as WidgetType, title: 'Timeline', icon: Calendar },
    { type: 'heatmap' as WidgetType, title: 'Mapa de Calor', icon: Grid },
    { type: 'funnel' as WidgetType, title: 'Funil', icon: TrendingUp },
    { type: 'cohort' as WidgetType, title: 'Coorte', icon: Users },
  ]

  // Add new widget
  const addWidget = (type: WidgetType, title: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title,
      config: {},
      position: { x: 50 + widgets.length * 20, y: 50 + widgets.length * 20 },
      size: { width: 400, height: 300 },
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

  // Load template
  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setWidgets(template.widgets)
      setSelectedTemplate(templateId)
    }
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
    a.download = 'dashboard-config.json'
    a.click()
  }

  return (
    <DndProvider backend={HTML5Backend}>
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
                <Select 
                  value={selectedTemplate}
                  onValueChange={loadTemplate}
                  placeholder="Carregar template"
                >
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </Select>
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
        <Card className="relative" style={{ height: '800px' }}>
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
            <WidgetWrapper
              key={widget.id}
              widget={widget}
              onUpdate={updateWidget}
              onRemove={removeWidget}
              isEditMode={isEditMode}
            />
          ))}
        </Card>
      </div>
    </DndProvider>
  )
}