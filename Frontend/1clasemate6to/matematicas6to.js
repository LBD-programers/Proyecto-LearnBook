// matematicas6to.js
document.addEventListener("DOMContentLoaded", () => {
  /* CONFIG */
  const XP_PER_LESSON = 20;

  /* ELEMENTOS */
  const mainHeader = document.getElementById("main-header");
  const mainSection = document.getElementById("main-section");
  const topicsSection = document.getElementById("topics-section");
  const topicButtonsContainer = document.getElementById("topic-buttons");
  const topicSections = document.querySelectorAll(".topic-section");

  /* Inicializar: interceptar clicks en topic-button (solo acceso por click) */
  topicButtonsContainer.querySelectorAll(".topic-button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // evitamos que solo el hash abra la sección
      const topic = btn.dataset.topic;
      openTopic(topic);
    });
  });

  // Botón volver de cada topbar (delegación)
  document.body.addEventListener("click", (e) => {
    const back = e.target.closest(".back-main");
    if (back) {
      e.preventDefault();
      closeTopicView();
    }
  });

  // Delegación para marcar lección completada desde la lista
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-complete");
    if (!btn) return;
    const listItem = btn.closest(".lesson-item");
    const topicSection = btn.closest(".topic-section");
    const topic = topicSection?.dataset.topic;
    const lessonId = listItem?.dataset.lessonId;
    if (!topic || !lessonId) return;

    // toggle complete
    const pressed = btn.getAttribute("aria-pressed") === "true";
    if (!pressed) {
      markLessonCompleted(topic, lessonId);
    } else {
      unmarkLessonCompleted(topic, lessonId);
    }
  });

  /* Abre la sección de un topic y la configura si es necesario */
  function openTopic(topic) {
    // ocultar principal
    mainHeader.classList.add("header-hidden");
    mainSection.hidden = true;
    topicsSection.hidden = true;

    // mostrar la sección del topic (crear si no hay contenido)
    let section = document.querySelector(`.topic-section[data-topic="${topic}"]`);
    if (!section) {
      // si no existe, crear un section vacío (no debería pasar porque ponemos secciones en HTML)
      section = document.createElement("section");
      section.className = "topic-section";
      section.dataset.topic = topic;
      document.querySelector(".class-container").appendChild(section);
    }

    // si la sección está vacía, poblarla con plantilla de lista (podemos generar items de ejemplo)
    if (!section.querySelector(".topic-body")) {
      populateTopicSection(section, topic);
    }

    // mostrar sección
    section.hidden = false;
    section.scrollIntoView({ behavior: "smooth" });

    // actualizar UI (progreso, xp, estado items)
    updateTopicUI(topic);
  }

  /* Cierra la vista de topic y vuelve a la pantalla principal */
  function closeTopicView() {
    // ocultar todas las topic sections
    document.querySelectorAll(".topic-section").forEach(s => s.hidden = true);

    // mostrar principal
    mainSection.hidden = false;
    topicsSection.hidden = false;
    mainHeader.classList.remove("header-hidden");

    // scroll a la sección de temas
    topicsSection.scrollIntoView({ behavior: "smooth" });
  }

  /* Población dinámica de sección (si está vacía) */
  function populateTopicSection(section, topic) {
    const prettyName = {
      poligonos: "Polígonos",
      decimales: "Números decimales",
      fracciones: "Fracciones",
      area: "Área",
      volumen: "Volumen"
    }[topic] || topic;

    section.innerHTML = `
      <div class="topic-topbar">
        <button class="back-main" aria-label="Volver a temas"><i class="fas fa-arrow-left"></i> Temas</button>

        <div class="progress-info" aria-hidden="false">
          <div class="streak">
            <span class="label">Racha</span>
            <span class="value" id="streak-${topic}">0</span>
            <span class="icon">🔥</span>
          </div>

          <div class="progress">
            <span class="label">Progreso</span>
            <div class="progress-bar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" role="progressbar">
              <div class="progress-fill" style="width:0%" id="progress-fill-${topic}"></div>
            </div>
            <span class="percent" id="percent-${topic}">0%</span>
          </div>

          <div class="xp">
            <span class="label">XP</span>
            <span class="value" id="xp-${topic}">0</span>
            <i class="fas fa-gem xp-icon" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <div class="topic-body">
        <h2 id="${topic}-heading" class="topic-heading">${prettyName}</h2>
        <p class="topic-desc">Lista de lecciones para ${prettyName}. Haz click en una lección para abrirla. Cuando termines, puedes marcarla como completada para obtener XP.</p>
        <ul class="lesson-list" id="lessons-${topic}"></ul>
      </div>
    `;

    // Añadir lecciones de ejemplo (3 por defecto) si no hay datos previos
    const lessonsUl = section.querySelector(`#lessons-${topic}`);
    const exampleLessons = [
      { id: `${topic}-1`, title: `1. Introducción a ${prettyName}` },
      { id: `${topic}-2`, title: `2. Ejemplos y ejercicios` },
      { id: `${topic}-3`, title: `3. Práctica guiada` }
    ];

    exampleLessons.forEach(l => {
      const li = document.createElement("li");
      li.className = "lesson-item";
      li.dataset.lessonId = l.id;
      li.innerHTML = `
        <a class="lesson-link" href="lecciones/${topic}/leccion-${l.id.split('-').pop()}.html">${l.title}</a>
        <div class="lesson-actions">
          <button class="btn-complete" aria-pressed="false">Marcar</button>
          <span class="status" aria-hidden="true"></span>
        </div>
      `;
      lessonsUl.appendChild(li);
    });
  }

  /* STORAGE helpers: estructura por topic:
     localStorage key: lb_progress_<topic>
     value: JSON {
       completed: [lessonId,...],
       xp: number,
       streak: number,
       lastDate: "YYYY-MM-DD"
     }
  */
  function readProgress(topic) {
    const key = `lb_progress_${topic}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { completed: [], xp: 0, streak: 0, lastDate: null };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { completed: [], xp: 0, streak: 0, lastDate: null };
    }
  }
  function writeProgress(topic, obj) {
    const key = `lb_progress_${topic}`;
    localStorage.setItem(key, JSON.stringify(obj));
  }

  /* Marca una lección como completada */
  function markLessonCompleted(topic, lessonId) {
    const p = readProgress(topic);
    if (!p.completed.includes(lessonId)) {
      p.completed.push(lessonId);
      p.xp = (p.xp || 0) + XP_PER_LESSON;

      // actualizar racha: si no hay lastDate -> racha = 1
      const today = new Date().toISOString().slice(0, 10);
      if (!p.lastDate) {
        p.streak = 1;
      } else {
        const last = new Date(p.lastDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const lastStr = p.lastDate;
        const yesterdayStr = yesterday.toISOString().slice(0,10);

        if (lastStr === today) {
          // ya tuvo completación hoy -> no incrementamos racha
        } else if (lastStr === yesterdayStr) {
          p.streak = (p.streak || 0) + 1;
        } else {
          p.streak = 1;
        }
      }
      p.lastDate = new Date().toISOString().slice(0,10);
      writeProgress(topic, p);

      // actualizar UI
      updateTopicUI(topic);
    }

    // cambiar estado visual del item y boton
    const li = document.querySelector(`.topic-section[data-topic="${topic}"] .lesson-item[data-lesson-id="${lessonId}"]`);
    if (li) {
      li.classList.add("completed");
      const btn = li.querySelector(".btn-complete");
      btn.setAttribute("aria-pressed","true");
      btn.textContent = "Completada";
      li.querySelector(".status").textContent = "✓ completada";
    }
  }

  /* Desmarca una lección completada */
  function unmarkLessonCompleted(topic, lessonId) {
    const p = readProgress(topic);
    const idx = p.completed.indexOf(lessonId);
    if (idx !== -1) {
      p.completed.splice(idx,1);
      // ajustar XP: restar XP_PER_LESSON, pero no bajar de 0
      p.xp = Math.max(0, (p.xp || 0) - XP_PER_LESSON);
      writeProgress(topic, p);
      updateTopicUI(topic);
    }

    const li = document.querySelector(`.topic-section[data-topic="${topic}"] .lesson-item[data-lesson-id="${lessonId}"]`);
    if (li) {
      li.classList.remove("completed");
      const btn = li.querySelector(".btn-complete");
      btn.setAttribute("aria-pressed","false");
      btn.textContent = "Marcar";
      li.querySelector(".status").textContent = "";
    }
  }

  /* Actualiza UI de una sección: porcentaje, xp, racha y estados de items */
  function updateTopicUI(topic) {
    const section = document.querySelector(`.topic-section[data-topic="${topic}"]`);
    if (!section) return;

    const p = readProgress(topic);
    const lessonsUl = section.querySelector(".lesson-list");
    const items = lessonsUl ? Array.from(lessonsUl.querySelectorAll(".lesson-item")) : [];

    const total = items.length || 0;
    const completedCount = p.completed ? p.completed.length : 0;
    const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    // actualizar topbar valores
    const percentSpan = section.querySelector(`#percent-${topic}`);
    const fill = section.querySelector(`#progress-fill-${topic}`);
    const xpSpan = section.querySelector(`#xp-${topic}`);
    const streakSpan = section.querySelector(`#streak-${topic}`);

    if (percentSpan) percentSpan.textContent = `${percent}%`;
    if (fill) fill.style.width = `${percent}%`;
    if (xpSpan) xpSpan.textContent = p.xp || 0;
    if (streakSpan) streakSpan.textContent = p.streak || 0;

    // actualizar status de cada item
    items.forEach(li => {
      const id = li.dataset.lessonId;
      const btn = li.querySelector(".btn-complete");
      const status = li.querySelector(".status");
      if (p.completed && p.completed.includes(id)) {
        li.classList.add("completed");
        if (btn) { btn.setAttribute("aria-pressed","true"); btn.textContent = "Completada"; }
        if (status) status.textContent = "✓ completada";
      } else {
        li.classList.remove("completed");
        if (btn) { btn.setAttribute("aria-pressed","false"); btn.textContent = "Marcar"; }
        if (status) status.textContent = "";
      }
    });

    // actualizar atributo aria-valuenow para accesibilidad
    const bar = section.querySelector(".progress-bar");
    if (bar) bar.setAttribute("aria-valuenow", percent);
  }

  /* Crear/preparar todas las secciones que estén vacías con 3 lecciones ejemplo */
  document.querySelectorAll(".topic-section").forEach(s => {
    if (!s.querySelector(".topic-body")) {
      // si es la sección de poligonos ya existente, la dejamos; las otras las poblaremos
      const t = s.dataset.topic;
      if (t) populateTopicSection(s, t);
    }
  });

  // Inicializar: actualizar UI para todas las secciones (si ya tenían items)
  document.querySelectorAll(".topic-section").forEach(s => {
    const t = s.dataset.topic;
    if (t) updateTopicUI(t);
  });
});
