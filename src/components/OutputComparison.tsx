import { useState } from 'preact/hooks';

interface Output {
  model: string;
  dateTested: string;
  content: string;
  commentary?: string;
}

interface Props {
  prompt: string;
  outputs: Output[];
}

export default function OutputComparison({ prompt, outputs }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  if (!outputs || outputs.length === 0) {
    return <p class="text-clinical-500">No outputs available.</p>;
  }

  const active = outputs[activeTab];

  return (
    <div class="border border-clinical-200 rounded-lg overflow-hidden">
      {/* Prompt header */}
      <div class="bg-clinical-100 px-4 py-3 border-b border-clinical-200">
        <p class="text-xs font-semibold text-clinical-500 uppercase tracking-wide mb-1">Prompt</p>
        <p class="text-sm text-clinical-700 italic">{prompt}</p>
      </div>

      {/* Tab bar */}
      <div class="flex border-b border-clinical-200 bg-clinical-50 overflow-x-auto">
        {outputs.map((output, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            class={[
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === i
                ? 'border-b-2 border-blue-500 text-blue-600 bg-warm-white'
                : 'text-clinical-500 hover:text-clinical-700 hover:bg-clinical-100',
            ].join(' ')}
          >
            {output.model}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div class="p-4 bg-warm-white">
        <div class="mb-3">
          <span class="text-xs text-clinical-400">Tested: {active.dateTested}</span>
        </div>

        <div class="prose prose-sm max-w-none text-clinical-800 whitespace-pre-wrap font-mono text-sm bg-clinical-50 rounded p-3 border border-clinical-100">
          {active.content}
        </div>

        {active.commentary && (
          <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p class="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Commentary</p>
            <p class="text-sm text-blue-800">{active.commentary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
