# AgroSpace Monitor Backend

API backend em TypeScript para o sistema AgroSpace Monitor.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`

## Endpoints

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/historical-temperature`
- `GET /api/v1/sensors`
- `POST /api/v1/telemetry`
- `GET /api/v1/alerts`
- `GET /api/v1/ia-manejo/recommendations`
- `GET /api-docs` (Swagger UI)

## Troubleshooting — Gráficos não aparecem

Se os gráficos de **Temperatura Histórica** e **Umidade por Setor** não estão funcionando:

1. **Teste os endpoints:**
   - Abra `http://localhost:3000/test-api.html` (se criar esse arquivo)
   - Ou use o curl:
     ```bash
     curl http://localhost:3000/api/v1/dashboard/summary
     curl http://localhost:3000/api/v1/dashboard/historical-temperature
     ```

2. **Verifique o console do navegador (F12):**
   - Procure por erros de CORS ou network
   - Procure por mensagens de log: `Loading dashboard from...`, `Dashboard data loaded:`, etc.

3. **Certifique-se de que:**
   - Backend está rodando em `http://localhost:3000`
   - Frontend está sendo servido de outra porta (ex: `http://localhost:8000`)
   - CORS está habilitado (está no código)
   - Dependências estão instaladas (`npm install`)

4. **Para reiniciar:**
   ```bash
   npm run build
   npm run dev
   ```

## Estrutura

```
src/
  ├── index.ts              # Servidor Express + rotas
  ├── types.ts              # Tipos TypeScript para API
  ├── config.ts             # Simulação de estados
  ├── swagger.ts            # Documentação Swagger
  ├── services/
  │   └── monitorService.ts # Lógica de negócio
  └── data/
      └── mockData.ts       # Dados mock + funções auxiliares
```
