/**
 * Utility Functions
 * Helper functions for formatting and data manipulation
 */

/**
 * Format currency in Brazilian Real
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number, showSign = true): string {
  const formatted = `${Math.abs(value).toFixed(1)}%`
  if (!showSign) return formatted
  
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

/**
 * Format date in Brazilian format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

/**
 * Format datetime in Brazilian format
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}

/**
 * Get badge color based on value change
 */
export function getBadgeColor(change: number): 'green' | 'red' | 'gray' {
  if (change > 0) return 'green'
  if (change < 0) return 'red'
  return 'gray'
}

/**
 * Get insight icon based on type
 */
export function getInsightIcon(type: 'warning' | 'success' | 'info'): string {
  switch (type) {
    case 'warning':
      return '⚠️'
    case 'success':
      return '✅'
    case 'info':
      return 'ℹ️'
    default:
      return '📊'
  }
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50'
    case 'low':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Calculate growth rate
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is this week
 */
export function isThisWeek(date: Date): boolean {
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  
  return date >= weekStart && date <= weekEnd
}

/**
 * Get date range label
 */
export function getDateRangeLabel(start: Date | null, end: Date | null): string {
  if (!start && !end) return 'Últimos 30 dias'
  if (start && !end) return `Desde ${formatDate(start)}`
  if (!start && end) return `Até ${formatDate(end)}`
  return `${formatDate(start)} - ${formatDate(end)}`
}