export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "AgroSpace Monitor API",
    version: "0.1.0",
    description: "Documentação Swagger para o backend AgroSpace Monitor.",
    contact: {
      name: "AgroSpace Monitor Team"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local"
    }
  ],
  paths: {
    "/api/v1/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Resumo do dashboard principal",
        responses: {
          "200": {
            description: "Resumo do dashboard retornado com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/dashboard/historical-temperature": {
      get: {
        tags: ["Dashboard"],
        summary: "Histórico de temperatura das últimas 6 horas",
        responses: {
          "200": {
            description: "Histórico de temperatura retornado com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/sensors": {
      get: {
        tags: ["Sensores"],
        summary: "Lista valores em tempo real dos sensores e status dos dispositivos ESP32",
        responses: {
          "200": {
            description: "Dados de sensores retornados com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/telemetry": {
      post: {
        tags: ["Telemetria"],
        summary: "Ingestão de dados de telemetria de dispositivos ESP32",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  deviceId: { type: "string" },
                  sector: { type: "string" },
                  metrics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["TEMP", "UMID", "pH", "LUX"] },
                        value: { type: "number" }
                      },
                      required: ["type", "value"]
                    }
                  }
                },
                required: ["deviceId", "sector", "metrics"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Telemetria recebida com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" }
                  }
                }
              }
            }
          },
          "400": {
            description: "Requisição inválida.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/alerts": {
      get: {
        tags: ["Alertas"],
        summary: "Lista de alertas ativos ordenados por severidade e data",
        responses: {
          "200": {
            description: "Alertas retornados com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/ia-manejo/recommendations": {
      get: {
        tags: ["IA Manejo"],
        summary: "Recomendações de manejo geradas por regras de IA",
        responses: {
          "200": {
            description: "Recomendações retornadas com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/ia-manejo/analyze": {
      post: {
        tags: ["IA Manejo"],
        summary: "Analisa texto de consulta e gera recomendação baseada em setor ou sensor mencionado",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  query: { type: "string", example: "O que fazer com o Setor D?" }
                },
                required: ["query"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Recomendação gerada com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          }
        }
      }
    }
  }
};
