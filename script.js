
"use strict";

// ========================================
// BIO LAB 14 — BY DARKHAN
// 80 минут • 24 оқушыға дейін
// Кездейсоқ таңдау • 3 командалық ойын
// ========================================

const $ = id => document.getElementById(id);
const STORAGE = "biolab14_random_final_v1";
const TOTAL_PAGES = 14;

const CLASS_NAMES = [
  "Рамазан",
  "Тұрғанжан",
  "Нұрай",
  "Әлқуат",
  "Шырай",
  "Гүлсезім",
  "Маржан",
  "Мариям",
  "Жансая",
  "Азиза",
  "Ақсезім",
  "Нұрболсын",
  "Ақнұр",
  "Іңкәр",
  "Асхат",
  "Аяжан",
  "Мирас",
  "Санжар",
  "Ерасыл",
  "Нұрасыл",
  "Расул",
  "Айнұр",
  "Дархан",
  "Айкерім"
];

const TEAMS = [
  "🩸 Гемоглобин",
  "💪 Миоглобин",
  "🫁 Оттегі"
];

// ========================================
// 1. ЖҮЙЕНІҢ КҮЙІ
// ========================================

function initialState() {
  return {
    page: 0,
    startedAt: null,

    students: CLASS_NAMES.map((name, id) => ({
      id,
      name,
      present: true
    })),

    oral: {},
    quiz: {},
    quick: {},
    logic: {},
    creative: {},

    oralSelected: null,
    quizSelected: null,
    battleIndex: 0
  };
}

let state = initialState();

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE) || "null"
  );

  if (
    saved &&
    typeof saved === "object" &&
    Array.isArray(saved.students) &&
    saved.students.length === 24
  ) {
    state = {
      ...initialState(),
      ...saved
    };
  }
} catch (error) {
  console.warn("Сақталған мәлімет оқылмады", error);
}

for (const key of [
  "oral",
  "quiz",
  "quick",
  "logic",
  "creative"
]) {
  if (
    !state[key] ||
    typeof state[key] !== "object"
  ) {
    state[key] = {};
  }
}

function save() {
  try {
    localStorage.setItem(
      STORAGE,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Сақтау қатесі", error);
  }
}

function html(text) {
  return String(text).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(
    object,
    key
  );
}

function presentStudents() {
  return state.students.filter(s => s.present);
}

function teamCount() {
  return Math.min(3, presentStudents().length);
}

function studentTeam(id) {
  const index = presentStudents()
    .findIndex(s => s.id === id);

  if (index < 0 || teamCount() === 0) {
    return -1;
  }

  return index % teamCount();
}

function teamMembers(team) {
  return presentStudents().filter(
    s => studentTeam(s.id) === team
  );
}

function randomStudent(pool) {
  if (!pool.length) return null;

  let index;

  if (
    window.crypto &&
    typeof window.crypto.getRandomValues === "function"
  ) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    index = values[0] % pool.length;
  } else {
    index = Math.floor(
      Math.random() * pool.length
    );
  }

  return pool[index];
}

// ========================================
// 2. БЕТТЕРДІ АУЫСТЫРУ
// ========================================

function goTo(page) {
  page = Number(page);

  if (
    !Number.isInteger(page) ||
    page < 0 ||
    page >= TOTAL_PAGES
  ) {
    return;
  }

  if (page > 0 && !state.startedAt) {
    state.startedAt = Date.now();
  }

  if (state.page === 5 && page !== 5) {
    stopVideo();
  }

  state.page = page;
  save();

  for (let i = 0; i < TOTAL_PAGES; i++) {
    const section = $("page-" + i);
    const active = i === page;

    section.classList.toggle("active", active);
    section.hidden = !active;
  }

  document.querySelectorAll(".nav-btn")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        Number(btn.dataset.page) === page
      );
    });

  $("pageIndicator").textContent =
    `${page + 1} / ${TOTAL_PAGES}`;

  $("previousPage").disabled = page === 0;
  $("nextPage").disabled =
    page === TOTAL_PAGES - 1;

  $("nextPage").textContent =
    page === TOTAL_PAGES - 2
      ? "Қорытынды →"
      : "Келесі →";

  refresh();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

window.goTo = goTo;

document.querySelectorAll(".nav-btn")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      goTo(Number(btn.dataset.page));
    });
  });

$("previousPage").addEventListener("click", () => {
  goTo(state.page - 1);
});

$("nextPage").addEventListener("click", () => {
  goTo(state.page + 1);
});

// ========================================
// 3. ТАЙМЕР
// ========================================

function updateClock() {
  let seconds = 0;

  if (state.startedAt) {
    seconds = Math.max(
      0,
      Math.floor(
        (Date.now() - state.startedAt) / 1000
      )
    );
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  $("lessonClock").textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainder).padStart(2, "0");

  document.querySelector(".timer").style.color =
    seconds >= 4800 ? "#ffda79" : "#3cdbad";
}

setInterval(updateClock, 1000);

// ========================================
// 4. ТОЛЫҚ ЭКРАН
// ========================================

$("fullscreenBtn").addEventListener(
  "click",
  async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement
          .requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      alert("Бұл браузер толық экранды қолдамайды.");
    }
  }
);

// ========================================
// 5. YOUTUBE
// ========================================

const VIDEOS = [
  {
    id: "iMpjcdbTtLw",
    title: "Гемоглобин мен миоглобиннің құрылысы мен қызметі"
  },
  {
    id: "02kcm3jA1ms",
    title: "Гемоглобин мен миоглобин құрылысы"
  }
];

function playVideo(index) {
  const video = VIDEOS[index];
  if (!video) return;

  // Алғашқы 3 минутты көру үшін.
  // Қажет болса YouTube ішінен жалғастыруға болады.
  $("youtubePlayer").src =
    "https://www.youtube-nocookie.com/embed/" +
    video.id +
    "?start=0&end=180&rel=0&playsinline=1";

  $("videoTitle").textContent =
    "▶ " + video.title;

  $("videoExternal").href =
    "https://www.youtube.com/watch?v=" +
    video.id;
}

function stopVideo() {
  $("youtubePlayer").src = "about:blank";
  $("videoTitle").textContent =
    "Видео тоқтатылды.";
}

document.querySelectorAll("[data-video]")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      playVideo(Number(btn.dataset.video));
    });
  });

$("stopVideo").addEventListener(
  "click",
  stopVideo
);

// ========================================
// 6. ҚАТЫСУШЫЛАР
// ========================================

function teamActivityStarted() {
  return (
    Object.keys(state.quick).length > 0 ||
    Object.keys(state.logic).length > 0 ||
    Object.keys(state.creative).length > 0
  );
}

function beforeRosterChange() {
  if (!teamActivityStarted()) return true;

  const accepted = confirm(
    "Қатысушылар өзгерсе, командалар қайта бөлінеді. " +
    "Сондықтан командалық ойын ұпайлары тазаланады. " +
    "Жеке бағалар сақталады. Жалғастырамыз ба?"
  );

  if (!accepted) return false;

  state.quick = {};
  state.logic = {};
  state.creative = {};
  state.battleIndex = 0;

  return true;
}

