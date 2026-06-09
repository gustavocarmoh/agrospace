const API_BASE = 'http://localhost:3000/api/v1';

function switchTab(name) {
  document.querySelectorAll('.asm-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.asm-section').forEach(s => s.classList.remove('active'));
  const tabs = ['dashboard','sensores','alertas','ia'];
  const idx = tabs.indexOf(name);
  document.querySelectorAll('.asm-tab')[idx].classList.add('active');
  document.getElementById('sec-' + name).classList.add('active');
  
  if (name === 'alertas') loadAlerts();
  if (name === 'sensores') loadSensors();
  if (name === 'ia') loadRecommendations();
}

function sendPrompt() {}

function showSector(id) {
  sendPrompt('Me dê detalhes sobre o setor ' + id + ' da plantação AgroSpace Monitor: condições atuais, status dos sensores e recomendações da IA para esse setor.');
}

function updateClock() {
  const now = new Date();
  document.getElementById('asm-clock').textContent = now.toLocaleTimeString('pt-BR');
}
setInterval(updateClock, 1000);
updateClock();

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    const data = await res.json();
    
    document.getElementById('m-temp').innerHTML = data.metrics.averageTemperature.value + '<span class="metric-unit">°C</span>';
    document.getElementById('m-hum').innerHTML = data.metrics.averageHumidity.value + '<span class="metric-unit">%</span>';
    document.getElementById('m-risk').innerHTML = data.metrics.sectorsAtRisk.count + '<span class="metric-unit"> /' + data.metrics.sectorsAtRisk.total + '</span>';
    document.getElementById('m-irr').innerHTML = data.metrics.activeIrrigation.activeSectors + '<span class="metric-unit"> set</span>';
    
    updateSectorMap(data.sectorsMap);
    updateTemperatureChart(data);
    updateHumidityChart(data.humidityBySector);
  } catch (e) {
    console.error('Erro ao carregar dashboard:', e);
  }
}

function updateSectorMap(sectors) {
  const sectorMap = document.querySelector('.sector-map');
  if (!sectorMap) return;
  
  sectorMap.innerHTML = sectors.map(s => {
    let icon = '🌿', cssClass = 'healthy';
    if (s.status === 'warning') { icon = '💧'; cssClass = 'low-water'; }
    if (s.status === 'critical') { icon = s.id === 'G' ? '🚨' : '⚠'; cssClass = 'risk'; }
    if (s.status === 'inactive') { icon = '🔵'; cssClass = 'idle'; }
    
    return `<div class="sector ${cssClass}" onclick="showSector('${s.id}')">
      <div class="sector-icon">${icon}</div>
      <div class="sector-id">${s.id}</div>
      <div class="sector-status">${s.label}</div>
    </div>`;
  }).join('');
}

function updateTemperatureChart(dashData) {
  fetch(`${API_BASE}/dashboard/historical-temperature`)
    .then(r => r.json())
    .then(histData => {
      const tempCtx = document.getElementById('tempChart');
      if (!tempCtx) return;
      
      const ctx = tempCtx.getContext('2d');
      if (window.tempChart) window.tempChart.destroy();
      
      window.tempChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: histData.timestamps,
          datasets: histData.series.map((s, i) => ({
            label: s.sector,
            data: s.data,
            borderColor: s.sector === 'G' ? '#e03a3a' : '#1ddb8a',
            backgroundColor: s.sector === 'G' ? 'rgba(224,58,58,0.08)' : 'rgba(29,219,138,0.05)',
            borderWidth: 2,
            pointRadius: 3,
            fill: true,
            tension: 0.4
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: { color: '#5a8ab0', font: { size: 11 }, boxWidth: 10, boxHeight: 10 }
            }
          },
          scales: {
            x: { ticks: { color: '#4a6a8a', font: { size: 10 } }, grid: { color: '#1a3a5c55' } },
            y: { ticks: { color: '#4a6a8a', font: { size: 10 } }, grid: { color: '#1a3a5c55' }, min: 18, max: 38 }
          }
        }
      });
    })
    .catch(e => console.error('Erro ao carregar histórico de temperatura:', e));
}

