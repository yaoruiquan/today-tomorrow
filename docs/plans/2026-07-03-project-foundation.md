# Project Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前静态原型整理成可继续开发的完整 Mac 桌宠应用工程骨架。

**Architecture:** 保留现有静态原型作为视觉基准，正式应用迁移到 Tauri + React + TypeScript。业务规则放在前端可测试 TypeScript 模块，Tauri/Rust 层只负责窗口、系统能力和持久化文件路径。

**Tech Stack:** Tauri, React, TypeScript, Vite, Vitest, Playwright, pnpm.

---

## Context

当前仓库只有静态原型文件：

- `index.html`
- `app.js`
- `styles.css`
- `docs/product-spec.md`
- `output/playwright/prototype-desktop-v2.png`
- `output/playwright/prototype-mobile-v2.png`

目标目录和长期开发规则见 `docs/development-guide.md`。

## Acceptance Criteria

- 静态原型被保留在 `prototype/static-web/`。
- 正式应用拥有清晰的 `src/`、`src-tauri/`、`tests/`、`scripts/`、`docs/` 目录。
- 核心任务逻辑先有单元测试，再迁移实现。
- 桌宠、任务、下班整理、日夜循环分别有模块边界。
- Tauri shell 采用 `pet` / `panel` 桌宠窗口模型，不以普通大主窗口作为 MVP 形态。
- 开发命令、测试命令和打包命令写入 `package.json`。
- README 说明如何启动 Web 原型和 Tauri 应用。

## Task 1: Preserve Current Static Prototype

**Files:**

- Create: `prototype/static-web/index.html`
- Create: `prototype/static-web/app.js`
- Create: `prototype/static-web/styles.css`
- Create: `prototype/static-web/output/playwright/prototype-desktop-v2.png`
- Create: `prototype/static-web/output/playwright/prototype-mobile-v2.png`
- Modify: `README.md`

**Step 1: Move current prototype files**

Run:

```bash
mkdir -p prototype/static-web/output/playwright
mv index.html prototype/static-web/index.html
mv app.js prototype/static-web/app.js
mv styles.css prototype/static-web/styles.css
mv output/playwright/*.png prototype/static-web/output/playwright/
```

Expected: root no longer contains static prototype files, but prototype can still be opened from `prototype/static-web/index.html`.

**Step 2: Create root README**

Create `README.md`:

```markdown
# 今天明天

今天明天是一只住在 Mac 桌面上的极简治愈系桌宠，帮助用户记录今天和明天的事项，并在下班前温柔地整理未完成的事。

## Documents

- Product spec: `docs/product-spec.md`
- Development guide: `docs/development-guide.md`
- Project foundation plan: `docs/plans/2026-07-03-project-foundation.md`

## Prototype

The original static prototype lives in `prototype/static-web/`.

Open `prototype/static-web/index.html` in a browser to inspect the baseline design.
```

**Step 3: Verify prototype files**

Run:

```bash
test -f prototype/static-web/index.html
test -f prototype/static-web/app.js
test -f prototype/static-web/styles.css
test -f prototype/static-web/output/playwright/prototype-desktop-v2.png
test -f prototype/static-web/output/playwright/prototype-mobile-v2.png
```

Expected: all commands exit with status 0.

**Step 4: Commit**

```bash
git add README.md prototype docs
git commit -m "Preserve prototype before app migration

Constraint: Current static prototype remains the visual baseline.
Rejected: Rewrite from scratch immediately | would risk losing the product tone before tests exist.
Confidence: high
Scope-risk: narrow
Directive: Keep prototype snapshots available until the Tauri UI reaches parity.
Tested: Verified prototype files exist after move.
Not-tested: Browser rendering after move."
```

## Task 2: Scaffold Frontend App

**Files:**

- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/providers.tsx`
- Create: `src/app/window-router.tsx`
- Create: `src/app/views/pet-view.tsx`
- Create: `src/app/views/panel-view.tsx`
- Create: `src/shared/styles/tokens.css`
- Create: `src/shared/styles/base.css`
- Create: `src/test/setup.ts`

**Step 1: Initialize package metadata**

Create `package.json`:

```json
{
  "name": "today-tomorrow",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "check": "pnpm lint && pnpm typecheck && pnpm test"
  },
  "dependencies": {
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "playwright": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

**Step 2: Install dependencies**

Run:

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` is created.

**Step 3: Create Vite entry files**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>今天明天</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./shared/styles/tokens.css";
import "./shared/styles/base.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/app/App.tsx`:

```tsx
import { WindowRouter } from "./window-router";

export function App() {
  return <WindowRouter />;
}
```

Create `src/app/window-router.tsx`:

```tsx
import { PanelView } from "./views/panel-view";
import { PetView } from "./views/pet-view";

export function WindowRouter() {
  const params = new URLSearchParams(window.location.search);
  const windowType = params.get("window");

  if (windowType === "panel") {
    return <PanelView />;
  }

  return <PetView />;
}
```

Create `src/app/views/pet-view.tsx`:

```tsx
export function PetView() {
  return (
    <main className="pet-window" aria-label="小光团">
      <button type="button">小光团</button>
    </main>
  );
}
```

Create `src/app/views/panel-view.tsx`:

```tsx
export function PanelView() {
  return (
    <main className="panel-window" aria-label="今天明天任务面板">
      <p>今天 / 明天</p>
    </main>
  );
}
```

**Step 4: Verify**

Run:

```bash
pnpm typecheck
pnpm build
```

Expected: both commands pass.

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml index.html vite.config.ts tsconfig.json tsconfig.node.json eslint.config.js .prettierrc .gitignore src
git commit -m "Create typed frontend foundation

Constraint: Future app needs testable modules instead of static prototype scripts.
Rejected: Continue expanding app.js | would make desktop behavior difficult to test.
Confidence: high
Scope-risk: narrow
Directive: Keep UI migration incremental and compare against prototype screenshots.
Tested: pnpm typecheck; pnpm build.
Not-tested: Desktop shell not created yet."
```

## Task 3: Add Core Task Domain Tests

**Files:**

- Create: `src/features/tasks/task-types.ts`
- Create: `src/features/tasks/task-reducer.ts`
- Create: `src/features/tasks/task-selectors.ts`
- Create: `src/features/tasks/task-copy.ts`
- Create: `src/features/tasks/task-reducer.test.ts`

**Step 1: Write failing tests**

Create `src/features/tasks/task-reducer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { addTask, moveTask, toggleTaskDone } from "./task-reducer";
import { openTaskCount } from "./task-selectors";
import type { Task } from "./task-types";

const baseTask: Task = {
  id: "task-1",
  title: "整理今天",
  bucket: "today",
  status: "open",
  createdAt: "2026-07-03T10:00:00.000Z",
  updatedAt: "2026-07-03T10:00:00.000Z"
};

describe("task reducer", () => {
  it("adds a today task", () => {
    const tasks = addTask([], {
      id: "task-2",
      title: "写下一件事",
      bucket: "today",
      now: "2026-07-03T10:05:00.000Z"
    });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      id: "task-2",
      title: "写下一件事",
      bucket: "today",
      status: "open"
    });
  });

  it("marks a task done", () => {
    const tasks = toggleTaskDone([baseTask], "task-1", "2026-07-03T10:10:00.000Z");

    expect(tasks[0].status).toBe("done");
    expect(tasks[0].completedAt).toBe("2026-07-03T10:10:00.000Z");
  });

  it("moves an open today task to tomorrow", () => {
    const tasks = moveTask([baseTask], "task-1", "tomorrow", "2026-07-03T10:15:00.000Z");

    expect(tasks[0].bucket).toBe("tomorrow");
    expect(tasks[0].status).toBe("open");
  });

  it("counts only open tasks in a bucket", () => {
    const doneTask: Task = { ...baseTask, id: "task-2", status: "done" };

    expect(openTaskCount([baseTask, doneTask], "today")).toBe(1);
  });
});
```

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test src/features/tasks/task-reducer.test.ts
```

