import type { AlertItem, LiveSensor, DeviceStatus, Recommendation, SectorSummary, HumiditySector, TelemetryRequest, SensorType } from "../types";
import { simulation } from "../config";

export const baselineSensors: LiveSensor[] = [
  { id: "SENSOR-A01", sector: "A", type: "TEMP", value: 22.8, unit: "°C", status: "IDEAL" },
  { id: "SENSOR-B02", sector: "B", type: "UMID", value: 38, unit: "%", status: "CRÍTICO" },
  { id: "SENSOR-G01", sector: "G", type: "TEMP", value: 34.1, unit: "°C", status: "ALERTA" },
  { id: "SENSOR-D01", sector: "D", type: "pH", value: 8.9, unit: "pH", status: "RISCO ALTO" },
  { id: "SENSOR-E01", sector: "E", type: "LUX", value: 6400, unit: "lx", status: "NORMAL" },
  { id: "SENSOR-F01", sector: "F", type: "UMID", value: 47, unit: "%", status: "ABAIXO DO IDEAL" }
];

export const baselineDevices: DeviceStatus[] = [
  { id: "ESP32-A01", sector: "A", type: "Temp + Umid", lastRead: "há 2s", status: "ONLINE" },
  { id: "ESP32-B02", sector: "B", type: "Umidade", lastRead: "há 1s", status: "ONLINE" },
  { id: "ESP32-D01", sector: "D", type: "pH + Temp", lastRead: "há 4s", status: "DEGRADADO" },
  { id: "ESP32-G01", sector: "G", type: "Temp + LED", lastRead: "há 2s", status: "ONLINE" },
  { id: "ESP32-H01", sector: "H", type: "Temp + Umid", lastRead: "há 42s", status: "OFFLINE" }
];

export const baselineSectors: SectorSummary[] = [
  { id: "A", name: "Setor A", status: "healthy", label: "SAUDÁVEL" },
  { id: "B", name: "Setor B", status: "warning", label: "BAIXA UMID." },
  { id: "C", name: "Setor C", status: "healthy", label: "SAUDÁVEL" },
  { id: "D", name: "Setor D", status: "critical", label: "RISCO CONTAM." },
  { id: "E", name: "Setor E", status: "healthy", label: "SAUDÁVEL" },
  { id: "F", name: "Setor F", status: "warning", label: "IRRIGAR" },
  { id: "G", name: "Setor G", status: "critical", label: "TEMP. ALTA" },
  { id: "H", name: "Setor H", status: "inactive", label: "EM ESPERA" }
];

export const baselineHumidity: HumiditySector[] = [
  { sector: "A", value: 78, status: "healthy" },
  { sector: "B", value: 38, status: "critical" },
  { sector: "C", value: 75, status: "healthy" },
  { sector: "D", value: 50, status: "warning" },
  { sector: "E", value: 80, status: "healthy" },
  { sector: "F", value: 47, status: "warning" },
  { sector: "G", value: 52, status: "warning" },
  { sector: "H", value: 0, status: "inactive" }
];

export const temperatureHistory = {
  timestamps: ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30"],
  series: [
    { sector: "G", data: [22.1, 23.5, 24.8, 27.2, 30.1, 32.4, 34.1] },
    { sector: "A", data: [21.0, 21.5, 22.0, 22.3, 22.4, 22.5, 22.8] }
  ]
};

export const baselineAlerts: AlertItem[] = [
  {
    id: "ALT-2847",
    severity: "CRÍTICO",
    message: "Risco de contaminação no Setor D. pH = 8.9 (faixa ideal: 6.0–7.0). Possível acúmulo de minerais marcianos.",
    timestamp: "14:32:10",
    sensorId: "SENSOR-D01"
  },
  {
    id: "ALT-2846",
    severity: "CRÍTICO",
    message: "Temperatura crítica no Setor G: 34.1°C. Risco de dano às raízes e murchamento das mudas.",
    timestamp: "14:21:03",
    sensorId: "SENSOR-G01"
  },
  {
    id: "ALT-2845",
    severity: "ATENÇÃO",
    message: "Setor B com umidade abaixo do mínimo: 38%. Planta pode entrar em estresse hídrico em 2h.",
    timestamp: "14:28:47",
    sensorId: "SENSOR-B02"
  },
  {
    id: "ALT-2843",
    severity: "INFO",
    message: "ESP32-H01 (Setor H) offline. Último dado registrado há 42 segundos. Aguardando reconexão.",
    timestamp: "14:09:51",
    sensorId: "SISTEMA"
  }
];

