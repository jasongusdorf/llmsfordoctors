import { useState } from 'preact/hooks';

interface Video {
  title: string;
  url: string;
  channel: string;
  summary: string;
  category: string;
  llm: string[];
  topic: string[];
  priority: number;
  dateAdded: string;
}

interface Props {
  videos: Video[];
}

type SortKey = 'date' | 'priority' | 'alpha';

function PriorityStars({ priority }: { priority: number }) {
  return (
    <span class="shrink-0" aria-label={`Priority ${priority} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          class={star <= priority ? 'text-amber-400' : 'text-clinical-200 dark:text-clinical-700'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function VideoList({ videos }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('priority');

  const sorted = [...videos].sort((a, b) => {
    if (sortKey === 'date') {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
    if (sortKey === 'priority') {
      return b.priority - a.priority;
    }
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  });

  return (
    <div>
      {/* Sort controls */}
      <div class="flex gap-2 mb-6">
        {([
          ['date', 'Date Added'],
          ['priority', 'Priority'],
          ['alpha', 'A–Z'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            class={[
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              sortKey === key
                ? 'bg-blue-600 text-white'
                : 'bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 hover:bg-clinical-200 dark:hover:bg-clinical-600',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Video list */}
      <ul class="space-y-4">
        {sorted.map((video) => (
          <li
            key={video.url}
            class="p-4 rounded-lg border border-clinical-200 dark:border-clinical-700 bg-warm-white dark:bg-clinical-800"
          >
            <div class="flex items-start gap-3">
              <PriorityStars priority={video.priority} />
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h2 class="font-semibold text-clinical-900 dark:text-clinical-50">
                    {video.title}
                  </h2>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    YouTube
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <p class="text-sm text-clinical-600 dark:text-clinical-400 mt-1">
                  {video.summary}
                </p>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {video.category}
                  </span>
                  {video.llm.map((l) => (
                    <span
                      key={l}
                      class="px-2 py-0.5 rounded text-xs bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300"
                    >
                      {l}
                    </span>
                  ))}
                  {video.topic.map((t) => (
                    <span
                      key={t}
                      class="px-2 py-0.5 rounded text-xs bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300"
                    >
                      {t}
                    </span>
                  ))}
                  <span class="text-xs text-clinical-400 dark:text-clinical-500 ml-auto">
                    {video.channel} · {new Date(video.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
