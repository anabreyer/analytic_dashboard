/**
 * NaturalLanguageSearch Component
 * Allows natural language queries about the data
 */

'use client'

import { useState } from 'react'
import { Card, Text, TextInput, Button } from '@tremor/react'
import { useMutation } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import { Search, Sparkles, MessageCircle } from 'lucide-react'
import { debounce } from '@/lib/utils'

export function NaturalLanguageSearch() {
  const [query, setQuery] = useState('')
  const [lastResult, setLastResult] = useState<any>(null)

  // Mutation for natural language query
  const mutation = useMutation({
    mutationFn: (searchQuery: string) => analyticsAPI.naturalQuery(searchQuery),
    onSuccess: (data) => {
      setLastResult(data)
    },
  })

  const handleSearch = () => {
    if (query.trim()) {
      mutation.mutate(query)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const exampleQueries = [
    "Quanto vendi ontem?",
    "Qual o produto mais vendido?",
    "Mostre o ticket médio",
    "Qual o melhor canal de vendas?"
  ]

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <Text className="font-semibold text-gray-900">
            Pergunte em linguagem natural
          </Text>
        </div>

        <div className="flex gap-2">
          <TextInput
            placeholder="Ex: Quanto vendi ontem no iFood?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            icon={MessageCircle}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || mutation.isPending}
            icon={Search}
            color="indigo"
          >
            {mutation.isPending ? 'Analisando...' : 'Perguntar'}
          </Button>
        </div>

        {/* Example queries */}
        <div className="flex flex-wrap gap-2">
          <Text className="text-xs text-gray-600">Exemplos:</Text>
          {exampleQueries.map((example) => (
            <button
              key={example}
              onClick={() => {
                setQuery(example)
                mutation.mutate(example)
              }}
              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        {/* Result display */}
        {lastResult && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text className="text-xs text-gray-500">Pergunta:</Text>
                <Text className="text-xs text-gray-500">
                  Confiança: {(lastResult.confidence * 100).toFixed(0)}%
                </Text>
              </div>
              <Text className="font-medium text-gray-900">{lastResult.query}</Text>
              
              <div className="pt-2 border-t border-gray-100">
                <Text className="text-xs text-gray-500 mb-1">Resposta:</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {lastResult.answer}
                </Text>
              </div>
              
              {lastResult.interpretation && (
                <div className="text-xs text-gray-500">
                  Interpretação: {lastResult.interpretation}
                </div>
              )}
            </div>
          </div>
        )}

        {mutation.isError && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-red-600">
              Desculpe, não consegui entender sua pergunta. Tente reformular.
            </Text>
          </div>
        )}
      </div>
    </Card>
  )
}