function afterRosterChange() {
  const active = presentStudents();

  if (
    !active.some(s => s.id === state.oralSelected)
  ) {
    state.oralSelected = null;
  }

  if (
    !active.some(s => s.id === state.quizSelected)
  ) {
    state.quizSelected = null;
  }

  save();
  refresh();

  $("attendanceFeedback").textContent =
    `✅ ${active.length} оқушы қатысады. ` +
    `${24 - active.length} оқушы қатыспайды.`;
}

function changePresence(id, present) {
  const student = state.students[id];
  if (!student) return;

  if (student.present === present) return;

  if (!beforeRosterChange()) return;

  student.present = present;
  afterRosterChange();
}

function renderAttendance() {
  const active = presentStudents();
  const absent = state.students
    .filter(s => !s.present);

  $("presentCount").textContent = active.length;
  $("absentCount").textContent = absent.length;
  $("teamCount").textContent = teamCount();

  $("presentList").innerHTML = active.map(s => `
    <div class="student-row">
      <span class="student-number">
        ${s.id + 1}.
      </span>

      <input type="text"
             maxlength="60"
             data-name="${s.id}"
             value="${html(s.name)}"
             aria-label="Оқушының аты">

      <button class="small-danger"
              data-absent="${s.id}">
        ✕ Алып тастау
      </button>
    </div>
  `).join("");

  $("absentList").innerHTML = absent.length
    ? absent.map(s => `
      <div class="absent-row">
        <span>${html(s.name)}</span>
        <button class="small-success"
                data-restore="${s.id}">
          ↩ Қайтару
        </button>
      </div>
    `).join("")
    : "<p>Қатыспайтын оқушылар жоқ.</p>";

  document.querySelectorAll("[data-absent]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        changePresence(
          Number(btn.dataset.absent),
          false
        );
      });
    });

  document.querySelectorAll("[data-restore]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        changePresence(
          Number(btn.dataset.restore),
          true
        );
      });
    });

  document.querySelectorAll("[data-name]")
    .forEach(input => {
      input.addEventListener("change", () => {
        const id = Number(input.dataset.name);
        const name = input.value.trim();

        if (!name) {
          input.value = state.students[id].name;
          return;
        }

        state.students[id].name = name;
        save();
        renderTeamRoster();
        renderOral();
        renderQuiz();
        renderScores();
      });
    });
}

$("allPresent").addEventListener("click", () => {
  if (!state.students.some(s => !s.present)) {
    return;
  }

  if (!beforeRosterChange()) return;

  state.students.forEach(s => {
    s.present = true;
  });

  afterRosterChange();
});

function renderTeamRoster() {
  if (!teamCount()) {
    $("teamRoster").innerHTML =
      '<div class="card">Қатысушылар жоқ.</div>';
    return;
  }

  $("teamRoster").innerHTML =
    TEAMS.slice(0, teamCount())
      .map((name, i) => `
        <div class="team-card">
          <h3>${name}</h3>
          <p>${teamMembers(i).length} оқушы</p>

          <ol>
            ${teamMembers(i).map(s => `
              <li>${html(s.name)}</li>
            `).join("")}
          </ol>
        </div>
      `).join("");
}

// ========================================
// 7. КҮРДЕЛІ АУЫЗША СҰРАҚТАР
// ========================================

const ORAL = [
  {
    q: "Эритроциттің екі жағы ойыс пішіні оның қызметіне қалай әсер етеді?",
    a: "Беткі аудан мен көлем қатынасын ұлғайтады, газ алмасуға қолайлы жағдай жасайды және қылтамырлардан өтуге көмектеседі."
  },
  {
    q: "Неліктен гемоглобиннің төрт субъбірліктен тұруы оттегі тасымалы үшін маңызды?",
    a: "Әр субъбірлікте гем бар. Төрт O₂ байланысады және субъбірліктер арасындағы кооперативтілік оттегіні тиімді қабылдап-босатуға көмектеседі."
  },
  {
    q: "Гемоглобиннің бір субъбірлігі O₂ байланыстырғанда қалғандарына қандай әсер етеді?",
    a: "Қалған субъбірліктердің оттегіге жақындығын арттырады. Бұл оң кооперативтілік."
  },
  {
    q: "Неліктен гемоглобин оттегіні өкпеде қабылдап, ұлпада босата алады?",
    a: "Өкпе мен ұлпада O₂ парциалдық қысымы әртүрлі. Байланысу қайтымды, ал гемоглобиннің жақындығы жағдайға тәуелді."
  },
  {
    q: "Гем тобындағы Fe²⁺ ионының рөлі қандай?",
    a: "Гем құрамындағы Fe²⁺ оттегі молекуласын қайтымды байланыстыруға қатысады."
  },
  {
    q: "Оттегінің парциалдық қысымы төмендесе гемоглобиннің қанығуы қалай өзгереді?",
    a: "Тепе-теңдік O₂ босату жағына ығысады, сондықтан қанығу төмендейді."
  },
  {
    q: "Белсенді жұмыс істейтін ұлпада CO₂ артса, қандай физиологиялық әсер болады?",
    a: "CO₂ көбеюі мен рН төмендеуі Бор әсері арқылы Hb-ның O₂-ге жақындығын азайтып, оттегінің босауын жеңілдетеді."
  },
  {
    q: "Неліктен Hb-ның оттегімен қанығу қисығы S тәрізді?",
    a: "Гемоглобинде төрт субъбірлік бар, олардың оттегімен байланысуы кооперативті болады."
  },
  {
    q: "Қандай жағдайда гемоглобиннің оттегіні босатуы күшеюі мүмкін?",
    a: "Ұлпада O₂ парциалдық қысымы төмендеп, CO₂ көбейіп және рН азайғанда O₂ босатылуы жеңілдейді."
  },
  {
    q: "Гемоглобин мен миоглобиннің құрылымдық айырмашылығы қызметіне қалай байланысты?",
    a: "Төрт тізбекті Hb кооперативті түрде O₂ тасымалдайды. Бір тізбекті Mb O₂-ні жоғары жақындықпен байланыстырып, бұлшықетте сақтауға көмектеседі."
  },
  {
    q: "Бұлшықетте оттегі азайса, миоглобин қандай қызмет атқарады?",
    a: "Оттегі парциалдық қысымы жеткілікті төмендеген кезде байланысқан O₂-нің бір бөлігін босата алады."
  },
  {
    q: "Миоглобиннің оттегіге жоғары жақындығы қандай артықшылық береді?",
    a: "Бұлшықеттегі O₂ қорын сақтауға және оның жасуша ішінде таралуына жағдай жасайды."
  },
  {
    q: "Миоглобин неліктен гемоглобин сияқты кооперативті байланыспайды?",
    a: "Миоглобинде бір полипептидтік тізбек және бір O₂ байланыстыру орны бар; бірнеше субъбірліктің өзара әсері жоқ."
  },
  {
    q: "Қанығу қисығының гиперболалық болуы миоглобин туралы нені білдіреді?",
    a: "Миоглобин бір байланыстыру орны арқылы O₂-ге жоғары жақындық көрсетеді және Hb-ға тән кооперативтілік байқалмайды."
  },
  {
    q: "Неліктен гемоглобиннің O₂-ге жақындығы миоглобиннен төмен болғаны пайдалы?",
    a: "Гемоглобин оттегіні ұлпаларға босата алуы керек. Өте жоғары жақындық оның тасымалдаушы рөлін қиындатар еді."
  },
  {
    q: "Өкпе альвеоласынан оттегінің қанға өтуін қандай заңдылық түсіндіреді?",
    a: "Оттегі парциалдық қысым айырмашылығы бойынша диффузия арқылы өтеді."
  },
  {
    q: "Оксигемоглобиннің түзілуі мен ыдырауы неге қайтымды?",
    a: "O₂ гемоглобинге қайтымды байланысады. Бұл өкпеде қабылдау мен ұлпада босатуды қамтамасыз етеді."
  },
  {
    q: "Жетілген эритроциттің ядросыз болуының қандай маңызы бар?",
    a: "Гемоглобинге көбірек кеңістік береді және эритроциттің арнайы тасымалдаушы қызметіне бейімделуінің бір бөлігі."
  },
  {
    q: "Гемоглобиннің гем тобы мен глобин бөлігінің айырмашылығын түсіндір.",
    a: "Глобин — нәруыз тізбегі. Гем — құрамында Fe²⁺ бар нәруыздық емес топ; ол O₂ байланысуына қатысады."
  },
  {
    q: "Егер гемоглобин оттегіні біржола берік ұстап қалса, қандай мәселе туар еді?",
    a: "Ұлпаларға O₂ босату қиындайды, сондықтан гемоглобиннің тасымалдаушы қызметі нашарлайды."
  },
  {
    q: "Гемоглобин мен миоглобиннің ортақ екі молекулалық қасиетін ата.",
    a: "Екеуі де глобинді нәруыздар, құрамында Fe²⁺ бар гем тобы болады және O₂-мен қайтымды байланысады."
  },
  {
    q: "Миоглобин бұлшықет жасушасының ішінде неліктен маңызды?",
    a: "O₂ қорын сақтауға және жасушаның ішкі бөліктеріне оттегінің таралуына көмектеседі."
  },
  {
    q: "Жоғары O₂ қысымы кезінде Hb қисығы неге жазықтала бастайды?",
    a: "Гемоглобиннің байланысу орындары қаныға бастайды; толық қанығуға жақындағанда қосымша O₂ байланысуының өсімі азаяды."
  },
  {
    q: "Гемоглобин мен миоглобиннің физиологиялық қызметін бір мысалмен салыстыр.",
    a: "Өкпеден бұлшықетке O₂ жеткізуде Hb қатысады, ал бұлшықет ішіндегі O₂ қорын сақтауға және таратуға Mb көмектеседі."
  }
];

