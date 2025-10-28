// src/features/notice/NoticeSetting.tsx
import React, { useEffect, useMemo, useState } from "react";
import "../../../public/assets/style/_flex.scss";
import "../../../public/assets/style/_typography.scss";
import "./NoticeSetting.scss";
import { FiEdit } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import CreateNotice, { NoticeItemShape } from "./CreateNotice";
import { fetchSettings, Setting } from "../../api/settingsAPI";

type Channel = "kakao" | "discord" | "email" | "sms";

interface Tag {
  label: string;
}

interface NoticeItem {
  id: string;
  title: string;
  tags: Tag[];
  channel: Channel;
  channelLabel: string;
  date: string;
  link?: string;
}

interface NoticeCardProps {
  item: NoticeItem;
  onEdit?: (id: string) => void;
}

/* ===== 유틸 ===== */
const formatKST = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

// Setting → NoticeItem 매핑
const mapSettingToItem = (s: Setting): NoticeItem => {
  const firstMsg =
    Array.isArray(s.messages) && s.messages.length > 0
      ? s.messages[0]
      : undefined;
  const platform = (firstMsg?.platform || "").toLowerCase();

  const channel: Channel =
    platform === "discord" ||
    platform === "email" ||
    platform === "sms" ||
    platform === "kakao"
      ? (platform as Channel)
      : "kakao"; // 기본값

  const channelLabel =
    channel === "discord"
      ? "디스코드"
      : channel === "email"
      ? "이메일"
      : channel === "sms"
      ? "문자"
      : "카카오톡";

  return {
    id: (s.id || s._id || `${Date.now()}`) as string,
    title: s.name,
    tags: (s.filter_keywords ?? []).map((k) => ({ label: k })),
    channel,
    channelLabel,
    date: firstMsg?.sended_at
      ? formatKST(firstMsg.sended_at)
      : new Date().toLocaleDateString("ko-KR"),
    link: s.url_list?.[0],
  };
};

/* ===== Card ===== */
const NoticeCard: React.FC<NoticeCardProps> = ({ item, onEdit }) => {
  return (
    <div className="notice-card">
      <div className="notice-card-header flex-between">
        <div className="notice-card-title body1">{item.title}</div>
        <div>
          <button
            type="button"
            className="notice-card-edit flex-center"
            aria-label={`${item.title} 편집`}
            onClick={() => onEdit?.(item.id)}
          >
            <div className="icon-wrapper">
              <FiEdit size={16} />
            </div>
          </button>
        </div>
      </div>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="notice-card-link"
        >
          {item.link}
        </a>
      )}

      <div className="notice-card-tags">
        {item.tags.map((t, i) => (
          <span className="tag" key={i}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="notice-contour"></div>
      <div className="notice-card-channel body3">
        알림 채널:{" "}
        <span className={`channel ${item.channel}`}>{item.channelLabel}</span>
      </div>

      <div className="notice-card-date button2 flex-row">
        <div className="time-icon">
          <IoMdTime />
        </div>
        {item.date}
      </div>
    </div>
  );
};

/* ===== Main ===== */
const NoticeSetting: React.FC = () => {
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 초기에 서버에서 목록 조회
  useEffect(() => {
    (async () => {
      setLoading(true);
      setBanner(null);
      try {
        const list = await fetchSettings();
        const mapped = list.map(mapSettingToItem);
        setItems(mapped);
      } catch (e: any) {
        setBanner({
          type: "error",
          text: e?.message || "알림 설정을 불러오지 못했습니다.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEdit = (id: string) => {
    console.log("edit:", id);
    // TODO: 편집 모달/페이지 연결
  };

  const handleCreated = (item: NoticeItemShape) => {
    setItems((prev) => [item as unknown as NoticeItem, ...prev]);
  };

  const empty = useMemo(
    () => !loading && items.length === 0,
    [loading, items.length]
  );

  return (
    <div className="notice-setting-container">
      {/* 상단 배너 */}
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

      <div className="notice-title heading3">알림 설정 목록</div>

      {loading && (
        <div className="body3" style={{ padding: "12px 4px" }}>
          불러오는 중…
        </div>
      )}
      {empty && (
        <div className="body3" style={{ padding: "12px 4px" }}>
          알림 설정이 없습니다.
        </div>
      )}

      {!loading &&
        items.map((it) => (
          <NoticeCard key={it.id} item={it} onEdit={handleEdit} />
        ))}

      {/* 생성 모달 트리거 (+ 버튼) */}
      <CreateNotice onCreated={handleCreated} />
    </div>
  );
};

export default NoticeSetting;
