/**
 * ChannelsTable Component
 * Displays performance metrics for each sales channel
 */

'use client'

import { 
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Text,
  Title,
  Card
} from '@tremor/react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { Truck, Store, Smartphone, Clock } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ChannelsTableProps {
  startDate: Date | null
  endDate: Date | null
}

export function ChannelsTable({ startDate, endDate }: ChannelsTableProps) {
  // Fetch channels data
  const { data, isLoading, error } = useQuery({
    queryKey: ['channels', startDate, endDate],
    queryFn: () => analyticsAPI.getChannels({
      start_date: startDate,
      end_date: endDate
    }),
  })

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Text className="text-red-600">Erro ao carregar canais</Text>
      </div>
    )
  }

  const getChannelIcon = (name: string, type: string) => {
    if (type === 'Presencial') return Store
    if (name.toLowerCase().includes('whatsapp')) return Smartphone
    return Truck
  }

  const getChannelColor = (name: string) => {
    if (name.toLowerCase().includes('ifood')) return 'red'
    if (name.toLowerCase().includes('rappi')) return 'orange'
    if (name.toLowerCase().includes('uber')) return 'black'
    if (name.toLowerCase().includes('whatsapp')) return 'green'
    if (name.toLowerCase().includes('próprio')) return 'blue'
    return 'gray'
  }

  // Calculate totals
  const totals = data.channels.reduce((acc, channel) => ({
    orders: acc.orders + channel.orders,
    revenue: acc.revenue + channel.revenue,
  }), { orders: 0, revenue: 0 })

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Text className="text-gray-600">Total Canais</Text>
          <Text className="text-2xl font-bold">{data.channels.length}</Text>
        </Card>
        <Card className="p-4">
          <Text className="text-gray-600">Total Pedidos</Text>
          <Text className="text-2xl font-bold">{formatNumber(totals.orders)}</Text>
        </Card>
        <Card className="p-4">
          <Text className="text-gray-600">Receita Total</Text>
          <Text className="text-2xl font-bold">{formatCurrency(totals.revenue)}</Text>
        </Card>
        <Card className="p-4">
          <Text className="text-gray-600">Ticket Médio Geral</Text>
          <Text className="text-2xl font-bold">
            {formatCurrency(totals.revenue / totals.orders)}
          </Text>
        </Card>
      </div>

      {/* Channels Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Canal</TableHeaderCell>
              <TableHeaderCell className="text-right">Pedidos</TableHeaderCell>
              <TableHeaderCell className="text-right">Market Share</TableHeaderCell>
              <TableHeaderCell className="text-right">Faturamento</TableHeaderCell>
              <TableHeaderCell className="text-right">Ticket Médio</TableHeaderCell>
              <TableHeaderCell className="text-right">Tempo Entrega</TableHeaderCell>
              <TableHeaderCell className="text-right">Cancelamento</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.channels.map((channel) => {
              const Icon = getChannelIcon(channel.name, channel.type)
              const marketShare = (channel.orders / totals.orders) * 100
              const revenueShare = (channel.revenue / totals.revenue) * 100
              
              return (
                <TableRow key={channel.name}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <Text className="font-medium">{channel.name}</Text>
                      <Badge color={getChannelColor(channel.name)} size="xs">
                        {channel.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Text>{formatNumber(channel.orders)}</Text>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, marketShare)}%` }}
                        />
                      </div>
                      <Text className="text-sm">{marketShare.toFixed(1)}%</Text>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <Text className="font-medium">{formatCurrency(channel.revenue)}</Text>
                      <Text className="text-xs text-gray-500">
                        {revenueShare.toFixed(1)}% do total
                      </Text>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Text>{formatCurrency(channel.avg_ticket)}</Text>
                  </TableCell>
                  <TableCell className="text-right">
                    {channel.avg_delivery_time ? (
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <Text>{Math.round(channel.avg_delivery_time)} min</Text>
                      </div>
                    ) : (
                      <Text className="text-gray-400">-</Text>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      color={channel.cancellation_rate > 5 ? 'red' : 'green'}
                      size="xs"
                    >
                      {channel.cancellation_rate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}