function updateHumidityChart(humidityData) {
  const humCtx = document.getElementById('humChart');
  if (!humCtx) return;
  
  const ctx = humCtx.getContext('2d');
  if (window.humChart) window.humChart.destroy();
  
  window.humChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: humidityData.map(h => h.sector),
      datasets: [{
        label: 'Umidade %',
        data: humidityData.map(h => h.value),
        backgroundColor: humidityData.map(h => {
          if (h.status === 'healthy') return '#1ddb8a';
          if (h.status === 'warning') return '#f0a500';
          if (h.status === 'critical') return '#e03a3a';
          return '#1a3a5c';
        }),
        borderRadius: 4,
        borderWidth: 0
      },{
        type: 'line',
        label: 'Mínimo ideal (55%)',
        data: new Array(humidityData.length).fill(55),
        borderColor: '#4a6a8a',
        borderDash: [4,4],
        borderWidth: 1,
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#4a6a8a', font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: '#4a6a8a', font: { size: 10 } }, grid: { color: '#1a3a5c55' }, min: 0, max: 100 }
      }
    }
  });
}

function liveData() {
  loadDashboard();
}
setInterval(liveData, 5000);
loadDashboard();

async function loadSensors() {
  try {
    const res = await fetch(`${API_BASE}/sensors`);
    const data = await res.json();
    
    const sensorGrid = document.querySelector('.sensors-grid');
    if (sensorGrid) {
      sensorGrid.innerHTML = data.liveSensors.map(sensor => {
        let color = '#1ddb8a', icon = '🌡';
        if (sensor.status === 'CRÍTICO') { color = '#e03a3a'; }
        else if (sensor.status === 'ALERTA') { color = '#f0a500'; }
        
        if (sensor.type === 'UMID') icon = '💧';
        if (sensor.type === 'pH') icon = '⚗';
        if (sensor.type === 'LUX') icon = '💡';
        
        return `<div class="sensor-card">
          <div class="sensor-name">${icon} ${sensor.type} — ${sensor.id}</div>
          <div class="sensor-gauge">
            <div class="gauge-value" style="color:${color}">${sensor.value}<span style="font-size:15px;color:#5a8ab0">${sensor.unit}</span></div>
            <div style="font-size:10px;color:#5a8ab0;margin-top:4px;font-family:'Share Tech Mono',monospace">SETOR ${sensor.sector} — ${sensor.status}</div>
          </div>
          <div class="gauge-bar"><div class="gauge-fill" style="width:${Math.min(sensor.value, 100)}%;background:${color}"></div></div>
        </div>`;
      }).join('');
    }
    
    const devTable = document.getElementById('device-table');
    if (devTable) {
      devTable.innerHTML = data.devicesStatus.map(dev => {
        const statusColor = dev.status === 'ONLINE' ? '#1ddb8a' : dev.status === 'DEGRADADO' ? '#f0a500' : '#e03a3a';
        return `<tr style="border-bottom:1px solid #0d1625;">
          <td style="padding:8px 0;color:#c8d8f0;">${dev.id}</td>
          <td style="padding:8px 0;color:#5a8ab0;">${dev.sector}</td>
          <td style="padding:8px 0;color:#5a8ab0;">${dev.type}</td>
          <td style="padding:8px 0;color:#5a8ab0;">${dev.lastRead}</td>
          <td style="padding:8px 0;"><span style="color:${statusColor};">● ${dev.status}</span></td>
        </tr>`;
      }).join('');
    }
  } catch (e) {
    console.error('Erro ao carregar sensores:', e);
  }
}