Expected: FAIL because task modules do not exist yet.

**Step 3: Implement minimal task modules**

Create `src/features/tasks/task-types.ts`:

```ts
export type TaskBucket = "today" | "tomorrow";
export type TaskStatus = "open" | "done" | "abandoned";

export interface Task {
  id: string;
  title: string;
  bucket: TaskBucket;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  carriedFromDate?: string;
}
```

Create `src/features/tasks/task-reducer.ts`:

```ts
import type { Task, TaskBucket } from "./task-types";

interface AddTaskInput {
  id: string;
  title: string;
  bucket: TaskBucket;
  now: string;
}

export function addTask(tasks: Task[], input: AddTaskInput): Task[] {
  return [
    {
      id: input.id,
      title: input.title,
      bucket: input.bucket,
      status: "open",
      createdAt: input.now,
      updatedAt: input.now
    },
    ...tasks
  ];
}

export function toggleTaskDone(tasks: Task[], id: string, now: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task;

    if (task.status === "done") {
      const { completedAt, ...nextTask } = task;
      return {
        ...nextTask,
        status: "open",
        updatedAt: now
      };
    }

    return {
      ...task,
      status: "done",
      completedAt: now,
      updatedAt: now
    };
  });
}

export function moveTask(tasks: Task[], id: string, bucket: TaskBucket, now: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task;

    return {
      ...task,
      bucket,
      status: "open",
      completedAt: undefined,
      abandonedAt: undefined,
      updatedAt: now
    };
  });
}
```

Create `src/features/tasks/task-selectors.ts`:

```ts
import type { Task, TaskBucket } from "./task-types";

export function tasksInBucket(tasks: Task[], bucket: TaskBucket): Task[] {
  return tasks.filter((task) => task.bucket === bucket && task.status !== "abandoned");
}

export function openTaskCount(tasks: Task[], bucket: TaskBucket): number {
  return tasks.filter((task) => task.bucket === bucket && task.status === "open").length;
}
```

Create `src/features/tasks/task-copy.ts`:

```ts
export const taskCopy = {
  emptyToday: "今天很轻",
  emptyTomorrow: "明天很清楚",
  addToday: "放进今天了。",
  addTomorrow: "明天会接住它。",
  done: "完成得很安静。",
  reopened: "重新放回视线里。",
  moveToTomorrow: "交给明天。",
  moveToToday: "今天继续。",
  emptyInput: "先写下一件小事。"
} as const;
```

**Step 4: Run tests to verify they pass**

Run:

```bash
pnpm test src/features/tasks/task-reducer.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/tasks
git commit -m "Define testable today tomorrow task rules

Constraint: MVP only supports today and tomorrow task buckets.
Rejected: Add priority, projects, tags, reminders | outside product spec for v1.
Confidence: high
Scope-risk: narrow
Directive: Keep task fields intentionally sparse until a user workflow requires more.
Tested: pnpm test src/features/tasks/task-reducer.test.ts.
Not-tested: UI integration not migrated yet."
```

## Task 4: Add Day Cycle Rollover Tests

**Files:**

- Create: `src/features/day-cycle/day-cycle-types.ts`
- Create: `src/features/day-cycle/day-rollover.ts`
- Create: `src/features/day-cycle/day-rollover.test.ts`

**Step 1: Write failing tests**

