"""
Test Suite for Nola Analytics API
Tests all endpoints for correctness and performance
"""

import pytest
from fastapi.testclient import TestClient
from datetime import date, datetime, timedelta
import time

from app.main import app

client = TestClient(app)

class TestAnalyticsAPI:
    """Test class for analytics endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns API info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert data["name"] == "Nola Analytics"
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/api/v1/analytics/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert "cache" in data
    
    def test_overview_endpoint(self):
        """Test overview metrics endpoint"""
        response = client.get("/api/v1/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "period" in data
        assert "metrics" in data
        
        # Check metrics exist
        metrics = data["metrics"]
        assert "total_orders" in metrics
        assert "total_revenue" in metrics
        assert "avg_ticket" in metrics
        assert "unique_customers" in metrics
        
        # Check metric structure
        for metric in metrics.values():
            assert "value" in metric
            assert "change" in metric
            assert "previous" in metric
    
    def test_overview_with_date_filter(self):
        """Test overview with date range filter"""
        start_date = "2024-01-01"
        end_date = "2024-01-31"
        
        response = client.get(
            f"/api/v1/analytics/overview?start_date={start_date}&end_date={end_date}"
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check period matches request
        assert data["period"]["start"] == start_date
        assert data["period"]["end"] == end_date
    
    def test_timeline_endpoint(self):
        """Test timeline data endpoint"""
        response = client.get("/api/v1/analytics/timeline")
        assert response.status_code == 200
        data = response.json()
        
        assert "granularity" in data
        assert "data" in data
        assert isinstance(data["data"], list)
        
        # Check data structure if not empty
        if data["data"]:
            point = data["data"][0]
            assert "period" in point
            assert "orders" in point
            assert "revenue" in point
            assert "avg_ticket" in point
    
    def test_timeline_granularities(self):
        """Test different timeline granularities"""
        granularities = ["hour", "day", "week", "month"]
        
        for gran in granularities:
            response = client.get(f"/api/v1/analytics/timeline?granularity={gran}")
            assert response.status_code == 200
            data = response.json()
            assert data["granularity"] == gran
    
    def test_top_products_endpoint(self):
        """Test top products endpoint"""
        response = client.get("/api/v1/analytics/top-products")
        assert response.status_code == 200
        data = response.json()
        
        assert "products" in data
        assert isinstance(data["products"], list)
        
        # Check product structure if not empty
        if data["products"]:
            product = data["products"][0]
            assert "id" in product
            assert "name" in product
            assert "times_sold" in product
            assert "revenue" in product
            assert "top_customizations" in product
    
    def test_insights_endpoint(self):
        """Test business insights endpoint"""
        response = client.get("/api/v1/analytics/insights")
        assert response.status_code == 200
        data = response.json()
        
        assert "insights" in data
        assert isinstance(data["insights"], list)
        
        # Check insight structure if not empty
        if data["insights"]:
            insight = data["insights"][0]
            assert "type" in insight
            assert "priority" in insight
            assert "title" in insight
            assert "description" in insight
            assert "action" in insight
    
    def test_channels_performance_endpoint(self):
        """Test channels performance endpoint"""
        response = client.get("/api/v1/analytics/channels")
        assert response.status_code == 200
        data = response.json()
        
        assert "channels" in data
        assert isinstance(data["channels"], list)
        
        # Check channel structure if not empty
        if data["channels"]:
            channel = data["channels"][0]
            assert "name" in channel
            assert "type" in channel
            assert "orders" in channel
            assert "revenue" in channel
            assert "avg_ticket" in channel
    
    def test_natural_query_endpoint(self):
        """Test natural language query endpoint"""
        queries = [
            "Quanto vendi hoje?",
            "Qual o produto mais vendido?",
            "Mostre o ticket médio"
        ]
        
        for query in queries:
            response = client.post(
                "/api/v1/analytics/natural-query",
                json={"query": query}
            )
            assert response.status_code == 200
            data = response.json()
            
            assert "query" in data
            assert "interpretation" in data
            assert "answer" in data
            assert "confidence" in data
    
    def test_cache_performance(self):
        """Test that caching improves performance"""
        endpoint = "/api/v1/analytics/overview"
        
        # First request (cache miss)
        start = time.time()
        response1 = client.get(endpoint)
        time1 = time.time() - start
        
        # Second request (cache hit)
        start = time.time()
        response2 = client.get(endpoint)
        time2 = time.time() - start
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Second request should be faster (cache hit)
        # Allow some margin for variation
        if time1 > 0.1:  # Only test if first request took meaningful time
            assert time2 < time1 * 0.5, f"Cache not improving performance: {time1:.3f}s vs {time2:.3f}s"
    
    def test_invalid_granularity(self):
        """Test invalid granularity returns error"""
        response = client.get("/api/v1/analytics/timeline?granularity=invalid")
        assert response.status_code == 422  # Validation error
    
    def test_performance_requirement(self):
        """Test that queries complete within 500ms requirement"""
        endpoints = [
            "/api/v1/analytics/overview",
            "/api/v1/analytics/timeline",
            "/api/v1/analytics/top-products",
            "/api/v1/analytics/channels"
        ]
        
        for endpoint in endpoints:
            start = time.time()
            response = client.get(endpoint)
            duration = time.time() - start
            
            assert response.status_code == 200
            assert duration < 0.5, f"Endpoint {endpoint} took {duration:.3f}s (limit: 0.5s)"

# Run tests with: pytest test_api.py -v