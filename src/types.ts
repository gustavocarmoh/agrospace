export interface MetricCard {
  value: number;
  unit: string;
  trend: string;
  status: string;
}

export interface SectorSummary {
  id: string;
  name: string;
  status: "healthy" | "warning" | "critical" | "inactive";
  label: string;
}

export interface HumiditySector {
  sector: string;
  value: number;
  status: "healthy" | "warning" | "critical" | "inactive";
}

export interface DashboardSummaryResponse {
  metrics: {
    averageTemperature: MetricCard;
    averageHumidity: MetricCard;
    sectorsAtRisk: {
      count: number;
      total: number;
      message: string;
    };
    activeIrrigation: {
      activeSectors: number;
      currentCycle: string;
    };
  };
  sectorsMap: SectorSummary[];
  humidityBySector: HumiditySector[];
}

export interface HistoricalTemperatureResponse {
  timestamps: string[];
  series: Array<{
    sector: string;
    data: number[];
  }>;
}

export type SensorType = "TEMP" | "UMID" | "pH" | "LUX";

export interface LiveSensor {
  id: string;
  sector: string;
  type: SensorType;
  value: number;
  unit: string;
  status: string;
}

export interface DeviceStatus {
  id: string;
  sector: string;
  type: string;
  lastRead: string;
  status: "ONLINE" | "DEGRADADO" | "OFFLINE";
}

export interface SensorsResponse {
  liveSensors: LiveSensor[];
  devicesStatus: DeviceStatus[];
}

export interface TelemetryMetric {
  type: SensorType;
  value: number;
}

export interface TelemetryRequest {
  deviceId: string;
  sector: string;
  metrics: TelemetryMetric[];
}

export interface AlertItem {
  id: string;
  severity: "INFO" | "ATENÇÃO" | "CRÍTICO";
  message: string;
  timestamp: string;
  sensorId: string;
}

export interface AlertsResponse {
  activeAlertsCount: number;
  alerts: AlertItem[];
}

export interface Recommendation {
  priority: "URGENTE" | "MODERADO" | "NORMAL";
  title: string;
  description: string;
  targetSector: string;
  sensorId: string;
  confidence: number;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
}