Create `src/features/day-cycle/day-rollover.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { rolloverTomorrowIntoToday } from "./day-rollover";
import type { Task } from "../tasks/task-types";

const tomorrowTask: Task = {
  id: "task-1",
  title: "明天接住",
  bucket: "tomorrow",
  status: "open",
  createdAt: "2026-07-03T10:00:00.000Z",
  updatedAt: "2026-07-03T10:00:00.000Z"
};

describe("day rollover", () => {
  it("moves open tomorrow tasks into today after the date changes", () => {
    const result = rolloverTomorrowIntoToday({
      tasks: [tomorrowTask],
      lastOpenedLocalDate: "2026-07-03",
      currentLocalDate: "2026-07-04",
      now: "2026-07-04T09:00:00.000Z"
    });

    expect(result.tasks[0]).toMatchObject({
      bucket: "today",
      carriedFromDate: "2026-07-03"
    });
    expect(result.changed).toBe(true);
  });

  it("does not roll over twice on the same local date", () => {
    const result = rolloverTomorrowIntoToday({
      tasks: [tomorrowTask],
      lastOpenedLocalDate: "2026-07-03",
      currentLocalDate: "2026-07-03",
      now: "2026-07-03T11:00:00.000Z"
    });

    expect(result.tasks[0].bucket).toBe("tomorrow");
    expect(result.changed).toBe(false);
  });
});
```

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test src/features/day-cycle/day-rollover.test.ts
```

Expected: FAIL because day-cycle modules do not exist yet.

**Step 3: Implement rollover**

Create `src/features/day-cycle/day-cycle-types.ts`:

```ts
export interface DayCycleState {
  lastOpenedLocalDate: string;
  lastRolloverAt?: string;
  lastEveningReviewDate?: string;
}
```

Create `src/features/day-cycle/day-rollover.ts`:

```ts
import type { Task } from "../tasks/task-types";

interface RolloverInput {
  tasks: Task[];
  lastOpenedLocalDate: string;
  currentLocalDate: string;
  now: string;
}

interface RolloverResult {
  tasks: Task[];
  changed: boolean;
}

export function rolloverTomorrowIntoToday(input: RolloverInput): RolloverResult {
  if (input.currentLocalDate === input.lastOpenedLocalDate) {
    return { tasks: input.tasks, changed: false };
  }

  return {
    changed: true,
    tasks: input.tasks.map((task) => {
      if (task.bucket !== "tomorrow" || task.status !== "open") {
        return task;
      }

      return {
        ...task,
        bucket: "today",
        carriedFromDate: input.lastOpenedLocalDate,
        updatedAt: input.now
      };
    })
  };
}
```

**Step 4: Run tests**

Run:

```bash
pnpm test src/features/day-cycle/day-rollover.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/day-cycle
git commit -m "Carry tomorrow into today on date change

Constraint: Product loop depends on yesterday's tomorrow becoming today's opening.
Rejected: Midnight popup | too intrusive for a low-disturbance desktop companion.
Confidence: high
Scope-risk: narrow
Directive: Keep rollover tied to local app open or wake events, not forced alarms.
Tested: pnpm test src/features/day-cycle/day-rollover.test.ts.
Not-tested: Sleep/wake app lifecycle integration."
```

## Task 5: Build Task Panel UI From Prototype

**Files:**

- Create: `src/features/tasks/components/quick-add.tsx`
- Create: `src/features/tasks/components/task-column.tsx`
- Create: `src/features/tasks/components/task-item.tsx`
- Create: `src/features/tasks/components/task-panel.tsx`
- Modify: `src/app/views/panel-view.tsx`
- Modify: `src/shared/styles/tokens.css`
- Modify: `src/shared/styles/base.css`

**Step 1: Add component tests first**

Create `src/features/tasks/components/task-panel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskPanel } from "./task-panel";

describe("TaskPanel", () => {
  it("renders today and tomorrow columns", () => {
    render(<TaskPanel />);

    expect(screen.getByRole("heading", { name: "今天" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "明天" })).toBeInTheDocument();
  });
});
```

Run:

```bash
pnpm test src/features/tasks/components/task-panel.test.tsx
```

Expected: FAIL because component does not exist.

**Step 2: Implement minimal UI**

Use the current prototype as visual source. Keep the first component version simple and wire real state in the next task.

**Step 3: Verify**

Run:

```bash
pnpm test src/features/tasks/components/task-panel.test.tsx
pnpm dev -- --host 127.0.0.1
```

Expected: test passes. Opening the Vite URL with `?window=panel` renders the task panel; opening without the query still renders only the pet view.

**Step 4: Commit**

```bash
git add src/features/tasks/components src/app/views/panel-view.tsx src/shared/styles
git commit -m "Rebuild task panel as React components

