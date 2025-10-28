// src/api/settingsAPI.ts
import http from "./http";

// 요청 타입
export type CreateSettingRequest = {
  domain_id: string;
  name: string;
  url_list: string[];
  filter_keywords: string[];
};

// 응답 타입
export type Message = {
  id: string;
  contents: string;
  sended_at: string;
  platform: string;
};

export type Setting = {
  id?: string;
  _id?: string;

  user_id?: string;
  domain_id: string;
  name: string;
  url_list: string[];
  filter_keywords: string[];
  messages: Message[];
  [extra: string]: any;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function createSetting(
  payload: CreateSettingRequest
): Promise<Setting> {
  try {
    const body = { ...payload, settings: { ...payload } };

    if (import.meta.env.DEV) {
      console.log("[settingsAPI] POST /settings payload =", body);
    }

    const { data } = await http.post("/settings", body, {
      headers: { "Content-Type": "application/json" },
    });

    if (import.meta.env.DEV) {
      console.log("[settingsAPI] POST /settings response =", data);
    }

    const picked = data?.settings ?? data?.setting ?? null;
    if (!picked || typeof picked !== "object") {
      throw new ApiError(
        200,
        "서버 응답 형식이 올바르지 않습니다. (settings 없음)"
      );
    }

    // 정규화
    if (!Array.isArray(picked.url_list)) picked.url_list = [];
    if (!Array.isArray(picked.filter_keywords)) picked.filter_keywords = [];
    if (!Array.isArray(picked.messages)) picked.messages = [];

    return picked as Setting;
  } catch (e: any) {
    const status = e?.response?.status ?? 0;
    const msg =
      e?.response?.data?.message ??
      (status === 400
        ? "잘못된 요청입니다."
        : status === 401
        ? "인증이 필요합니다."
        : status === 403
        ? "권한이 없습니다."
        : status === 404
        ? "엔드포인트를 찾을 수 없습니다. (베이스URL/프리픽스 확인)"
        : "알 수 없는 오류가 발생했어요.");
    if (import.meta.env.DEV) {
      console.error("[settingsAPI] createSetting error:", {
        status,
        msg,
        data: e?.response?.data,
      });
    }
    throw new ApiError(status, msg);
  }
}

export async function fetchSettings(): Promise<Setting[]> {
  try {
    const { data } = await http.get("/settings");
    const list: any[] = Array.isArray(data?.settings) ? data.settings : [];

    return list.map((it) => {
      const out: Setting = {
        ...(it ?? {}),
        id: it?.id ?? it?._id,
        url_list: Array.isArray(it?.url_list) ? it.url_list : [],
        filter_keywords: Array.isArray(it?.filter_keywords)
          ? it.filter_keywords
          : [],
        messages: Array.isArray(it?.messages) ? it.messages : [],
      };
      return out;
    });
  } catch (e: any) {
    const status = e?.response?.status ?? 0;
    const msg =
      e?.response?.data?.message ??
      (status === 401
        ? "토큰이 필요합니다."
        : status === 403
        ? "유효하지 않은 AccessToken"
        : status === 500
        ? "알림 설정 조회 중 오류가 발생했습니다."
        : "알 수 없는 오류가 발생했어요.");
    throw new ApiError(status, msg);
  }
}
