import assert from "node:assert/strict";
import test from "node:test";
import { deriveChatViewState, type ConfirmationCopy } from "../lib/chat-page-state.ts";

const baseConfirmationCopy: ConfirmationCopy = {
  title: "可以先点亮一下",
  description: "点亮后，对方会知道你愿意继续了解。",
  actionLabel: "点亮 TA",
  actionDisabled: false,
};

test("chat view state shows full loading only for the first empty conversation load", () => {
  const initialLoadState = deriveChatViewState({
    loadingMessages: true,
    messageCount: 0,
    loadingConfirmationStatus: false,
    updatingConfirmationStatus: false,
    confirmationCopy: baseConfirmationCopy,
  });

  assert.equal(initialLoadState.showInitialMessageLoading, true);
  assert.equal(initialLoadState.showMessageSwitchOverlay, false);
});

test("chat view state keeps the existing conversation visible while switching contacts", () => {
  const switchState = deriveChatViewState({
    loadingMessages: true,
    messageCount: 4,
    loadingConfirmationStatus: false,
    updatingConfirmationStatus: false,
    confirmationCopy: baseConfirmationCopy,
  });

  assert.equal(switchState.showMessageSwitchOverlay, true);
  assert.equal(switchState.showInitialMessageLoading, false);
});

test("chat view state replaces stale confirmation copy while the next contact status is loading", () => {
  const loadingConfirmationState = deriveChatViewState({
    loadingMessages: false,
    messageCount: 4,
    loadingConfirmationStatus: true,
    updatingConfirmationStatus: false,
    confirmationCopy: {
      ...baseConfirmationCopy,
      description: "上一位联系人的确认文案",
      actionLabel: "上一位联系人的按钮",
    },
  });

  assert.equal(loadingConfirmationState.confirmationDescription, "稍等一下，正在同步你们这段聊天的确认状态。");
  assert.equal(loadingConfirmationState.confirmationActionLabel, "加载中...");
  assert.equal(loadingConfirmationState.confirmationActionDisabled, true);
});

test("chat view state keeps the confirmation action disabled while a confirmation update is in flight", () => {
  const updatingConfirmationState = deriveChatViewState({
    loadingMessages: false,
    messageCount: 2,
    loadingConfirmationStatus: false,
    updatingConfirmationStatus: true,
    confirmationCopy: baseConfirmationCopy,
  });

  assert.equal(updatingConfirmationState.confirmationActionLabel, "处理中...");
  assert.equal(updatingConfirmationState.confirmationActionDisabled, true);
});