// ========================================
// 8. КЕЗДЕЙСОҚ АУЫЗША ТАҢДАУ
// ========================================

function oralRemaining() {
  return presentStudents().filter(
    s => !has(state.oral, s.id)
  );
}

function pickOral() {
  if (
    state.oralSelected !== null &&
    !has(state.oral, state.oralSelected) &&
    presentStudents().some(
      s => s.id === state.oralSelected
    )
  ) {
    $("oralFeedback").textContent =
      "Алдымен таңдалған оқушыны бағала.";
    return;
  }

  const pool = oralRemaining();

  if (!pool.length) {
    state.oralSelected = null;
    $("oralFeedback").textContent =
      "✅ Қатысушылардың барлығы жауап берді.";
    renderOral();
    return;
  }

  const student = randomStudent(pool);

  state.oralSelected = student.id;
  save();
  renderOral();
}

function renderOral() {
  const active = presentStudents();
  const remaining = oralRemaining();
  const completed = active.length - remaining.length;

  $("oralProgressText").textContent =
    `${completed} / ${active.length} бағаланды`;

  const id = state.oralSelected;
  const student = active.find(s => s.id === id);

  const hasSelection = Boolean(student);
  const graded = hasSelection && has(state.oral, id);

  $("oralPick").disabled =
    !active.length ||
    (hasSelection && !graded) ||
    remaining.length === 0;

  $("oralPick").textContent =
    remaining.length === 0
      ? "✅ Барлығы аяқталды"
      : "🎲 Рандом таңдау";

  $("oralReveal").disabled = !hasSelection;

  document.querySelectorAll(".oral-grade")
    .forEach(btn => {
      btn.disabled = !hasSelection || graded;
    });

  if (!hasSelection) {
    $("oralStudent").textContent =
      active.length
        ? "🎲 Кездейсоқ оқушыны таңдау"
        : "Қатысушыларды тіркеу керек";

    $("oralQuestion").textContent =
      "Рандом батырмасын бас.";

    $("oralAnswer").hidden = true;
    $("oralAnswer").textContent = "";
    $("oralFeedback").textContent =
      active.length
        ? `${remaining.length} оқушы әлі жауап берген жоқ.`
        : "Қатысушылар жоқ.";
  } else {
    $("oralStudent").textContent =
      "🎤 " + student.name;

    $("oralQuestion").textContent =
      ORAL[id].q;

    $("oralAnswer").textContent =
      "Дұрыс жауаптың үлгісі: " + ORAL[id].a;

    if (graded) {
      $("oralFeedback").textContent =
        `✅ ${student.name}: ${state.oral[id]} / 3 ұпай. ` +
        "Келесі оқушыны рандом арқылы таңда.";

      $("oralAnswer").hidden = false;
    } else {
      $("oralAnswer").hidden = true;
      $("oralFeedback").textContent =
        "Жауапты тыңдап, 0–3 ұпай қой.";
    }
  }

  $("oralResults").innerHTML = active
    .map(s => {
      const done = has(state.oral, s.id);

      return `
        <div class="progress-person">
          <span>${html(s.name)}</span>
          <b>
            ${done
              ? state.oral[s.id] + " / 3"
              : "Кезекте"}
          </b>
        </div>
      `;
    }).join("");
}

$("oralPick").addEventListener(
  "click",
  pickOral
);

$("oralReveal").addEventListener("click", () => {
  if (state.oralSelected === null) return;

  $("oralAnswer").hidden =
    !$("oralAnswer").hidden;
});

document.querySelectorAll(".oral-grade")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      const id = state.oralSelected;

      if (id === null || has(state.oral, id)) {
        return;
      }

      if (!presentStudents().some(s => s.id === id)) {
        return;
      }

      state.oral[id] = Number(btn.dataset.points);

      save();
      renderOral();
      renderScores();
    });
  });

// ========================================
// 9. КҮРДЕЛІ ЖЕКЕ ТЕСТТЕР
// ========================================