Constraint: UI must preserve the light note-like prototype tone.
Rejected: Adopt a component library | too heavy for the MVP and risks generic todo-tool styling.
Confidence: medium
Scope-risk: moderate
Directive: Keep visual changes checked against prototype screenshots.
Tested: pnpm test src/features/tasks/components/task-panel.test.tsx; pnpm dev -- --host 127.0.0.1 with ?window=panel.
Not-tested: Full task interactions not wired yet."
```

## Task 6: Add Pet Feature Boundary

**Files:**

- Create: `src/features/pet/components/glow-pet.tsx`
- Create: `src/features/pet/components/pet-message.tsx`
- Create: `src/features/pet/pet-mood.ts`
- Create: `src/features/pet/pet-position.ts`
- Create: `src/features/pet/pet-copy.ts`
- Create: `src/features/pet/pet-mood.test.ts`

**Step 1: Write mood tests**

Create `src/features/pet/pet-mood.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getBasePetMood } from "./pet-mood";

describe("pet mood", () => {
  it("sleeps when today is empty", () => {
    expect(getBasePetMood({ openTodayCount: 0, isEvening: false })).toBe("sleeping");
  });

  it("gets heavy when today is too full", () => {
    expect(getBasePetMood({ openTodayCount: 5, isEvening: false })).toBe("heavy");
  });

  it("uses evening mood after workday end", () => {
    expect(getBasePetMood({ openTodayCount: 2, isEvening: true })).toBe("evening");
  });
});
```

**Step 2: Implement mood logic**

Create `src/features/pet/pet-mood.ts`:

```ts
export type PetMood = "calm" | "happy" | "heavy" | "evening" | "sleeping";

interface MoodInput {
  openTodayCount: number;
  isEvening: boolean;
}

export function getBasePetMood(input: MoodInput): PetMood {
  if (input.openTodayCount === 0) return "sleeping";
  if (input.isEvening) return "evening";
  if (input.openTodayCount >= 5) return "heavy";
  return "calm";
}
```

**Step 3: Implement visual component**

Port the prototype pet markup and animations into `glow-pet.tsx` and shared CSS. Keep props small:

```tsx
import type { PetMood } from "../pet-mood";

interface GlowPetProps {
  mood: PetMood;
  onClick: () => void;
}

export function GlowPet({ mood, onClick }: GlowPetProps) {
  return (
    <button className="pet" data-mood={mood} aria-label="小光团" onClick={onClick}>
      <span className="pet-aura" aria-hidden="true" />
      <span className="pet-body" aria-hidden="true">
        <span className="pet-face">
          <span />
          <span />
        </span>
      </span>
      <span className="pet-shadow" aria-hidden="true" />
    </button>
  );
}
```

**Step 4: Verify**

Run:

```bash
pnpm test src/features/pet/pet-mood.test.ts
pnpm typecheck
```

Expected: both pass.

**Step 5: Commit**

```bash
git add src/features/pet src/shared/styles
git commit -m "Separate glow pet mood and rendering

Constraint: The pet must participate in workflow feedback, not decorate a todo list.
Rejected: Keep mood as CSS-only state | makes business feedback hard to test.
Confidence: high
Scope-risk: narrow
Directive: Add new pet states through pet-mood tests before styling.
Tested: pnpm test src/features/pet/pet-mood.test.ts; pnpm typecheck.
Not-tested: Drag persistence not implemented."
```

## Task 7: Add Evening Review Flow

**Files:**

- Create: `src/features/evening-review/evening-review-flow.ts`
- Create: `src/features/evening-review/evening-review-copy.ts`
- Create: `src/features/evening-review/evening-review-flow.test.ts`
- Create: `src/features/evening-review/components/evening-review-dialog.tsx`
- Modify: `src/features/tasks/task-reducer.ts`

**Step 1: Write failing flow tests**

Create `src/features/evening-review/evening-review-flow.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { moveOpenTodayTasksToTomorrow } from "./evening-review-flow";
import type { Task } from "../tasks/task-types";

