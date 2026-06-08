import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger";
import {
  getDashboardSummary,
  getHistoricalTemperature,
  getSensors,
  getAlerts,
  getRecommendations,
  ingestTelemetry
} from "./services/monitorService";
import type { TelemetryRequest } from "./types";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/v1/dashboard/summary", (_req: Request, res: Response) => {
  const summary = getDashboardSummary();
  return res.status(200).json(summary);
});

app.get("/api/v1/dashboard/historical-temperature", (_req: Request, res: Response) => {
  const history = getHistoricalTemperature();
  return res.status(200).json(history);
});

app.get("/api/v1/sensors", (_req: Request, res: Response) => {
  const sensors = getSensors();
  return res.status(200).json(sensors);
});

app.post("/api/v1/telemetry", (req: Request<unknown, unknown, TelemetryRequest>, res: Response) => {
  const payload = req.body;
  if (!payload || !payload.deviceId || !payload.sector || !Array.isArray(payload.metrics)) {
    return res.status(400).json({ message: "Corpo de request inválido." });
  }
  ingestTelemetry(payload);
  return res.status(201).json({ message: "Dados de telemetria recebidos com sucesso." });
});

app.get("/api/v1/alerts", (_req: Request, res: Response) => {
  const alerts = getAlerts();
  return res.status(200).json(alerts);
});

app.get("/api/v1/ia-manejo/recommendations", (_req: Request, res: Response) => {
  const recommendations = getRecommendations();
  return res.status(200).json(recommendations);
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Endpoint não encontrado." });
});

app.listen(port, () => {
  console.log(`AgroSpace Monitor backend rodando em http://localhost:${port}`);
});
