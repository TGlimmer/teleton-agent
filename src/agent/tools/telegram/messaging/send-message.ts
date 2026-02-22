import { Type } from "@sinclair/typebox";
import type { Tool, ToolExecutor, ToolResult } from "../../types.js";
import { TELEGRAM_MAX_MESSAGE_LENGTH } from "../../../../constants/limits.js";
import { getErrorMessage } from "../../../../utils/errors.js";
import { createLogger } from "../../../../utils/logger.js";

const log = createLogger("Tools");

/**
 * Parameters for telegram_send_message tool
 */
interface SendMessageParams {
  chatId: string;
  text: string;
  replyToId?: number;
}

/**
 * Tool definition for sending Telegram messages
 */
export const telegramSendMessageTool: Tool = {
  name: "telegram_send_message",
  description:
    "Send a text message to a Telegram chat. Supports up to 4096 characters. Use this for standard text responses in DMs or groups. For messages with custom keyboards, use telegram_reply_keyboard. For media, use specific media tools (telegram_send_photo, etc.).",
  parameters: Type.Object({
    chatId: Type.String({
      description: "The chat ID to send the message to",
    }),
    text: Type.String({
      description: "The message text to send (max 4096 characters)",
      maxLength: TELEGRAM_MAX_MESSAGE_LENGTH,
    }),
    replyToId: Type.Optional(
      Type.Number({
        description: "Optional message ID to reply to",
      })
    ),
  }),
};

/**
 * Executor for telegram_send_message tool
 */
export const telegramSendMessageExecutor: ToolExecutor<SendMessageParams> = async (
  params,
  context
): Promise<ToolResult> => {
  try {
    const { chatId, text, replyToId } = params;

    // Cross-chat restriction: non-admin users can only send to the current chat
    const adminIds = context.config?.telegram?.admin_ids ?? [];
    const isAdmin = adminIds.includes(Number(context.senderId));
    if (!isAdmin && chatId !== context.chatId) {
      return { success: false, error: "⛔ You can only send messages in the current chat." };
    }

    // Send message via Telegram bridge
    const sentMessage = await context.bridge.sendMessage({
      chatId,
      text,
      replyToId,
    });

    return {
      success: true,
      data: {
        messageId: sentMessage?.id ?? null,
        date: sentMessage?.date ?? null,
      },
    };
  } catch (error) {
    log.error({ err: error }, "Error sending Telegram message");
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
