"""
Analytics API Endpoints - VERSÃO FINAL CORRIGIDA
Com todos os endpoints funcionando através do AnalyticsService
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta, date
from typing import Optional
import logging

from ..core.database import get_db
from ..core.cache import cache, cache_key_builder
from ..core.config import settings
from ..services.analytics_service import AnalyticsService
from ..schemas import schemas
from .nlp_processor import NaturalLanguageProcessor

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/overview", response_model=schemas.OverviewResponse)
async def get_overview(
    # Parâmetros básicos existentes
    start_date: Optional[date] = Query(None, description="Start date for analysis"),
    end_date: Optional[date] = Query(None, description="End date for analysis"),
    store_id: Optional[int] = Query(None, description="Filter by store ID"),
    
    # NOVOS PARÂMETROS DE FILTRO
    channels: Optional[str] = Query(None, description="Comma-separated channels: ifood,rappi,whatsapp"),
    day_of_week: Optional[str] = Query(None, description="Comma-separated days: mon,tue,wed"),
    time_of_day: Optional[str] = Query(None, description="Comma-separated times: morning,afternoon,evening"),
    categories: Optional[str] = Query(None, description="Comma-separated categories: burgers,drinks"),
    customer_type: Optional[str] = Query(None, description="Comma-separated types: new,returning,vip"),
    price_range: Optional[str] = Query(None, description="Comma-separated ranges: low,medium,high"),
    delivery_zone: Optional[str] = Query(None, description="Comma-separated zones: north,south"),
    order_size: Optional[str] = Query(None, description="Comma-separated sizes: small,medium,large"),
    
    db: Session = Depends(get_db)
):
    """
    Get overview metrics with advanced filtering support
    """
    try:
        # Log dos filtros recebidos
        logger.info(f"📊 Overview API - Filtros recebidos:")
        logger.info(f"  - channels: {channels}")
        logger.info(f"  - day_of_week: {day_of_week}")
        logger.info(f"  - time_of_day: {time_of_day}")
        logger.info(f"  - categories: {categories}")
        
        # Build cache key com filtros
        cache_key = cache_key_builder(
            "overview",
            start_date=str(start_date) if start_date else None,
            end_date=str(end_date) if end_date else None,
            store_id=store_id,
            channels=channels,
            day_of_week=day_of_week,
            time_of_day=time_of_day,
            categories=categories,
            customer_type=customer_type
        )
        
        # Try cache first
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Cache HIT: {cache_key}")
            return cached_result
        
        # Preparar filtros para o service
        filters = {
            'channels': channels.split(',') if channels else None,
            'day_of_week': day_of_week.split(',') if day_of_week else None,
            'time_of_day': time_of_day.split(',') if time_of_day else None,
            'categories': categories.split(',') if categories else None,
            'customer_type': customer_type.split(',') if customer_type else None,
            'price_range': price_range.split(',') if price_range else None,
            'delivery_zone': delivery_zone.split(',') if delivery_zone else None,
            'order_size': order_size.split(',') if order_size else None,
        }
        
        # Chamar service com filtros
        service = AnalyticsService(db)
        result = service.get_overview_metrics(
            start_date, 
            end_date, 
            store_id,
            filters=filters  # PASSAR FILTROS PARA O SERVICE
        )
        
        # Cache the result
        cache.set(cache_key, result, ttl=settings.CACHE_TTL_OVERVIEW)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_overview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/timeline", response_model=schemas.TimelineResponse)
async def get_timeline(
    # Parâmetros básicos
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    store_id: Optional[int] = Query(None),
    granularity: str = Query("day", regex="^(hour|day|week|month)$"),
    
    # FILTROS AVANÇADOS
    channels: Optional[str] = Query(None),
    day_of_week: Optional[str] = Query(None),
    time_of_day: Optional[str] = Query(None),
    categories: Optional[str] = Query(None),
    customer_type: Optional[str] = Query(None),
    
    db: Session = Depends(get_db)
):
    """
    Get timeline data with filters
    """
    try:
        logger.info(f"📈 Timeline API - Filtros: channels={channels}, day_of_week={day_of_week}")
        
        cache_key = cache_key_builder(
            "timeline",
            start_date=str(start_date) if start_date else None,
            end_date=str(end_date) if end_date else None,
            store_id=store_id,
            granularity=granularity,
            channels=channels,
            day_of_week=day_of_week,
            time_of_day=time_of_day
        )
        
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Preparar filtros
        filters = {
            'channels': channels.split(',') if channels else None,
            'day_of_week': day_of_week.split(',') if day_of_week else None,
            'time_of_day': time_of_day.split(',') if time_of_day else None,
            'categories': categories.split(',') if categories else None,
            'customer_type': customer_type.split(',') if customer_type else None,
        }
        
        service = AnalyticsService(db)
        result = service.get_timeline_data(
            start_date, 
            end_date, 
            store_id, 
            granularity,
            filters=filters
        )
        
        cache.set(cache_key, result, ttl=settings.CACHE_TTL_TIMELINE)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_timeline: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-products", response_model=schemas.TopProductsResponse)
async def get_top_products(
    # Parâmetros básicos
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    store_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    
    # FILTROS AVANÇADOS
    channels: Optional[str] = Query(None),
    day_of_week: Optional[str] = Query(None),
    time_of_day: Optional[str] = Query(None),
    categories: Optional[str] = Query(None),
    customer_type: Optional[str] = Query(None),
    price_range: Optional[str] = Query(None),
    delivery_zone: Optional[str] = Query(None),
    order_size: Optional[str] = Query(None),
    
    db: Session = Depends(get_db)
):
    """
    Get top products with filters
    """
    try:
        logger.info(f"🍔 Top Products API - Filtros: channels={channels}, categories={categories}")
        
        cache_key = cache_key_builder(
            "top_products",
            start_date=str(start_date) if start_date else None,
            end_date=str(end_date) if end_date else None,
            store_id=store_id,
            limit=limit,
            channels=channels,
            categories=categories
        )
        
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Preparar filtros
        filters = {
            'channels': channels.split(',') if channels else None,
            'day_of_week': day_of_week.split(',') if day_of_week else None,
            'time_of_day': time_of_day.split(',') if time_of_day else None,
            'categories': categories.split(',') if categories else None,
            'customer_type': customer_type.split(',') if customer_type else None,
            'price_range': price_range.split(',') if price_range else None,
            'delivery_zone': delivery_zone.split(',') if delivery_zone else None,
            'order_size': order_size.split(',') if order_size else None,
        }
        
        service = AnalyticsService(db)
        result = service.get_top_products(
            start_date, 
            end_date, 
            store_id, 
            limit,
            filters=filters
        )
        
        cache.set(cache_key, result, ttl=settings.CACHE_TTL_PRODUCTS)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_top_products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights", response_model=schemas.InsightsResponse)
async def get_insights(
    store_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get business insights based on data analysis
    """
    try:
        cache_key = cache_key_builder("insights", store_id=store_id)
        
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
        
        service = AnalyticsService(db)
        result = service.get_business_insights(store_id)
        
        cache.set(cache_key, result, ttl=settings.CACHE_TTL_INSIGHTS)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/channels", response_model=schemas.ChannelsResponse)
