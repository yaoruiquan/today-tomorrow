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

## 7. T-006 主面板与宠物视觉验收项

### 7.1 一屏主面板

- 默认空状态下面板不显示内部滚动条。
- 轻任务状态下面板不显示内部滚动条：今天和明天各 0-5 条 open 任务。
- 面板包含固定且清晰的 top status strip、quick add、today focus、tomorrow shelf、evening/action strip。
- 用户可以添加今天 / 明天任务，不因面板滚动或失焦丢失输入焦点。
- Today 区域视觉上比 Tomorrow 区域更明确、更聚焦。
- Tomorrow 区域视觉上像“明天接住”的安静 shelf，而不是第二个同权重 dashboard 列。
- 超过轻任务数量时，显示紧凑 overflow 文案，不让整个默认面板变成滚动页面。

### 7.2 主题系统

- 提供 5 个主题：`warmGlow`、`mintFocus`、`lavenderCalm`、`blueNight`、`peachRest`。
- 主题切换会温和改变小光团主体自发光、面板 accent、选中控件和轻装饰。
- 主题切换不改变任务数据、任务布局或下班整理流程。
- 所选主题重启后仍保留。

### 7.3 Glow intensity

- 提供 3 个发光强度：`low`、`soft`、`bright`。
- 默认强度为 `soft`。
- 切换强度会影响小光团本体亮度、边缘自发光 bloom 和面板 accent bloom。
- glow intensity 重启后仍保留。
- reduced motion 开启时，静态强度仍生效，连续呼吸 / parallax 动效关闭或明显降低。

### 7.4 立体小光团

- 收起态小光团看起来像有体积的发光球体，不像平面圆点或方形 tile。
- 小光团的光来自球体本身，不是围绕在外面的独立光环 / halo / ring。
- 小光团包含可见的 top-left highlight、inner shading 和 elliptical floor shadow。
- 键盘 focus 可见，但不会暴露整个方形窗口边界。
- 旧的 transient message 不会在重启后残留，也不会裁切成白边。
- 小光团主题色与当前面板主题一致。

### 7.5 桌面恢复

- 用户有紧凑入口可将小光团恢复到当前可见屏幕内。
- 该恢复入口不抢占主流程，不成为主要按钮。

## 8. T-007 养成与桌面互动验收项

### 8.1 范围边界

- 不新增复杂宠物情绪状态。
- 不新增早晚仪式流程。
- 不根据任务文字内容分析宠物性格。
- 不出现完成率、连续打卡、效率分数或惩罚式文案。

### 8.2 接住明天

- 用户可以开启 / 关闭 `接住明天`。
- 开启后，未完成今天任务移动到明天前需要用户确认。
- `接住明天` 文案表达帮助和承接，不表达失败。
- 被接住的任务进入 tomorrow shelf 后不出现失败、逾期、惩罚标签。

### 8.3 Hover 互动

- 鼠标 hover 小光团但不点击时，小光团有轻微本体反应。
- hover 不自动打开面板。
- hover 不抢当前应用焦点。
- hover 不影响拖拽。
- reduced motion 开启时，hover 动效明显降低或静态化。

### 8.4 轻声提醒

- 轻声提醒以小光团视觉变化或 panel 内极轻提示为主。
- 轻声提醒有频率限制。
- 安静模式下不触发轻声提醒。
- 提醒不使用红色警告、逾期、责备或效率压迫文案。

### 8.5 安静模式

- 用户可以开启 `1 小时`、`到明天` 或 `一直开启` 的安静模式。
- 安静模式下小光团仍可见，但提醒、粒子和 playful reactions 被降低。
- 安静模式不影响任务添加、完成、移动和面板打开。

### 8.6 陪做模式

- 用户可以从任务行进入 `陪做模式`。
- 同时最多一条任务处于 `陪做中`。
- 完成任务或手动停止后退出陪做。
- 陪做模式不强制 Pomodoro、不生成效率统计。

### 8.7 桌面空间与个性化

- 小光团位置可记忆。
- `回到屏幕内` 可把小光团恢复到当前可见屏幕。
- 面板展开位置靠近小光团，并保持在屏幕边界内。
- 个性化设置保持轻量，不出现宠物商店、复杂主题编辑器或装扮市场。

## 9. T-008 前端丝滑度验收项

### 9.1 面板内交互

- 打开小光团后，点击输入框不会收起面板。
- 输入文字不会丢失。
- 添加任务后输入框清空并重新聚焦。
- 点击 panel 内按钮、select、任务行、设置入口不会误收起面板。
- Tab 可以在 panel 内控件之间循环，不触发收起。
- Escape 可以收起面板。
- 点击 panel 外部可以收起面板。

### 9.2 渐进设置

- 默认面板不同时暴露所有能力和桌面设置。
- `接住明天`、`轻声提醒`、`靠近回应`、`安静模式`、位置和 `回到屏幕内` 可通过紧凑设置入口访问。
- 默认面板仍然一屏显示。
- 设置入口不抢占 quick add 和今天 / 明天规划的视觉主次。

### 9.3 任务行

- 任务行 idle 状态只突出完成按钮和任务标题。
- `陪做` 和移动操作在 hover / focus / selected 状态出现，或通过紧凑菜单访问。
- 键盘用户可以访问所有任务行操作。
- `陪做中` 状态需要常驻可见。

### 9.4 接住明天

- `接住明天` master toggle 不作为默认主面板常驻高权重控件。
- 当今天有未完成任务且适合整理时，evening strip 显示 `还有 N 件，我帮你接到明天？`。
- 用户可以确认 `接住明天` 或选择 `先留在今天`。
- 用户 dismiss 后，同一 session 内不立即重复出现同一建议。

### 9.5 动效和宠物

- 面板展开 / 收起有短、轻、稳定的过渡。
- 面板展开方向和小光团位置有空间关系。
- reduced motion 下不使用 scale / 位移动效，只保留必要 opacity。
- 小光团第一眼仍是本体自发光球体，不像外部完整光环。

## 10. 截图参考

开发侧已生成以下烟测截图：

- `output/playwright/mvp-pet-desktop.png`
- `output/playwright/mvp-pet-open-desktop.png`
- `output/playwright/mvp-evening-review.png`
- `output/playwright/mvp-panel-after-review.png`
- `output/playwright/mvp-panel-mobile-reference.png`

## 11. 已知风险

- 当前机器已安装 Rust/Cargo/rustup，并已完成 `pnpm tauri:build`。完整 Xcode 仍缺失，因此未验证 Apple notarization 或正式分发签名。
- macOS DMG target 暂未作为默认产物。当前可验收产物为 `src-tauri/target/release/bundle/macos/今天明天.app`。
- MVP 仍使用 WebView localStorage。正式发行前建议迁移到 Tauri app data JSON 文件。
- 透明窗口未启用；当前先使用小尺寸无边框窗口验证桌宠体验。
