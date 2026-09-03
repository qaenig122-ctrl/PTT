# EAII PTT Rating Fix

## What changed

- Reliability and performance are now separate dimensions.
- Reliability is normalized to 0-100 before the outer 80/20 weighting.
- Performance still contributes 20% through P95, P99, average latency and throughput.
- A slow endpoint no longer becomes CRITICAL merely because latency crosses a threshold.
- Endpoint CRITICAL is reserved for severe reliability problems; latency-only problems are treated as performance concerns.
- The final system rating is calculated only after the test reaches COMPLETED or STOPPED.
- During RUNNING/STARTING, live endpoint rows show `TESTING` instead of a final severity.
- Endpoint statistics are keyed by `METHOD + PATH`, preventing GET/POST/etc. with the same path from being merged.

## Reliability formula

Inside the reliability score:

- Failure rate: 35%
- HTTP 5xx: 20%
- Timeouts: 15%
- HTTP 4xx: 5%
- Stability: 5%

These internal weights total 80%, so the result is normalized back to 100 before applying the final reliability weight.

## Final formula

`Overall = Reliability × 0.80 + Performance × 0.20`

Therefore an endpoint with 0% errors but high latency can be reported as a performance concern without falsely presenting the entire test as a reliability failure.