const openTodayTask: Task = {
  id: "task-1",
  title: "收尾",
  bucket: "today",
  status: "open",
  createdAt: "2026-07-03T10:00:00.000Z",
  updatedAt: "2026-07-03T10:00:00.000Z"
};

describe("evening review flow", () => {
  it("moves open today tasks to tomorrow", () => {
    const tasks = moveOpenTodayTasksToTomorrow([openTodayTask], "2026-07-03T18:00:00.000Z");

    expect(tasks[0].bucket).toBe("tomorrow");
    expect(tasks[0].status).toBe("open");
  });
});
```

**Step 2: Implement flow**

Create `src/features/evening-review/evening-review-flow.ts`:

```ts
import type { Task } from "../tasks/task-types";

export function moveOpenTodayTasksToTomorrow(tasks: Task[], now: string): Task[] {
  return tasks.map((task) => {
    if (task.bucket !== "today" || task.status !== "open") return task;

    return {
      ...task,
      bucket: "tomorrow",
      updatedAt: now
    };
  });
}
```

Create `src/features/evening-review/evening-review-copy.ts`:

```ts
export function reviewTitle(openTodayCount: number): string {
  if (openTodayCount === 0) return "今天已经很完整。";
  return `今天还剩 ${openTodayCount} 件事，要交给明天吗？`;
}

export const eveningReviewCopy = {
  keep: "先放着",
  move: "移到明天",
  complete: "标记完成",
  abandon: "放弃这件事",
  done: "今天可以收起来了。"
} as const;
```

**Step 3: Verify**

Run:

```bash
pnpm test src/features/evening-review/evening-review-flow.test.ts
```

Expected: PASS.

**Step 4: Commit**

```bash
git add src/features/evening-review src/features/tasks
git commit -m "Model evening review as a first-class flow

Constraint: The product memory point is handing unfinished work to tomorrow.
Rejected: Treat review as a generic bulk edit | loses the product's end-of-day ritual.
Confidence: high
Scope-risk: moderate
Directive: Keep review copy gentle and avoid productivity guilt language.
Tested: pnpm test src/features/evening-review/evening-review-flow.test.ts.
Not-tested: Dialog accessibility and per-task actions."
```

## Task 8: Scaffold Tauri Desktop Pet Shell

**Files:**

- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/capabilities/default.json`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/commands/mod.rs`
- Create: `src-tauri/src/commands/window.rs`
- Create: `src-tauri/src/persistence/mod.rs`
- Create: `src-tauri/src/persistence/app_data_path.rs`
- Create: `src-tauri/src/window/mod.rs`
- Create: `src-tauri/src/window/pet_window.rs`
- Create: `src-tauri/src/window/panel_window.rs`
- Modify: `package.json`

**Step 1: Install Tauri dependencies**

Run:

```bash
pnpm add -D @tauri-apps/cli
pnpm add @tauri-apps/api
```

Expected: Tauri packages are added to `package.json`.

**Step 2: Initialize Tauri**

Run:

```bash
pnpm tauri init
```

Expected: `src-tauri/` is created.

**Step 3: Configure pet and panel windows**

In `src-tauri/tauri.conf.json`, configure MVP around the desktop pet window, not a normal main app window:

```json
{
  "app": {
    "windows": [
      {
        "label": "pet",
        "title": "小光团",
        "url": "index.html?window=pet",
        "width": 144,
        "height": 144,
        "resizable": false,
        "decorations": false,
        "alwaysOnTop": true,
        "visibleOnAllWorkspaces": true,
        "transparent": false
      },
      {
        "label": "panel",
        "title": "今天明天",
        "url": "index.html?window=panel",
        "width": 760,
        "height": 520,
        "resizable": false,
        "decorations": false,
        "alwaysOnTop": true,
        "visible": false,
        "transparent": false
      }
    ]
  }
}
```

Use `transparent: false` for the first shell unless the distribution target allows macOS private APIs. Add transparent mode only after a dedicated spike. The first shell can use a small shallow background for the pet window, but must not fall back to a large ordinary main window.

**Step 4: Add window commands**

Create Tauri commands with these names:

```rust
show_panel_near_pet
hide_panel
save_pet_position
restore_pet_position
```

Expected behavior:

- `show_panel_near_pet` positions the panel near the pet and clamps it to the visible monitor area.
- `hide_panel` hides the panel without changing task state.
- `save_pet_position` persists the current pet window position.
- `restore_pet_position` ignores saved coordinates that are no longer visible on any screen.

**Step 5: Add scripts**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

Keep existing scripts.

**Step 6: Verify**

Run:

```bash
pnpm tauri:dev
```

Expected: desktop app launches with the small pet window visible. The task panel window exists but starts hidden.

**Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src-tauri
git commit -m "Add Tauri desktop pet shell

Constraint: Desktop state should show only the small glow pet, not a normal app window.
Rejected: Start with one 980x720 main window | would violate the core desktop-pet experience.
Confidence: medium
Scope-risk: moderate
Directive: Revisit transparent window only with distribution target confirmed.
Tested: pnpm tauri:dev.
Not-tested: Packaging, tray, launch at login, transparent window distribution constraints."
```

