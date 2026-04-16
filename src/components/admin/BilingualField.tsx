"use client";
import { useState, ReactNode } from "react";

interface BilingualFieldProps {
  label: string;
  description?: string;
  nameEn: string;
  nameBn: string;
  valueEn: string;
  valueBn: string;
  onChange: (name: string, value: string) => void;
  type?: "input" | "textarea" | "url";
  placeholder?: string;
  placeholderBn?: string;
  rows?: number;
  required?: boolean;
}

export function BilingualField({
  label, description, nameEn, nameBn, valueEn, valueBn,
  onChange, type = "input", placeholder, placeholderBn, rows = 3, required,
}: BilingualFieldProps) {
  const [tab, setTab] = useState<"en" | "bn">("en");

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/50 transition-colors resize-none";

  const renderInput = (name: string, value: string, ph?: string, isBn?: boolean) => {
    const props = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(name, e.target.value),
      placeholder: ph,
      className: inputClass + (isBn ? " font-[Noto_Serif_Bengali,serif]" : ""),
      lang: isBn ? "bn" : "en",
      required: required && !isBn,
    };
    if (type === "textarea") return <textarea rows={rows} {...props} />;
    return <input type={type === "url" ? "url" : "text"} {...props} />;
  };

  return (
    <div className="py-3 border-b border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-white">{label}{required && <span className="text-red-400 ml-1">*</span>}</p>
          {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
        </div>
        {/* EN / BN tabs */}
        <div className="flex rounded-lg overflow-hidden border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setTab("en")}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              tab === "en" ? "bg-red-500 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            EN{valueEn ? " ✓" : ""}
          </button>
          <button
            type="button"
            onClick={() => setTab("bn")}
            className={`px-3 py-1 text-xs font-semibold transition-colors border-l border-white/10 ${
              tab === "bn" ? "bg-red-500 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            BN{valueBn ? " ✓" : ""}
          </button>
        </div>
      </div>

      {tab === "en"
        ? renderInput(nameEn, valueEn, placeholder ?? `English ${label.toLowerCase()}...`, false)
        : renderInput(nameBn, valueBn, placeholderBn ?? `বাংলা ${label.toLowerCase()}...`, true)}

      {/* Status hints */}
      {valueEn && valueBn && (
        <div className="flex items-center gap-3 mt-1">
          <p className="text-[10px] text-green-400/70">
            ✓ <span className="text-white/50">EN users see</span> English
            &nbsp;·&nbsp;
            <span className="text-white/50">BN users see</span> বাংলা
          </p>
        </div>
      )}
      {valueEn && !valueBn && (
        <p className="text-[10px] text-yellow-400/50 mt-1">
          Only English — EN users see English · BN users see English (no Bangla added)
        </p>
      )}
      {!valueEn && valueBn && (
        <p className="text-[10px] text-blue-400/50 mt-1">
          Only Bangla — BN users see বাংলা · EN users see Bangla (no English added)
        </p>
      )}
      {!valueEn && !valueBn && (
        <p className="text-[10px] text-white/20 mt-1">
          Empty — add English, Bangla, or both
        </p>
      )}
    </div>
  );
}

/** Simple bilingual wrapper for the admin settings page fields */
export function BilingualSettingField({
  label, description, nameEn, nameBn, valueEn, valueBn, onChange,
  type = "input", placeholder, placeholderBn,
}: BilingualFieldProps) {
  return (
    <BilingualField
      label={label} description={description}
      nameEn={nameEn} nameBn={nameBn}
      valueEn={valueEn} valueBn={valueBn}
      onChange={onChange} type={type}
      placeholder={placeholder} placeholderBn={placeholderBn}
    />
  );
}
