# 今天明天开发文档

> 版本：2026-07-03  
> 范围：把当前静态原型推进为完整 Mac 桌宠应用的工程目录、模块边界、数据模型和开发路线。  
> 本版同步产品设计重点：桌面态只显示小光团，任务面板是轻量展开层，下班整理是产品记忆点。

## 1. 开发目标

今天明天是一只住在 Mac 桌面角落的小光团。它帮助用户轻量记录今天和明天的事项，并在下班前把未完成的事情温柔地安放到明天。

第一版不是重型任务管理器。开发时要优先保护下面三个体验：

1. 桌面常驻但低打扰。
2. 今天 / 明天两个列表足够快、足够轻。
3. 下班整理是核心记忆点，不只是普通弹窗。

开发判断标准：

- 如果一个实现会让产品更像普通 Todo 软件，默认不要做。
- 如果一个功能不能服务“记录今天，安放明天”，默认推迟。
- 如果一个提示会打断用户正在做的事，改成宠物状态、hover 短句或用户主动点击后的面板。
- 桌面态必须先成立：收起时屏幕上只剩小光团，而不是一个缩小版应用窗口。

当前仓库里已经有一版静态 Web 原型：

- `index.html`
- `app.js`
- `styles.css`
- `docs/product-spec.md`
- `output/playwright/*.png`

这份文档先设计完整项目的目标目录。实际迁移时不要一次性重写全部代码，应按阶段把静态原型拆进新工程。

## 2. 推荐技术路线

### 2.1 首选方案：Tauri + React + TypeScript

推荐使用 Tauri 作为 Mac 桌面壳，前端使用 React + TypeScript + Vite。

理由：

- 产品需要桌宠窗口、轻量面板窗口、窗口置顶、窗口尺寸控制、透明或近似透明背景、系统托盘、开机启动等桌面能力。
- 现有原型已经是 HTML/CSS/JS，迁移到 Web 前端成本低。
- Tauri 使用系统 WebView 和 Rust 后端，适合轻量桌面工具。
- 任务数据量小，第一版不需要复杂后端服务。

官方参考：

- Tauri 架构：<https://v2.tauri.app/concept/architecture/>
- Tauri 窗口自定义：<https://v2.tauri.app/learn/window-customization/>
- Tauri 配置：<https://v2.tauri.app/reference/config/>

### 2.2 需要提前注意的桌面限制

透明窗口、置顶、全工作区显示这些能力和发行渠道强相关。

Tauri 官方配置文档说明，macOS 透明窗口会涉及 `macos-private-api`，这会影响 Mac App Store 上架。因此第一版要先明确发行目标：

- 若第一版是官网下载 / 内部分发：可以优先验证 Tauri 透明小窗体验。
- 若第一版必须进 Mac App Store：要避免依赖私有透明窗口能力，改为小尺寸无边框窗口或重新评估 Electron。

Electron 也具备成熟的 `BrowserWindow` 窗口控制能力，官方参考：<https://electronjs.org/docs/latest/api/browser-window>。除非后续证实 Tauri 窗口能力无法满足桌宠体验，否则不建议第一版切到 Electron。

开发阶段不要用一个 980x720 的主窗口代表 MVP。真实 MVP 应采用桌宠优先窗口模型：

- `pet` 窗口：小尺寸、无边框、置顶、默认右下角，只显示小光团。
- `panel` 窗口：点击小光团后出现，靠近小光团定位，失焦或点击空白处收起。
- `review` 流程：优先在 `panel` 中聚焦展示；只有未来设计明确要求时再拆成独立窗口。
- `settings` 窗口：MVP 后期再加入，不影响第一版日夜循环验证。

如果透明窗口受限，第一版可以用很小的无边框浅色窗口先验证交互，但必须记录为发行风险，不能把普通大窗口当成最终形态。

### 2.3 前端技术约束

第一版保持克制：