const QUIZ = [
  {
    q: "Эритроциттің газ алмасуға қолайлы пішіні қандай?",
    options: [
      "Шар тәрізді",
      "Екі жағы ойыс диск",
      "Ұзын цилиндр",
      "Төртбұрыш"
    ],
    answer: 1,
    why: "Екі жағы ойыс пішін газ алмасуға және жасушаның икемділігіне қолайлы."
  },
  {
    q: "HbA молекуласындағы α және β тізбектердің қатынасы қандай?",
    options: [
      "1α + 3β",
      "3α + 1β",
      "2α + 2β",
      "4α"
    ],
    answer: 2,
    why: "Ересек адамның негізгі HbA молекуласы α₂β₂ құрылымды."
  },
  {
    q: "Hb-ның кооперативті байланысуына қандай құрылым мүмкіндік береді?",
    options: [
      "Төрт субъбірліктің өзара әсері",
      "Ядроның болуы",
      "Бір ғана гем",
      "ДНҚ тізбегі"
    ],
    answer: 0,
    why: "Гемоглобин субъбірліктерінің өзара әсері O₂ жақындығын өзгертеді."
  },
  {
    q: "Бір Hb молекуласындағы O₂ байланыстыру орындары толық толса неше O₂ болады?",
    options: ["1", "2", "3", "4"],
    answer: 3,
    why: "Әр гем бір O₂ байланыстырады, ал Hb-да төрт гем бар."
  },
  {
    q: "Оттегіні қайтымды байланыстыруға қатысатын гемдегі ионды таңда.",
    options: ["Na⁺", "Fe²⁺", "Ca²⁺", "K⁺"],
    answer: 1,
    why: "Гем тобының ортасында Fe²⁺ темір ионы болады."
  },
  {
    q: "Гемоглобиннің тасымалдаушы қызметі үшін қай қасиет аса маңызды?",
    options: [
      "O₂-ні біржола бекіту",
      "O₂-ні қайтымды байланыстыру",
      "Гемнің болмауы",
      "Тек бір тізбектің болуы"
    ],
    answer: 1,
    why: "Қайтымдылық өкпеде O₂ қабылдауға, ұлпада босатуға мүмкіндік береді."
  },
  {
    q: "Оксигемоглобин туралы дұрыс пікірді таңда.",
    options: [
      "Құрамында O₂ байланысқан Hb",
      "Бұлшықеттегі негізгі нәруыз",
      "Тек бір глобин тізбегі",
      "Құрамында гем жоқ"
    ],
    answer: 0,
    why: "Оксигемоглобин — оттегімен байланысқан гемоглобин."
  },
  {
    q: "Өкпедегі O₂-нің гемоглобинмен байланысуына не қолайлы?",
    options: [
      "O₂ парциалдық қысымының жоғары болуы",
      "Гемоглобиннің жойылуы",
      "Гемнің болмауы",
      "O₂ қысымының нөл болуы"
    ],
    answer: 0,
    why: "Жоғары O₂ парциалдық қысымы Hb-ның қанығуына ықпал етеді."
  },
  {
    q: "Ұлпаларда O₂ босатылуын қай фактор қолдайды?",
    options: [
      "O₂ қысымының төмен болуы",
      "Гем тобының көбейіп кетуі",
      "Эритроцитте ядро пайда болуы",
      "Диффузияның толық тоқтауы"
    ],
    answer: 0,
    why: "Ұлпаларда O₂ жұмсалады, сондықтан қысым төмен болып, Hb O₂ босатады."
  },
  {
    q: "Гемоглобиннің глобин бөлігі нені білдіреді?",
    options: [
      "Темір ионын",
      "Нәруыз тізбектерін",
      "Оттегі газын",
      "Қан плазмасын"
    ],
    answer: 1,
    why: "Глобин — нәруыздық бөлік, ал гем — темірі бар топ."
  },
  {
    q: "Миоглобиннің оттегіні сақтауға бейімділігі немен байланысты?",
    options: [
      "O₂-ге жоғары жақындығымен",
      "Төрт субъбірлігінің болуымен",
      "Эритроцитте орналасуымен",
      "Гем тобының болмауымен"
    ],
    answer: 0,
    why: "Миоглобин O₂-ге жоғары жақындық көрсетеді."
  },
  {
    q: "Миоглобиннің субъбірлік саны қанша?",
    options: ["4", "3", "2", "1"],
    answer: 3,
    why: "Миоглобин — бір полипептид тізбекті нәруыз."
  },
  {
    q: "Миоглобиннің оттегімен қанығу қисығы неге гиперболалық?",
    options: [
      "Төрт гем болғандықтан",
      "Бір O₂ байланыстыру орны болғандықтан",
      "Қан плазмасында болғандықтан",
      "О₂ байланыстырмайтындықтан"
    ],
    answer: 1,
    why: "Миоглобинде бір байланыстыру орны бар, кооперативтілік байқалмайды."
  },
  {
    q: "Mb молекуласының құрамында неше гем бар?",
    options: ["4", "2", "1", "3"],
    answer: 2,
    why: "Миоглобин бір полипептид тізбегі мен бір гем тобынан тұрады."
  },
  {
    q: "Қай пікір ғылыми тұрғыдан дұрыс?",
    options: [
      "Mb оттегіні қанмен тасымалдайды",
      "Hb бұлшықетте O₂ қорын сақтайды",
      "Hb тасымалдайды, Mb сақтауға көмектеседі",
      "Екеуінде де Fe²⁺ жоқ"
    ],
    answer: 2,
    why: "Гемоглобин эритроцитте тасымалдайды, миоглобин бұлшықетте сақтауға көмектеседі."
  },
  {
    q: "Миоглобин қай жерде негізінен кездеседі?",
    options: [
      "Қаңқа және жүрек бұлшықеттерінде",
      "Қан плазмасында",
      "Сүйек минералында",
      "Эритроциттің ішінде негізгі нәруыз ретінде"
    ],
    answer: 0,
    why: "Миоглобин бұлшықет жасушаларында кездеседі."
  },
  {
    q: "Hb қанығу қисығының S тәрізді болуы нені көрсетеді?",
    options: [
      "Оттегінің кооперативті байланысуын",
      "Гемоглобиннің бір тізбектен тұруын",
      "Темірдің болмауын",
      "O₂ байланысының қайтымсыздығын"
    ],
    answer: 0,
    why: "S тәрізді қисық Hb субъбірліктерінің кооперативтілігін көрсетеді."
  },
  {
    q: "Миоглобин қай парциалдық қысымда жоғары қанығуға ертерек жетеді?",
    options: [
      "Гемоглобинмен салыстырғанда төменірек қысымда",
      "Тек шексіз жоғары қысымда",
      "Ешбір қысымда қанықпайды",
      "Тек CO₂ қысымында"
    ],
    answer: 0,
    why: "Миоглобин O₂-ге жоғары жақындық көрсетеді."
  },
  {
    q: "Гемоглобиндегі оң кооперативтілік кезінде не болады?",
    options: [
      "O₂ байланысқан сайын басқа орындардың жақындығы артады",
      "Әр субъбірлік жойылады",
      "Гем саны нөлге түседі",
      "O₂ байланыспайды"
    ],
    answer: 0,
    why: "Бір O₂ байланысуы басқа орындардың жақындығын арттырады."
  },
  {
    q: "Белсенді ұлпада рН төмендеуі Hb-ға қалай әсер етеді?",
    options: [
      "O₂ босатуды жеңілдетеді",
      "Hb-ны миоглобинге айналдырады",
      "Барлық гемді жояды",
      "O₂-ні біржола байланыстырады"
    ],
    answer: 0,
    why: "Бор әсері арқылы гемоглобиннің O₂-ге жақындығы азаяды."
  },
  {
    q: "Оттегі өкпе альвеоласынан қанға қалай өтеді?",
    options: [
      "Митоз арқылы",
      "Диффузия арқылы",
      "Фотосинтез арқылы",
      "Транскрипция арқылы"
    ],
    answer: 1,
    why: "O₂ парциалдық қысым айырмашылығы бойынша диффузияланады."
  },
  {
    q: "Жетілген адам эритроцитінің ерекшелігі қандай?",
    options: [
      "Ядросы болмайды",
      "Хлоропласттары болады",
      "Төрт ядросы бар",
      "ДНҚ-ны белсенді көбейтеді"
    ],
    answer: 0,
    why: "Жетілген эритроциттер ядросыз, газ тасымалына бейімделген."
  },
  {
    q: "O₂ жеткізудегі Hb мен Mb байланысын қай пікір дұрыс түсіндіреді?",
    options: [
      "Hb қанмен жеткізеді, Mb бұлшықет ішінде көмектеседі",
      "Екеуі де тек өкпеде болады",
      "Mb эритроцитте, Hb бұлшықетте болады",
      "Екеуі де тек CO₂ байланыстырады"
    ],
    answer: 0,
    why: "Олардың орналасуы мен қызметтері бір-бірін толықтырады."
  },
  {
    q: "Молекулалардың оттегі сыйымдылығы қандай қатынаста?",
    options: [
      "Бір Hb — 1 O₂, бір Mb — 4 O₂",
      "Екеуі де 4 O₂",
      "Бір Hb — 4 O₂, бір Mb — 1 O₂",
      "Екеуі де O₂ байланыстырмайды"
    ],
    answer: 2,
    why: "Hb-да төрт гем, Mb-да бір гем болады."
  }
];

