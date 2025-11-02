"""
Pydantic Schemas for Request/Response Validation
Defines the structure of data sent to and received from the API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, date
from decimal import Decimal

# ===== Request Schemas =====

class DateRangeFilter(BaseModel):
    """Base schema for date range filtering"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    store_id: Optional[int] = None
    channel_id: Optional[int] = None

class TimelineRequest(BaseModel):
    """Request schema for timeline endpoint"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    store_id: Optional[int] = None
    granularity: Literal["hour", "day", "week", "month"] = "day"

# ===== Response Schemas =====

class MetricValue(BaseModel):
    """Schema for a metric with current value and change"""
    value: float
    change: float = Field(description="Percentage change from previous period")
    previous: float = Field(description="Previous period value")

class OverviewMetrics(BaseModel):
    """Schema for overview dashboard metrics"""
    total_orders: MetricValue
    total_revenue: MetricValue
    avg_ticket: MetricValue
    unique_customers: MetricValue

class OverviewResponse(BaseModel):
    """Response schema for overview endpoint"""
    period: Dict[str, str]
    metrics: OverviewMetrics

class TimelinePoint(BaseModel):
    """Single point in timeline data"""
    period: str
    orders: int
    revenue: float
    avg_ticket: float

class TimelineResponse(BaseModel):
    """Response schema for timeline endpoint"""
    granularity: str
    data: List[TimelinePoint]

class ProductCustomization(BaseModel):
    """Product customization detail"""
    name: str
    count: int

class TopProduct(BaseModel):
    """Top selling product with details"""
    id: int
    name: str
    times_sold: int
    total_quantity: float
    revenue: float
    avg_price: float
    top_customizations: List[ProductCustomization]

class TopProductsResponse(BaseModel):
    """Response schema for top products endpoint"""
    products: List[TopProduct]

class InsightMetric(BaseModel):
    """Metrics associated with an insight"""
    current: Optional[float] = None
    previous: Optional[float] = None
    hour: Optional[int] = None
    daily_avg: Optional[int] = None
    orders: Optional[int] = None
    avg_ticket: Optional[float] = None

class Insight(BaseModel):
    """Single business insight"""
    type: str = Field(description="Type: warning, success, info")
    priority: str = Field(description="Priority: high, medium, low")
    title: str
    description: str
    metric: Optional[InsightMetric] = None
    action: str = Field(description="Recommended action")

class InsightsResponse(BaseModel):
    """Response schema for insights endpoint"""
    insights: List[Insight]

class ChannelPerformance(BaseModel):
    """Channel performance metrics"""
    name: str
    type: str
    orders: int
    revenue: float
    avg_ticket: float
    avg_delivery_time: Optional[float] = None
    cancellation_rate: float

class ChannelsResponse(BaseModel):
    """Response schema for channels performance endpoint"""
    channels: List[ChannelPerformance]

class CustomerSegment(BaseModel):
    """Customer segmentation data"""
    segment: str
    count: int
    avg_ltv: float
    avg_days_inactive: int
    action: str

class CustomersResponse(BaseModel):
    """Response schema for customer segments endpoint"""
    segments: List[CustomerSegment]

class HourlyPattern(BaseModel):
    """Hourly sales pattern"""
    hour: int
    orders: int
    revenue: float
    is_peak: bool

class HourlyPatternsResponse(BaseModel):
    """Response schema for hourly patterns endpoint"""
    patterns: List[HourlyPattern]
    peak_hours: List[int]

# ===== Natural Language Query Schemas =====

class NaturalQueryRequest(BaseModel):
    """Request for natural language query"""
    query: str = Field(description="Natural language question about the data")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")

class NaturalQueryResponse(BaseModel):
    """Response for natural language query"""
    query: str
    interpretation: str
    answer: str
    data: Optional[Dict[str, Any]] = None
    chart_type: Optional[str] = None
    confidence: float = Field(ge=0, le=1)

# ===== Export Schemas =====

class ExportRequest(BaseModel):
    """Request for data export"""
    # export_type: str = Field(regex="^(overview|products|timeline|custom)$")
    # format: str = Field(default="csv", regex="^(csv|excel|json)$")
    export_type: Literal["overview", "products", "timeline", "custom"]
    format: Literal["csv", "excel", "json"] = "csv"
    filters: Optional[DateRangeFilter] = None

class ExportResponse(BaseModel):
    """Response for export request"""
    file_url: str
    file_name: str
    expires_at: datetime

# ===== Error Schemas =====

class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None

# ===== Health Check =====

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    database: bool
    cache: bool
    timestamp: datetime

# ========== PRODUCT TIMELINE SCHEMAS (NOVOS) ==========

class Product(BaseModel):
    """Product basic information for selection"""
    id: str
    name: str
    category: Optional[str] = None
    total_sold: Optional[int] = 0

class ProductsListResponse(BaseModel):
    """Response for products list endpoint - for product selection"""
    products: List[Product]

class ProductTimelinePoint(BaseModel):
    """Timeline data point for a specific product"""
    period: str
    orders: int
    quantity: int
    revenue: float
    avg_price: float

class ProductTimelineResponse(BaseModel):
    """Response for product timeline endpoint - evolution over time"""
    product: Dict[str, Any]  # Contains id, name, category
    granularity: str
    data: List[ProductTimelinePoint]

class WidgetDataRequest(BaseModel):
    data_source: str
    metric: str
    dimension: Optional[str] = None
    aggregation: str = "sum"
    date_range: Optional[Dict[str, Any]] = None
    limit: int = 10
    sort_by: str = "desc"
    filters: Optional[Dict[str, Any]] = None

class WidgetDataResponse(BaseModel):
    success: bool
    data: List[Dict[str, Any]]
    period: Optional[Dict[str, Optional[str]]] = None
    error: Optional[str] = None

# ========== FIM DOS SCHEMAS DO PRODUCT TIMELINE ==========