- 不引入大型 UI 组件库。
- 不引入复杂状态机库。
- 不引入云同步、账号系统、数据库服务。
- CSS 先使用普通 CSS / CSS Modules / design tokens，保留现有视觉语言。
- 状态管理先用小型 store 或 React reducer；只有状态复杂度明显上升时再升级。

## 3. 目标目录结构

完整项目建议整理成下面结构：

```text
today-tomorrow/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── eslint.config.js
├── .prettierrc
├── .gitignore
├── docs/
│   ├── product-spec.md
│   ├── development-guide.md
│   ├── architecture.md
│   ├── qa-checklist.md
│   └── plans/
│       └── 2026-07-03-project-foundation.md
├── prototype/
│   └── static-web/
│       ├── index.html
│       ├── app.js
│       ├── styles.css
│       └── output/
│           └── playwright/
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── App.tsx
│   │   ├── app-shell.tsx
│   │   ├── providers.tsx
│   │   ├── window-router.tsx
│   │   └── views/
│   │       ├── pet-view.tsx
│   │       ├── panel-view.tsx
│   │       └── settings-view.tsx
│   ├── features/
│   │   ├── desktop-shell/
│   │   │   ├── desktop-window-types.ts
│   │   │   ├── panel-anchor.ts
│   │   │   ├── window-events.ts
│   │   │   └── window-copy.ts
│   │   ├── tasks/
│   │   │   ├── components/
│   │   │   │   ├── quick-add.tsx
│   │   │   │   ├── task-column.tsx
│   │   │   │   ├── task-item.tsx
│   │   │   │   └── task-panel.tsx
│   │   │   ├── task-types.ts
│   │   │   ├── task-reducer.ts
│   │   │   ├── task-selectors.ts
│   │   │   ├── task-storage.ts
│   │   │   └── task-copy.ts
│   │   ├── pet/
│   │   │   ├── components/
│   │   │   │   ├── glow-pet.tsx
│   │   │   │   └── pet-message.tsx
│   │   │   ├── pet-mood.ts
│   │   │   ├── pet-position.ts
│   │   │   └── pet-copy.ts
│   │   ├── evening-review/
│   │   │   ├── components/
│   │   │   │   ├── evening-review-dialog.tsx
│   │   │   │   └── review-task-row.tsx
│   │   │   ├── evening-review-flow.ts
│   │   │   └── evening-review-copy.ts
│   │   ├── day-cycle/
│   │   │   ├── day-rollover.ts
│   │   │   ├── local-date.ts
│   │   │   └── day-cycle-types.ts
│   │   ├── growth/
│   │   │   ├── growth-rules.ts
│   │   │   └── growth-types.ts
│   │   └── settings/
│   │       ├── settings-types.ts
│   │       ├── settings-store.ts
│   │       └── default-settings.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── icon-button.tsx
│   │   │   ├── segmented-control.tsx
│   │   │   └── dialog.tsx
│   │   ├── hooks/
│   │   │   ├── use-click-outside.ts
│   │   │   ├── use-escape-key.ts
│   │   │   └── use-reduced-motion.ts
│   │   ├── lib/
│   │   │   ├── assert-never.ts
│   │   │   ├── ids.ts
│   │   │   └── time.ts
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   ├── base.css
│   │   │   └── animations.css
│   │   └── types/
│   │       └── result.ts
│   └── test/
│       ├── setup.ts
│       └── factories.ts
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   └── src/
│       ├── main.rs
│       ├── commands/
│       │   ├── mod.rs
│       │   ├── app_settings.rs
│       │   ├── persistence.rs
│       │   └── window.rs
│       ├── persistence/
│       │   ├── mod.rs
│       │   ├── app_data_path.rs
│       │   ├── migrations.rs
│       │   └── repository.rs
│       ├── window/
│       │   ├── mod.rs
│       │   ├── pet_window.rs
│       │   └── panel_window.rs
│       └── tray.rs
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│       ├── pet-window.spec.ts
│       ├── tasks.spec.ts
│       └── evening-review.spec.ts
└── scripts/
    ├── check.sh
    ├── dev.sh
    └── package-macos.sh
```

