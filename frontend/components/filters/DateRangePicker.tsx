/**
 * DateRangePicker Component
 * Date range selection filter
 */

'use client'

import { DateRangePicker as TremorDateRangePicker, DateRangePickerValue } from '@tremor/react'
import { Calendar } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { subDays } from 'date-fns'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onDateChange: (start: Date | null, end: Date | null) => void
}

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
  const handleChange = (value: DateRangePickerValue) => {
    onDateChange(value.from || null, value.to || null)
  }

  // Preset ranges
  const presets = [
    {
      label: 'Hoje',
      onClick: () => {
        const today = new Date()
        onDateChange(today, today)
      }
    },
    {
      label: 'Últimos 7 dias',
      onClick: () => {
        const end = new Date()
        const start = subDays(end, 6)
        onDateChange(start, end)
      }
    },
    {
      label: 'Últimos 30 dias',
      onClick: () => {
        const end = new Date()
        const start = subDays(end, 29)
        onDateChange(start, end)
      }
    },
    {
      label: 'Este mês',
      onClick: () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        onDateChange(start, end)
      }
    },
    {
      label: 'Mês passado',
      onClick: () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)
        onDateChange(start, end)
      }
    }
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Período</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <TremorDateRangePicker
          value={{ from: startDate || undefined, to: endDate || undefined }}
          onValueChange={handleChange}
          placeholder="Selecione o período"
          selectPlaceholder="Selecionar"
          locale={ptBR}
          enableClear={true}
          displayFormat="dd/MM/yyyy"
          className="flex-1"
        />
        <div className="flex gap-1 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={preset.onClick}
              className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}