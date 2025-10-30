import Message from "../../models/Message";

// 단일 메시지 삭제
export const deleteMessage = async (messageId: string) => {
  try {
    const deleted = await Message.findByIdAndDelete(messageId);
    return !!deleted;
  } catch (error) {
    console.error("메시지 삭제 실패:", error);
    throw new Error("메시지 삭제에 실패했습니다.");
  }
};
