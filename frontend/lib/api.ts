/**
 * API Client - ENHANCED VERSION WITH FILTERS AND PRODUCT TIMELINE
 * Handles all communication with the backend
 */

import axios from 'axios'
import { format } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log('Request params:', config.params) // Log params to debug filters
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error)
    return Promise.reject(error)
  }
)

// Types for API responses
export interface MetricValue {
  value: number
  change: number
  previous: number
}

export interface OverviewMetrics {
  total_orders: MetricValue
  total_revenue: MetricValue
  avg_ticket: MetricValue
  unique_customers: MetricValue
}

export interface OverviewResponse {
  period: {
    start: string
    end: string
  }
  metrics: OverviewMetrics
}

export interface TimelinePoint {
  period: string
  orders: number
  revenue: number
  avg_ticket: number
}

export interface TimelineResponse {
  granularity: string
  data: TimelinePoint[]
}

export interface ProductCustomization {
  name: string
  count: number
}

export interface TopProduct {
  id: number
  name: string
  times_sold: number
  total_quantity: number
  revenue: number
  avg_price: number
  top_customizations: ProductCustomization[]
}

export interface TopProductsResponse {
  products: TopProduct[]
}

export interface Insight {
  type: 'warning' | 'success' | 'info'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  metric?: any
  action: string
}

export interface InsightsResponse {
  insights: Insight[]
}

export interface ChannelPerformance {
  name: string
  type: string
  orders: number
  revenue: number
  avg_ticket: number
  avg_delivery_time: number | null
  cancellation_rate: number
}

export interface ChannelsResponse {
  channels: ChannelPerformance[]
}

export interface NaturalQueryResponse {
  query: string
  interpretation: string
  answer: string
  confidence: number
}

// ========== NOVAS INTERFACES PARA PRODUCT TIMELINE ==========
export interface Product {
  id: string
  name: string
  category?: string
  total_sold?: number
}

export interface ProductsListResponse {
  products: Product[]
}

export interface ProductTimelinePoint {
  period: string
  orders: number
  quantity: number
  revenue: number
  avg_price: number
}

export interface ProductTimelineResponse {
  product: {
    id: number
    name: string
    category?: string
  }
  granularity: string
  data: ProductTimelinePoint[]
}
// ========== FIM DAS NOVAS INTERFACES ==========

// Helper function to build filter params
const buildFilterParams = (params: any) => {
  const queryParams: any = {}
  
  // Basic params
  if (params.start_date) queryParams.start_date = format(params.start_date, 'yyyy-MM-dd')
  if (params.end_date) queryParams.end_date = format(params.end_date, 'yyyy-MM-dd')
  
  // Store ID - only add if not null/undefined
  if (params.store_id !== null && params.store_id !== undefined) {
    queryParams.store_id = params.store_id
  }
  
  if (params.granularity) queryParams.granularity = params.granularity
  if (params.limit) queryParams.limit = params.limit
  
  // Advanced filter params - handle both arrays and strings
  const handleFilterParam = (paramValue: any): string | undefined => {
    if (!paramValue) return undefined
    if (typeof paramValue === 'string') return paramValue // Already a string
    if (Array.isArray(paramValue) && paramValue.length > 0) return paramValue.join(',')
    return undefined
  }
  
  const dayOfWeek = handleFilterParam(params.day_of_week)
  if (dayOfWeek) queryParams.day_of_week = dayOfWeek
  
  const timeOfDay = handleFilterParam(params.time_of_day)
  if (timeOfDay) queryParams.time_of_day = timeOfDay
  
  const channels = handleFilterParam(params.channels)
  if (channels) queryParams.channels = channels
  
  const categories = handleFilterParam(params.categories)
  if (categories) queryParams.categories = categories
  
  const priceRange = handleFilterParam(params.price_range)
  if (priceRange) queryParams.price_range = priceRange
  
  const customerType = handleFilterParam(params.customer_type)
  if (customerType) queryParams.customer_type = customerType
  
  const deliveryZone = handleFilterParam(params.delivery_zone)
  if (deliveryZone) queryParams.delivery_zone = deliveryZone
  
  const orderSize = handleFilterParam(params.order_size)
  if (orderSize) queryParams.order_size = orderSize
  
  console.log('🔧 buildFilterParams - Input:', params)
  console.log('🔧 buildFilterParams - Output:', queryParams)
  
  return queryParams
}

