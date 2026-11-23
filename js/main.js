/* Bounty Hunter — поведінка сторінок (без залежностей) */
(function () {
  "use strict";

  /* ---------- Дані (замість бекенду) ---------- */
  const FREELANCERS = {
    1: { name: "Віталій Кравченко", ini: "ВК", cat: "Frontend", lvl: "junior", rating: "4.5", status: "free", rate: "250 грн/год", loc: "Київ",
         desc: "Верстаю адаптивні інтерфейси на HTML, CSS і JavaScript, працюю з Figma та React. Шукаю перші комерційні проєкти.", stack: ["HTML", "CSS", "JavaScript", "React", "Figma"] },
    2: { name: "Ірина Савченко", ini: "ІС", cat: "Backend", lvl: "middle", rating: "4", status: "free", rate: "22 $/год", loc: "Харків",
         desc: "Розробляю API на Python та Django, налаштовую бази даних PostgreSQL, пишу автотести. Досвід — 3 роки.", stack: ["Python", "Django", "PostgreSQL", "Docker"] },
    3: { name: "Андрій Бондар", ini: "АБ", cat: "Fullstack", lvl: "senior", rating: "5", status: "busy", rate: "45 $/год", loc: "Львів",
         desc: "Повний цикл розробки вебсервісів: React, Node.js, DevOps. Керував командою з п'яти розробників.", stack: ["React", "Node.js", "TypeScript", "AWS", "CI/CD"] }
  };
  const JOBS = {
    1: { title: "Junior Frontend-розробник", co: "TechNova", cat: "Frontend", lvl: "junior", budget: "800–1200 $", deadline: "30 днів", format: "Віддалено",
         desc: ["Шукаємо початківця для роботи над інтерфейсами клієнтського порталу. Ви будете верстати сторінки за макетами Figma, підключати компоненти на React та разом із командою покращувати доступність сайту."] },
    2: { title: "Backend-розробник (Python/Django)", co: "DataForge", cat: "Backend", lvl: "middle", budget: "2000–3000 $", deadline: "60 днів", format: "Гібрид, Київ",
         desc: ["Потрібен розробник для створення REST API платіжного модуля. Інтеграція платіжних шлюзів, оптимізація запитів до PostgreSQL, покриття коду тестами."] },
    3: { title: "Fullstack-розробник", co: "CloudBridge", cat: "Fullstack", lvl: "senior", budget: "5000–7000 $", deadline: "90 днів", format: "Віддалено",
         desc: ["Побудова вебплатформи з нуля: React на фронтенді, Node.js на бекенді, налаштування CI/CD. Менторство двох молодших розробників."] }
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const param = (k) => new URLSearchParams(location.search).get(k);
  const store = {
    get(k, d) { try { const v = sessionStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };

  /* ---------- Вхід / реєстрація ---------- */
  const loginForm = $("#login-form");
  if (loginForm) loginForm.addEventListener("submit", (e) => {
    const login = $("#login").value.trim(), pass = $("#password").value;
    const err = $("#login-error");
    if (!login || !pass) { e.preventDefault(); err.textContent = "Введіть логін і пароль."; return; }
    if (pass.length < 4) { e.preventDefault(); err.textContent = "Пароль має містити щонайменше 4 символи."; return; }
    store.set("user", login);
  });

  const regForm = $("#register-form");
  if (regForm) regForm.addEventListener("submit", (e) => {
    const err = $("#register-error");
    const login = $("#r-login").value.trim(), mail = $("#r-email").value.trim(), pass = $("#r-pass").value;
    if (!login || !/^\S+@\S+\.\S+$/.test(mail)) { e.preventDefault(); err.textContent = "Вкажіть логін і коректний email."; return; }
    if (pass.length < 8) { e.preventDefault(); err.textContent = "Пароль має містити щонайменше 8 символів."; return; }
    store.set("user", login); store.set("role", $("#r-role").value);
  });

  $$("[data-logout]").forEach((a) => a.addEventListener("click", () => { try { sessionStorage.clear(); } catch (e) { /* ignore */ } }));
  $$("[data-role]").forEach((a) => a.addEventListener("click", () => store.set("role", a.dataset.role)));

  /* ---------- Фільтри та пошук (екрани 3 і 5) ---------- */
  const results = $("#results");
  if (results) {
    const items = $$("article", results);
    const apply = () => {
      const f = {};
      $$("[data-filter]").forEach((s) => { f[s.dataset.filter] = s.value; });
      const q = ($("[data-search]") || { value: "" }).value.trim().toLowerCase();
      let shown = 0;
      items.forEach((it) => {
        const d = it.dataset;
        const ok =
          (!f.category || d.category === f.category) &&
          (!f.level || d.level === f.level) &&
          (!f.rating || parseFloat(d.rating) >= parseFloat(f.rating)) &&
          (!f.status || d.status === f.status) &&
          (!q || it.textContent.toLowerCase().includes(q));
        it.parentElement.hidden = !ok;
        if (ok) shown++;
      });
      const empty = $("#empty"); if (empty) empty.hidden = shown !== 0;
    };
    $$("[data-filter]").forEach((s) => s.addEventListener("change", apply));
    const search = $("[data-search]"); if (search) search.addEventListener("input", apply);
  }

  /* ---------- Профіль фрілансера (екран 4) ---------- */
  if ($("#profile")) {
    const id = param("id") || "1";
    const f = FREELANCERS[id] || FREELANCERS[1];
    setText("p-name", f.name); setText("p-desc", f.desc); setText("p-cat", f.cat); setText("p-lvl", f.lvl);
    setText("p-rate", f.rate); setText("p-loc", f.loc); setText("p-photo", f.ini);
    const st = $("#p-status"); st.textContent = f.status === "free" ? "Free" : "Busy"; st.className = "status status--" + f.status;
    const r = $("#p-rating"); r.lastChild.textContent = f.rating;
    const stack = $("#p-stack"); stack.innerHTML = ""; f.stack.forEach((t) => { const li = document.createElement("li"); li.textContent = t; stack.appendChild(li); });
    $("#p-contact").href = "chat.html?with=" + (FREELANCERS[id] ? id : 1);
    document.title = f.name + " — Bounty Hunter";
  }

  /* ---------- Вакансія + модальне вікно заявки (екран 6) ---------- */
  if ($("#job")) {
    const id = param("id") || "1";
    const j = JOBS[id] || JOBS[1];
    setText("j-title", j.title); setText("j-co", j.co); setText("j-cat", j.cat); setText("j-lvl", j.lvl);
    setText("j-budget", j.budget); setText("j-deadline", j.deadline); setText("j-format", j.format); setText("j-logo", j.co.slice(0, 2).toUpperCase());
    $("#j-desc").innerHTML = ""; j.desc.forEach((t) => { const p = document.createElement("p"); p.textContent = t; $("#j-desc").appendChild(p); });
    document.title = j.title + " — Bounty Hunter";

    const dlg = $("#apply-modal");
    $("#apply-btn").addEventListener("click", () => { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); $("#a-letter").focus(); });
    $("#apply-cancel").addEventListener("click", () => dlg.close());
    $("#apply-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const letter = $("#a-letter").value.trim(), rate = $("#a-rate").value.trim();
      if (!letter || !rate) return;
      store.set("application", { job: j.title, letter, rate });
      location.href = "waiting.html";
    });
  }

  /* ---------- Очікування відповіді (екран 8) ---------- */
  if ($("#w-job")) {
    const a = store.get("application", null);
    if (a) { setText("w-job", a.job); setText("w-letter", a.letter); setText("w-rate", a.rate); }
  }

  /* ---------- Чат (екран 7) ---------- */
  const log = $("#chat-log");
  if (log) {
    const id = param("with") || "1";
    const f = FREELANCERS[id] || FREELANCERS[1];
    setText("c-name", f.name); setText("c-avatar", f.ini);
    const key = "chat-" + id;
    const time = () => new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
    let msgs = store.get(key, null) || [{ out: false, text: "Вітаю! Дякую, що написали. Розкажіть, будь ласка, про ваш проєкт.", t: time() }];
    const draw = (m) => {
      const b = document.createElement("div"); b.className = "bubble" + (m.out ? " bubble--out" : "");
      b.textContent = m.text; const t = document.createElement("time"); t.textContent = m.t; b.appendChild(t); log.appendChild(b);
      log.scrollTop = log.scrollHeight;
    };
    msgs.forEach(draw);
    $("#chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = $("#chat-input"); const text = inp.value.trim(); if (!text) return;
      const m = { out: true, text, t: time() }; msgs.push(m); draw(m); inp.value = ""; store.set(key, msgs);
      setTimeout(() => { const r = { out: false, text: "Дякую за повідомлення! Відповім найближчим часом.", t: time() }; msgs.push(r); draw(r); store.set(key, msgs); }, 900);
    });
    $("#chat-input").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chat-form").requestSubmit(); } });
  }

  /* ---------- Допомога ---------- */
  const help = $("#help-form");
  if (help) help.addEventListener("submit", (e) => { e.preventDefault(); $("#help-note").textContent = "Дякуємо! Ми відповімо протягом доби."; help.reset(); });
})();
