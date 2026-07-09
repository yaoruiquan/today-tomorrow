import { useEffect, useRef, useState } from "react";
import type { AppModelSnapshot } from "./task-panel-types";
import { toLocalDateKey } from "../../day-cycle/local-date";
import { placePetWindow, recenterPetWindow } from "../../desktop-shell/window-events";
import { EveningReviewDialog } from "../../evening-review/components/evening-review-dialog";
import { glowIntensityOptions, petThemeOptions } from "../../settings/theme-options";
import type { DesktopPlacementId, QuietModeId } from "../../settings/settings-types";
import type { TaskBucket } from "../task-types";
import { TaskColumn } from "./task-column";

interface TaskPanelProps {
  model: AppModelSnapshot;
  compact?: boolean;
}

export function TaskPanel({ model, compact = false }: TaskPanelProps) {
  const [catchSuggestionDismissed, setCatchSuggestionDismissed] = useState(false);
  const [catchFeedbackCount, setCatchFeedbackCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const catchFeedbackTimer = useRef<number | undefined>(undefined);
  const dateLabel = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date());
  const reviewedToday = model.data.dayCycle.lastEveningReviewDate === toLocalDateKey(new Date());
  const todayStatus = getTodayStatus(model.todayOpenCount);
  const tomorrowStatus =
    model.tomorrowOpenCount > 0 ? `明天接住 ${model.tomorrowOpenCount} 件` : "明天还空着";
  const reviewStatus = model.todayOpenCount === 0 ? "今天很完整" : reviewedToday ? "今天已收好" : "还没收尾";
  const reviewAction = model.isEvening && model.todayOpenCount > 0 ? "把今天收起来" : "下班整理";
  const taskPanelClassName = `task-panel${compact ? " is-compact" : ""}`;
  const activeCoDoTitle = model.activeCoDoTask?.title;
  const quietModeValue = model.quietModeActive ? model.data.settings.quietMode.mode : "off";
  const catchSuggestionVisible =
    model.data.settings.catchTomorrowEnabled &&
    model.isEvening &&
    model.todayOpenCount > 0 &&
    !catchSuggestionDismissed;
  const catchFeedbackVisible = catchFeedbackCount > 0;
  const companionMessage = getCompanionMessage({
    quietModeActive: model.quietModeActive,
    activeCoDoTitle,
    gentleReminderMessage: model.gentleReminderMessage,
    growthStage: model.data.growth.stage
  });

  useEffect(() => {
    setCatchSuggestionDismissed(false);
  }, [model.todayOpenCount, model.data.settings.catchTomorrowEnabled]);

  useEffect(() => {
    return () => {
      if (catchFeedbackTimer.current) window.clearTimeout(catchFeedbackTimer.current);
    };
  }, []);

  function showCaughtFeedback(count: number) {
    if (catchFeedbackTimer.current) window.clearTimeout(catchFeedbackTimer.current);

    setCatchFeedbackCount(count);
    catchFeedbackTimer.current = window.setTimeout(() => {
      setCatchFeedbackCount(0);
      catchFeedbackTimer.current = undefined;
    }, 2600);
  }

  function handleCatchTodayTasksForTomorrow() {
    const caughtCount = model.todayOpenCount;
    if (caughtCount <= 0) return;

    setCatchSuggestionDismissed(true);
    showCaughtFeedback(caughtCount);
    model.catchTodayTasksForTomorrow();
  }

  function handleDismissCatchSuggestion() {
    setCatchSuggestionDismissed(true);
    model.showMessage("好，我先不动它们。");
  }

  function handleEmptyColumnAdd(bucket: TaskBucket) {
    model.showMessage(bucket === "today" ? "先写下一件今天的事。" : "先写下一件明天的事。");
  }

  async function returnPetToScreen() {
    const didRecenter = await recenterPetWindow();
    model.showMessage(didRecenter ? "小光团回到屏幕内。" : "小光团会待在角落。");
  }

  async function applyDesktopPlacement(placement: DesktopPlacementId) {
    model.setDesktopPlacement(placement);

    if (placement === "lastPosition") {
      model.showMessage("会记住你拖到的位置。");
      return;
    }

    const didPlace = await placePetWindow(placement);
    model.showMessage(didPlace ? "小光团换了个角落。" : "这个位置会在桌面版生效。");
  }

  if (model.data.panel.mode === "eveningReview") {
    return (
      <article
        className={taskPanelClassName}
        data-theme={model.data.settings.petThemeId}
        data-glow={model.data.settings.glowIntensity}
        data-reduced-motion={model.data.settings.reducedMotion ? "true" : undefined}
      >
        <EveningReviewDialog
          tasks={model.reviewTasks}
          onKeep={model.closeEveningReview}
          onMoveAll={model.moveAllOpenTodayToTomorrow}
          onCompleteTask={model.toggleTask}
          onMoveTask={(id) => model.moveTaskToBucket(id, "tomorrow")}
          onAbandonTask={model.abandonTaskById}
        />
      </article>
    );
  }

  return (
    <article
      className={taskPanelClassName}
      data-theme={model.data.settings.petThemeId}
      data-glow={model.data.settings.glowIntensity}
      data-reduced-motion={model.data.settings.reducedMotion ? "true" : undefined}
      aria-label="今天和明天"
    >
      <header className="panel-status-strip">
        <div>
          <p className="panel-kicker">{dateLabel}</p>
          <h1>今天 / 明天</h1>
        </div>
        <div className="status-stack" aria-label="今日状态">
          <span className="status-chip">{todayStatus}</span>
          <span>{tomorrowStatus}</span>
        </div>
      </header>

      <section
        className="companion-strip"
        data-reminder-active={model.gentleReminderActive ? "true" : undefined}
        aria-label="小光团状态"
      >
        <p>{companionMessage}</p>
        <div className="companion-status" aria-label="陪伴状态">
          {activeCoDoTitle ? <span>陪做中</span> : null}
          {model.quietModeActive ? <span>安静中</span> : null}
        </div>
      </section>

      <div className="planning-body">
        <TaskColumn
          bucket="today"
          title="今天"
          subtitle={model.todayOpenCount ? "专注中" : "很轻"}
          variant="focus"
          openCount={model.todayOpenCount}
          tasks={model.todayTasks}
          activeCoDoTaskId={model.data.pet.activeCoDoTaskId}
          onAdd={model.addTaskToBucket}
          onEmptySubmit={handleEmptyColumnAdd}
          onToggle={model.toggleTask}
          onMove={(id: string, bucket: TaskBucket) => model.moveTaskToBucket(id, bucket)}
          onRename={model.renameTaskById}
          onDelete={model.abandonTaskById}
          onStartCoDo={model.startCoDoTask}
          onStopCoDo={model.stopCoDoTask}
        />
        <TaskColumn
          bucket="tomorrow"
          title="明天接住"
          subtitle={model.tomorrowOpenCount ? "安静放好" : "还空着"}
          variant="shelf"
          openCount={model.tomorrowOpenCount}
          tasks={model.tomorrowTasks}
          activeCoDoTaskId={model.data.pet.activeCoDoTaskId}
          receiving={catchFeedbackVisible}
          onAdd={model.addTaskToBucket}
          onEmptySubmit={handleEmptyColumnAdd}
          onToggle={model.toggleTask}
          onMove={(id: string, bucket: TaskBucket) => model.moveTaskToBucket(id, bucket)}
          onRename={model.renameTaskById}
          onDelete={model.abandonTaskById}
          onStartCoDo={model.startCoDoTask}
          onStopCoDo={model.stopCoDoTask}
        />
      </div>

      <section className="evening-strip" aria-label="下班整理">
        {catchFeedbackVisible ? (
          <>
            <div>
              <span className="review-chip">{`已接住 +${catchFeedbackCount}`}</span>
              <p>我接住了，明天还在。</p>
            </div>
            <button className="quiet-button evening-action" type="button" onClick={model.startEveningReview}>
              下班整理
            </button>
          </>
        ) : catchSuggestionVisible ? (
          <>
            <div>
              <span className="review-chip">{reviewStatus}</span>
              <p>{`还有 ${model.todayOpenCount} 件，我帮你接到明天？`}</p>
            </div>
            <div className="strip-actions">
              <button
                className="primary-button compact-action"
                type="button"
                onClick={handleCatchTodayTasksForTomorrow}
              >
                接住明天
              </button>
              <button
                className="quiet-button compact-action"
                type="button"
                onClick={handleDismissCatchSuggestion}
              >
                先留在今天
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="review-chip">{reviewStatus}</span>
              <p>{model.todayOpenCount ? "把今天轻轻收个尾。" : "今天已经很完整。"}</p>
            </div>
            <button className="quiet-button evening-action" type="button" onClick={model.startEveningReview}>
              {reviewAction}
            </button>
          </>
        )}
      </section>

      <footer className="panel-footer-controls" aria-label="外观和设置">
        <div className="theme-swatches" aria-label="小光团主题">
          {petThemeOptions.map((theme) => (
            <button
              key={theme.id}
              className="theme-swatch"
              type="button"
              data-theme={theme.id}
              aria-label={`切换到${theme.name}主题`}
              aria-pressed={model.data.settings.petThemeId === theme.id}
              title={theme.hint}
              onClick={() => model.setPetThemeId(theme.id)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="glow-control" role="group" aria-label="发光强度">
          {glowIntensityOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={model.data.settings.glowIntensity === option.id}
              onClick={() => model.setGlowIntensity(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>

        <div className="settings-popover-wrap">
          <button
            className="settings-toggle"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            设置
          </button>

          {settingsOpen ? (
            <div className="compact-settings" role="dialog" aria-label="小光团设置">
              <section>
                <h2>陪伴</h2>
                <div className="ability-toggles" aria-label="能力开关">
                  <label>
                    <input
                      type="checkbox"
                      checked={model.data.settings.catchTomorrowEnabled}
                      onChange={(event) => model.setCatchTomorrowEnabled(event.currentTarget.checked)}
                    />
                    <span>接住明天</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={model.data.settings.gentleRemindersEnabled}
                      onChange={(event) => model.setGentleRemindersEnabled(event.currentTarget.checked)}
                    />
                    <span>轻声提醒</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={model.data.settings.hoverInteractionEnabled}
                      onChange={(event) => model.setHoverInteractionEnabled(event.currentTarget.checked)}
                    />
                    <span>靠近回应</span>
                  </label>
                </div>
              </section>

              <section>
                <h2>安静</h2>
                <select
                  className="quiet-select"
                  aria-label="安静模式"
                  value={quietModeValue}
                  onChange={(event) => model.setQuietMode(event.currentTarget.value as QuietModeId)}
                >
                  <option value="off">关闭</option>
                  <option value="oneHour">1 小时</option>
                  <option value="untilTomorrow">到明天</option>
                  <option value="always">一直</option>
                </select>
              </section>

              <section>
                <h2>桌面</h2>
                <div className="desktop-settings-row">
                  <select
                    className="placement-select"
                    aria-label="小光团位置"
                    value={model.data.settings.desktopPlacement}
                    onChange={(event) => void applyDesktopPlacement(event.currentTarget.value as DesktopPlacementId)}
                  >
                    <option value="bottomRight">右下</option>
                    <option value="bottomLeft">左下</option>
                    <option value="topRight">右上</option>
                    <option value="topLeft">左上</option>
                    <option value="lastPosition">记住拖动</option>
                  </select>

                  <button
                    className="recenter-button"
                    type="button"
                    title="回到屏幕内"
                    onClick={returnPetToScreen}
                  >
                    回到屏幕内
                  </button>
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </footer>
    </article>
  );
}

function getCompanionMessage(input: {
  quietModeActive: boolean;
  activeCoDoTitle?: string;
  gentleReminderMessage?: string;
  growthStage: string;
}): string {
  if (input.quietModeActive) return "安静模式中，小光团只轻轻亮着。";
  if (input.activeCoDoTitle) return `陪你做：${input.activeCoDoTitle}`;
  if (input.gentleReminderMessage) return input.gentleReminderMessage;

  switch (input.growthStage) {
    case "dayNightCore":
      return "它把这些天的光都记住了。";
    case "holdingGlow":
      return "小光团的光更稳了一点。";
    case "starCore":
      return "身体里多了一点星尘光。";
    case "smallGlow":
      return "它越来越会接住你的明天了。";
    default:
      return "小光团在这里，先放下一件小事。";
  }
}

function getTodayStatus(openTodayCount: number): string {
  if (openTodayCount === 0) return "今天很轻";
  if (openTodayCount <= 3) return "今天刚刚好";
  if (openTodayCount <= 5) return "今天有点满";
  return "先看最前面的几件";
}
