import { deleteMessage } from "../repository/mongodb/messagesRepository";

// 단일 메시지 삭제
export const deleteUserMessage = async (messageId: string) => {
  try {
    const result = await deleteMessage(messageId);

    if (!result) {
      throw new Error("해당 메시지를 찾을 수 없습니다.");
    }

    return result;
  } catch (error) {
    throw new Error("메시지 삭제에 실패했습니다.");
  }
};
