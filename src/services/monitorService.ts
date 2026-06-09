import type {
  AlertsResponse,
  AlertItem,
  DashboardSummaryResponse,
  HistoricalTemperatureResponse,
  RecommendationsResponse,
  SensorsResponse,
  TelemetryRequest,
  SensorType,
  LiveSensor,
  Recommendation
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

function normalizeSector(query: string) {
  const match = query.match(/\bsetor\s*([A-H])\b/i);
  return match ? match[1].toUpperCase() : null;
}

function normalizeSensorId(query: string) {
  const match = query.match(/\b(?:sensor|esp32)\s*-?\s*([A-H]\d{2})\b/i)
    || query.match(/\b([A-H]\d{2})\b/i);
  return match ? match[1].toUpperCase() : null;
}

function normalizeSensorType(query: string): SensorType | null {
  const lowered = query.toLowerCase();
  if (/\b(temp|temperatura)\b/.test(lowered)) return "TEMP";
  if (/\b(umid|umidade)\b/.test(lowered)) return "UMID";
  if (/\bph\b/.test(lowered)) return "pH";
  if (/\b(lux|luz)\b/.test(lowered)) return "LUX";
  return null;
}

function getSeverityScore(status: string) {
  if (status === "CRÍTICO" || status === "RISCO ALTO") return 100;
  if (status === "ALERTA" || status === "ABAIXO DO IDEAL") return 80;
  return 50;
}

function buildRecommendationFromSensor(sensor: LiveSensor): Recommendation {
  let priority: Recommendation["priority"] = "NORMAL";
  let title = `Recomendação para ${sensor.id}`;
  let description = "Nenhuma anomalia detectada no sensor.";

  if (sensor.type === "TEMP") {
    if (sensor.value > 30) {
      priority = "URGENTE";
      title = `Resfriar Setor ${sensor.sector} imediatamente`;
      description = `Temperatura de ${sensor.value}°C no setor ${sensor.sector} está acima do limite seguro. Ative refrigeração ou ventilação e monitore a queda de temperatura nos próximos 15 minutos.`;
    } else if (sensor.value >= 28) {
      priority = "MODERADO";
      title = `Observar temperatura em Setor ${sensor.sector}`;
      description = `Temperatura de ${sensor.value}°C está próxima ao limite. Verifique fluxo de ar e evite ganho térmico adicional.`;
    } else {
      priority = "NORMAL";
      title = `Temperatura está estável no setor ${sensor.sector}`;
      description = `Temperatura de ${sensor.value}°C está dentro da faixa aceitável no momento.`;
    }
  }

  if (sensor.type === "UMID") {
    if (sensor.value < 55) {
      priority = sensor.value < 40 ? "URGENTE" : "MODERADO";
      title = `Aumentar irrigação no Setor ${sensor.sector}`;
      description = `Umidade de ${sensor.value}% está abaixo do recomendado. Inicie ciclo de irrigação e verifique a umidade após 10 minutos.`;
    } else {
      priority = "NORMAL";
      title = `Umidade adequada no Setor ${sensor.sector}`;
      description = `Umidade de ${sensor.value}% está dentro da faixa aceitável para cultivo.`;
    }
  }

  if (sensor.type === "pH") {
    if (sensor.value < 6.0 || sensor.value > 7.0) {
      priority = "URGENTE";
      title = `Ajustar pH no Setor ${sensor.sector}`;
      description = `pH de ${sensor.value} no setor ${sensor.sector} está fora da faixa ideal. Aplique correções para aproximar de 6.5–7.0.`;
    } else {
      priority = "NORMAL";
      title = `pH estável no Setor ${sensor.sector}`;
      description = `pH de ${sensor.value} está dentro da faixa segura.`;
    }
  }

  if (sensor.type === "LUX") {
    if (sensor.value < 3000) {
      priority = "MODERADO";
      title = `Aumentar iluminação no Setor ${sensor.sector}`;
      description = `Luminosidade de ${sensor.value} lx é baixa para cultura. Considere acionar iluminação auxiliar.`;
    } else {
      title = `Iluminação adequada no Setor ${sensor.sector}`;
      description = `Nível de ${sensor.value} lx está apropriado para as condições atuais.`;
    }
  }

  return {
    priority,
    title,
    description,
    targetSector: `Setor ${sensor.sector}`,
    sensorId: sensor.id,
    confidence: Math.min(95, Math.max(70, getSeverityScore(sensor.status)))
  };
}

function getBestSensorForSector(sector: string, sensorType?: SensorType) {
  const matches = baselineSensors.filter((sensor) => sensor.sector === sector && (!sensorType || sensor.type === sensorType));
  if (!matches.length) return null;
  return matches.sort((a, b) => getSeverityScore(b.status) - getSeverityScore(a.status))[0];
}

function getWorstSensorByType(sensorType: SensorType) {
  const matches = baselineSensors.filter((sensor) => sensor.type === sensorType);
  if (!matches.length) return null;
  return matches.sort((a, b) => getSeverityScore(b.status) - getSeverityScore(a.status))[0];
}

export function getRecommendations(): RecommendationsResponse {
  return { recommendations: baselineRecommendations };
}

export function addRecommendation(recommendation: Recommendation) {
  baselineRecommendations.unshift(recommendation);
}

export function getAiRecommendation(query: string) {
  const normalizedQuery = query.trim();
  const foundSector = normalizeSector(normalizedQuery);
  const foundSensor = normalizeSensorId(normalizedQuery);
  const foundSensorType = normalizeSensorType(normalizedQuery);

  let sensor: LiveSensor | null = null;

  if (foundSensor) {
    sensor = baselineSensors.find((item) => item.id === foundSensor || item.id.endsWith(foundSensor)) || null;
  }

  if (!sensor && foundSector) {
    sensor = getBestSensorForSector(foundSector, foundSensorType || undefined);
  }

  if (!sensor && foundSensorType) {
    sensor = getWorstSensorByType(foundSensorType);
  }

  const recommendation: Recommendation = sensor ? buildRecommendationFromSensor(sensor) : {
    priority: "NORMAL",
    title: "Recomendação geral de manejo",
    description: "Para fornecer recomendação precisa, informe um setor (A–H) ou sensor específico (por exemplo, SENSOR-D01).",
    targetSector: foundSector ? `Setor ${foundSector}` : "Geral",
    sensorId: foundSensor || "SISTEMA",
    confidence: 72
  } as Recommendation;

  addRecommendation(recommendation);

  return {
    query: normalizedQuery,
    recommendation,
    foundSector: foundSector || undefined,
    foundSensor: foundSensor || undefined
  };
}

export function ingestTelemetry(payload: TelemetryRequest) {
  applyTelemetryUpdate(payload);
  const deviceId = payload.deviceId;
  if (deviceLastReadSeconds[deviceId] !== undefined) {
    deviceLastReadSeconds[deviceId] = 0;
  }
}
