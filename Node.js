/* --- Helpers de navegación entre secciones --- */
document.addEventListener('DOMContentLoaded', () => {
  // navegación botones
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      mostrarSeccion(btn.dataset.target);
    });
  });

  // hamburger móvil abre/oculta menú
  const hamburger = document.querySelector('.hamburger');
  hamburger && hamburger.addEventListener('click', () => {
    const nb = document.querySelector('.nav-buttons');
    nb.style.display = nb.style.display === 'flex' ? 'none' : 'flex';
  });

  // FAQ acordeón
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const a = q.nextElementSibling;
      a.style.display = a.style.display === 'block' ? 'none' : 'block';
    });
  });

  // Niveles: mostrar panel de clases
  document.querySelectorAll('.nivel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nivel = btn.dataset.nivel;
      document.querySelectorAll('.nivel-panel').forEach(p => p.hidden = true);
      const panel = document.querySelector(`.nivel-panel[data-nivel="${nivel}"]`);
      if (panel) panel.hidden = false;
      else {
        // Si no existe panel concreto, clonamos uno de ejemplo y adaptamos (flexible)
        const sample = document.querySelector('.nivel-panel');
        if (sample) {
          const clone = sample.cloneNode(true);
          clone.dataset.nivel = nivel;
          clone.querySelector('h3').textContent = `Clases - ${btn.querySelector('span').textContent}`;
          document.getElementById('clasesDisponibles').appendChild(clone);
        }
      }
      // scroll
      document.getElementById('clasesDisponibles').scrollIntoView({behavior:'smooth'});
    });
  });

  // botones de clase que redirigen a otra página (o a una ruta)
  document.addEventListener('click', (e) => {
    const c = e.target.closest('.clase-btn');
    if (c && c.dataset.url) {
      // Abrir en nueva pestaña para mantener plantilla
      window.open(c.dataset.url, '_blank');
    }
  });

  // formulario de auth: registrar / login
  document.getElementById('btnRegister').addEventListener('click', registerUser);
  document.getElementById('btnLogin').addEventListener('click', loginUser);

  // feedback (estrellas + enviar)
  setupStars();
  document.getElementById('btnSendFeedback').addEventListener('click', sendFeedback);

  // preservar comportamiento inicial de secciones desde nav (por si cargan con hash)
  const active = document.querySelector('.nav-btn.active');
  if(active) mostrarSeccion(active.dataset.target);
});

/* Mostrar sección */
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
  const sel = document.getElementById(id);
  if (sel) sel.classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

/* --- Auth: register & login (conexión a Flask) --- */
const API_BASE = location.origin; // asume mismo host; cambiar si el backend está separado

async function registerUser(){
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('authMessage');

  if(!name || !email || !password){ msg.textContent = 'Rellena todos los campos.'; return; }

  try{
    const res = await fetch(API_BASE + '/api/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({name, email, password})
    });
    const data = await res.json();
    if(res.ok){
      msg.textContent = 'Registro exitoso. ¡Bienvenido!';
      msg.style.color = 'green';
    } else {
      msg.textContent = data.error || 'Error en el registro.';
      msg.style.color = 'var(--danger)';
    }
  }catch(err){
    msg.textContent = 'No se pudo conectar al servidor.';
    msg.style.color = 'var(--danger)';
  }
}

async function loginUser(){
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('authMessage');

  if(!email || !password){ msg.textContent = 'Rellena email y contraseña.'; return; }

  try{
    const res = await fetch(API_BASE + '/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, password})
    });
    const data = await res.json();
    if(res.ok){
      msg.textContent = 'Inicio de sesión correcto. ¡Bienvenido!';
      msg.style.color = 'green';
      // Aquí podrías guardar token/session en localStorage si añades JWT/session en backend
    } else {
      msg.textContent = data.error || 'Credenciales inválidas.';
      msg.style.color = 'var(--danger)';
    }
  }catch(err){
    msg.textContent = 'No se pudo conectar al servidor.';
    msg.style.color = 'var(--danger)';
  }
}

/* --- Feedback: estrellas y envío --- */
let selectedRating = 0;
function setupStars(){
  const stars = document.querySelectorAll('.star');
  stars.forEach(s => {
    s.addEventListener('click', () => {
      selectedRating = Number(s.dataset.value);
      updateStars(selectedRating);
    });
    s.addEventListener('mouseover', () => {
      updateStars(Number(s.dataset.value));
    });
    s.addEventListener('mouseout', () => {
      updateStars(selectedRating);
    });
  });
}
function updateStars(n){
  document.querySelectorAll('.star').forEach(s => {
    s.classList.toggle('active', Number(s.dataset.value) <= n);
  });
}

async function sendFeedback(){
  const comentario = document.getElementById('comentario').value.trim();
  const msg = document.getElementById('feedbackMessage');
  if(!comentario){ msg.textContent = 'Escribe un comentario.'; return; }
  try{
    const res = await fetch(API_BASE + '/api/feedback', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({comentario, rating: selectedRating || 0})
    });
    const data = await res.json();
    if(res.ok){
      msg.textContent = 'Gracias por tu opinión.';
      msg.style.color = 'green';
      document.getElementById('feedbackForm').reset();
      selectedRating = 0;
      updateStars(0);
    } else {
      msg.textContent = data.error || 'Error al enviar la opinión.';
      msg.style.color = 'var(--danger)';
    }
  }catch(err){
    msg.textContent = 'No se pudo conectar al servidor.';
    msg.style.color = 'var(--danger)';
  }
}