## 4. 目录职责说明

### 4.1 `prototype/`

保存当前静态原型和截图，不作为正式应用源码继续扩展。

迁移原则：

- 视觉和文案可以从原型复制。
- 业务逻辑要拆成可测试的 TypeScript 模块。
- 原型截图保留为视觉回归参考。

### 4.2 `src/app/views/`

负责按桌面窗口类型渲染对应入口。

关键视图：

- `pet-view.tsx`：只渲染小光团、hover 短句和拖动交互。
- `panel-view.tsx`：渲染今天 / 明天任务面板和下班整理流程。
- `settings-view.tsx`：后续设置入口，MVP 可以先保留占位。

不要把整个应用都挂在一个全屏或大尺寸 `App` 里。`App` 应根据窗口 label 或 URL route 选择当前视图。

### 4.3 `src/features/desktop-shell/`

负责前端和 Tauri 窗口能力之间的边界。

包含：

- 当前窗口类型识别。
- 小光团位置和面板锚点计算。
- 展开 / 收起面板事件。
- 失焦、Escape、点击空白收起。
- 多屏幕边界修正。

不包含：

- 任务业务规则。
- 宠物 mood 计算。
- 下班整理决策。
- Rust 侧窗口创建细节。

### 4.4 `src/features/tasks/`

负责今天 / 明天任务。

包含：

- 任务类型定义。
- 添加任务。
- 完成 / 取消完成。
- 今天和明天之间移动。
- 任务计数。
- 空状态文案。
- 面板里的任务 UI。

不包含：

- 桌宠动画。
- 下班整理流程。
- 日期滚动。
- 桌面窗口控制。

### 4.5 `src/features/day-cycle/`

负责本地日期和日夜循环。

关键职责：

- 判断当前本地日期。
- 判断是否跨天。
- 第二天启动时，把昨天的明天任务变成今天任务。
- 保存 `lastOpenedLocalDate`。
- 避免同一天重复 rollover。

第一版不处理复杂时区同步，因为产品没有云端账号。

### 4.6 `src/features/evening-review/`

负责下班整理。

这是核心差异化功能，必须独立成模块，不能埋在普通任务列表里。

关键职责：

- 读取今天未完成任务。
- 展示温柔的收尾文案。
- 支持逐项选择：先放着、移到明天、标记完成、放弃。
- 记录当天是否完成过下班整理。
- 触发宠物晚间 / 安睡 / 开心状态。

第一版不应只做一个“全部移到明天”的普通批量按钮。可以保留批量动作，但至少要在流程结构上支持逐项处理，因为产品设计明确包含“先放着 / 移到明天 / 标记完成 / 放弃”。

### 4.7 `src/features/pet/`

负责小光团外观和交互。

关键职责：

- 小光团渲染。
- 呼吸、亮起、困倦、晚间、安睡等状态。
- 鼠标靠近提示。
- 点击展开 / 收起任务面板。
- 拖动位置。
- 保存宠物位置。
- 根据任务数量和下班整理状态计算 mood。
- 明天安排清楚时显示少量小星点。

小光团不能成为任务模块的装饰皮肤。它要参与工作流：完成任务、任务过多、下班整理、今天清空都会改变它。

### 4.8 `src/features/growth/`

负责轻养成规则。

第一版只实现最小成长反馈：

- 完成任务时短暂变亮。
- 完成下班整理后增加一次 `reviewStreak`。
- 达到几次下班整理后显示小星点。

不要在第一版做惩罚、等级数值面板、商店、复杂成就。

### 4.9 `src/features/settings/`

负责用户设置。

第一版建议只保留：

- 下班时间。
- 是否开机启动。
- 是否置顶。
- 是否显示所有桌面空间。
- 是否启用低动效。