async function loadAlerts() {
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    const data = await res.json();
    
    document.getElementById('alert-badge').textContent = data.activeAlertsCount;
    
    const alertsList = document.querySelector('.alerts-list');
    if (alertsList) {
      alertsList.innerHTML = data.alerts.map(alert => {
        let cssClass = 'warn';
        if (alert.severity === 'CRÍTICO') cssClass = 'danger';
        if (alert.severity === 'INFO') cssClass = 'ok';
        
        return `<div class="alert-item ${cssClass}">
          <i class="ti ti-alert-triangle alert-icon" aria-hidden="true"></i>
          <div>
            <div class="alert-msg"><strong style="color:${alert.severity === 'CRÍTICO' ? '#e03a3a' : alert.severity === 'INFO' ? '#1ddb8a' : '#f0a500'}">${alert.severity}</strong> — ${alert.message}</div>
            <div class="alert-time">${alert.timestamp} — ${alert.sensorId} — ID #${alert.id}</div>
          </div>
        </div>`;
      }).join('');
    }
  } catch (e) {
    console.error('Erro ao carregar alertas:', e);
  }
}

async function loadRecommendations() {
  try {
    const res = await fetch(`${API_BASE}/ia-manejo/recommendations`);
    const data = await res.json();
    
    const recoList = document.getElementById('reco-list');
    if (recoList) {
      recoList.innerHTML = data.recommendations.map(rec => {
        const priorityMap = { URGENTE: 'high', MODERADO: 'mid', NORMAL: 'low' };
        const priorityClass = priorityMap[rec.priority] || 'mid';
        
        return `<div class="reco-item">
          <div class="reco-priority ${priorityClass}">${rec.priority}</div>
          <div class="reco-text">
            <div class="reco-action">${rec.title}</div>
            <div class="reco-reason">${rec.description}</div>
            <div class="reco-sector-tag">📍 ${rec.targetSector} · ${rec.sensorId} · Confiança: <span class="reco-confidence">${rec.confidence}%</span></div>
          </div>
        </div>`;
      }).join('');
    }
  } catch (e) {
    console.error('Erro ao carregar recomendações:', e);
  }
}

async function askAI() {
  const q = document.getElementById('ai-query').value.trim();
  if (!q) return;
  const resp = document.getElementById('ai-response');
  resp.innerHTML = '<div style="color:#4a6a8a;font-size:12px;font-family:\'Share Tech Mono\',monospace;padding:12px;border:1px solid #1a3a5c;border-radius:8px;">⏳ Analisando dados dos sensores...</div>';

  try {
    const sensorsRes = await fetch(`${API_BASE}/sensors`);
    const sensorsData = await sensorsRes.json();
    
    let sensorContext = 'Dados atuais dos sensores AgroSpace Monitor:\n';
    sensorsData.liveSensors.forEach(s => {
      sensorContext += `- Setor ${s.sector}: ${s.type}=${s.value}${s.unit} (${s.status})\n`;
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: `Você é o sistema de IA agroespacial do AgroSpace Monitor, uma plataforma de monitoramento agrícola para futuras bases lunares e marcianas. Analise os dados dos sensores IoT e responda com recomendações práticas e objetivas de manejo agrícola espacial. Seja direto, técnico e conciso. Use emojis de forma sparingly. Responda sempre em português.`,
        messages: [{ role: 'user', content: `${sensorContext}\n\nPergunta do operador: ${q}` }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || 'Sem resposta.';
    resp.innerHTML = `<div style="background:#0d1625;border:1px solid #1ddb8a33;border-radius:8px;padding:14px;font-size:12px;line-height:1.7;color:#c8d8f0;white-space:pre-wrap;">${text}</div>`;
  } catch(e) {
    resp.innerHTML = '<div style="color:#e03a3a;font-size:12px;padding:10px;border:1px solid #e03a3a33;border-radius:8px;">Erro ao conectar com a IA. Verifique a chave de API ou conexão. (Deixe em branco para usar apenas análise local.)</div>';
  }
  document.getElementById('ai-query').value = '';
}

document.getElementById('ai-query').addEventListener('keydown', e => {
  if (e.key === 'Enter') askAI();
});