## Task 9: Wire App State and Persistence Adapter

**Files:**

- Create: `src/app/app-state.ts`
- Create: `src/app/app-storage.ts`
- Create: `src/app/default-app-data.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/features/tasks/components/task-panel.tsx`
- Create: `src/app/app-state.test.ts`

**Step 1: Write app state tests**

Create `src/app/app-state.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createDefaultAppData } from "./default-app-data";

describe("default app data", () => {
  it("starts with empty user tasks and default settings", () => {
    const data = createDefaultAppData("2026-07-03");

    expect(data.tasks).toEqual([]);
    expect(data.settings.workdayEndTime).toBe("18:00");
    expect(data.dayCycle.lastOpenedLocalDate).toBe("2026-07-03");
    expect(data.pet.panelOpen).toBe(false);
    expect(data.panel.open).toBe(false);
    expect(data.growth.stage).toBe("spark");
  });
});
```

**Step 2: Implement default data**

Create `src/app/default-app-data.ts`:

```ts
import type { DayCycleState } from "../features/day-cycle/day-cycle-types";
import type { Task } from "../features/tasks/task-types";

interface Settings {
  workdayEndTime: string;
  alwaysOnTop: boolean;
  visibleOnAllWorkspaces: boolean;
  launchAtLogin: boolean;
  reducedMotion: boolean;
}

interface PetState {
  mood: "calm" | "happy" | "heavy" | "evening" | "sleeping";
  panelOpen: boolean;
  position?: {
    x: number;
    y: number;
    screenId?: string;
  };
  lastMessage?: string;
}

interface PanelState {
  open: boolean;
  mode: "tasks" | "eveningReview";
  anchor: "pet";
}

interface GrowthState {
  stage: "spark" | "glow" | "stardust" | "halo" | "dayNightWatcher";
  completedTaskCount: number;
  eveningReviewCount: number;
  eveningReviewStreak: number;
}

interface AppData {
  schemaVersion: number;
  tasks: Task[];
  dayCycle: DayCycleState;
  pet: PetState;
  panel: PanelState;
  growth: GrowthState;
  settings: Settings;
}

export function createDefaultAppData(localDate: string): AppData {
  return {
    schemaVersion: 1,
    tasks: [],
    dayCycle: {
      lastOpenedLocalDate: localDate
    },
    pet: {
      mood: "calm",
      panelOpen: false
    },
    panel: {
      open: false,
      mode: "tasks",
      anchor: "pet"
    },
    growth: {
      stage: "spark",
      completedTaskCount: 0,
      eveningReviewCount: 0,
      eveningReviewStreak: 0
    },
    settings: {
      workdayEndTime: "18:00",
      alwaysOnTop: true,
      visibleOnAllWorkspaces: true,
      launchAtLogin: false,
      reducedMotion: false
    }
  };
}
```