// ========================================
// 10. КЕЗДЕЙСОҚ ЖЕКЕ ТЕСТ
// ========================================

function quizRemaining() {
  return presentStudents().filter(
    s => !has(state.quiz, s.id)
  );
}

function pickQuiz() {
  if (
    state.quizSelected !== null &&
    !has(state.quiz, state.quizSelected) &&
    presentStudents().some(
      s => s.id === state.quizSelected
    )
  ) {
    $("quizFeedback").textContent =
      "Алдымен таңдалған оқушының тестін аяқта.";
    return;
  }

  const pool = quizRemaining();

  if (!pool.length) {
    state.quizSelected = null;
    renderQuiz();
    return;
  }

  state.quizSelected = randomStudent(pool).id;
  save();
  renderQuiz();
}

function renderQuiz() {
  const active = presentStudents();
  const remaining = quizRemaining();
  const completed = active.length - remaining.length;

  $("quizProgressText").textContent =
    `${completed} / ${active.length} тапсырды`;

  const id = state.quizSelected;
  const student = active.find(s => s.id === id);
  const selected = Boolean(student);
  const done = selected && has(state.quiz, id);

  $("quizPick").disabled =
    !active.length ||
    (selected && !done) ||
    remaining.length === 0;

  $("quizPick").textContent =
    remaining.length === 0
      ? "✅ Барлығы аяқталды"
      : "🎲 Рандом таңдау";

  $("quizCheck").disabled = !selected || done;

  if (!selected) {
    $("quizStudent").textContent =
      active.length
        ? "🎲 Оқушыны рандом таңдау"
        : "Қатысушылар жоқ";

    $("quizQuestion").textContent =
      "Рандом таңдау батырмасын бас.";

    $("quizOptions").innerHTML = "";

    $("quizFeedback").textContent =
      active.length
        ? `${remaining.length} оқушының тесті қалды.`
        : "Алдымен қатысушыларды белгіле.";
  } else {
    const question = QUIZ[id];
    const result = state.quiz[id];

    $("quizStudent").textContent =
      "🧠 " + student.name;

    $("quizQuestion").textContent =
      question.q;

    $("quizOptions").innerHTML =
      question.options.map((option, i) => {
        const checked =
          done && result.selected === i;

        let css = "";

        if (done && i === question.answer) {
          css = "correct";
        } else if (done && checked) {
          css = "wrong";
        }

        return `
          <label class="choice ${css}">
            <input
              type="radio"
              name="quiz-answer"
              value="${i}"
              ${checked ? "checked" : ""}
              ${done ? "disabled" : ""}
            >

            <span>
              ${String.fromCharCode(65 + i)}.
              ${html(option)}
            </span>
          </label>
        `;
      }).join("");

    if (done) {
      $("quizFeedback").textContent =
        (result.correct
          ? "✅ Дұрыс! +2 ұпай. "
          : "❌ Қате. ") +
        question.why;
    } else {
      $("quizFeedback").textContent =
        "Жауапты таңдап, тексер.";
    }
  }

  $("quizResults").innerHTML =
    active.map(s => {
      const finished = has(state.quiz, s.id);

      return `
        <div class="progress-person">
          <span>${html(s.name)}</span>
          <b>
            ${finished
              ? state.quiz[s.id].points + " / 2"
              : "Кезекте"}
          </b>
        </div>
      `;
    }).join("");
}

$("quizPick").addEventListener("click", pickQuiz);

$("quizCheck").addEventListener("click", () => {
  const id = state.quizSelected;

  if (id === null || has(state.quiz, id)) return;

  if (!presentStudents().some(s => s.id === id)) {
    return;
  }

  const selected = document.querySelector(
    'input[name="quiz-answer"]:checked'
  );

  if (!selected) {
    $("quizFeedback").textContent =
      "Алдымен жауапты таңда.";
    return;
  }

  const answer = Number(selected.value);
  const correct = answer === QUIZ[id].answer;

  state.quiz[id] = {
    selected: answer,
    correct,
    points: correct ? 2 : 0
  };

  save();
  renderQuiz();
  renderScores();
});

// ========================================
// 11. 1-ОЙЫН: ЖАҒДАЯТТЫҚ БАТЛ
// ========================================

