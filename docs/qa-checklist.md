# 今天明天 QA Checklist

> 版本：2026-07-03  
> 范围：MVP 验收。QA 应优先验证产品记忆点：下班前把今天没完成的事轻轻安放到明天。

## 1. 环境准备

```bash
pnpm install
pnpm dev
```

Web 预览地址：

- 桌宠态：`http://localhost:5173/`
- 面板态：`http://localhost:5173/?window=panel`

Tauri 桌面验收需要本机安装：

- Rust / Cargo / rustup
- Xcode Command Line Tools
- 如需 notarization 或正式分发签名，再补齐完整 Xcode 和 Apple 签名/公证凭据

## 2. 自动化检查

```bash
pnpm check
pnpm build
pnpm exec tauri info
pnpm tauri:build
```

当前开发侧已知：

- `pnpm tauri:build` 已能生成签名后的 macOS `.app`。
- `pnpm exec tauri info` 仍会报告完整 Xcode 未安装；当前只验证到本地 ad-hoc signed `.app`，未验证 Apple notarization。
- 默认 bundle target 暂收窄为 `app`。Tauri/create-dmg 在当前环境中把 DMG 临时输出放进源目录时会触发自包含镜像并报 “设备上无剩余空间”；DMG 正式打包需后续单独修复或在发布机验证。

## 3. Web MVP 验收项

- 收起态只显示小光团，不显示任务面板。
- 点击小光团后出现轻量任务面板。
- 面板包含今天、明天、快速添加和下班整理入口。
- 可以添加今天任务。
- 可以添加明天任务。
- 可以完成任务并重新打开任务。
- 可以把今天任务移到明天。
- 可以把明天任务移到今天。
- 输入为空时不创建任务，并显示轻提示。
- 任务刷新后仍存在。
- 控制台没有业务错误。

## 4. 下班整理验收项

- 点击“下班整理”后进入聚焦整理流程。
- 0 个未完成任务时显示“今天已经很完整。”。
- 1 个未完成任务时显示“今天还有 1 件事，要交给明天吗？”。
- 多个未完成任务时显示剩余数量。
- 可以选择“先放着”并回到任务视图。
- 可以一次性“全部交给明天”。
- 可以逐项标记完成。
- 可以逐项移到明天。
- 可以逐项放弃。
- 当最后一个未完成任务被处理后，自动完成本次整理并回到任务视图。
- 同一天重复整理不会重复增加成长次数。

## 5. 日夜循环验收项

- 跨本地日期打开应用时，明天的未完成任务进入今天。
- 已完成或已放弃任务不会被 rollover。
- 同一天不会重复 rollover。
- 到达下班时间后，小光团进入更暖的晚间状态，不自动抢焦点。

## 6. 桌宠验收项

- Tauri `pet` 窗口为小尺寸无边框窗口。
- `pet` 窗口默认在屏幕右下附近。
- `pet` 窗口可以拖动。
- 拖动后位置被保存到应用状态。
- 点击小光团显示 `panel` 窗口。
- `panel` 窗口靠近小光团，且不超出屏幕边界。
- Escape、窗口失焦或点击外部可收起面板。
- 桌宠状态会随任务数量、完成任务和下班整理变化。

## 7. 截图参考

开发侧已生成以下烟测截图：

- `output/playwright/mvp-pet-desktop.png`
- `output/playwright/mvp-pet-open-desktop.png`
- `output/playwright/mvp-evening-review.png`
- `output/playwright/mvp-panel-after-review.png`
- `output/playwright/mvp-panel-mobile-reference.png`

## 8. 已知风险

- 当前机器已安装 Rust/Cargo/rustup，并已完成 `pnpm tauri:build`。完整 Xcode 仍缺失，因此未验证 Apple notarization 或正式分发签名。
- macOS DMG target 暂未作为默认产物。当前可验收产物为 `src-tauri/target/release/bundle/macos/今天明天.app`。
- MVP 仍使用 WebView localStorage。正式发行前建议迁移到 Tauri app data JSON 文件。
- 透明窗口未启用；当前先使用小尺寸无边框窗口验证桌宠体验。
