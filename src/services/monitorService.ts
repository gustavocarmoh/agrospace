import type {
  AlertsResponse,
  AlertItem,
  DashboardSummaryResponse,
  HistoricalTemperatureResponse,
  RecommendationsResponse,
  SensorsResponse,
  TelemetryRequest
} from "../types";
import {
  baselineAlerts,
  baselineHumidity,
  baselineRecommendations,
  baselineSectors,
  baselineSensors,
  deviceLastReadSeconds,
  getDeviceStatuses,
  temperatureHistory,
  applyTelemetryUpdate
} from "../data/mockData";
import { simulation } from "../config";

function buildAverageTemperature() {
  const tempSensors = baselineSensors.filter((sensor) => sensor.type === "TEMP");
  const total = tempSensors.reduce((sum, sensor) => sum + sensor.value, 0);
  const average = tempSensors.length ? total / tempSensors.length : 0;
  return {
    value: Number(average.toFixed(1)),
    unit: "°C",
    trend: "+0.4",
    status: average > 28 ? "above_ideal" : "normal"
  };
}

function buildAverageHumidity() {
  const humiditySensors = baselineSensors.filter((sensor) => sensor.type === "UMID");
  const total = humiditySensors.reduce((sum, sensor) => sum + sensor.value, 0);
  const average = humiditySensors.length ? total / humiditySensors.length : 0;
  return {
    value: Number(average.toFixed(0)),
    unit: "%",
    trend: "-6",
    status: average < 55 ? "below_ideal" : "normal"
  };
}

function countSectorsAtRisk() {
  const count = baselineSectors.filter((sector) => sector.status === "critical" || sector.status === "warning").length;
  return {
    count,
    total: baselineSectors.length,
    message: count > 0 ? "Requer atenção imediata" : "Tudo estável"
  };
}

function buildActiveIrrigation() {
  const activeSectors = baselineSectors.filter((sector) => sector.status === "warning").length;
  return {
    activeSectors,
    currentCycle: "14h32"
  };
}

export function getDashboardSummary(): DashboardSummaryResponse {
  return {
    metrics: {
      averageTemperature: buildAverageTemperature(),
      averageHumidity: buildAverageHumidity(),
      sectorsAtRisk: countSectorsAtRisk(),
      activeIrrigation: buildActiveIrrigation()
    },
    sectorsMap: baselineSectors,
    humidityBySector: baselineHumidity
  };
}

export function getHistoricalTemperature(): HistoricalTemperatureResponse {
  return temperatureHistory;
}

export function getSensors(): SensorsResponse {
  const liveSensors = baselineSensors.map((sensor) => ({ ...sensor }));
  const devicesStatus = getDeviceStatuses();
  return { liveSensors, devicesStatus };
}

function createOfflineAlert() {
  if (simulation.esp32H01Online) {
    return null;
  }

  return {
    id: "ALT-2843",
    severity: "INFO" as const,
    message: "ESP32-H01 (Setor H) offline. Último dado registrado há 42 segundos. Aguardando reconexão.",
    timestamp: "14:09:51",
    sensorId: "SISTEMA"
  };
}

export function getAlerts(): AlertsResponse {
  const activeAlerts = baselineAlerts.filter((alert) => alert.id !== "ALT-2843");
  const offlineAlert = createOfflineAlert();
  const alerts: AlertItem[] = offlineAlert ? [...activeAlerts, offlineAlert] : activeAlerts;
  return {
    activeAlertsCount: alerts.length,
    alerts: alerts.sort((a, b) => {
      const severityOrder: Record<AlertItem["severity"], number> = { CRÍTICO: 0, ATENÇÃO: 1, INFO: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity] || b.timestamp.localeCompare(a.timestamp);
    })
  };
}

export function getRecommendations(): RecommendationsResponse {
  return { recommendations: baselineRecommendations };
}

export function ingestTelemetry(payload: TelemetryRequest) {
  applyTelemetryUpdate(payload);
  const deviceId = payload.deviceId;
  if (deviceLastReadSeconds[deviceId] !== undefined) {
    deviceLastReadSeconds[deviceId] = 0;
  }
}