// API functions
export const analyticsAPI = {
  // Get overview metrics with filters
  getOverview: async (params?: any) => {
    const queryParams = buildFilterParams(params || {})
    
    console.log('Overview API call with params:', queryParams)
    
    const response = await api.get<OverviewResponse>('/analytics/overview', { params: queryParams })
    return response.data
  },

  // Get timeline data with filters
  getTimeline: async (params?: any) => {
    const queryParams = buildFilterParams(params || {})
    
    console.log('Timeline API call with params:', queryParams)
    
    const response = await api.get<TimelineResponse>('/analytics/timeline', { params: queryParams })
    return response.data
  },

  // Get top products with filters
  getTopProducts: async (params?: any) => {
    const queryParams = buildFilterParams(params || {})
    
    console.log('Top Products API call with params:', queryParams)
    
    const response = await api.get<TopProductsResponse>('/analytics/top-products', { params: queryParams })
    return response.data
  },

  // Get business insights
  getInsights: async (store_id?: number | null) => {
    const params = store_id ? { store_id } : {}
    const response = await api.get<InsightsResponse>('/analytics/insights', { params })
    return response.data
  },

  // Get channels performance with filters
  getChannels: async (params?: any) => {
    const queryParams = buildFilterParams(params || {})
    
    console.log('Channels API call with params:', queryParams)
    
    const response = await api.get<ChannelsResponse>('/analytics/channels', { params: queryParams })
    return response.data
  },

  // Natural language query
  naturalQuery: async (query: string) => {
    const response = await api.post<NaturalQueryResponse>('/analytics/natural-query', { query })
    return response.data
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/analytics/health')
    return response.data
  },

  // ========== NOVAS FUNÇÕES PARA PRODUCT TIMELINE ==========
  
  // Buscar lista de produtos
  getProductsList: async (params?: any) => {
    const queryParams = buildFilterParams(params || {})
    
    console.log('Products List API call with params:', queryParams)
    
    const response = await api.get<ProductsListResponse>('/analytics/products-list', { 
      params: queryParams 
    })
    return response.data
  },

  // Buscar timeline de produto específico
  getProductTimeline: async (params: any) => {
    const queryParams: any = {
      product_id: params.product_id,
      granularity: params.granularity || 'day'
    }
    
    // Adicionar datas
    if (params.start_date) queryParams.start_date = format(params.start_date, 'yyyy-MM-dd')
    if (params.end_date) queryParams.end_date = format(params.end_date, 'yyyy-MM-dd')
    
    // Adicionar filtros
    if (params.channels?.length > 0) {
      queryParams.channels = params.channels.join(',')
    }
    if (params.day_of_week?.length > 0) {
      queryParams.day_of_week = params.day_of_week.join(',')
    }
    if (params.time_of_day?.length > 0) {
      queryParams.time_of_day = params.time_of_day.join(',')
    }
    
    console.log('Product Timeline API call with params:', queryParams)
    
    const response = await api.get<ProductTimelineResponse>('/analytics/product-timeline', { 
      params: queryParams 
    })
    return response.data
  },

  fetchWidgetData: async (config: {
      dataSource: string
      metric: string
      dimension?: string
      aggregation: string
      dateRange?: { start: Date | null; end: Date | null }
      limit?: number
      sortBy?: string
      filters?: Record<string, any>
    }) => {
      const payload = {
        data_source: config.dataSource,
        metric: config.metric,
        dimension: config.dimension,
        aggregation: config.aggregation,
        date_range: config.dateRange ? {
          start: config.dateRange.start ? config.dateRange.start.toISOString() : null,
          end: config.dateRange.end ? config.dateRange.end.toISOString() : null
        } : null,
        limit: config.limit || 10,
        sort_by: config.sortBy || 'desc',
        filters: config.filters
      }

      console.log('Widget Data API call with payload:', payload)

      const response = await api.post('/analytics/widget-data', payload)
      return response.data
  },
  
  // ========== FIM DAS NOVAS FUNÇÕES ==========
}