async def get_channels(
    # Parâmetros básicos
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    
    # FILTROS AVANÇADOS
    channels: Optional[str] = Query(None),
    day_of_week: Optional[str] = Query(None),
    time_of_day: Optional[str] = Query(None),
    
    db: Session = Depends(get_db)
):
    """
    Get performance metrics by sales channel
    """
    try:
        logger.info(f"📱 Channels API - Filtros: channels={channels}")
        
        # Preparar filtros
        filters = {
            'channels': channels.split(',') if channels else None,
            'day_of_week': day_of_week.split(',') if day_of_week else None,
            'time_of_day': time_of_day.split(',') if time_of_day else None,
        }
        
        service = AnalyticsService(db)
        result = service.get_channels_performance(start_date, end_date, filters=filters)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_channels: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/natural-query", response_model=schemas.NaturalQueryResponse)
async def natural_query(
    request: schemas.NaturalQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Process natural language queries about the data
    """
    try:
        logger.info(f"🧠 Natural Query: {request.query}")
        
        processor = NaturalLanguageProcessor(db)
        result = processor.process_query(request.query, request.context)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in natural_query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ENDPOINTS PRODUCT TIMELINE CORRIGIDOS ====================

@router.get("/products-list", response_model=schemas.ProductsListResponse)
async def get_products_list(
    store_id: Optional[int] = Query(None, description="Filter by store ID"),
    search: Optional[str] = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    """
    Get list of all products for selection
    NOW USING AnalyticsService instead of direct queries
    """
    try:
        logger.info(f"📦 Fetching products list via AnalyticsService...")
        
        # Usar o AnalyticsService
        service = AnalyticsService(db)
        result = service.get_products_list(store_id)
        
        # Se houver search, filtrar os resultados
        if search and result.get('products'):
            filtered_products = [
                p for p in result['products'] 
                if search.lower() in p['name'].lower()
            ]
            result['products'] = filtered_products
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_products_list: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-timeline", response_model=schemas.ProductTimelineResponse)
async def get_product_timeline(
    product_id: int = Query(..., description="Product ID"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    granularity: str = Query("day", regex="^(hour|day|week|month)$"),
    
    # Filters
    channels: Optional[str] = Query(None, description="Comma-separated channel names"),
    day_of_week: Optional[str] = Query(None, description="Comma-separated days (mon,tue,wed,thu,fri,sat,sun)"),
    time_of_day: Optional[str] = Query(None, description="Comma-separated periods (morning,afternoon,evening,night)"),
    
    db: Session = Depends(get_db)
):
    """
    Get sales timeline for a specific product
    NOW USING AnalyticsService for data processing
    """
    try:
        logger.info(f"📊 Product timeline for {product_id} via AnalyticsService")
        logger.info(f"Period: {start_date} to {end_date}")
        logger.info(f"Filters: channels={channels}, day_of_week={day_of_week}, time_of_day={time_of_day}")
        
        # Build filters dict para o service
        filters = {}
        if channels:
            filters['channels'] = [c.strip().lower() for c in channels.split(',')]
        if day_of_week:
            filters['day_of_week'] = [d.strip().lower() for d in day_of_week.split(',')]
        if time_of_day:
            filters['time_of_day'] = [t.strip().lower() for t in time_of_day.split(',')]
        
        # Usar o AnalyticsService
        service = AnalyticsService(db)
        result = service.get_product_timeline(
            product_id=product_id,
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            filters=filters
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_product_timeline: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FIM DOS ENDPOINTS PRODUCT TIMELINE ====================

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint
    """
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = True
    except:
        db_status = False
    
    # Test cache connection
    cache_status = cache.client is not None
    
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": db_status,
        "cache": cache_status,
        "timestamp": datetime.utcnow()
    }

