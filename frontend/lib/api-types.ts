/**
 * API Type Definitions
 * Shared types for both real and mock APIs
 */

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