暂不做主题编辑器、任务字段配置、复杂通知策略。

### 4.10 `src-tauri/`

负责原生桌面能力。

关键职责：

- `pet` / `panel` / 后续 `settings` 窗口创建和配置。
- 持久化文件路径。
- 系统托盘。
- 开机启动。
- 应用菜单。
- 后续自动更新。

业务规则尽量留在前端 TypeScript。Rust 层优先处理系统能力和文件读写，避免形成两套业务逻辑。

窗口职责：

- `pet_window.rs`：创建和恢复小光团窗口，处理置顶、跨桌面、拖动后的持久化。
- `panel_window.rs`：创建轻量面板窗口，按小光团位置计算出现方向，失焦后隐藏。
- `window.rs` command：提供 `show_panel_near_pet`、`hide_panel`、`save_pet_position` 等命令。

## 5. 核心数据模型

### 5.1 Task

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

设计说明：

- `bucket` 只允许今天或明天。
- `status` 保留 `abandoned`，因为下班整理里有“放弃这件事”。
- `carriedFromDate` 用于记录从昨天交接来的任务，后续可做轻量周回看。
- 不加优先级、标签、项目、提醒时间。

### 5.2 AppData

```ts
export interface AppData {
  schemaVersion: number;
  tasks: Task[];
  dayCycle: DayCycleState;
  pet: PetState;
  panel: PanelState;
  growth: GrowthState;
  settings: Settings;
}
```

### 5.3 DayCycleState

```ts
export interface DayCycleState {
  lastOpenedLocalDate: string;
  lastRolloverAt?: string;
  lastEveningReviewDate?: string;
}
```

### 5.4 PetState

```ts
export type PetMood = "calm" | "happy" | "heavy" | "evening" | "sleeping";

export interface PetPosition {
  x: number;
  y: number;
  screenId?: string;
}

export interface PetState {
  mood: PetMood;
  position?: PetPosition;
  panelOpen: boolean;
  lastMessage?: string;
}
```

说明：

- `position` 存储小光团窗口左上角坐标；恢复时必须校验是否仍在可见屏幕内。
- `panelOpen` 是运行时 UI 状态，持久化时可以保存，但应用启动默认应为 `false`。
- `lastMessage` 用于恢复短提示不重要，若持久化失败不影响任务数据。

### 5.5 PanelState

```ts
export type PanelMode = "tasks" | "eveningReview";

export interface PanelState {
  open: boolean;
  mode: PanelMode;
  anchor: "pet";
}
```

说明：

- 面板不是普通应用窗口，不需要独立复杂导航。
- 下班整理优先作为 `eveningReview` mode 在面板中呈现。
- 点击空白、Escape、窗口失焦都可以关闭面板；关闭不改变任务数据。

### 5.6 GrowthState

```ts
export type GrowthStage =
  | "spark"
  | "glow"
  | "stardust"
  | "halo"
  | "dayNightWatcher";

export interface GrowthState {
  stage: GrowthStage;
  completedTaskCount: number;
  eveningReviewCount: number;
  eveningReviewStreak: number;
}
```

### 5.7 Settings

```ts
export interface Settings {
  workdayEndTime: string;
  alwaysOnTop: boolean;
  visibleOnAllWorkspaces: boolean;
  launchAtLogin: boolean;
  reducedMotion: boolean;
}
```

默认值：

```ts
export const defaultSettings: Settings = {
  workdayEndTime: "18:00",
  alwaysOnTop: true,
  visibleOnAllWorkspaces: true,
  launchAtLogin: false,
  reducedMotion: false
};
```

## 6. 关键业务规则

### 6.1 添加任务

输入为空时不创建任务，显示文案：“先写下一件小事。”

添加到今天：

- `bucket = "today"`
- `status = "open"`
- 宠物提示：“放进今天了。”

添加到明天：

- `bucket = "tomorrow"`
- `status = "open"`
- 宠物提示：“明天会接住它。”

### 6.2 完成任务

