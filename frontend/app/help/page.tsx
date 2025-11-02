/**
 * Help Page
 * Central de ajuda e documentação
 */

'use client'

import { Card, Title, Text, TextInput, Accordion, AccordionHeader, AccordionBody, Button } from '@tremor/react'
import { HelpCircle, Search, MessageCircle, FileText, Video, Phone, Mail, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: 'Como interpretar as métricas do dashboard?',
    answer: 'As métricas principais mostram: Pedidos (total de vendas), Faturamento (receita total), Ticket Médio (valor médio por pedido) e Clientes Únicos. As porcentagens indicam a variação em relação ao período anterior.'
  },
  {
    question: 'Como usar a busca em linguagem natural?',
    answer: 'Digite perguntas como "Quanto vendi ontem?", "Qual o produto mais vendido?" ou "Mostre o ticket médio". O sistema interpreta sua pergunta e retorna os dados relevantes.'
  },
  {
    question: 'Como exportar dados para Excel?',
    answer: 'Clique no botão "Export CSV" no header do dashboard. O arquivo baixado pode ser aberto no Excel e contém todas as métricas, produtos, e performance por canal.'
  },
  {
    question: 'O que significam os insights automáticos?',
    answer: 'Os insights são alertas gerados automaticamente pelo sistema: Vermelho (problemas), Verde (oportunidades) e Azul (informações). Cada insight inclui uma ação recomendada.'
  },
  {
    question: 'Como alterar o período de análise?',
    answer: 'Use o seletor de datas no dashboard. Você pode escolher períodos pré-definidos (Hoje, Últimos 7 dias, etc) ou selecionar datas específicas.'
  },
  {
    question: 'Como funciona o Dark Mode?',
    answer: 'Clique no botão Dark/Light no header do dashboard. A preferência é salva automaticamente e será mantida quando você retornar.'
  }
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Central de Ajuda</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Encontre respostas e aprenda a usar o sistema
        </p>
      </div>

      {/* Search Bar */}
      <Card className="dark:bg-gray-800">
        <TextInput
          icon={Search}
          placeholder="Buscar ajuda..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <Title className="dark:text-white">Documentação</Title>
              <Text className="text-gray-500 dark:text-gray-400">Guias detalhados</Text>
            </div>
          </div>
        </Card>

        <Card className="dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <Title className="dark:text-white">Tutoriais</Title>
              <Text className="text-gray-500 dark:text-gray-400">Vídeos explicativos</Text>
            </div>
          </div>
        </Card>

        <Card className="dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <Title className="dark:text-white">Suporte</Title>
              <Text className="text-gray-500 dark:text-gray-400">Fale conosco</Text>
            </div>
          </div>
        </Card>
      </div>

      {/* FAQs */}
      <Card className="dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <Title className="dark:text-white">Perguntas Frequentes</Title>
        </div>
        
        <Accordion className="space-y-2">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="border dark:border-gray-700 rounded-lg">
              <AccordionHeader className="dark:text-white">
                {faq.question}
              </AccordionHeader>
              <AccordionBody className="dark:text-gray-300">
                {faq.answer}
              </AccordionBody>
            </div>
          ))}
        </Accordion>
        
        {filteredFaqs.length === 0 && (
          <Text className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma pergunta encontrada para "{searchTerm}"
          </Text>
        )}
      </Card>

      {/* Contact Support */}
      <Card className="dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <Title className="dark:text-white">Precisa de mais ajuda?</Title>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-1" />
            <div>
              <Text className="font-medium dark:text-white">Telefone</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">(11) 4000-1234</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-500">Seg-Sex 9h-18h</Text>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-1" />
            <div>
              <Text className="font-medium dark:text-white">Email</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">suporte@nola.com.br</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-500">Resposta em até 24h</Text>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-1" />
            <div>
              <Text className="font-medium dark:text-white">Chat Online</Text>
              <Button size="xs" variant="secondary" className="mt-1">
                Iniciar Chat
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Resources */}
      <Card className="dark:bg-gray-800">
        <Title className="dark:text-white mb-4">Recursos Úteis</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
            <ExternalLink className="h-4 w-4" />
            Guia de Início Rápido
          </a>
          <a href="#" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
            <ExternalLink className="h-4 w-4" />
            Melhores Práticas
          </a>
          <a href="#" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
            <ExternalLink className="h-4 w-4" />
            API Documentation
          </a>
          <a href="#" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
            <ExternalLink className="h-4 w-4" />
            Changelog
          </a>
        </div>
      </Card>
    </div>
  )
}