export const baselineRecommendations: Recommendation[] = [
  {
    priority: "URGENTE",
    title: "Isolar e tratar Setor D imediatamente",
    description: "pH de 8.9 indica possível acúmulo de carbonatos. Risco de dano permanente às culturas em até 4 horas. Recomenda-se aplicação de solução ácida diluída (pH alvo: 6.5) e coleta de amostra para análise química.",
    targetSector: "Setor D",
    sensorId: "SENSOR-D01",
    confidence: 94
  },
  {
    priority: "URGENTE",
    title: "Ativar sistema de resfriamento no Setor G",
    description: "Temperatura de 34.1°C excede limite operacional (30°C). Ativar ventilação forçada ou cortina térmica. Monitorar taxa de descida a cada 5 minutos. Meta: ≤ 28°C em 20 min.",
    targetSector: "Setor G",
    sensorId: "SENSOR-G01",
    confidence: 98
  },
  {
    priority: "MODERADO",
    title: "Irrigar Setor B — ciclo de 15 min",
    description: "Umidade em 38% com tendência de queda. Iniciar ciclo de irrigação de 15 minutos com volume de 2.4L/m². Verificar umidade após ciclo — alvo: 65–70%.",
    targetSector: "Setor B",
    sensorId: "SENSOR-B02",
    confidence: 89
  }
];

export const deviceLastReadSeconds: Record<string, number> = {
  "ESP32-A01": 2,
  "ESP32-B02": 1,
  "ESP32-D01": 4,
  "ESP32-G01": 2,
  "ESP32-H01": 42
};

export const sectorMetricMap: Record<string, Array<{ type: SensorType; value: number }>> = {
  A: [{ type: "TEMP", value: 22.8 }],
  B: [{ type: "UMID", value: 38 }],
  C: [{ type: "TEMP", value: 22.8 }],
  D: [{ type: "pH", value: 8.9 }],
  E: [{ type: "LUX", value: 6400 }],
  F: [{ type: "UMID", value: 47 }],
  G: [{ type: "TEMP", value: 34.1 }],
  H: []
};

export function applyTelemetryUpdate(payload: TelemetryRequest) {
  const existingIndex = baselineSensors.findIndex((item) => item.id === payload.deviceId.replace("ESP32", "SENSOR"));
  payload.metrics.forEach((metric) => {
    const existingSensor = baselineSensors.find(
      (sensor) => sensor.sector === payload.sector && sensor.type === metric.type
    );
    if (existingSensor) {
      existingSensor.value = metric.value;
      existingSensor.status = getSensorStatus(metric.type, metric.value, payload.sector);
    }
  });
  if (existingIndex >= 0) {
    deviceLastReadSeconds[payload.deviceId] = 0;
  }
}

export function getSensorStatus(type: SensorType, value: number, sector: string): string {
  if (type === "TEMP") {
    if (sector === "G" && value > 30) return "CRÍTICO";
    return value >= 28 ? "ALERTA" : "IDEAL";
  }

  if (type === "UMID") {
    if (sector === "B" && value < 55) return "CRÍTICO";
    return value < 50 ? "ABAIXO DO IDEAL" : "NORMAL";
  }

  if (type === "pH") {
    if (sector === "D" && (value < 6.0 || value > 7.0)) return "RISCO ALTO";
    return "NORMAL";
  }

  return "NORMAL";
}

export function getDeviceStatuses(): DeviceStatus[] {
  return baselineDevices.map((device) => {
    if (device.id === "ESP32-H01" && simulation.esp32H01Online) {
      return { ...device, lastRead: "há 2s", status: "ONLINE" };
    }

    const lastSeconds = deviceLastReadSeconds[device.id] ?? 999;
    if (lastSeconds > simulation.offlineThresholdSeconds) {
      return { ...device, lastRead: `há ${lastSeconds}s`, status: "OFFLINE" };
    }

    if (device.id === "ESP32-D01" && simulation.degradedOnMissingMetric) {
      return { ...device, lastRead: `há ${lastSeconds}s`, status: "DEGRADADO" };
    }

    return { ...device, lastRead: `há ${lastSeconds}s`, status: "ONLINE" };
  });
}