完成任务时：

- `status = "done"`
- 写入 `completedAt`
- 宠物短暂进入 `happy`
- 提示：“完成得很安静。”

取消完成时：

- `status = "open"`
- 清空 `completedAt`
- 提示：“重新放回视线里。”

### 6.3 移动任务

今天移到明天：

- `bucket = "tomorrow"`
- `status = "open"`
- 提示：“交给明天。”

明天移到今天：

- `bucket = "today"`
- `status = "open"`
- 提示：“今天继续。”

### 6.4 每日 rollover

当应用启动或从睡眠唤醒后，如果 `currentLocalDate !== lastOpenedLocalDate`：

1. 把所有 `bucket = "tomorrow"` 且 `status = "open"` 的任务改为 `bucket = "today"`。
2. 为这些任务写入 `carriedFromDate = lastOpenedLocalDate`。
3. 已完成或已放弃任务不自动移动。
4. 更新 `lastOpenedLocalDate = currentLocalDate`。
5. 提示：“明天已经来到今天。”

不要在午夜强制弹窗。只有用户打开或唤醒时轻轻完成交接。

### 6.5 下班整理

触发方式：

- 用户点击“下班整理”。
- 到达 `settings.workdayEndTime` 后，宠物进入晚间状态并显示轻提示。

到点提醒规则：

- 不自动弹出阻塞式 dialog。
- 不抢焦点。
- 不播放高强度提醒。
- 同一天最多主动提示一次。
- 用户靠近或点击小光团时可以展开收尾文案。

文案：

- 0 件未完成：“今天已经很完整。”
- 1 件未完成：“今天还有 1 件事，要交给明天吗？”
- 多件未完成：“今天还剩 N 件事，要交给明天吗？”

第一版动作：

- 先放着。
- 全部移到明天。
- 逐项标记完成。
- 逐项放弃。

完成整理后：

- 记录 `lastEveningReviewDate`。
- 增加 `eveningReviewCount`。
- 宠物进入 `sleeping` 或 `happy`。
- 提示：“今天可以收起来了。”
- 若所有剩余事项都被移到明天或完成，面板可以自动回到任务视图，但不要强制关闭。

### 6.6 宠物 mood 计算

基础规则：

```ts
if (openTodayCount === 0) return "sleeping";
if (isEvening && openTodayCount > 0) return "evening";
if (openTodayCount >= 5) return "heavy";
return "calm";
```

事件型 mood：

- 完成任务后短暂 `happy`，随后回到基础 mood。
- 下班整理完成后短暂 `happy`，随后进入 `sleeping` 或 `evening`。

## 7. UI 结构

### 7.1 桌面态

只显示小光团。

要求：

- 默认右下角。
- 可拖动。
- 拖动后保存位置。
- 不遮挡主要工作区域。
- 鼠标靠近显示一句短提示。
- 点击展开任务面板。
- 到下班时间时不弹窗，只通过更暖的颜色、更慢呼吸和短提示表达。

桌面态验收时不能出现完整任务面板、标题栏、传统窗口边框或明显应用容器。

### 7.2 展开态

面板显示：

- 日期。
- 产品名或“今天 / 明天”。
- 今天任务。
- 明天任务。
- 快速添加。
- 下班整理入口。

展开态仍然像轻便签，不做厚重窗口。

面板行为：

- 面板从小光团附近展开，不居中占据屏幕。
- 面板超出屏幕边界时自动换边或夹紧到可见区域。
- 再次点击小光团、按 Escape、点击面板外或窗口失焦时收起。
- 收起面板不改变任务状态。

### 7.3 下班整理态

聚焦流程，不展示多余信息。

第一版优先在任务面板内切换为下班整理 mode；不建议使用居中的系统感 dialog 作为最终体验。

必须避免强催促文案。

### 7.4 移动端说明

当前产品目标是 Mac 桌面桌宠。移动端截图只作为响应式视觉参考，不是第一版产品目标。