@router.get("/test-filters")
async def test_filters(
    channels: Optional[str] = Query(None, description="Test channels filter"),
    day_of_week: Optional[str] = Query(None, description="Test day filter"),
    time_of_day: Optional[str] = Query(None, description="Test time filter"),
    db: Session = Depends(get_db)
):
    """
    Test endpoint to verify filters are working
    """
    test_result = {
        "received_filters": {
            "channels": channels,
            "day_of_week": day_of_week,
            "time_of_day": time_of_day
        },
        "parsed_filters": {
            "channels": channels.split(',') if channels else None,
            "day_of_week": day_of_week.split(',') if day_of_week else None,
            "time_of_day": time_of_day.split(',') if time_of_day else None
        }
    }
    
    # Test database query
    try:
        # Testar contagem de vendas
        sales_count = db.execute(text("SELECT COUNT(*) FROM sales")).scalar()
        test_result["sales_count"] = sales_count
        
        # Testar channels disponíveis
        channels_db = db.execute(text("SELECT id, name FROM channels ORDER BY id")).fetchall()
        test_result["available_channels"] = [
            {"id": c.id, "name": c.name} 
            for c in channels_db
        ]
        
        # Testar produtos disponíveis
        products_count = db.execute(text("SELECT COUNT(*) FROM products")).scalar()
        test_result["products_count"] = products_count
        
    except Exception as e:
        test_result["error"] = str(e)
    
    return test_result