"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const COUNTRY_CODES = [
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+91",  country: "India",      flag: "🇮🇳" },
  { code: "+1",   country: "USA",        flag: "🇺🇸" },
  { code: "+44",  country: "UK",         flag: "🇬🇧" },
  { code: "+971", country: "UAE",        flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar",      flag: "🇶🇦" },
  { code: "+965", country: "Kuwait",     flag: "🇰🇼" },
  { code: "+968", country: "Oman",       flag: "🇴🇲" },
  { code: "+973", country: "Bahrain",    flag: "🇧🇭" },
  { code: "+60",  country: "Malaysia",   flag: "🇲🇾" },
  { code: "+65",  country: "Singapore",  flag: "🇸🇬" },
  { code: "+86",  country: "China",      flag: "🇨🇳" },
  { code: "+81",  country: "Japan",      flag: "🇯🇵" },
  { code: "+82",  country: "South Korea", flag: "🇰🇷" },
  { code: "+92",  country: "Pakistan",   flag: "🇵🇰" },
  { code: "+94",  country: "Sri Lanka",  flag: "🇱🇰" },
  { code: "+977", country: "Nepal",      flag: "🇳🇵" },
  { code: "+95",  country: "Myanmar",    flag: "🇲🇲" },
  { code: "+66",  country: "Thailand",   flag: "🇹🇭" },
  { code: "+62",  country: "Indonesia",  flag: "🇮🇩" },
  { code: "+63",  country: "Philippines", flag: "🇵🇭" },
  { code: "+84",  country: "Vietnam",    flag: "🇻🇳" },
  { code: "+49",  country: "Germany",    flag: "🇩🇪" },
  { code: "+33",  country: "France",     flag: "🇫🇷" },
  { code: "+39",  country: "Italy",      flag: "🇮🇹" },
  { code: "+34",  country: "Spain",      flag: "🇪🇸" },
  { code: "+7",   country: "Russia",     flag: "🇷🇺" },
  { code: "+55",  country: "Brazil",     flag: "🇧🇷" },
  { code: "+61",  country: "Australia",  flag: "🇦🇺" },
  { code: "+64",  country: "New Zealand", flag: "🇳🇿" },
  { code: "+20",  country: "Egypt",      flag: "🇪🇬" },
  { code: "+234", country: "Nigeria",    flag: "🇳🇬" },
  { code: "+27",  country: "South Africa", flag: "🇿🇦" },
  { code: "+254", country: "Kenya",      flag: "🇰🇪" },
  { code: "+212", country: "Morocco",    flag: "🇲🇦" },
  { code: "+213", country: "Algeria",    flag: "🇩🇿" },
  { code: "+216", country: "Tunisia",    flag: "🇹🇳" },
  { code: "+98",  country: "Iran",       flag: "🇮🇷" },
  { code: "+90",  country: "Turkey",     flag: "🇹🇷" },
  { code: "+380", country: "Ukraine",    flag: "🇺🇦" },
  { code: "+48",  country: "Poland",     flag: "🇵🇱" },
  { code: "+31",  country: "Netherlands", flag: "🇳🇱" },
  { code: "+32",  country: "Belgium",    flag: "🇧🇪" },
  { code: "+41",  country: "Switzerland", flag: "🇨🇭" },
  { code: "+46",  country: "Sweden",     flag: "🇸🇪" },
  { code: "+47",  country: "Norway",     flag: "🇳🇴" },
  { code: "+45",  country: "Denmark",    flag: "🇩🇰" },
  { code: "+358", country: "Finland",    flag: "🇫🇮" },
  { code: "+43",  country: "Austria",    flag: "🇦🇹" },
  { code: "+351", country: "Portugal",   flag: "🇵🇹" },
  { code: "+30",  country: "Greece",     flag: "🇬🇷" },
  { code: "+1-CA", country: "Canada",   flag: "🇨🇦" },
  { code: "+52",  country: "Mexico",     flag: "🇲🇽" },
  { code: "+54",  country: "Argentina",  flag: "🇦🇷" },
  { code: "+56",  country: "Chile",      flag: "🇨🇱" },
  { code: "+57",  country: "Colombia",   flag: "🇨🇴" },
  { code: "+51",  country: "Peru",       flag: "🇵🇪" },
];

export function CountryCodePicker({
  value,
  onChange,
  testIdPrefix = "",
}: {
  value: string;
  onChange: (val: string) => void;
  testIdPrefix?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = COUNTRY_CODES.find((c) => c.code === value) ?? COUNTRY_CODES[0];
  const filtered = search.trim()
    ? COUNTRY_CODES.filter(
        (c) =>
          c.country.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      )
    : COUNTRY_CODES;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={`${testIdPrefix}button-country-code`}
          className="flex items-center gap-1.5 px-3 h-10 rounded-l-md border border-r-0 border-border bg-muted/50 hover:bg-muted transition-colors text-sm font-medium shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-muted-foreground">{selected.code.replace("-CA", "")}</span>
          <ChevronsUpDown size={12} className="text-muted-foreground ml-0.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country…"
            className="text-sm bg-transparent outline-none w-full placeholder:text-muted-foreground"
            data-testid={`${testIdPrefix}input-country-search`}
            autoFocus
          />
        </div>
        <ScrollArea className="h-56">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No results</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left"
                data-testid={`${testIdPrefix}option-country-${c.code}`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 truncate text-foreground">{c.country}</span>
                <span className="text-muted-foreground text-xs">{c.code.replace("-CA", "")}</span>
                {value === c.code && <Check size={12} className="text-primary shrink-0" />}
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export interface PhoneInputProps {
  dialCode: string;
  onDialCodeChange: (code: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (num: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  testIdPrefix?: string;
  inputClassName?: string;
}

export function PhoneInput({
  dialCode,
  onDialCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  placeholder = "1XXXXXXXXX",
  required,
  maxLength = 20,
  autoComplete = "tel-national",
  testIdPrefix = "",
  inputClassName,
}: PhoneInputProps) {
  return (
    <div className="flex">
      <CountryCodePicker
        value={dialCode}
        onChange={onDialCodeChange}
        testIdPrefix={testIdPrefix}
      />
      <Input
        type="tel"
        value={phoneNumber}
        onChange={(e) => onPhoneNumberChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={cn("rounded-l-none flex-1 min-w-0", inputClassName)}
        data-testid={`${testIdPrefix}input-phone-number`}
      />
    </div>
  );
}