如果保留 Web 预览页，小屏可以隐藏小光团或改成普通预览布局；正式桌面实现不需要为移动设备补齐完整交互。

## 8. 持久化策略

### 8.1 MVP

开发阶段可以先使用 `localStorage`，但正式 Tauri 版本建议迁移到应用数据目录下的 JSON 文件。

文件建议：

```text
~/Library/Application Support/TodayTomorrow/app-data.json
```

实际路径由 Tauri / Rust 层根据系统 app data 目录获取，不要在前端硬编码。

### 8.2 数据迁移

`AppData.schemaVersion` 从 `1` 开始。

每次修改持久化结构，新增 migration：

```text
src-tauri/src/persistence/migrations.rs
src/features/*/migration-tests.ts
```

迁移原则：

- 永远保留用户任务。
- 不能迁移的字段给默认值。
- 不因为字段缺失导致应用白屏。

## 9. 测试策略

### 9.1 单元测试

优先覆盖纯业务规则：

- 添加任务。
- 完成 / 取消完成。
- 今天和明天移动。
- 日期 rollover。
- 下班整理动作。
- 宠物 mood 计算。
- 成长阶段计算。

这些测试不需要启动 Tauri。

### 9.2 组件测试

覆盖：

- 快速添加表单。
- 任务列空状态。
- 任务移动按钮。
- 下班整理 dialog。
- 宠物消息展示。

### 9.3 E2E / 视觉检查

覆盖：

- 桌面态只显示小光团。
- 展开态面板靠近小光团，不像普通主窗口。
- 小屏预览不出现文本重叠。
- 添加任务后计数变化。
- 完成任务后宠物变亮。
- 下班整理后任务进入明天。
- 到下班时间后不自动抢焦点。
- 点击空白、Escape、失焦都能收起面板。
- 截图确认没有文本重叠。

现有 `output/playwright/*.png` 可以作为初始视觉基准。

### 9.4 Tauri 集成测试

覆盖：

- 应用启动。
- `pet` 窗口配置。
- `panel` 窗口显示 / 隐藏。
- 小光团位置保存和屏幕边界修正。
- app data 文件读写。
- 系统托盘入口。

## 10. 开发阶段

### M0：项目基础建设

目标：不改变产品行为，先把工程骨架搭起来。

完成标准：

- 当前静态原型移动到 `prototype/static-web/`。
- 新增 Vite + React + TypeScript 项目。
- 新增 Tauri shell，并明确 `pet` / `panel` 窗口模型。
- 新增 lint、typecheck、test 命令。
- 文档和目录稳定。

### M1：任务模块迁移

目标：把当前 `app.js` 里的任务逻辑迁移到可测试模块。

完成标准：

- `task-reducer.ts` 有单元测试。
- UI 能添加、完成、移动任务。
- 本地存储行为和原型一致。

### M2：小光团桌面交互

目标：桌宠成为真实主入口。

完成标准：

- 小光团默认右下角。
- 支持拖动并保存位置。
- 点击打开 / 关闭面板。
- 点击空白处收起。
- hover 显示短提示。
- 面板定位跟随小光团，且不会跑出屏幕。

### M3：日夜循环

目标：实现“明天接住今天”的基础循环。

完成标准：

- 跨天后明天任务进入今天。
- 不重复 rollover。
- 晚间状态根据下班时间触发。
- 今天清空后进入安睡状态。

### M4：下班整理

目标：做出产品记忆点。

完成标准：

- 下班整理展示未完成任务数量。
- 支持先放着、移到明天、标记完成、放弃。
- 整理完成后触发宠物反馈。
- 整理次数进入轻养成数据。
- 到点只轻提示，不自动抢焦点。

### M5：桌面发行准备

目标：进入可试用安装包。

完成标准：

- macOS dev build 正常运行。
- app icon 和基础菜单完成。
- 数据写入 app data 目录。
- 崩溃或数据损坏时能恢复默认空状态。
- 有 QA checklist。

