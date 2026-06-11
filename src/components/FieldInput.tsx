import { useState } from 'preact/hooks';
import { fieldKindFor } from '../lib/field-config';

interface Props {
  collection: string;
  k: string;
  v: unknown;
  isCreate: boolean;
  onChange: (value: unknown) => void;
}

const inputCls = 'w-full rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm';
const labelCls = 'block text-clinical-500 mb-1';

export default function FieldInput({ collection, k, v, isCreate, onChange }: Props) {
  const cfg = fieldKindFor(collection, k);

  if (cfg?.kind === 'readonly' && !isCreate) {
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <input class={`${inputCls} opacity-60`} value={String(v ?? '')} readOnly disabled />
      </label>
    );
  }
  if (cfg?.kind === 'readonly' && isCreate) {
    // Slug is synced from the web-address field at publish time; hide it here.
    return null;
  }

  if (cfg?.kind === 'stars') {
    const current = typeof v === 'number' ? v : 0;
    return (
      <div class="text-sm">
        <span class={labelCls}>{k}</span>
        <div class="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" aria-label={`${star} stars`}
              class={`text-2xl leading-none ${star <= current ? 'text-amber-400' : 'text-clinical-300'}`}
              onClick={() => onChange(star)}>
              ★
            </button>
          ))}
          <button type="button" class="ml-2 text-xs text-clinical-400 underline" onClick={() => onChange(0)}>
            set 0 (warning)
          </button>
          <span class="ml-2 text-xs text-clinical-500">{current}/5</span>
        </div>
      </div>
    );
  }

  if (cfg?.kind === 'chips-enum') {
    const selected = Array.isArray(v) ? (v as string[]) : [];
    const toggle = (opt: string) =>
      onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
    return (
      <div class="text-sm">
        <span class={labelCls}>{k}</span>
        <div class="flex flex-wrap gap-1">
          {cfg.options.map((opt) => (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              class={`px-2 py-0.5 rounded-full text-xs border ${selected.includes(opt)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-clinical-300 dark:border-clinical-600 text-clinical-500'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (cfg?.kind === 'chips') {
    const selected = Array.isArray(v) ? (v as string[]) : [];
    return <ChipsInput k={k} selected={selected} onChange={onChange} />;
  }

  if (cfg?.kind === 'select') {
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <select class={inputCls} value={String(v ?? '')}
          onInput={(e) => onChange((e.target as HTMLSelectElement).value)}>
          <option value="" disabled>choose...</option>
          {cfg.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </label>
    );
  }

  if (cfg?.kind === 'textarea') {
    const text = v == null ? '' : String(v);
    return (
      <label class="text-sm">
        <span class={labelCls}>{k} <span class="text-xs text-clinical-400">({text.length} chars)</span></span>
        <textarea class={`${inputCls} h-20`} value={text}
          onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)} />
      </label>
    );
  }

  if (cfg?.kind === 'date') {
    const display = v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? '').slice(0, 10);
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <input type="date" class={inputCls} value={display}
          onInput={(e) => onChange((e.target as HTMLInputElement).value)} />
      </label>
    );
  }

  if (cfg?.kind === 'number') {
    const n = typeof v === 'number' ? v : 0;
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <input type="number" class={inputCls} min={cfg.min} max={cfg.max} step={1} value={String(n)}
          onInput={(e) => {
            const parsed = Number((e.target as HTMLInputElement).value);
            if (Number.isNaN(parsed)) return;
            const clamped = Math.round(Math.min(cfg.max ?? Infinity, Math.max(cfg.min ?? -Infinity, parsed)));
            onChange(clamped);
          }} />
        {cfg.help && <span class="block text-xs text-clinical-400 mt-0.5">{cfg.help}</span>}
      </label>
    );
  }

  // Fallback: legacy type-inferred rendering for unknown fields.
  if (typeof v === 'boolean') {
    return (
      <label class="text-sm flex items-center gap-2 py-1">
        <input type="checkbox" checked={v} onInput={(e) => onChange((e.target as HTMLInputElement).checked)} />
        <span class="text-clinical-500">{k}</span>
      </label>
    );
  }
  if (typeof v === 'number') {
    return (
      <label class="text-sm">
        <span class={labelCls}>{k}</span>
        <input type="number" class={inputCls} value={String(v)}
          onInput={(e) => {
            const n = Number((e.target as HTMLInputElement).value);
            onChange(Number.isNaN(n) ? v : n);
          }} />
      </label>
    );
  }
  if (Array.isArray(v)) {
    return <ChipsInput k={k} selected={v as string[]} onChange={onChange} />;
  }
  const display = v instanceof Date ? v.toISOString().slice(0, 10) : (v == null ? '' : String(v));
  return (
    <label class="text-sm">
      <span class={labelCls}>{k}</span>
      <input class={inputCls} value={display}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)} />
    </label>
  );
}

function ChipsInput({ k, selected, onChange }: { k: string; selected: string[]; onChange: (v: unknown) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (t && !selected.includes(t)) onChange([...selected, t]);
    setDraft('');
  };
  return (
    <div class="text-sm">
      <span class={labelCls}>{k}</span>
      <div class="flex flex-wrap items-center gap-1">
        {selected.map((s) => (
          <button key={s} type="button" title="Remove"
            class="px-2 py-0.5 rounded-full text-xs bg-clinical-100 dark:bg-clinical-700 border border-clinical-300 dark:border-clinical-600"
            onClick={() => onChange(selected.filter((x) => x !== s))}>
            {s} ✕
          </button>
        ))}
        <input class={`${inputCls} !w-32`} placeholder="add + Enter" value={draft}
          onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          onBlur={add} />
      </div>
    </div>
  );
}
