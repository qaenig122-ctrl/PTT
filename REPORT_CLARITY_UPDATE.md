# EAII PTT Report Clarity Update

## Changes

- Executive Findings now explains what the score and individual metrics mean in plain language.
- The report distinguishes the preferred **Target** from the **Warning** ceiling and **Critical** limit.
- SLA is explicitly defined as **Service Level Agreement**.
- A PASS in the SLA table means the metric remains within the acceptable SLA range; it does not necessarily mean the preferred target was achieved.
- Error-rate values above the preferred target but below the warning ceiling are shown as **acceptable / optimization opportunity**, not as warnings.
- Endpoint ratings marked **HEALTHY** are rendered green, including the endpoint error-rate value.
- The report no longer treats every non-zero endpoint error rate as a red value.
- “WARNING” notices are reserved for actual warning-threshold breaches.
- Final production-readiness wording is aligned with actual warning/critical conditions.
- HTTP 4xx/5xx counts are explained separately from the test engine's Error Rate so the report does not imply they are the same metric.

## Example interpretation

For a Spike Test with **1.34% Error Rate**, **≤1.0% preferred target**, **>5.0% warning ceiling**, and **>12.0% critical ceiling**:

- Preferred target: **not met**
- Warning threshold: **not crossed**
- Critical threshold: **not crossed**
- SLA gate: **PASS — acceptable range**
- Endpoint rating: **HEALTHY** when its own warning thresholds are not crossed
- Recommended wording: **acceptable for the tested condition, with monitoring/optimization recommended**

This prevents a healthy result from being visually presented as red or as a critical failure.