## 11. 命令约定

建议命令：

```bash
pnpm install
pnpm dev
pnpm tauri dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm tauri build
```

脚本约定：

- `pnpm dev`：只跑 Web 前端。
- `pnpm tauri dev`：跑桌面应用。
- `pnpm check`：顺序执行 lint、typecheck、unit test。
- `pnpm test:e2e`：跑 Playwright。
- `pnpm package:macos`：打 macOS 包。

## 12. 代码边界

### 12.1 前端业务逻辑

放在 `src/features/*/*.ts`。

要求：

- 纯函数优先。
- 输入输出可测试。
- 不直接读写 DOM。
- 不直接调用 Tauri API，除非位于 adapter 文件。

### 12.2 UI 组件

放在 `src/features/*/components/` 或 `src/shared/components/`。

要求：

- 组件只负责渲染和交互事件。
- 文案从 `*-copy.ts` 引入。
- 样式使用稳定 className 和 tokens。

### 12.3 Tauri 命令

放在 `src-tauri/src/commands/`。

要求：

- 命令命名清晰。
- 返回结构化结果。
- 不吞掉错误。
- 不包含前端文案。

## 13. 文案原则

所有产品内文案遵守 `docs/product-spec.md`：

- 短。
- 轻。
- 柔和。
- 不责备。
- 不用强激励。

开发时优先从 copy 文件集中管理：

```text
src/features/tasks/task-copy.ts
src/features/pet/pet-copy.ts
src/features/evening-review/evening-review-copy.ts
```

不要把文案散落在组件和 reducer 里。

## 14. 样式原则

保留当前原型的方向：

- 暖白 / 米白底色。
- 浅薄荷绿。
- 柔和天蓝。
- 淡黄色光晕。
- 少量深色文字。
- 细边框。
- 柔和阴影。

避免：

- 大面积紫蓝渐变。
- 高饱和霓虹色。
- 夸张庆祝动效。
- 卡片套卡片。
- 复杂背景插画。

小光团动画像呼吸，不像表演。

## 15. 验收标准

MVP 完成时必须满足：

1. 应用收起时桌面上只显示小光团。
2. 用户可以添加今天和明天任务。
3. 用户可以完成任务。
4. 用户可以在今天和明天之间移动任务。
5. 用户可以进行下班整理。
6. 下班整理能把未完成任务移到明天。
7. 第二天启动时，明天任务能成为今天任务。
8. 小光团会根据任务状态发生轻微变化。
9. 用户任务能持久化。
10. 应用重启后状态不丢失。
11. 核心流程有测试覆盖。
12. 面板展开和下班整理都不使用强打扰提醒。
13. 桌面窗口不明显遮挡工作区。
14. 产品内不出现优先级、标签、项目、日历、重复任务等重型任务管理字段。

## 16. 当前仓库的下一步

当前仓库已经完成基础 MVP 迁移：

- 静态原型已保留在 `prototype/static-web/`。
- 正式应用已迁移到 Vite + React + TypeScript。
- Tauri 已配置 `pet` / `panel` 双窗口模型。
- 今天 / 明天任务、下班整理、日夜 rollover、宠物 mood、轻成长和 localStorage 持久化已经实现。
- Web 预览已完成浏览器烟测，截图保存在 `output/playwright/`。

继续开发的优先级：

1. 在具备 Rust/Cargo 的机器上完成 `pnpm tauri:dev` 和 `pnpm tauri:build` 验证。
2. 把 MVP 持久化从 localStorage 迁移到 Tauri app data JSON 文件。
3. 增加系统托盘、基础菜单和开机启动设置。
4. 根据 QA 结果修复桌面窗口、边界定位和下班整理细节。

当前本机验证限制：

- `rustc`、`cargo`、`rustup` 未安装。
- 因此 Rust/Tauri 编译暂未验证，交给 QA 时必须作为已知风险说明。
