/**
 * Settings Page
 * Configurações do sistema
 */

'use client'

import { Card, Title, Text, Button, TextInput, Select, SelectItem, Switch } from '@tremor/react'
import { Settings, User, Bell, Shield, Database, Palette, Save, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <Title className="dark:text-white">Perfil</Title>
            <Text className="text-gray-500 dark:text-gray-400">Informações da conta</Text>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <TextInput placeholder="Seu nome" defaultValue="João Silva" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <TextInput placeholder="seu@email.com" defaultValue="joao@nola.com" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
            <TextInput placeholder="(11) 99999-9999" defaultValue="(11) 98765-4321" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
            <Select defaultValue="manager" className="mt-1">
              <SelectItem value="owner">Proprietário</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="analyst">Analista</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <Title className="dark:text-white">Notificações</Title>
            <Text className="text-gray-500 dark:text-gray-400">Configure alertas e notificações</Text>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <Text className="font-medium dark:text-white">Notificações Push</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Receba alertas em tempo real</Text>
            </div>
            <Switch checked={notifications} onChange={setNotifications} />
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <Text className="font-medium dark:text-white">Alertas por Email</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Resumo diário por email</Text>
            </div>
            <Switch checked={emailAlerts} onChange={setEmailAlerts} />
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <Text className="font-medium dark:text-white">Auto-refresh</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Atualizar dados automaticamente</Text>
            </div>
            <Switch checked={autoRefresh} onChange={setAutoRefresh} />
          </div>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <Title className="dark:text-white">Sistema</Title>
            <Text className="text-gray-500 dark:text-gray-400">Configurações avançadas</Text>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Idioma</label>
            <Select defaultValue="pt-BR" className="mt-1">
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fuso Horário</label>
            <Select defaultValue="america-sp" className="mt-1">
              <SelectItem value="america-sp">América/São Paulo</SelectItem>
              <SelectItem value="america-rj">América/Rio de Janeiro</SelectItem>
              <SelectItem value="america-manaus">América/Manaus</SelectItem>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Formato de Data</label>
            <Select defaultValue="dd/mm/yyyy" className="mt-1">
              <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
              <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
              <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Moeda</label>
            <Select defaultValue="BRL" className="mt-1">
              <SelectItem value="BRL">Real (R$)</SelectItem>
              <SelectItem value="USD">Dólar (US$)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" icon={RefreshCw}>
          Resetar
        </Button>
        <Button icon={Save} color="blue">
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}