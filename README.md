# 今天明天

一只安静住在 Mac 桌面角落的小光团，帮你轻量记录今天和明天的事，并在下班前把未完成事项温柔地安放到明天。

它不是重型任务管理器。它只关心两个问题：

- 今天还要做什么？
- 明天需要接住什么？

## Features

- 今天 / 明天双列表
- 快速添加、完成、重新打开、移动、放弃任务
- 下班整理流程
- 本地日期滚动：明天任务会在新的一天进入今天
- 小光团桌宠窗口与任务面板窗口
- 本地数据持久化
- 宠物主题色、发光强度与轻成长反馈

## Tech Stack

- Tauri 2
- React 19
- TypeScript
- Vite
- Vitest
- pnpm

## Getting Started

```bash
pnpm install
pnpm dev
```

常用检查：

```bash
pnpm check
pnpm build
```

桌面开发：

```bash
pnpm tauri:dev
pnpm tauri:build
```

Tauri 桌面模式需要本机安装 Rust/Cargo/rustup。macOS 打包与正式分发还需要完整 Xcode、签名和公证环境。

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | 启动 Web 开发服务 |
| `pnpm check` | 运行 lint、typecheck、test |
| `pnpm build` | 构建 Web 产物 |
| `pnpm tauri:dev` | 启动桌面开发模式 |
| `pnpm tauri:build` | 构建桌面应用 |

## Versions

- `v0.1.0` Web MVP：今天/明天任务、下班整理、轻成长、本地持久化
- `v0.2.0` Desktop MVP：Tauri 桌宠窗口、任务面板、拖动定位、显示/隐藏
- `v0.3.0` Visual System：一屏面板、宠物主题、发光强度、立体小光团
- `v0.4.0` Packaging Beta：macOS 打包、签名准备、安装包验证
- `v1.0.0` Gentle Daily Companion：稳定日常使用版本

## Documentation

- [Product Spec](docs/product-spec.md)
- [Development Guide](docs/development-guide.md)
- [Architecture](docs/architecture.md)
- [QA Checklist](docs/qa-checklist.md)
- [Agent Protocol](docs/agents/interaction-protocol.md)

## Prototype

原始静态原型保存在 `prototype/static-web/`，可直接打开 `prototype/static-web/index.html` 查看早期视觉基线。

## Repository

[yaoruiquan/today-tomorrow](https://github.com/yaoruiquan/today-tomorrow)
