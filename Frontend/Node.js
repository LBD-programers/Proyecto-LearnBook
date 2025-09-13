document.addEventListener("DOMContentLoaded", () => {
  /* ======================
     NAVEGACIÓN ENTRE SECCIONES
  ====================== */
  const navBtns = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".seccion");
  const lema = document.getElementById("section-lema");

  const lemas = {
    general: "Tu apoyo extra en el aprendizaje.",
    clases: "Explora las asignaturas disponibles para tu nivel.",
    usuario: "Crea tu cuenta o ingresa para comenzar a aprender.",
    ayuda: "Tu opinión y apoyo hacen crecer a LearnBook."
  };

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      sections.forEach(s => s.classList.remove("active"));
      const sel = document.getElementById(btn.dataset.target);
      if (sel) sel.classList.add("active");

      lema.textContent = lemas[btn.dataset.target] || "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* ======================
     FAQ ACORDEÓN
  ====================== */
  const faqQuestions = document.querySelectorAll(".faq-q");
  faqQuestions.forEach(q => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      const openItem = document.querySelector(".faq-item.open");

      // cerrar otra si está abierta
      if (openItem && openItem !== item) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        openItem.querySelector(".faq-icon").textContent = "📕";
      }

      // alternar actual
      item.classList.toggle("open");
      const expanded = item.classList.contains("open");
      q.setAttribute("aria-expanded", expanded);
      q.querySelector(".faq-icon").textContent = expanded ? "📖" : "📕";

      // animación extra para el ícono
      q.querySelector(".faq-icon").style.transition = "transform 0.3s";
      q.querySelector(".faq-icon").style.transform = expanded ? "rotate(15deg)" : "rotate(0deg)";
    });
  });

  /* ======================
     CLASES POR NIVEL
  ====================== */
  const nivelBtns = document.querySelectorAll(".nivel-btn");
  nivelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const nivel = btn.dataset.nivel;
      const panel = document.querySelector(`.nivel-panel[data-nivel="${nivel}"]`);

      if (!panel) return;

      // toggle: si ya está visible, ocultar
      if (!panel.hidden) {
        panel.hidden = true;
        return;
      }

      // ocultar todos y abrir el actual
      document.querySelectorAll(".nivel-panel").forEach(p => p.hidden = true);
      panel.hidden = false;
      document.getElementById("clasesDisponibles").scrollIntoView({ behavior: "smooth" });
    });
  });

  // botones de clase → abrir página
  document.addEventListener("click", e => {
    const c = e.target.closest(".clase-btn");
    if (c && c.dataset.url) {
      window.open(c.dataset.url, "_self");
    }
  });

  /* ======================
     AUTENTICACIÓN
  ====================== */
  const API_BASE = location.origin;

  async function registerUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const msg = document.getElementById("authMessage");

    if (!name || !email || !password) {
      msg.textContent = "Rellena todos los campos.";
      msg.style.color = "var(--danger)";
      return;
    }

    try {
      const res = await fetch(API_BASE + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      msg.textContent = res.ok ? "Registro exitoso. ¡Bienvenido!" : data.error || "Error en el registro.";
      msg.style.color = res.ok ? "green" : "var(--danger)";
    } catch {
      msg.textContent = "No se pudo conectar al servidor.";
      msg.style.color = "var(--danger)";
    }
  }

  async function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const msg = document.getElementById("authMessage");

    if (!email || !password) {
      msg.textContent = "Rellena email y contraseña.";
      msg.style.color = "var(--danger)";
      return;
    }

    try {
      const res = await fetch(API_BASE + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      msg.textContent = res.ok ? "Inicio de sesión correcto. ¡Bienvenido!" : data.error || "Credenciales inválidas.";
      msg.style.color = res.ok ? "green" : "var(--danger)";
    } catch {
      msg.textContent = "No se pudo conectar al servidor.";
      msg.style.color = "var(--danger)";
    }
  }

  document.getElementById("btnRegister")?.addEventListener("click", registerUser);
  document.getElementById("btnLogin")?.addEventListener("click", loginUser);

  /* ======================
     FEEDBACK
  ====================== */
  let selectedRating = 0;
  const stars = document.querySelectorAll(".star");
  const comentario = document.getElementById("comentario");
  const charCount = document.getElementById("charCount");
  const maxChars = 150;

  stars.forEach(s => {
    s.addEventListener("click", () => {
      selectedRating = Number(s.dataset.value);
      updateStars(selectedRating);
    });
  });

  function updateStars(n) {
    stars.forEach(s => {
      s.classList.toggle("active", Number(s.dataset.value) <= n);
    });
  }

  if (comentario && charCount) {
    comentario.addEventListener("input", () => {
      let val = comentario.value;
      if (val.length > maxChars) {
        comentario.value = val.substring(0, maxChars);
      }
      charCount.textContent = `${comentario.value.length} / ${maxChars}`;
    });
  }

  document.getElementById("btnSendFeedback")?.addEventListener("click", async () => {
    const text = comentario.value.trim();
    const msg = document.getElementById("feedbackMessage");

    if (!text) {
      msg.textContent = "Escribe un comentario.";
      msg.style.color = "var(--danger)";
      return;
    }

    try {
      const res = await fetch(API_BASE + "/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentario: text, rating: selectedRating || 0 })
      });
      const data = await res.json();
      if (res.ok) {
        msg.textContent = "Gracias por tu opinión.";
        msg.style.color = "green";
        comentario.value = "";
        charCount.textContent = `0 / ${maxChars}`;
        selectedRating = 0;
        updateStars(0);

        // limpiar mensaje después de 3s
        setTimeout(() => { msg.textContent = ""; }, 3000);
      } else {
        msg.textContent = data.error || "Error al enviar la opinión.";
        msg.style.color = "var(--danger)";
      }
    } catch {
      msg.textContent = "No se pudo conectar al servidor.";
      msg.style.color = "var(--danger)";
    }
  });

  /* ======================
     MODO OSCURO
  ====================== */
  const themeToggle = document.getElementById("theme-toggle");

  function toggleTheme() {
    const theme = document.documentElement.getAttribute("data-theme");
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
  }

  function updateThemeIcon(theme) {
    const themeIcon = document.getElementById("theme-icon");
    if (themeIcon) {
      themeIcon.textContent = theme === "light" ? "dark_mode" : "light_mode";
    }
  }

  themeToggle?.addEventListener("click", toggleTheme);
  loadTheme();
});
