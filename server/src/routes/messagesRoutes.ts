import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { deleteUserMessage } from "../services/messagesService";

const router = Router();

// DELETE -단일 메시지 삭제
router.delete("/:id", authMiddleware, async (req: any, res) => {
  try {
    const messageId = req.params.id;

    const result = await deleteUserMessage(messageId);
    if (!result) {
      return res.status(404).json({ message: "해당 메시지를 찾을 수 없습니다." });
    }

    return res.status(200).json({ message: "메시지가 삭제되었습니다." });
  } catch (error: any) {
    console.error("메시지 삭제 실패:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
