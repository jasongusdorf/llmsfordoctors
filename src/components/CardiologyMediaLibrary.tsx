import { useMemo, useState } from 'preact/hooks';
import type { CardiologyMedia } from '../lib/cardiology-media';
export type { CardiologyMedia } from '../lib/cardiology-media';

export default function CardiologyMediaLibrary({items}:{items:CardiologyMedia[]}) {
  const [modality,setModality]=useState('All');
  const [query,setQuery]=useState('');
  const modalities=['All',...new Set(items.map(item=>item.modality))];
  const filtered=useMemo(()=>items.filter(item=>(modality==='All'||item.modality===modality)&&(!query||`${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()))),[items,modality,query]);
  return <div>
    <div class="grid gap-3 rounded-2xl border border-clinical-200 bg-warm-white p-4 dark:border-clinical-700 dark:bg-clinical-800 sm:grid-cols-[1fr_auto]">
      <label class="sr-only" for="media-search">Search cardiac media</label>
      <input id="media-search" type="search" value={query} onInput={event=>setQuery(event.currentTarget.value)} placeholder="Search anatomy, diagnosis, view, or modality" class="rounded-lg border border-clinical-300 bg-white px-4 py-2.5 dark:border-clinical-600 dark:bg-clinical-900" />
      <p class="self-center text-sm tabular-nums text-clinical-500">{filtered.length} of {items.length} assets</p>
    </div>
    <div class="mt-4 flex flex-wrap gap-2">{modalities.map(item=><button onClick={()=>setModality(item)} class={`rounded-full border px-3 py-1.5 text-sm ${modality===item?'border-red-700 bg-red-50 text-red-900 dark:border-red-400 dark:bg-red-950/30 dark:text-red-100':'border-clinical-300 dark:border-clinical-600'}`}>{item}</button>)}</div>
    <div class="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">{filtered.map(item=><a href={`/education/cardiology/media/${item.id}`} class="mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-clinical-200 bg-warm-white text-left transition hover:-translate-y-0.5 hover:border-red-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 dark:border-clinical-700 dark:bg-clinical-800">
      <span class="relative block">{item.mediaKind==='video'?<><img src={item.poster} alt="" loading="lazy" decoding="async" class="h-auto w-full bg-black object-contain"/><span class="absolute inset-0 grid place-items-center"><span class="rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white">▶ Cine loop</span></span></>:<img src={item.src} alt={item.description || item.title} loading="lazy" decoding="async" width={item.width} height={item.height} class="h-auto w-full bg-black/5 object-contain" />}</span>
      <span class="block p-4"><span class="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">{item.modality} · {item.mediaKind==='video'?'Video · ':''}{item.license}</span><span class="mt-1 block font-heading text-lg font-semibold">{item.title}</span><span class="mt-2 line-clamp-3 block text-sm leading-6 text-clinical-600 dark:text-clinical-300">{item.description}</span><span class="mt-3 block text-sm font-semibold text-red-700 dark:text-red-300">Open study and interpretation →</span></span>
    </a>)}</div>
  </div>
}
