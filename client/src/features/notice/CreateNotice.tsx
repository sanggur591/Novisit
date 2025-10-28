// src/features/notice/CreateNotice.tsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../../../public/assets/style/_flex.scss";
import "../../../public/assets/style/_typography.scss";
import "./NoticeSetting.scss";
import { FiPlus } from "react-icons/fi";
import { useAuth } from "../../auth";

// ❗ 파일명이 settingsAPI.ts(복수형)인지 꼭 확인!
import { createSetting, ApiError, Setting } from "../../api/settingsAPI";

export type Channel = "kakao" | "discord" | "email" | "sms";

export type NoticeItemShape = {
  id: string;
  title: string;
  tags: { label: string }[];
  channel: Channel;
  channelLabel: string;
  date: string;
  link?: string;
};

interface CreateNoticeProps {
  onCreated: (item: NoticeItemShape) => void;
}

const CreateNotice: React.FC<CreateNoticeProps> = ({ onCreated }) => {
  const { logout } = (useAuth() as any) ?? {};

  // 모달/폼 상태
  const [open, setOpen] = useState(false);
  const [domainId, setDomainId] = useState("");
  const [name, setName] = useState("공지 알림");
  const [urlText, setUrlText] = useState("https://example.com/news");
  const [keywordText, setKeywordText] = useState("공지, 업데이트");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ESC 닫기 + 스크롤 잠금 (SSR 가드 포함)
  useEffect(() => {
    if (!open) return;
    if (typeof document === "undefined") return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 문자열 → 리스트 파서
  const parseList = (text: string) =>
    text
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);

  // Setting → 카드 데이터 (id/_id 모두 대응)
  const toNoticeItem = (s: Setting): NoticeItemShape => ({
    id: String(
      (s as any)._id ?? (s as any).id ?? crypto.randomUUID?.() ?? Date.now()
    ),
    title: s.name,
    tags: (s.filter_keywords ?? []).map((k) => ({ label: k })),
    channel: "kakao", // 서버 스펙에 채널 없음 → 임시 표기
    channelLabel: "카카오톡",
    date: new Date().toLocaleDateString("ko-KR"),
    link: s.url_list?.[0],
  });

  const canSubmit = !!domainId.trim() && !!name.trim() && !loading;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setBanner(null);

    const payload = {
      domain_id: domainId.trim(),
      name: name.trim(),
      url_list: parseList(urlText),
      filter_keywords: parseList(keywordText),
    };

    if (!payload.domain_id || !payload.name) {
      setBanner({ type: "error", text: "domain_id와 name은 필수입니다." });
      return;
    }

    try {
      setLoading(true);
      if (import.meta.env.DEV) {
        console.log("[CreateNotice] submit payload =", payload);
      }

      const setting = await createSetting(payload);
      onCreated(toNoticeItem(setting));
      setBanner({ type: "success", text: "알림 설정이 생성되었습니다." });

      // 초기화 & 닫기
      setDomainId("");
      setName("공지 알림");
      setUrlText("");
      setKeywordText("");
      setOpen(false);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const msg = apiErr?.message || "네트워크 오류가 발생했습니다.";
      setBanner({ type: "error", text: msg });
      if (apiErr?.status === 401 || apiErr?.status === 403) {
        logout?.(); // 만료/무효 → 메인으로
      }
      if (import.meta.env.DEV) {
        console.error("[CreateNotice] submit error =", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // 포털 대상(SPA 환경이면 항상 존재) 가드
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <>
      {/* + 버튼 (FAB) */}
      <div className="notice-add-row">
        <button
          type="button"
          className="notice-fab"
          aria-label="알림 설정 추가"
          onClick={() => setOpen(true)}
        >
          <FiPlus size={22} />
        </button>
      </div>

      {/* 모달 */}
      {open &&
        portalTarget &&
        createPortal(
          <div
            className="modal-backdrop"
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
          >
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              aria-labelledby="modal-title"
            >
              <div className="modal__header">
                <div id="modal-title" className="heading3">
                  알림 설정 생성
                </div>
                <button
                  className="modal__close button2"
                  onClick={() => setOpen(false)}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>

              <div className="modal__body">
                {banner && (
                  <div
                    className={`notice-banner ${
                      banner.type === "success"
                        ? "notice-banner--success"
                        : "notice-banner--error"
                    }`}
                    role="alert"
                    style={{ marginBottom: 12 }}
                  >
                    {banner.text}
                  </div>
                )}

                <form className="notice-form" onSubmit={handleSubmit}>
                  <label className="form__label">
                    도메인 ID <span className="req">*</span>
                    <input
                      className="form__input"
                      type="text"
                      placeholder="6710abcd1234ef5678901234"
                      value={domainId}
                      onChange={(e) => setDomainId(e.target.value)}
                      required
                    />
                  </label>

                  <label className="form__label">
                    설정 이름 <span className="req">*</span>
                    <input
                      className="form__input"
                      type="text"
                      placeholder="공지 알림"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>

                  <label className="form__label">
                    URL 목록 (줄바꿈 또는 쉼표)
                    <textarea
                      className="form__textarea"
                      rows={3}
                      placeholder={`https://example.com/news\nhttps://another.com/notice`}
                      value={urlText}
                      onChange={(e) => setUrlText(e.target.value)}
                    />
                  </label>

                  <label className="form__label">
                    필터 키워드 (줄바꿈 또는 쉼표)
                    <textarea
                      className="form__textarea"
                      rows={3}
                      placeholder="공지, 업데이트"
                      value={keywordText}
                      onChange={(e) => setKeywordText(e.target.value)}
                    />
                  </label>

                  <div className="form__actions gap-8">
                    <button
                      className="btn btn--secondary"
                      type="button"
                      onClick={() => setOpen(false)}
                      disabled={loading}
                    >
                      취소
                    </button>
                    <button
                      className="btn btn--primary"
                      type="submit"
                      disabled={!canSubmit}
                    >
                      {loading ? "생성 중…" : "생성"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          portalTarget
        )}
    </>
  );
};

export default CreateNotice;
