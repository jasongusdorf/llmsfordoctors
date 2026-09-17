import { useMemo, useState } from 'preact/hooks';

export type CardiologyMedia = {
  id:string; title:string; description:string; modality:string; src:string; sourcePage:string;
  creator:string; license:string; licenseUrl:string; changes:string; width?:number; height?:number; mime:string;
  mediaKind?:string; poster?:string;
};

export default function CardiologyMediaLibrary({items}:{items:CardiologyMedia[]}) {
  const [modality,setModality]=useState('All');
  const [query,setQuery]=useState('');
  const [active,setActive]=useState<CardiologyMedia|null>(null);
  const modalities=['All',...new Set(items.map(item=>item.modality))];
  const filtered=useMemo(()=>items.filter(item=>(modality==='All'||item.modality===modality)&&(!query||`${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()))),[items,modality,query]);
  return <div>
    <div class="grid gap-3 rounded-2xl border border-clinical-200 bg-warm-white p-4 dark:border-clinical-700 dark:bg-clinical-800 sm:grid-cols-[1fr_auto]">
      <label class="sr-only" for="media-search">Search cardiac media</label>
      <input id="media-search" type="search" value={query} onInput={event=>setQuery(event.currentTarget.value)} placeholder="Search anatomy, diagnosis, view, or modality" class="rounded-lg border border-clinical-300 bg-white px-4 py-2.5 dark:border-clinical-600 dark:bg-clinical-900" />
      <p class="self-center text-sm tabular-nums text-clinical-500">{filtered.length} of {items.length} assets</p>
    </div>
    <div class="mt-4 flex flex-wrap gap-2">{modalities.map(item=><button onClick={()=>setModality(item)} class={`rounded-full border px-3 py-1.5 text-sm ${modality===item?'border-red-700 bg-red-50 text-red-900 dark:border-red-400 dark:bg-red-950/30 dark:text-red-100':'border-clinical-300 dark:border-clinical-600'}`}>{item}</button>)}</div>
    <div class="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">{filtered.map(item=><button onClick={()=>setActive(item)} class="mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-clinical-200 bg-warm-white text-left transition hover:-translate-y-0.5 hover:border-red-500 hover:shadow-md dark:border-clinical-700 dark:bg-clinical-800">
      <span class="relative block">{item.mediaKind==='video'?<><img src={item.poster} alt="" loading="lazy" decoding="async" class="h-auto w-full bg-black object-contain"/><span class="absolute inset-0 grid place-items-center"><span class="rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white">▶ Cine loop</span></span></>:<img src={item.src} alt={item.description || item.title} loading="lazy" decoding="async" width={item.width} height={item.height} class="h-auto w-full bg-black/5 object-contain" />}</span>
      <span class="block p-4"><span class="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">{item.modality} · {item.mediaKind==='video'?'Video · ':''}{item.license}</span><span class="mt-1 block font-heading text-lg font-semibold">{item.title}</span><span class="mt-2 line-clamp-3 block text-sm leading-6 text-clinical-600 dark:text-clinical-300">{item.description}</span></span>
    </button>)}</div>
    {active&&<div role="dialog" aria-modal="true" aria-labelledby="media-dialog-title" class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/85 p-3 sm:p-8" onClick={event=>{if(event.currentTarget===event.target)setActive(null)}}>
      <article class="max-h-full w-full max-w-5xl overflow-y-auto rounded-2xl bg-warm-white shadow-2xl dark:bg-clinical-900"><div class="flex justify-end p-3"><button onClick={()=>setActive(null)} class="rounded-full border border-clinical-300 px-3 py-1 text-sm">Close</button></div>{active.mediaKind==='video'?<video src={active.src} poster={active.poster} controls autoPlay muted loop playsInline class="mx-auto max-h-[65vh] w-full bg-black object-contain">Your browser does not support this video.</video>:<img src={active.src} alt={active.description||active.title} class="mx-auto max-h-[65vh] w-auto max-w-full object-contain"/>}<div class="p-5 sm:p-7"><p class="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">{active.modality}{active.mediaKind==='video'?' · Cine loop':''}</p><h2 id="media-dialog-title" class="mt-1 font-heading text-2xl font-bold">{active.title}</h2><p class="mt-3 leading-7 text-clinical-600 dark:text-clinical-300">{active.description}</p><div class="mt-5 rounded-lg border border-clinical-200 p-4 text-sm leading-6 dark:border-clinical-700"><p><strong>Creator:</strong> {active.creator}</p><p><strong>License:</strong> <a href={active.licenseUrl} class="underline">{active.license}</a></p><p><strong>Changes:</strong> {active.changes}</p><p><a href={active.sourcePage} class="font-semibold text-red-700 underline dark:text-red-300">Original file and complete attribution →</a></p></div></div></article>
    </div>}
  </div>
}
