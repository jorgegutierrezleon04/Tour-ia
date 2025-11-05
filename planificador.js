// planificador.js
document.addEventListener('DOMContentLoaded', () => {
  const modeChat = document.getElementById('modeChat');
  const modeForm = document.getElementById('modeForm');
  const chatMode = document.getElementById('chatMode');
  const formMode = document.getElementById('formMode');

  const chatWindow = document.getElementById('chatWindow');
  const chatInput = document.getElementById('chatInput');
  const sendChat = document.getElementById('sendChat');

  const destInput = document.getElementById('destInput');
  const daysInput = document.getElementById('daysInput');
  const budgetInput = document.getElementById('budgetInput');
  const interestsInput = document.getElementById('interestsInput');
  const groupSelect = document.getElementById('groupSelect');
  const genPlan = document.getElementById('genPlan');
  const planResult = document.getElementById('planResult');

  // mode switch
  modeChat.addEventListener('click', ()=>{ modeChat.classList.add('active'); modeForm.classList.remove('active'); chatMode.classList.add('visible'); formMode.classList.remove('visible'); });
  modeForm.addEventListener('click', ()=>{ modeForm.classList.add('active'); modeChat.classList.remove('active'); formMode.classList.add('visible'); chatMode.classList.remove('visible'); });

  // prefill from query params (destination or group)
  const params = new URLSearchParams(location.search);
  if (params.get('destination')) destInput.value = params.get('destination');
  if (params.get('group')) groupSelect.value = params.get('group');

  // Chat send
  sendChat.addEventListener('click', async () => {
    const text = chatInput.value.trim();
    if (!text) return;
    appendMsg('user', text);
    chatInput.value = '';
    appendMsg('bot', 'Escribiendo...');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ messages: [{ role: "user", content: text }], group: groupSelect.value || null })
      });
      const j = await res.json();
      const botText = j.text || 'Sin respuesta';
      // replace last bot typing
      const last = chatWindow.querySelector('.msg.bot:last-child');
      if (last) last.textContent = botText;
      else appendMsg('bot', botText);
    } catch (e) {
      appendMsg('bot', 'Error en la conexión.');
      console.error(e);
    }
  });

  function appendMsg(cls, text){
    const div = document.createElement('div');
    div.className = 'msg ' + (cls==='user' ? 'user' : 'bot');
    div.textContent = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Form generate plan (uses /api/plan)
  genPlan.addEventListener('click', async () => {
    const payload = {
      destination: destInput.value.trim(),
      days: daysInput.value ? Number(daysInput.value) : undefined,
      budget: budgetInput.value.trim(),
      interests: interestsInput.value.trim(),
      group: groupSelect.value || undefined
    };
    planResult.innerHTML = '<div class="muted">Generando itinerario...</div>';
    try {
      const res = await fetch('/api/plan', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(!res.ok) {
        const err = await res.json().catch(()=>({error:res.statusText}));
        throw new Error(err.error || res.statusText);
      }
      const json = await res.json();
      renderPlan(json);
    } catch (e) {
      planResult.innerHTML = '<div class="muted">Error al generar el itinerario.</div>';
      console.error(e);
    }
  });

  function renderPlan(data){
    if(!data || !data.itinerary) {
      planResult.innerHTML = '<div class="muted">No se recibió un itinerario válido.</div>';
      return;
    }
    planResult.innerHTML = '';
    if (data.summary) {
      const s = document.createElement('div'); s.className = 'muted'; s.textContent = data.summary; planResult.appendChild(s);
    }
    data.itinerary.forEach(d => {
      const card = document.createElement('div'); card.className = 'card';
      const h = document.createElement('h4'); h.textContent = 'Día ' + d.day + (d.date? ' — '+d.date:''); card.appendChild(h);
      if (d.summary) { const p = document.createElement('p'); p.textContent = d.summary; card.appendChild(p); }
      if (d.activities && d.activities.length) {
        d.activities.forEach(a => {
          const act = document.createElement('div'); act.innerHTML = `<strong>${a.time} — ${a.title}</strong><div class="muted">${a.desc}</div>`;
          card.appendChild(act);
        });
      }
      // images
      if (data.images && data.images.length) {
        const img = document.createElement('img'); img.src = data.images[0]; img.style.width='100%'; img.style.borderRadius='8px'; img.style.marginTop='8px';
        card.appendChild(img);
      }
      planResult.appendChild(card);
    });
  }
});
