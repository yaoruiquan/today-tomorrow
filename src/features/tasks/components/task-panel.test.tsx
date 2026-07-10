import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppModel } from "../../../app/app-model";
import { clearAppData } from "../../../app/app-storage";
import type { AppModelSnapshot } from "./task-panel-types";
import { TaskPanel } from "./task-panel";

describe("TaskPanel column-local add", () => {
  let currentModel: AppModelSnapshot | undefined;

  function readModel(): AppModelSnapshot {
    if (!currentModel) throw new Error("task panel harness did not render");
    return currentModel;
  }

  function Harness() {
    currentModel = useAppModel();
    return <TaskPanel model={currentModel} />;
  }

  beforeEach(() => {
    clearAppData();
    currentModel = undefined;
  });

  it("uses column-local add inputs instead of the global quick-add row", () => {
    render(<Harness />);

    expect(screen.queryByPlaceholderText("写下一件事")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "任务日期" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("添加今天的任务")).toHaveAttribute("placeholder", "添加今天的事");
    expect(screen.getByLabelText("添加明天的任务")).toHaveAttribute("placeholder", "放到明天");
    expect(screen.getByRole("button", { name: "添加到今天" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加到明天" })).toBeInTheDocument();
  });

  it("adds tasks to the column where the user typed and keeps focus there", async () => {
    render(<Harness />);

    const todayInput = screen.getByLabelText("添加今天的任务") as HTMLInputElement;
    fireEvent.change(todayInput, { target: { value: "整理今天" } });
    fireEvent.click(screen.getByRole("button", { name: "添加到今天" }));

    expect(await screen.findByText("整理今天")).toBeInTheDocument();
    await waitFor(() => expect(todayInput).toHaveFocus());
    expect(todayInput).toHaveValue("");
    expect(readModel().todayTasks[0]).toMatchObject({
      title: "整理今天",
      bucket: "today",
      status: "open"
    });

    const tomorrowInput = screen.getByLabelText("添加明天的任务") as HTMLInputElement;
    fireEvent.change(tomorrowInput, { target: { value: "准备明天" } });
    fireEvent.click(screen.getByRole("button", { name: "添加到明天" }));

    expect(await screen.findByText("准备明天")).toBeInTheDocument();
    await waitFor(() => expect(tomorrowInput).toHaveFocus());
    expect(tomorrowInput).toHaveValue("");
    expect(todayInput).not.toHaveFocus();
    expect(readModel().tomorrowTasks[0]).toMatchObject({
      title: "准备明天",
      bucket: "tomorrow",
      status: "open"
    });
  });

  it("renders long column task lists so the column can scroll", async () => {
    render(<Harness />);

    const todayColumn = screen.getByRole("region", { name: "今天" });
    const todayInput = within(todayColumn).getByLabelText("添加今天的任务") as HTMLInputElement;
    const addTodayButton = within(todayColumn).getByRole("button", { name: "添加到今天" });
    const taskTitles = Array.from({ length: 7 }, (_, index) => `长清单任务 ${index + 1}`);

    for (const title of taskTitles) {
      fireEvent.change(todayInput, { target: { value: title } });
      fireEvent.click(addTodayButton);
    }

    await waitFor(() => {
      for (const title of taskTitles) {
        expect(within(todayColumn).getByText(title)).toBeInTheDocument();
      }
    });
    expect(within(todayColumn).queryByText(/先放在后面/)).not.toBeInTheDocument();
  });

  it("keeps long task text visible in the task row", async () => {
    render(<Harness />);

    const longTitle =
      "这是一条比较长的记录内容，用来确认任务行会完整换行展示，而不是只露出前面一点点文字。";
    const todayInput = screen.getByLabelText("添加今天的任务") as HTMLInputElement;
    fireEvent.change(todayInput, { target: { value: longTitle } });
    fireEvent.click(screen.getByRole("button", { name: "添加到今天" }));

    expect(await screen.findByText(longTitle)).toBeInTheDocument();
  });

  it("shows bucket-specific gentle feedback on empty submit", async () => {
    render(<Harness />);

    const todayColumn = screen.getByRole("region", { name: "今天" });
    fireEvent.submit(within(todayColumn).getByLabelText("添加今天的任务").closest("form")!);

    await waitFor(() => expect(readModel().data.pet.lastMessage).toBe("先写下一件今天的事。"));

    const tomorrowColumn = screen.getByRole("region", { name: "明天接住" });
    fireEvent.submit(within(tomorrowColumn).getByLabelText("添加明天的任务").closest("form")!);

    await waitFor(() => expect(readModel().data.pet.lastMessage).toBe("先写下一件明天的事。"));
  });

  it("lets users delete a task from the main planning panel", async () => {
    render(<Harness />);

    const todayInput = screen.getByLabelText("添加今天的任务") as HTMLInputElement;
    fireEvent.change(todayInput, { target: { value: "可以删掉的事" } });
    fireEvent.click(screen.getByRole("button", { name: "添加到今天" }));

    expect(await screen.findByText("可以删掉的事")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "删除任务" }));

    await waitFor(() => expect(screen.queryByText("可以删掉的事")).not.toBeInTheDocument());
    expect(readModel().todayTasks).toHaveLength(0);
    expect(readModel().data.tasks[0]).toMatchObject({
      title: "可以删掉的事",
      status: "abandoned"
    });
    expect(readModel().data.pet.lastMessage).toBe("这件事已经放下。");
  });

  it("shows deleted tasks in the local history record", async () => {
    render(<Harness />);

    const todayInput = screen.getByLabelText("添加今天的任务") as HTMLInputElement;
    fireEvent.change(todayInput, { target: { value: "会进记录的事" } });
    fireEvent.click(screen.getByRole("button", { name: "添加到今天" }));

    expect(await screen.findByText("会进记录的事")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "删除任务" }));
    fireEvent.click(screen.getByRole("button", { name: "设置" }));

    expect(await screen.findByText("本机保存 1 条旧记录")).toBeInTheDocument();
    expect(screen.getByText("已删除")).toBeInTheDocument();
    expect(screen.getByText("会进记录的事")).toBeInTheDocument();
  });

  it("lets users edit an existing task title from the task row", async () => {
    render(<Harness />);

    const todayInput = screen.getByLabelText("添加今天的任务") as HTMLInputElement;
    fireEvent.change(todayInput, { target: { value: "需要修改的事" } });
    fireEvent.click(screen.getByRole("button", { name: "添加到今天" }));

    expect(await screen.findByText("需要修改的事")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "编辑任务：需要修改的事" }));
    const editInput = screen.getByLabelText("编辑任务标题") as HTMLInputElement;
    fireEvent.change(editInput, { target: { value: "已经改好的事" } });
    fireEvent.submit(editInput.closest("form")!);

    expect(await screen.findByText("已经改好的事")).toBeInTheDocument();
    expect(screen.queryByText("需要修改的事")).not.toBeInTheDocument();
    expect(readModel().todayTasks[0]).toMatchObject({
      title: "已经改好的事",
      bucket: "today",
      status: "open"
    });
    expect(readModel().data.pet.lastMessage).toBe("这件事改好了。");
  });
});
