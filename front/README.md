# Frontend AgroSpace Monitor — Integrado com Backend

O frontend foi atualizado para consumir dados em tempo real do backend Node.js/Express.

## Como usar

1. **Inicie o backend:**
   ```bash
   cd /home/mitred/faculdade/agro
   npm install
   npm run dev
   ```
   O backend estará rodando em `http://localhost:3000`

2. **Abra o frontend:**
   - Abra o arquivo `front/index.html` no navegador
   - OU sirva via HTTP (por exemplo, com `python3 -m http.server 8000`)

## Endpoints consumidos

- `GET /api/v1/dashboard/summary` → Métricas do dashboard (temperatura, umidade, setores em risco, irrigação)
- `GET /api/v1/dashboard/historical-temperature` → Histórico de temperatura para gráfico
- `GET /api/v1/sensors` → Valores em tempo real dos sensores e status dos ESP32
- `GET /api/v1/alerts` → Lista de alertas ativos com severidade
- `GET /api/v1/ia-manejo/recommendations` → Recomendações de manejo automático

## Features

### Dashboard
- Carrega métricas (temp, umidade, setores em risco, irrigação ativa)
- Mapear setores atualiza dinamicamente com status do backend
- Gráfico de temperatura histórica (últimas 6 horas)
- Gráfico de barras de umidade por setor

### Sensores
- Lista de sensores com valores em tempo real
- Tabela de status dos dispositivos (ONLINE/DEGRADADO/OFFLINE)

### Alertas
- Alertas ordenados por severidade (CRÍTICO, ATENÇÃO, INFO)
- Badge com contagem de alertas ativos

### IA — Manejo
- Recomendações carregadas do backend (baseadas em regras)
- Chat integrado com Anthropic Claude para análise customizada (opcional)
  - Requer variável de ambiente `ANTHROPIC_API_KEY` no navegador
  - Se não configurada, apenas as recomendações estáticas aparecem

## Configuração

Se quiser usar IA com Anthropic, adicione sua chave API ao `askAI()` ou configure via header.

## Atualização automática

O dashboard se atualiza a cada 5 segundos buscando dados do `/dashboard/summary`.
