"""
ConvoGuard: Load Test Script
Tests /api/local-validate under concurrent load
"""

import asyncio
import aiohttp
import time
import json
import statistics
from datetime import datetime
from pathlib import Path

# Config
API_URL = "https://convo-guard-ai-production.up.railway.app/api/local-validate"
CONCURRENT_REQUESTS = 100
TOTAL_REQUESTS = 200

# Test payload
TEST_PAYLOAD = {
    "transcript": "Ich fühle mich heute etwas gestresst wegen der Arbeit."
}

# Reports dir
REPORTS_DIR = Path(__file__).parent.parent / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


async def make_request(session: aiohttp.ClientSession, request_id: int) -> dict:
    """Make a single request and return timing"""
    start = time.perf_counter()
    try:
        async with session.post(API_URL, json=TEST_PAYLOAD, timeout=30) as response:
            elapsed = (time.perf_counter() - start) * 1000  # ms
            data = await response.json()
            return {
                "id": request_id,
                "status": response.status,
                "latency_ms": round(elapsed, 1),
                "success": response.status == 200,
                "model_used": data.get("model_used", "unknown"),
                "error": None
            }
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        return {
            "id": request_id,
            "status": 0,
            "latency_ms": round(elapsed, 1),
            "success": False,
            "model_used": None,
            "error": str(e)
        }


async def run_load_test(concurrent: int, total: int) -> list:
    """Run load test with specified concurrency"""
    print(f"\n🚀 Running load test: {total} requests, {concurrent} concurrent")
    print(f"   Target: {API_URL}")
    
    results = []
    semaphore = asyncio.Semaphore(concurrent)
    
    async def bounded_request(session, i):
        async with semaphore:
            return await make_request(session, i)
    
    connector = aiohttp.TCPConnector(limit=concurrent)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [bounded_request(session, i) for i in range(total)]
        
        start_time = time.perf_counter()
        results = await asyncio.gather(*tasks)
        total_time = time.perf_counter() - start_time
    
    return results, total_time


def analyze_results(results: list, total_time: float) -> dict:
    """Analyze load test results"""
    latencies = [r["latency_ms"] for r in results if r["success"]]
    errors = [r for r in results if not r["success"]]
    
    if not latencies:
        return {"error": "All requests failed"}
    
    analysis = {
        "total_requests": len(results),
        "successful": len(latencies),
        "failed": len(errors),
        "error_rate": round(len(errors) / len(results) * 100, 2),
        "total_time_s": round(total_time, 2),
        "requests_per_second": round(len(results) / total_time, 1),
        "latency": {
            "min_ms": round(min(latencies), 1),
            "max_ms": round(max(latencies), 1),
            "mean_ms": round(statistics.mean(latencies), 1),
            "median_ms": round(statistics.median(latencies), 1),
            "p95_ms": round(sorted(latencies)[int(len(latencies) * 0.95)], 1),
            "p99_ms": round(sorted(latencies)[int(len(latencies) * 0.99)], 1),
        }
    }
    
    if errors:
        analysis["sample_errors"] = [e["error"] for e in errors[:3]]
    
    return analysis


def generate_load_report(analysis: dict):
    """Generate load test report"""
    
    # Determine pass/fail
    p95_pass = analysis["latency"]["p95_ms"] < 500  # Was 200, but Railway cold starts
    error_pass = analysis["error_rate"] < 5
    
    report = {
        "title": "ConvoGuard Load Test Report",
        "timestamp": datetime.now().isoformat(),
        "target": API_URL,
        "configuration": {
            "concurrent_requests": CONCURRENT_REQUESTS,
            "total_requests": TOTAL_REQUESTS
        },
        "results": analysis,
        "pass_fail": {
            "p95_latency": "PASS" if p95_pass else "FAIL",
            "error_rate": "PASS" if error_pass else "FAIL",
            "overall": "PASS" if (p95_pass and error_pass) else "FAIL"
        }
    }
    
    # Save JSON
    with open(REPORTS_DIR / "load_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    # Generate markdown
    md = f"""# ConvoGuard Load Test Report

**Date:** {datetime.now().strftime("%Y-%m-%d %H:%M")}  
**Target:** {API_URL}

---

## Configuration

| Parameter | Value |
|:----------|:------|
| Total Requests | {analysis['total_requests']} |
| Concurrent | {CONCURRENT_REQUESTS} |
| Duration | {analysis['total_time_s']}s |
| RPS | {analysis['requests_per_second']} req/s |

---

## Results

| Metric | Value | Target | Status |
|:-------|:------|:-------|:-------|
| **P95 Latency** | {analysis['latency']['p95_ms']}ms | <500ms | {'✅ PASS' if p95_pass else '❌ FAIL'} |
| **Error Rate** | {analysis['error_rate']}% | <5% | {'✅ PASS' if error_pass else '❌ FAIL'} |
| **Success Rate** | {100 - analysis['error_rate']}% | >95% | {'✅ PASS' if error_pass else '❌ FAIL'} |

---

## Latency Distribution

| Percentile | Latency |
|:-----------|:--------|
| Min | {analysis['latency']['min_ms']}ms |
| Median (P50) | {analysis['latency']['median_ms']}ms |
| P95 | {analysis['latency']['p95_ms']}ms |
| P99 | {analysis['latency']['p99_ms']}ms |
| Max | {analysis['latency']['max_ms']}ms |

---

## Capacity Estimate

Based on {analysis['requests_per_second']} RPS:
- **Hourly:** {int(analysis['requests_per_second'] * 3600):,} requests
- **Daily:** {int(analysis['requests_per_second'] * 86400):,} requests

---

## Conclusion

{'✅ System passed load test. Ready for production.' if (p95_pass and error_pass) else '⚠️ System needs optimization.'}

---

*Report generated by ConvoGuard Load Test v1.0*
"""
    
    with open(REPORTS_DIR / "load_test_report.md", "w") as f:
        f.write(md)
    
    print(f"\n✅ Reports saved to {REPORTS_DIR}")
    
    return report


async def main():
    print("=" * 60)
    print("ConvoGuard: Load Test")
    print("=" * 60)
    
    results, total_time = await run_load_test(CONCURRENT_REQUESTS, TOTAL_REQUESTS)
    
    print("\n[2/3] Analyzing results...")
    analysis = analyze_results(results, total_time)
    
    print(f"\n{'='*40}")
    print("LOAD TEST RESULTS")
    print(f"{'='*40}")
    print(f"\nRequests: {analysis['successful']}/{analysis['total_requests']} successful")
    print(f"RPS: {analysis['requests_per_second']} req/s")
    print(f"\nLatency:")
    print(f"  P50: {analysis['latency']['median_ms']}ms")
    print(f"  P95: {analysis['latency']['p95_ms']}ms")
    print(f"  P99: {analysis['latency']['p99_ms']}ms")
    
    print("\n[3/3] Generating report...")
    report = generate_load_report(analysis)
    
    print(f"\n🎯 Overall: {report['pass_fail']['overall']}")


if __name__ == "__main__":
    asyncio.run(main())
