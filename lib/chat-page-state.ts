export type ConfirmationCopy = {
  title: string;
  description: string;
  actionLabel: string;
  actionDisabled: boolean;
};

type DeriveChatViewStateOptions = {
  loadingMessages: boolean;
  messageCount: number;
  loadingConfirmationStatus: boolean;
  updatingConfirmationStatus: boolean;
  confirmationCopy: ConfirmationCopy;
};

export function deriveChatViewState({
  loadingMessages,
  messageCount,
  loadingConfirmationStatus,
  updatingConfirmationStatus,
  confirmationCopy,
}: DeriveChatViewStateOptions) {
  const showMessageSwitchOverlay = loadingMessages && messageCount > 0;
  const showInitialMessageLoading = loadingMessages && messageCount === 0;
  const confirmationDescription = loadingConfirmationStatus
    ? "稍等一下，正在同步你们这段聊天的确认状态。"
    : confirmationCopy.description;
  const confirmationActionLabel = updatingConfirmationStatus
    ? "处理中..."
    : loadingConfirmationStatus
      ? "加载中..."
      : confirmationCopy.actionLabel;
  const confirmationActionDisabled =
    loadingConfirmationStatus || confirmationCopy.actionDisabled || updatingConfirmationStatus;

  return {
    showMessageSwitchOverlay,
    showInitialMessageLoading,
    confirmationDescription,
    confirmationActionLabel,
    confirmationActionDisabled,
  };
}
