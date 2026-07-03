const STORAGE_KEY = "jin-tian-ming-tian-prototype";

const defaultTasks = [
  { id: crypto.randomUUID(), title: "整理今天要收尾的三件事", bucket: "today", done: false },
  { id: crypto.randomUUID(), title: "给明天留一个清晰开头", bucket: "today", done: false },
  { id: crypto.randomUUID(), title: "确认桌面小光团的第一版状态", bucket: "tomorrow", done: false }
];

const state = {
  tasks: loadTasks(),
  noteTimer: null
};

const els = {
  dateLabel: document.querySelector("#dateLabel"),
  quickAdd: document.querySelector("#quickAdd"),
  taskInput: document.querySelector("#taskInput"),
  todayList: document.querySelector("#todayList"),
  tomorrowList: document.querySelector("#tomorrowList"),
  todayCount: document.querySelector("#todayCount"),
  tomorrowCount: document.querySelector("#tomorrowCount"),
  pet: document.querySelector("#pet"),
  petNote: document.querySelector("#petNote"),
  taskPanel: document.querySelector("#taskPanel"),
  togglePanel: document.querySelector("#togglePanel"),
  reviewDay: document.querySelector("#reviewDay"),
  reviewDialog: document.querySelector("#reviewDialog"),
  reviewCopy: document.querySelector("#reviewCopy"),
  moveAll: document.querySelector("#moveAll")
};

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : defaultTasks;
  } catch {
    return defaultTasks;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function formatDate() {
  const date = new Date();
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function taskCounts(bucket) {
  const tasks = state.tasks.filter((task) => task.bucket === bucket);
  return {
    total: tasks.length,
    open: tasks.filter((task) => !task.done).length
  };
}

function render() {
  els.dateLabel.textContent = formatDate();
  renderList("today", els.todayList);
  renderList("tomorrow", els.tomorrowList);

  const today = taskCounts("today");
  const tomorrow = taskCounts("tomorrow");
  els.todayCount.textContent = today.open;
  els.tomorrowCount.textContent = tomorrow.open;

  updatePetMood(today.open);
  saveTasks();
}

function renderList(bucket, listEl) {
  const tasks = state.tasks.filter((task) => task.bucket === bucket);
  listEl.replaceChildren();

  if (!tasks.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = bucket === "today" ? "今天很轻" : "明天很清楚";
    listEl.append(empty);
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " is-done" : ""}`;

    const check = document.createElement("button");
    check.className = `check-button${task.done ? " is-done" : ""}`;
    check.type = "button";
    check.setAttribute("aria-label", task.done ? "标记未完成" : "完成任务");
    check.textContent = task.done ? "✓" : "";
    check.addEventListener("click", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const move = document.createElement("button");
    move.className = "move-button";
    move.type = "button";
    move.setAttribute("aria-label", bucket === "today" ? "移到明天" : "移到今天");
    move.textContent = bucket === "today" ? "→" : "←";
    move.addEventListener("click", () => moveTask(task.id));

    item.append(check, title, move);
    listEl.append(item);
  });
}

function addTask(title, bucket) {
  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    bucket,
    done: false
  });
  render();
  showPetNote(bucket === "today" ? "放进今天了。" : "明天会接住它。");
}

function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  task.done = !task.done;
  render();
  showPetNote(task.done ? "完成得很安静。" : "重新放回视线里。");
}

function moveTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  task.bucket = task.bucket === "today" ? "tomorrow" : "today";
  task.done = false;
  render();
  showPetNote(task.bucket === "tomorrow" ? "交给明天。" : "今天继续。");
}

function updatePetMood(openToday) {
  const mood = openToday === 0 ? "bright" : openToday >= 5 ? "heavy" : "calm";
  els.pet.dataset.mood = mood;
}

function showPetNote(message) {
  clearTimeout(state.noteTimer);
  els.petNote.textContent = message;
  els.petNote.classList.add("is-visible");
  state.noteTimer = setTimeout(() => {
    els.petNote.classList.remove("is-visible");
  }, 1900);
}

function openReview() {
  const openToday = state.tasks.filter((task) => task.bucket === "today" && !task.done);

  if (!openToday.length) {
    showPetNote("今天已经很完整。");
    return;
  }

  els.reviewCopy.textContent = `${openToday.length} 件事还在今天。可以先放着，也可以轻轻移到明天。`;
  els.reviewDialog.showModal();
}

function moveOpenTodayToTomorrow() {
  state.tasks.forEach((task) => {
    if (task.bucket === "today" && !task.done) {
      task.bucket = "tomorrow";
    }
  });
  render();
  showPetNote("明天已经接住了。");
}

els.quickAdd.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = els.taskInput.value.trim();
  const data = new FormData(els.quickAdd);
  const bucket = data.get("bucket") === "tomorrow" ? "tomorrow" : "today";

  if (!title) {
    showPetNote("先写下一件小事。");
    els.taskInput.focus();
    return;
  }

  addTask(title, bucket);
  els.taskInput.value = "";
  els.taskInput.focus();
});

els.pet.addEventListener("click", () => {
  els.taskPanel.classList.toggle("is-hidden");
  showPetNote(els.taskPanel.classList.contains("is-hidden") ? "我在角落。" : "我回来了。");
});

els.togglePanel.addEventListener("click", () => {
  els.taskPanel.classList.toggle("is-hidden");
});

els.reviewDay.addEventListener("click", openReview);

els.moveAll.addEventListener("click", () => {
  moveOpenTodayToTomorrow();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && els.reviewDialog.open) {
    els.reviewDialog.close();
  }
});

render();
