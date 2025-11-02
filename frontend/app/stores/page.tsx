/**
 * Stores Page
 * Lista e gerenciamento de lojas
 */

'use client'

import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Button } from '@tremor/react'
import { Store, MapPin, Phone, Clock, Plus, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

const mockStores = [
  { id: 1, name: 'Loja Centro SP', city: 'São Paulo', address: 'Rua Augusta, 123', phone: '(11) 3333-4444', status: 'active', orders: 12453, revenue: 567890 },
  { id: 2, name: 'Loja Vila Madalena', city: 'São Paulo', address: 'Rua Aspicuelta, 456', phone: '(11) 3333-5555', status: 'active', orders: 8734, revenue: 398765 },
  { id: 3, name: 'Loja Pinheiros', city: 'São Paulo', address: 'Rua dos Pinheiros, 789', phone: '(11) 3333-6666', status: 'active', orders: 10234, revenue: 456789 },
  { id: 4, name: 'Loja Moema', city: 'São Paulo', address: 'Av. Moema, 321', phone: '(11) 3333-7777', status: 'maintenance', orders: 7654, revenue: 345678 },
  { id: 5, name: 'Loja Itaim Bibi', city: 'São Paulo', address: 'Rua Bandeira Paulista, 654', phone: '(11) 3333-8888', status: 'active', orders: 9876, revenue: 445678 },
]

export default function StoresPage() {
  const [stores] = useState(mockStores)

  const totalOrders = stores.reduce((sum, s) => sum + s.orders, 0)
  const totalRevenue = stores.reduce((sum, s) => sum + s.revenue, 0)
  const activeStores = stores.filter(s => s.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lojas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas lojas e filiais
          </p>
        </div>
        <Button icon={Plus} color="blue">
          Nova Loja
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500 dark:text-gray-400">Total de Lojas</Text>
              <Text className="text-2xl font-bold dark:text-white mt-1">{stores.length}</Text>
            </div>
            <Store className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500 dark:text-gray-400">Lojas Ativas</Text>
              <Text className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{activeStores}</Text>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        
        <Card className="dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500 dark:text-gray-400">Total Pedidos</Text>
              <Text className="text-2xl font-bold dark:text-white mt-1">
                {totalOrders.toLocaleString('pt-BR')}
              </Text>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        
        <Card className="dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500 dark:text-gray-400">Faturamento Total</Text>
              <Text className="text-2xl font-bold dark:text-white mt-1">
                R$ {totalRevenue.toLocaleString('pt-BR')}
              </Text>
            </div>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Store className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Stores Table */}
      <Card className="dark:bg-gray-800">
        <Title className="dark:text-white mb-4">Lista de Lojas</Title>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="dark:text-gray-400">Loja</TableHeaderCell>
              <TableHeaderCell className="dark:text-gray-400">Endereço</TableHeaderCell>
              <TableHeaderCell className="dark:text-gray-400">Telefone</TableHeaderCell>
              <TableHeaderCell className="dark:text-gray-400">Status</TableHeaderCell>
              <TableHeaderCell className="dark:text-gray-400">Pedidos</TableHeaderCell>
              <TableHeaderCell className="dark:text-gray-400">Faturamento</TableHeaderCell>
              <TableHeaderCell className="dark:text-gray-400">Ações</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-gray-500" />
                    <div>
                      <Text className="font-medium dark:text-white">{store.name}</Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">{store.city}</Text>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <Text className="text-sm dark:text-gray-300">{store.address}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Text className="text-sm dark:text-gray-300">{store.phone}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color={store.status === 'active' ? 'green' : 'yellow'}>
                    {store.status === 'active' ? 'Ativa' : 'Manutenção'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Text className="dark:text-gray-300">{store.orders.toLocaleString('pt-BR')}</Text>
                </TableCell>
                <TableCell>
                  <Text className="font-semibold dark:text-white">
                    R$ {store.revenue.toLocaleString('pt-BR')}
                  </Text>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}