**Step 3: Add localStorage adapter for Web dev**

Create `src/app/app-storage.ts`:

```ts
const STORAGE_KEY = "today-tomorrow-app-data";

export function loadFromLocalStorage<T>(fallback: T): T {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToLocalStorage<T>(data: T): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

**Step 4: Verify**

Run:

```bash
pnpm test src/app/app-state.test.ts
pnpm typecheck
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app src/features/tasks/components
git commit -m "Wire initial app data and storage boundary

Constraint: Web development needs persistence before Rust file storage is ready.
Rejected: Put localStorage calls inside components | would couple UI to persistence.
Confidence: high
Scope-risk: moderate
Directive: Replace storage adapter with Tauri persistence without changing feature components.
Tested: pnpm test src/app/app-state.test.ts; pnpm typecheck.
Not-tested: Tauri file persistence."
```

## Task 10: Add QA Checklist and Final Checks

**Files:**

- Create: `docs/qa-checklist.md`
- Create: `scripts/check.sh`
- Modify: `README.md`

**Step 1: Create QA checklist**

Create `docs/qa-checklist.md`:

```markdown
# QA Checklist

## Core Tasks

- [ ] Add a today task.
- [ ] Add a tomorrow task.
- [ ] Complete a task.
- [ ] Reopen a task.
- [ ] Move today task to tomorrow.
- [ ] Move tomorrow task to today.

## Evening Review

- [ ] Review shows open today task count.
- [ ] "先放着" leaves tasks unchanged.
- [ ] "移到明天" moves open today tasks to tomorrow.
- [ ] Completing review updates pet message.

## Pet

- [ ] Pet appears in the corner.
- [ ] Desktop state shows only the pet, not a normal task window.
- [ ] Pet click opens the task panel.
- [ ] Task panel appears near the pet and remains inside the visible screen.
- [ ] Clicking outside closes the task panel.
- [ ] Escape closes the task panel without changing task data.
- [ ] Pet mood changes when today is empty.
- [ ] Pet mood changes when today has five or more open tasks.
- [ ] Workday-end prompt does not steal focus or open a blocking modal.

## Desktop

- [ ] Tauri app launches.
- [ ] `pet` window is not resizable in MVP.
- [ ] `panel` window starts hidden.
- [ ] Pet window stays above normal windows when enabled.
- [ ] App restart preserves tasks.
```

**Step 2: Add check script**

Create `scripts/check.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run:

```bash
chmod +x scripts/check.sh
./scripts/check.sh
```

Expected: all checks pass.

**Step 3: Update README with commands**

Add:

```markdown
## Development

    pnpm install
    pnpm dev
    pnpm tauri:dev
    pnpm check
```

**Step 4: Commit**

```bash
git add README.md docs/qa-checklist.md scripts/check.sh
git commit -m "Document QA and project checks

Constraint: MVP quality depends on preserving the light interaction details.
Rejected: Rely only on manual ad hoc testing | too easy to miss rollover and review flows.
Confidence: high
Scope-risk: narrow
Directive: Update QA checklist whenever a user-facing flow changes.
Tested: ./scripts/check.sh.
Not-tested: macOS packaged install."
```

## Final Verification

Run:

```bash
pnpm check
pnpm build
pnpm tauri:dev
```

Expected:

- Lint passes.
- Typecheck passes.
- Unit tests pass.
- Web build passes.
- Tauri app launches with `pet` visible and `panel` hidden.

Then manually inspect:

- Current prototype still exists under `prototype/static-web/`.
- Formal source lives under `src/`.
- Tauri shell lives under `src-tauri/`.
- Product spec and development guide remain in `docs/`.