const BATTLE = [
  {
    q: "Ұлпада CO₂ мөлшері көбейіп, рН төмендеді. Гемоглобинге қандай әсер күтіледі?",
    options: [
      "O₂ босатуы жеңілдейді",
      "O₂-ні біржола ұстайды",
      "Төрт гемі жоғалады",
      "Миоглобинге айналады"
    ],
    answer: 0,
    why: "Бұл — Бор әсері. Hb-ның O₂-ге жақындығы төмендейді."
  },
  {
    q: "Миоглобиннің O₂-ге жақындығы Hb-дан жоғары. Бұл қандай қызметке қолайлы?",
    options: [
      "Қан арқылы үлкен қашықтыққа тасымалдауға",
      "Бұлшықеттегі O₂ қорын сақтауға",
      "Қан ұюына",
      "Ас қорытуға"
    ],
    answer: 1,
    why: "Миоглобин бұлшықет жасушасында O₂ қорын сақтауға көмектеседі."
  },
  {
    q: "Егер Hb төрт тізбегінің өзара әсері болмаса, қандай қасиет әлсірер еді?",
    options: [
      "Кооперативті байланысу",
      "Темірдің химиялық элемент болуы",
      "Қанның сұйық болуы",
      "O₂ молекуласының құрылысы"
    ],
    answer: 0,
    why: "Кооперативтілік субъбірліктердің өзара әсеріне тәуелді."
  },
  {
    q: "Өкпе мен ұлпада O₂ парциалдық қысымы әртүрлі. Бұл қандай құбылысты қамтамасыз етеді?",
    options: [
      "O₂-нің бір бағытта мәңгі бекітілуін",
      "Hb-ның O₂ қабылдап және босатуын",
      "Гемнің жоғалуын",
      "Жасушалардың фотосинтезін"
    ],
    answer: 1,
    why: "Қысым айырмашылығы Hb-ның қайтымды O₂ байланысуын тиімді етеді."
  },
  {
    q: "Бір Mb молекуласы неге Hb сияқты төрт O₂ байланыстыра алмайды?",
    options: [
      "Өйткені оның гемі жоқ",
      "Өйткені оның бір ғана гем тобы бар",
      "Өйткені ол фермент емес",
      "Өйткені онда темір жоқ"
    ],
    answer: 1,
    why: "Миоглобинде бір гем және бір O₂ байланыстыру орны бар."
  },
  {
    q: "Hb қанығу қисығы жоғары O₂ қысымында жазықталады. Неге?",
    options: [
      "Оттегі байланысу орындары қанығуға жақындайды",
      "Гемоглобин бірден жойылады",
      "Қан ұйиды",
      "Миоглобин түзіледі"
    ],
    answer: 0,
    why: "Байланысу орындарының көбі толғанда қанығу өзгерісі азаяды."
  },
  {
    q: "Белсенді бұлшықет жасушасында O₂ сұранысы артты. Қай байланыс дұрыс?",
    options: [
      "Hb жеткізеді, Mb жергілікті сақтауға көмектеседі",
      "Mb өкпеден қанмен тасымалдайды",
      "Hb тек жасуша ядросында",
      "Екеуі O₂ байланыстырмайды"
    ],
    answer: 0,
    why: "Hb O₂-ні қанмен тасымалдайды, Mb бұлшықет ішінде байланыстырады."
  },
  {
    q: "Hb молекуласының бір бөлігінде O₂ байланысқанда қалған бөліктердің жақындығы артады. Бұл не?",
    options: [
      "Диффузия",
      "Кооперативтілік",
      "Осмос",
      "Денатурация"
    ],
    answer: 1,
    why: "Бұл гемоглобиндегі оң кооперативтіліктің сипаты."
  },
  {
    q: "Екі нәруыздың да O₂ байланыстыруына ортақ қандай құрылым қатысады?",
    options: [
      "ДНҚ",
      "Хлоропласт",
      "Fe²⁺ бар гем тобы",
      "Ядро"
    ],
    answer: 2,
    why: "Екі нәруыздың да құрамында темірі бар гем тобы болады."
  }
];

function battleTeam(index) {
  if (!teamCount()) return -1;
  return index % teamCount();
}

function renderBattle() {
  const index = Math.max(
    0,
    Math.min(BATTLE.length - 1, state.battleIndex)
  );

  state.battleIndex = index;

  const question = BATTLE[index];
  const team = battleTeam(index);
  const done = has(state.quick, index);
  const result = state.quick[index];

  $("battleNumber").textContent =
    `Жағдаят ${index + 1} / ${BATTLE.length}`;

  $("battleTeam").textContent =
    team < 0 ? "Команда жоқ" : TEAMS[team];

  $("battleQuestion").textContent = question.q;

  $("battleBar").style.width =
    `${(index + 1) / BATTLE.length * 100}%`;

  $("battleOptions").innerHTML =
    question.options.map((option, i) => {
      const checked =
        done && result.selected === i;

      const css = done
        ? i === question.answer
          ? "correct"
          : checked ? "wrong" : ""
        : "";

      return `
        <label class="choice ${css}">
          <input type="radio"
                 name="battle-answer"
                 value="${i}"
                 ${checked ? "checked" : ""}
                 ${done ? "disabled" : ""}>
          <span>
            ${String.fromCharCode(65 + i)}.
            ${html(option)}
          </span>
        </label>
      `;
    }).join("");

  $("battleCheck").disabled =
    done || teamCount() === 0;

  $("battleNext").textContent =
    index === BATTLE.length - 1
      ? "2-ойынға өту →"
      : "Келесі жағдаят →";

  $("battleFeedback").textContent =
    done
      ? (result.correct
        ? "✅ Дұрыс! +3 ұпай. "
        : "❌ Қате. ") + question.why
      : teamCount()
        ? "Командамен ақылдасып, жауап таңдаңдар."
        : "Алдымен қатысушыларды тіркеңдер.";
}

$("battleCheck").addEventListener("click", () => {
  const index = state.battleIndex;

  if (!teamCount() || has(state.quick, index)) {
    return;
  }

  const selected = document.querySelector(
    'input[name="battle-answer"]:checked'
  );

  if (!selected) {
    $("battleFeedback").textContent =
      "Алдымен жауап таңдаңдар.";
    return;
  }

  const answer = Number(selected.value);
  const correct = answer === BATTLE[index].answer;

  state.quick[index] = {
    selected: answer,
    correct,
    points: correct ? 3 : 0
  };

  save();
  renderBattle();
  renderScores();
});

$("battleNext").addEventListener("click", () => {
  if (state.battleIndex >= BATTLE.length - 1) {
    goTo(11);
    return;
  }

  state.battleIndex++;
  save();
  renderBattle();
});

// ========================================
// 12. 2-ОЙЫН: ҚАТЕ ТҰЖЫРЫМ
// ========================================

const LOGIC = [
  [
    {
      text: "Гемоглобиннің төрт субъбірлігі O₂ байланысу кезіндегі кооперативтілікке мүмкіндік береді.",
      correct: true,
      why: "Төрт субъбірлік арасындағы өзара әсер кооперативтіліктің негізі."
    },
    {
      text: "Әр гем тобы толық қаныққанда төрт O₂ байланыстырады.",
      correct: false,
      why: "Әр гем бір O₂ байланыстырады; тұтас Hb төрт O₂ байланыстырады."
    },
    {
      text: "Гемоглобиннің O₂-мен байланысуы қайтымды.",
      correct: true,
      why: "Бұл O₂ қабылдау мен босатуға мүмкіндік береді."
    },
    {
      text: "Эритроцит пен гемоглобин — екеуі де жеке жасушалар.",
      correct: false,
      why: "Эритроцит — жасуша, гемоглобин — нәруыз."
    }
  ],
  [
    {
      text: "Миоглобин бір полипептидтік тізбектен тұрады.",
      correct: true,
      why: "Миоглобин — бір тізбекті нәруыз."
    },
    {
      text: "Миоглобиннің оттегіге жақындығы гемоглобиннен төмен.",
      correct: false,
      why: "Миоглобиннің O₂-ге жақындығы жоғары."
    },
    {
      text: "Миоглобин қаңқа және жүрек бұлшықеттерінде кездеседі.",
      correct: true,
      why: "Бұл оның негізгі орналасу аймағы."
    },
    {
      text: "Миоглобиннің қанығу қисығы Hb сияқты кооперативті S пішінді.",
      correct: false,
      why: "Миоглобиннің қисығы гиперболалық."
    }
  ],
  [
    {
      text: "Ұлпалардағы O₂ қысымының төмен болуы Hb-дан O₂ босауына ықпал етеді.",
      correct: true,
      why: "Қысым айырмашылығы O₂ босату үшін маңызды."
    },
    {
      text: "рН төмендегенде Hb-ның O₂-ге жақындығы әрқашан артады.",
      correct: false,
      why: "Бор әсері бойынша рН төмендеуі O₂ жақындығын азайтады."
    },
    {
      text: "Оттегі альвеоладан қанға диффузия арқылы өте алады.",
      correct: true,
      why: "Газ парциалдық қысым айырмашылығы бойынша таралады."
    },
    {
      text: "Гемоглобин мен миоглобиннің екеуінде де гем тобы бар.",
      correct: true,
      why: "Екі нәруыз да гем арқылы O₂ байланыстырады."
    }
  ]
];

