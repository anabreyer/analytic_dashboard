/**
 * StoreSelector Component
 * Store selection dropdown filter
 */

'use client'

import { Select, SelectItem } from '@tremor/react'
import { Store } from 'lucide-react'

interface StoreSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
}

// Mock stores data - in production, this would come from an API
const stores = [
  { id: 1, name: 'Loja Centro SP' },
  { id: 2, name: 'Loja Vila Madalena' },
  { id: 3, name: 'Loja Pinheiros' },
  { id: 4, name: 'Loja Moema' },
  { id: 5, name: 'Loja Itaim Bibi' },
  // Add more stores as needed
]

export function StoreSelector({ value, onChange }: StoreSelectorProps) {
  const handleChange = (selectedValue: string) => {
    if (selectedValue === 'all') {
      onChange(null)
    } else {
      onChange(Number(selectedValue))
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Loja</label>
      <Select
        value={value?.toString() || 'all'}
        onValueChange={handleChange}
        icon={Store}
        placeholder="Selecione uma loja"
      >
        <SelectItem value="all">
          Todas as lojas
        </SelectItem>
        {stores.map((store) => (
          <SelectItem key={store.id} value={store.id.toString()}>
            {store.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}