"use client";

import { useState } from "react";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Truck,
  FileText,
  AlertTriangle,
  Megaphone,
  Loader2,
  Check,
} from "lucide-react";

interface SettingsFormProps {
  initial: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}

interface FieldDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  type: "text" | "number" | "toggle" | "textarea";
  placeholder?: string;
  description?: string;
}

const fields: FieldDef[] = [
  {
    key: "siteName",
    label: "사이트명",
    icon: <Store size={14} />,
    type: "text",
    placeholder: "Bunny Shop",
  },
  {
    key: "siteDescription",
    label: "사이트 설명",
    icon: <FileText size={14} />,
    type: "text",
    placeholder: "사이트에 대한 간단한 설명",
  },
  {
    key: "contactEmail",
    label: "이메일",
    icon: <Mail size={14} />,
    type: "text",
    placeholder: "contact@example.com",
  },
  {
    key: "contactPhone",
    label: "전화번호",
    icon: <Phone size={14} />,
    type: "text",
    placeholder: "02-1234-5678",
  },
  {
    key: "contactAddress",
    label: "주소",
    icon: <MapPin size={14} />,
    type: "text",
    placeholder: "서울특별시 강남구",
  },
  {
    key: "freeShippingThreshold",
    label: "무료배송 기준 금액",
    icon: <Truck size={14} />,
    type: "number",
    placeholder: "30000",
    description: "이 금액 이상 구매 시 무료배송",
  },
  {
    key: "footerCopyright",
    label: "저작권 문구",
    icon: <FileText size={14} />,
    type: "text",
    placeholder: "© 2026 Bunny Shop",
  },
  {
    key: "announcement",
    label: "공지 배너",
    icon: <Megaphone size={14} />,
    type: "textarea",
    placeholder: "상단에 표시할 공지사항 (비우면 미표시)",
    description: "사이트 상단에 노출되는 공지 배너",
  },
  {
    key: "maintenanceMode",
    label: "점검 모드",
    icon: <AlertTriangle size={14} />,
    type: "toggle",
    description: "활성화 시 사이트 접근이 제한됩니다",
  },
];

export default function SettingsForm({ initial, onSave }: SettingsFormProps) {
  const [form, setForm] = useState<Record<string, unknown>>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const success = await onSave(form);
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initial);

  return (
    <div className="space-y-6">
      {/* Settings Groups */}
      <div className="space-y-4">
        {fields.map((field) => (
          <div
            key={field.key}
            className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-white/30 mt-1 flex-shrink-0">{field.icon}</span>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-white/60 block mb-1">
                  {field.label}
                </label>
                {field.description && (
                  <p className="text-[10px] text-white/25 mb-2">{field.description}</p>
                )}

                {field.type === "text" && (
                  <input
                    type="text"
                    value={String(form[field.key] || "")}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors"
                  />
                )}

                {field.type === "number" && (
                  <input
                    type="number"
                    value={Number(form[field.key] || 0)}
                    onChange={(e) => handleChange(field.key, parseInt(e.target.value) || 0)}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors"
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    value={String(form[field.key] || "")}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors resize-none"
                  />
                )}

                {field.type === "toggle" && (
                  <button
                    onClick={() => handleChange(field.key, !form[field.key])}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form[field.key]
                        ? "bg-violet-500"
                        : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        form[field.key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-[#0d0d0f] py-4 border-t border-white/5 -mx-6 px-6">
        <button
          onClick={handleSubmit}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm text-white font-medium transition-all disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/20"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saved ? (
            <Check size={14} />
          ) : null}
          {saving ? "저장 중..." : saved ? "저장 완료" : "설정 저장"}
        </button>
        {hasChanges && !saving && !saved && (
          <span className="text-[10px] text-amber-400/60">변경사항이 있습니다</span>
        )}
      </div>
    </div>
  );
}
