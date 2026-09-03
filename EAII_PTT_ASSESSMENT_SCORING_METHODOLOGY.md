# EAII PTT — Assessment & Scoring Methodology

## 1. Overall Assessment

EAII PTT evaluates system readiness using two dimensions:

| Dimension | Weight | Question |
|---|---:|---|
| Reliability | **80%** | Does the system continue working correctly, consistently, and reliably under load? |
| Performance | **20%** | Does the system respond efficiently and handle the expected workload? |

**Overall Score = (Reliability Score × 0.80) + (Performance Score × 0.20)**

Both component scores are normalized to 0–100.

## 2. Reliability — 80%

| Metric | Weight |
|---|---:|
| Success / Failure Rate | 35% |
| HTTP 5xx Errors | 20% |
| Timeouts | 15% |
| HTTP 4xx Errors | 5% |
| Consistency / Stability | 5% |
| **Total Reliability Dimension** | **80%** |

Reliability is the deployment-readiness gate. High throughput or low latency cannot compensate for critical reliability failures.

## 3. Performance — 20%

| Metric | Relative Weight inside Performance |
|---|---:|
| P95 Response Time | 40% |
| P99 Response Time | 25% |
| Average Response Time | 20% |
| RPS / Throughput | 15% |
| **Total** | **100%** |

The resulting Performance score contributes 20% to the overall score.

## 4. Critical Override

A critical reliability condition takes precedence over the numerical score. Examples include severe failure rate, HTTP 5xx failure, excessive timeouts, or other hard critical threshold violations.

**Critical reliability failure → CRITICAL / NOT READY.**

## 5. Final Assessment

| Label | Meaning |
|---|---|
| **READY** | Reliability and performance expectations are met with no significant blocking issues. |
| **READY WITH OPTIMIZATION INSIGHTS** | Reliability expectations are met; non-blocking optimization opportunities remain. |
| **NOT READY** | Required reliability or performance expectations are not met. |
| **CRITICAL** | Severe reliability/system failures require immediate attention before deployment. |

## 6. Finding Terminology

- **OPTIMIZATION INSIGHT** — improvement opportunity without a confirmed failure.
- **PERFORMANCE STRENGTH** — particularly strong endpoint/system performance.
- **PERFORMANCE WARNING** — performance needs monitoring or improvement.
- **PERFORMANCE ISSUE** — significant performance problem.
- **BOTTLENECK** — evidence of a component limiting capacity.
- **CRITICAL ISSUE** — severe failure requiring immediate action.

## 7. Assessment Principle

> **A system must be reliable before it can be considered performant.**

The report presents reliability evidence first, followed by performance evidence, endpoint findings, and the final deployment-readiness assessment.
