// app.js - main frontend behavior: banner, trending, groups preview, theme toggle
document.addEventListener('DOMContentLoaded', () => {
  const bannerText = document.getElementById('bannerText');
  const trendingList = document.getElementById('trendingList');
  const groupsGrid = document.getElementById('groupsGrid');
  const groupsGridFull = document.getElementById('groupsGridFull');

  // theme toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t==='dark' ? 'dark' : 'light');
    localStorage.setItem('theme', t);
  }
  const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);
  if (themeToggle) themeToggle.addEventListener('click', ()=> applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'));

  // fetch banner
  fetch('/api/banner').then(r=>r.json()).then(j=>{
    bannerText.textContent = j.text || "Explora nuevos destinos con confianza y curiosidad.";
  }).catch(()=>{ bannerText.textContent = "Explora nuevos destinos con confianza y curiosidad."; });

  // fetch trending
  fetch('/api/trending').then(r=>r.json()).then(j=>{
    const results = j.results || [];
    trendingList.innerHTML = results.map(d=>`<a class="chip" href="/planificador.html?destination=${encodeURIComponent(d.name)}" style="display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid var(--border;margin-right:8px;color:var(--text);text-decoration:none">${d.name}</a>`).join('');
  }).catch(()=>{ trendingList.innerHTML = '<div class="muted">No hay datos</div>'; });

  // groups data
  const groups = [
    {key:'familias', title:'Familias', desc:'Actividades seguras y educativas.'},
    {key:'parejas', title:'Parejas', desc:'Escapadas románticas y relajantes.'},
    {key:'estudiantes', title:'Estudiantes', desc:'Aventura y bajo presupuesto.'},
    {key:'solitario', title:'Solitario', desc:'Cultura y experiencias personales.'},
    {key:'despedida', title:'Despedida de soltero/a', desc:'Diversión y vida nocturna.'},
    {key:'erasmus', title:'Erasmus', desc:'Exploración cultural y viajes cortos.'},
    {key:'luna_de_miel', title:'Luna de miel', desc:'Experiencias exclusivas y de lujo.'},
    {key:'negocios', title:'Negocios', desc:'Viajes profesionales y networking.'}
  ];
  function renderGroups(target){
    return groups.map(g=>`<div class="group-card"><h3>${g.title}</h3><p class="muted">${g.desc}</p><p class="align-right"><a class="btn" href="/planificador.html?group=${g.key}">Explorar</a></p></div>`).join('');
  }
  if (groupsGrid) groupsGrid.innerHTML = renderGroups('preview');
  if (groupsGridFull) groupsGridFull.innerHTML = renderGroups('full');
});
