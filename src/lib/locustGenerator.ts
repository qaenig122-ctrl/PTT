import { EndpointConfig, TestType } from '../types';

export interface LocustGeneratorParams {
  testId: string;
  testName: string;
  testType?: TestType;
  testPlan?: TestType[];
  isSequentialSuite?: boolean;
  testConfigs?: Partial<Record<TestType, { users: number; durationSec: number; rampUpSec?: number }>>;
  baseUrl: string;
  users: number;
  endpoints: EndpointConfig[];
}

export function generateLocustScript(params: LocustGeneratorParams): string {
  const {
    testId,
    testName,
    testType = 'Load Test',
    testPlan = ['Load Test', 'Stress Test', 'Spike Test', 'Endurance Test', 'Volume Test', 'Concurrency Test'],
    isSequentialSuite = true,
    testConfigs,
    baseUrl,
    users,
    endpoints
  } = params;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Extract individual configuration per test type if available
  const cfgLoad = testConfigs?.['Load Test'] || { users: 100, durationSec: 1800, rampUpSec: 120 };
  const cfgStress = testConfigs?.['Stress Test'] || { users: 500, durationSec: 1800, rampUpSec: 180 };
  const cfgSpike = testConfigs?.['Spike Test'] || { users: 1000, durationSec: 600, rampUpSec: 30 };
  const cfgEndurance = testConfigs?.['Endurance Test'] || { users: 50, durationSec: 3600, rampUpSec: 60 };
  const cfgVolume = testConfigs?.['Volume Test'] || { users: 150, durationSec: 2700, rampUpSec: 90 };
  const cfgConcurrency = testConfigs?.['Concurrency Test'] || { users: 250, durationSec: 900, rampUpSec: 10 };

  const tasksCode = endpoints.map((ep, idx) => {
    const cleanPath = ep.path.startsWith('/') ? ep.path : `/${ep.path}`;
    const tagEndpoint = `${ep.method} ${cleanPath}`;
    const headersDict = JSON.stringify(ep.headers || {});
    const weight = ep.weight || 10;

    let bodyCode = 'None';
    if (ep.body) {
      try {
        const parsed = JSON.parse(ep.body);
        bodyCode = JSON.stringify(parsed, null, 12).trim();
      } catch {
        bodyCode = JSON.stringify(ep.body);
      }
    }

    let locustMethod = 'get';
    if (ep.method === 'POST') locustMethod = 'post';
    else if (ep.method === 'PUT') locustMethod = 'put';
    else if (ep.method === 'DELETE') locustMethod = 'delete';
    else if (ep.method === 'PATCH') locustMethod = 'patch';

    if (ep.method === 'GET' || ep.method === 'DELETE') {
      return `    @task(${weight})
    def task_${idx}_${ep.method.toLowerCase()}(self):
        """Route: ${tagEndpoint} (Weight: ${weight}x)"""
        with self.client.${locustMethod}(
            "${cleanPath}",
            headers=${headersDict},
            name="${tagEndpoint}",
            catch_response=True
        ) as response:
            if response.status_code >= 400:
                response.failure(f"HTTP error {response.status_code}")
            else:
                response.success()`;
    } else {
      return `    @task(${weight})
    def task_${idx}_${ep.method.toLowerCase()}(self):
        """Route: ${tagEndpoint} (Weight: ${weight}x)"""
        payload = ${bodyCode}
        with self.client.${locustMethod}(
            "${cleanPath}",
            json=payload,
            headers=${headersDict},
            name="${tagEndpoint}",
            catch_response=True
        ) as response:
            if response.status_code >= 400:
                response.failure(f"HTTP error {response.status_code}")
            else:
                response.success()`;
    }
  }).join('\n\n');

  if (isSequentialSuite) {
    return `# ==========================================================
# EAII Performance Testing Tool — Generated Locust Test Script
# Test Name:      ${testName}
# Test ID:        ${testId}
# Pipeline Scope: All 6 Test Types (Automated Sequential Suite)
# Test Types:     1. Load Test, 2. Stress Test, 3. Spike Test, 4. Endurance Test, 5. Volume Test, 6. Concurrency Test
# Target VUs:     Load: ${cfgLoad.users} | Stress: ${cfgStress.users} | Spike: ${cfgSpike.users} | Endurance: ${cfgEndurance.users} | Volume: ${cfgVolume.users} | Concurrency: ${cfgConcurrency.users}
# Host:           ${cleanBaseUrl}
# Generated:      ${new Date().toISOString()}
# ==========================================================

from locust import HttpUser, LoadTestShape, task, between, events
import json
import time
import uuid
import logging

class EAIIBenchmarkUser(HttpUser):
    # Realistic human think time pacing (0.5s to 2.0s delay between requests)
    wait_time = between(0.5, 2.0)
    host = "${cleanBaseUrl}"
    
    def on_start(self):
        self.auth_token = f"Bearer eaii_locust_token_{uuid.uuid4().hex[:8]}"
        self.client.headers.update({
            "X-EAII-TestId": "${testId}",
            "User-Agent": "EAII-PTT-Locust/1.0"
        })

${tasksCode}


class SequentialStagesLoadShape(LoadTestShape):
    """
    Automated 6-Phase Sequential Pipeline Shape:
      Stage 1: Load Test        (${cfgLoad.users} VUs, ${Math.round(cfgLoad.durationSec / 60)} min)
      Stage 2: Stress Test      (${cfgStress.users} VUs, ${Math.round(cfgStress.durationSec / 60)} min)
      Stage 3: Spike Test       (${cfgSpike.users} VUs, ${Math.round(cfgSpike.durationSec / 60)} min)
      Stage 4: Endurance Test   (${cfgEndurance.users} VUs, ${Math.round(cfgEndurance.durationSec / 60)} min)
      Stage 5: Volume Test      (${cfgVolume.users} VUs, ${Math.round(cfgVolume.durationSec / 60)} min)
      Stage 6: Concurrency Test (${cfgConcurrency.users} VUs, ${Math.round(cfgConcurrency.durationSec / 60)} min)
    """
    stages = [
        # Stage 1: Load Test
        {"duration": 120, "users": ${cfgLoad.users}, "spawn_rate": 10, "name": "Load Test - Ramp Up"},
        {"duration": ${Math.max(180, cfgLoad.durationSec)}, "users": ${cfgLoad.users}, "spawn_rate": 10, "name": "Load Test - Steady"},
        
        # Stage 2: Stress Test
        {"duration": ${Math.max(180, cfgLoad.durationSec) + 120}, "users": ${cfgStress.users}, "spawn_rate": 25, "name": "Stress Test - Ramp Up"},
        {"duration": ${Math.max(180, cfgLoad.durationSec) + Math.max(180, cfgStress.durationSec)}, "users": ${cfgStress.users}, "spawn_rate": 25, "name": "Stress Test - Peak"},
        
        # Stage 3: Spike Test
        {"duration": ${Math.max(180, cfgLoad.durationSec) + Math.max(180, cfgStress.durationSec) + 30}, "users": ${cfgSpike.users}, "spawn_rate": 100, "name": "Spike Test - Burst"},
        {"duration": ${Math.max(180, cfgLoad.durationSec) + Math.max(180, cfgStress.durationSec) + Math.max(90, cfgSpike.durationSec)}, "users": ${cfgSpike.users}, "spawn_rate": 100, "name": "Spike Test - Sustain"},
        
        # Stage 4: Endurance Test
        {"duration": ${Math.max(180, cfgLoad.durationSec) + Math.max(180, cfgStress.durationSec) + Math.max(90, cfgSpike.durationSec) + Math.max(180, cfgEndurance.durationSec)}, "users": ${cfgEndurance.users}, "spawn_rate": 5, "name": "Endurance Test - Soak"},
        
        # Stage 5: Volume Test
        {"duration": ${Math.max(180, cfgLoad.durationSec) + Math.max(180, cfgStress.durationSec) + Math.max(90, cfgSpike.durationSec) + Math.max(180, cfgEndurance.durationSec) + Math.max(180, cfgVolume.durationSec)}, "users": ${cfgVolume.users}, "spawn_rate": 15, "name": "Volume Test - Throughput"},
        
        # Stage 6: Concurrency Test
        {"duration": ${Math.max(180, cfgLoad.durationSec) + Math.max(180, cfgStress.durationSec) + Math.max(90, cfgSpike.durationSec) + Math.max(180, cfgEndurance.durationSec) + Math.max(180, cfgVolume.durationSec) + Math.max(120, cfgConcurrency.durationSec)}, "users": ${cfgConcurrency.users}, "spawn_rate": 50, "name": "Concurrency Test - Instant Lock"},
    ]

    def tick(self):
        run_time = self.get_run_time()
        for stage in self.stages:
            if run_time < stage["duration"]:
                return stage["users"], stage["spawn_rate"]
        return None


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    logging.info("Starting EAII PTT 6-Phase Sequential Pipeline for Test ID: ${testId}")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    logging.info("Finished EAII PTT 6-Phase Sequential Pipeline for Test ID: ${testId}")
`;
  }

  return `# ==========================================================
# EAII Performance Testing Tool — Generated Locust Test Script
# Test Name:      ${testName}
# Test ID:        ${testId}
# Test Type:      ${testType}
# Target VUs:     ${users}
# Host:           ${cleanBaseUrl}
# Generated:      ${new Date().toISOString()}
# ==========================================================

from locust import HttpUser, task, between, events
import json
import time
import uuid
import logging

class EAIIBenchmarkUser(HttpUser):
    # Realistic human think time pacing (0.5s to 2.0s delay between requests)
    wait_time = between(0.5, 2.0)
    host = "${cleanBaseUrl}"
    
    def on_start(self):
        self.auth_token = f"Bearer eaii_locust_token_{uuid.uuid4().hex[:8]}"
        self.client.headers.update({
            "X-EAII-TestId": "${testId}",
            "User-Agent": "EAII-PTT-Locust/1.0"
        })

${tasksCode}

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    logging.info("Starting EAII PTT Locust benchmark for Test ID: ${testId}")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    logging.info("Finished EAII PTT Locust benchmark for Test ID: ${testId}")
`;
}