function renderLogic() {
  if (!teamCount()) {
    $("logicArea").innerHTML =
      '<div class="card">Алдымен оқушыларды белгілеңдер.</div>';
    return;
  }

  $("logicArea").innerHTML =
    LOGIC.slice(0, teamCount())
      .map((items, team) => {
        const saved = state.logic[team];
        const done = Boolean(saved);

        const statements = items.map((item, i) => {
          const selected = done
            ? String(saved.answers[i])
            : "";

          return `
            <div class="statement">
              <p>
                <b>${i + 1}.</b>
                ${html(item.text)}
              </p>

              <select
                data-logic="${team}-${i}"
                ${done ? "disabled" : ""}>

                <option value="">Таңдау</option>

                <option value="true"
                  ${selected === "true"
                    ? "selected" : ""}>
                  ✅ Дұрыс
                </option>

                <option value="false"
                  ${selected === "false"
                    ? "selected" : ""}>
                  ❌ Қате
                </option>
              </select>
            </div>
          `;
        }).join("");

        let explanation = "";

        if (done) {
          explanation = items.map((item, i) => `
            <p>
              ${i + 1}.
              <b>
                ${saved.answers[i] === item.correct
                  ? "✅"
                  : "❌"}
              </b>
              ${html(item.why)}
            </p>
          `).join("");
        }

        return `
          <div class="logic-panel">
            <h3>${TEAMS[team]}</h3>

            <p>
              Төрт тұжырымды талдаңдар.
              Әр дұрыс шешім +1 ұпай.
            </p>

            ${statements}

            <button class="btn primary"
                    data-logic-check="${team}"
                    ${done ? "disabled" : ""}>
              🧩 Жауаптарды тексеру
            </button>

            <p class="feedback"
               id="logicFeedback-${team}">
              ${done
                ? `Нәтиже: ${saved.points} / 4 ұпай.`
                : ""}
            </p>

            ${done
              ? `<div class="answer-panel">
                   ${explanation}
                 </div>`
              : ""}
          </div>
        `;
      }).join("");

  document.querySelectorAll("[data-logic-check]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const team = Number(btn.dataset.logicCheck);
        const items = LOGIC[team];

        const fields = items.map((item, i) =>
          document.querySelector(
            `[data-logic="${team}-${i}"]`
          )
        );

        if (fields.some(field => field.value === "")) {
          $("logicFeedback-" + team).textContent =
            "Барлық төрт жауапты таңдаңдар.";
          return;
        }

        const answers = fields.map(
          field => field.value === "true"
        );

        const points = answers.reduce(
          (sum, answer, i) =>
            sum + Number(answer === items[i].correct),
          0
        );

        state.logic[team] = { answers, points };

        save();
        renderLogic();
        renderScores();
      });
    });
}

// ========================================
// 13. 3-ОЙЫН: ҒЫЛЫМИ ДӘЛЕЛДЕУ
// ========================================

const CREATIVE = [
  {
    title: "🔬 Молекуланың сырын аш",
    task: "Гемоглобиннің төрт субъбірлігін және төрт гем тобын шартты түрде сыз. O₂ байланыстыру орындарын белгіле. Неліктен Hb кооперативті қасиет көрсете алатынын ғылыми дәлелде.",
    rubric: "2 ұпай — сызба; 2 ұпай — ғылыми негіздеме; 1 ұпай — қорғау."
  },
  {
    title: "💪 Миоглобиннің артықшылығы",
    task: "Hb мен Mb-ның қанығу қисықтарын дәптерге сыз. Миоглобин неге төмен O₂ қысымында көбірек қанығатынын және оның бұлшықет үшін маңызын түсіндір.",
    rubric: "2 ұпай — график; 2 ұпай — түсіндіру; 1 ұпай — қорытынды."
  },
  {
    title: "🫁 Физиологиялық жағдайды талда",
    task: "Белсенді бұлшықетте O₂ азайып, CO₂ көбейді. Өкпе → қан → бұлшықет бағытын сыз. Hb мен Mb рөлін және Бор әсерінің маңызын дәлелде.",
    rubric: "2 ұпай — схема; 2 ұпай — механизм; 1 ұпай — ғылыми дәлел."
  }
];

function renderCreative() {
  if (!teamCount()) {
    $("creativeArea").innerHTML =
      '<div class="card">Алдымен оқушыларды белгілеңдер.</div>';
    return;
  }

  $("creativeArea").innerHTML =
    CREATIVE.slice(0, teamCount())
      .map((item, team) => {
        const score = has(state.creative, team)
          ? state.creative[team]
          : null;

        return `
          <div class="creative-panel">
            <h3>${TEAMS[team]}</h3>
            <h3>${html(item.title)}</h3>

            <p>${html(item.task)}</p>

            <p>
              <b>Бағалау:</b>
              ${html(item.rubric)}
            </p>

            <label for="creative-${team}">
              0–5 ұпай
            </label>

            <select id="creative-${team}">
              <option value="">Баға таңда</option>

              ${[0, 1, 2, 3, 4, 5].map(n => `
                <option value="${n}"
                  ${score === n ? "selected" : ""}>
                  ${n} ұпай
                </option>
              `).join("")}
            </select>

            <button class="btn success"
                    data-creative-save="${team}">
              🏅 Ұпайды сақтау
            </button>

            <p class="feedback"
               id="creativeFeedback-${team}">
              ${score === null
                ? "Әлі бағаланған жоқ."
                : score + " / 5 ұпай сақталды."}
            </p>
          </div>
        `;
      }).join("");

  document.querySelectorAll("[data-creative-save]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const team = Number(
          btn.dataset.creativeSave
        );

        const value = $("creative-" + team).value;

        if (value === "") {
          $("creativeFeedback-" + team).textContent =
            "Бағалау ұпайын таңда.";
          return;
        }

        state.creative[team] = Number(value);

        save();
        renderCreative();
        renderScores();
      });
    });
}

// ========================================
// 14. ҰПАЙЛАРДЫ ЕСЕПТЕУ
// ========================================

function personalPoints(id) {
  let score = 0;

  if (has(state.oral, id)) {
    score += state.oral[id];
  }

  if (has(state.quiz, id)) {
    score += state.quiz[id].points;
  }

  return score;
}

function teamPoints(team) {
  let score = 0;

  // Команда мүшелерінің жеке бағалары
  teamMembers(team).forEach(student => {
    score += personalPoints(student.id);
  });

  // 1-ойын
  BATTLE.forEach((item, index) => {
    if (
      battleTeam(index) === team &&
      has(state.quick, index)
    ) {
      score += state.quick[index].points;
    }
  });

  // 2-ойын
  if (has(state.logic, team)) {
    score += state.logic[team].points;
  }

  // 3-ойын
  if (has(state.creative, team)) {
    score += state.creative[team];
  }

  return score;
}

