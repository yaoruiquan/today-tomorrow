# 今天明天架构说明

> 版本：2026-07-03  
> 范围：当前 MVP 的工程边界、运行入口、状态流和桌面能力边界。

## 1. 总体结构

今天明天采用 Tauri + React + TypeScript。

- `src/`：前端 UI、业务规则和本地状态。
- `src-tauri/`：Mac 桌面窗口、窗口定位、窗口显示/隐藏等系统能力。
- `prototype/static-web/`：早期静态原型，只作为视觉和气质参考。
- `docs/`：产品、开发、架构、QA 和多智能体协作文档。

MVP 的核心判断是“桌宠优先”：收起时只显示小光团，点击后才出现任务面板。

## 2. 窗口模型

Tauri 配置包含两个窗口：

- `pet`：144x144，无边框、置顶、跳过任务栏，默认放在屏幕右下附近，只渲染小光团。
- `panel`：760x540，无边框、置顶，默认隐藏，点击小光团后出现在 pet 附近。

Web 预览使用 URL 区分窗口：

- `/` 或 `/?window=pet`：桌宠态预览。
- `/?window=panel`：任务面板预览。

在 Web 预览中，点击小光团会显示页内浮层面板；在 Tauri 运行时，点击小光团会调用原生命令显示 `panel` 窗口。

## 3. 状态与持久化

`useAppModel` 是当前 MVP 的应用状态入口，负责组合任务、日夜循环、下班整理、宠物状态和轻成长数据。

Web 预览使用 `localStorage` 持久化，桌面版使用 Tauri app data 目录下的 SQLite 数据库 `today-tomorrow.sqlite` 持久化：

- 任务列表。
- 日期 rollover 状态。
- 下班整理记录。
- 小光团状态与位置。
- 成长数据。
- 设置默认值。

加载时会把运行时面板状态重置为关闭，避免应用重启后直接弹出任务面板。

SQLite 由 `src-tauri/src/persistence.rs` 管理，包含 `app_state` 和 `task_records` 两张表。`app_state` 保存完整 AppData JSON，保持前端状态模型简单；`task_records` 同步任务字段，支撑删除、归档和历史记录查询。旧版 `app-data.json` 会在首次加载时迁移进 SQLite。业务规则仍保留在 TypeScript 纯函数中。

## 4. 业务模块

- `src/features/tasks/`：添加、完成、重新打开、移动、放弃任务。
- `src/features/day-cycle/`：本地日期和“明天进入今天”的 rollover。
- `src/features/evening-review/`：下班整理流程、文案和未完成任务处理。
- `src/features/pet/`：小光团视觉、mood 和短提示。
- `src/features/growth/`：轻成长阶段。
- `src/features/settings/`：下班时间与桌面偏好默认值。
- `src/features/desktop-shell/`：前端到 Tauri 窗口 API 的适配层。

## 5. 下班整理状态流

1. 用户点击“下班整理”。
2. 若今天没有未完成任务，直接记录当天整理完成。
3. 若今天有未完成任务，面板进入 `eveningReview`。
4. 用户可以逐项标记完成、移到明天、放弃，或一次性全部移到明天。
5. 当未完成任务清空时，自动记录当天整理完成并回到任务视图。
6. 同一天重复整理不会重复增加成长次数。

## 6. 验证边界

当前已验证：

- 前端 lint、typecheck、单元测试。
- Vite production build。
- Chrome Web 预览的桌宠态、展开态、任务添加、任务完成、下班整理和 localStorage 持久化。

当前未验证：

- Rust/Tauri 编译和桌面运行。当前本机缺少 `rustc`、`cargo`、`rustup`，且未安装完整 Xcode。
