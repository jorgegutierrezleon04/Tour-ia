// theme.js - manage theme toggling and persistence
(function(){
  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme==='dark' ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }
  const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(saved);
  document.addEventListener('click', (e)=>{
    if (e.target && e.target.id === 'themeToggle') {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    }
  });
})();