function scoreCards() {
  return TEAMS.slice(0, teamCount())
    .map((name, team) => `
      <div class="team-card">
        <h3>${name}</h3>

        <div class="team-score">
          ${teamPoints(team)}
        </div>

        <p>
          ${teamMembers(team).length} оқушы
        </p>
      </div>
    `).join("");
}

function renderScores() {
  const cards = scoreCards();

  $("game1Scores").innerHTML = cards;
  $("game2Scores").innerHTML = cards;
  $("game3Scores").innerHTML = cards;
  $("finalScores").innerHTML = cards;

  $("sidebarScores").innerHTML =
    TEAMS.slice(0, teamCount())
      .map((name, team) => `
        <div class="mini-score">
          <span>${name}</span>
          <b>${teamPoints(team)}</b>
        </div>
      `).join("");

  renderFinal();
}

// ========================================
// 15. СОҢҒЫ ҚОРЫТЫНДЫ
// ========================================

function renderFinal() {
  const active = presentStudents();

  if (!active.length) {
    $("winner").textContent =
      "Қатысушылар белгіленген жоқ.";

    $("studentResults").innerHTML = "";
    return;
  }

  const scores = Array.from(
    { length: teamCount() },
    (_, i) => teamPoints(i)
  );

  const maximum = Math.max(...scores);

  const winners = scores
    .map((score, index) => ({ score, index }))
    .filter(item => item.score === maximum);

  const assessed =
    active.some(s =>
      has(state.oral, s.id) ||
      has(state.quiz, s.id)
    ) ||
    Object.keys(state.quick).length > 0 ||
    Object.keys(state.logic).length > 0 ||
    Object.keys(state.creative).length > 0;

  if (!assessed) {
    $("winner").textContent =
      "Нәтижелер ойындардан кейін көрсетіледі.";
  } else if (winners.length === 1) {
    $("winner").innerHTML =
      "🏆 ЖЕҢІМПАЗ КОМАНДА<br>" +
      TEAMS[winners[0].index] +
      "<br>" +
      maximum + " ұпай";
  } else {
    $("winner").innerHTML =
      "🤝 ҰПАЙЛАР ТЕҢ<br>" +
      winners.map(item =>
        TEAMS[item.index]
      ).join(" және ") +
      "<br>" +
      maximum + " ұпай";
  }

  $("studentResults").innerHTML =
    active.map(s => {
      const oral = has(state.oral, s.id)
        ? state.oral[s.id]
        : "—";

      const quiz = has(state.quiz, s.id)
        ? state.quiz[s.id].points
        : "—";

      return `
        <tr>
          <td>${html(s.name)}</td>
          <td>${TEAMS[studentTeam(s.id)]}</td>
          <td>${oral}</td>
          <td>${quiz}</td>
          <td>
            <b>${personalPoints(s.id)}</b>
          </td>
        </tr>
      `;
    }).join("");
}

// ========================================
// 16. ГРАФИК
// ========================================

function drawOxygenChart() {
  const svg = $("oxygenChart");

  const left = 72;
  const right = 624;
  const top = 28;
  const bottom = 316;

  const x = p =>
    left + p / 100 * (right - left);

  const y = saturation =>
    bottom - saturation / 100 * (bottom - top);

  // Гемоглобиннің жуық Hill моделі
  function hb(p) {
    if (p <= 0) return 0;

    const p50 = 26;
    const n = 2.8;

    return 100 * Math.pow(p, n) /
      (Math.pow(p50, n) + Math.pow(p, n));
  }

  // Миоглобиннің жуық моделі
  function mb(p) {
    if (p <= 0) return 0;

    return 100 * p / (2.8 + p);
  }

  function curve(fn) {
    let path = "";

    for (let p = 0; p <= 100; p += 0.5) {
      path += (p === 0 ? "M" : "L") +
        x(p).toFixed(2) + " " +
        y(fn(p)).toFixed(2) + " ";
    }

    return path;
  }

  let grid = "";

  for (let value = 0; value <= 100; value += 20) {
    grid += `
      <line x1="${left}"
            y1="${y(value)}"
            x2="${right}"
            y2="${y(value)}"
            stroke="#354b68" />

      <text x="${left - 13}"
            y="${y(value) + 5}"
            fill="#bdcce3"
            font-size="14"
            text-anchor="end">
        ${value}
      </text>

      <line x1="${x(value)}"
            y1="${top}"
            x2="${x(value)}"
            y2="${bottom}"
            stroke="#263c59" />

      <text x="${x(value)}"
            y="${bottom + 24}"
            fill="#bdcce3"
            font-size="14"
            text-anchor="middle">
        ${value}
      </text>
    `;
  }

  svg.innerHTML = `
    ${grid}

    <path d="${curve(hb)}"
          fill="none"
          stroke="#ff6c89"
          stroke-width="5"
          stroke-linecap="round" />

    <path d="${curve(mb)}"
          fill="none"
          stroke="#b194ff"
          stroke-width="5"
          stroke-linecap="round" />

    <text x="72" y="17"
          fill="#e7f1ff"
          font-size="14">
      Қанығу (%)
    </text>

    <text x="220" y="370"
          fill="#e7f1ff"
          font-size="14">
      O₂ парциалдық қысымы (мм сын.бағ.)
    </text>

    <text x="424" y="156"
          fill="#ff96ae"
          font-size="16"
          font-weight="bold">
      Гемоглобин
    </text>

    <text x="420" y="60"
          fill="#cab2ff"
          font-size="16"
          font-weight="bold">
      Миоглобин
    </text>
  `;
}

// ========================================
// 17. КОНСПЕКТІНІ КӨШІРУ
// ========================================

$("copyNotes").addEventListener(
  "click",
  async () => {
    const text = $("notesContent").innerText;

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(text);
      } else {
        const temporary =
          document.createElement("textarea");

        temporary.value = text;
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";

        document.body.appendChild(temporary);
        temporary.select();

        const copied =
          document.execCommand("copy");

        temporary.remove();

        if (!copied) throw new Error("Copy failed");
      }

      alert("✅ Конспект көшірілді!");
    } catch (error) {
      alert(
        "Автоматты көшіру мүмкін болмады. " +
        "Конспектіні қолмен белгілеп көшір."
      );
    }
  }
);

// ========================================
// 18. ЖАҢА САБАҚ
// ========================================

$("resetLesson").addEventListener("click", () => {
  const confirmed = confirm(
    "Жаңа сабақ бастаймыз ба? " +
    "Бұрынғы бағалар мен қатысу белгілері тазаланады."
  );

  if (!confirmed) return;

  state = initialState();

  save();
  stopVideo();
  goTo(0);
  updateClock();
});

// ========================================
// 19. БАРЛЫҚ ИНТЕРФЕЙСТІ ЖАҢАРТУ
// ========================================

function refresh() {
  renderAttendance();
  renderTeamRoster();

  renderOral();
  renderQuiz();

  renderBattle();
  renderLogic();
  renderCreative();

  renderScores();
  updateClock();
}

// ========================================
// 20. САЙТТЫ ІСКЕ ҚОСУ
// ========================================

function initialize() {
  drawOxygenChart();

  const page = Math.max(
    0,
    Math.min(
      TOTAL_PAGES - 1,
      Number(state.page) || 0
    )
  );

  goTo(page);
}

initialize();
