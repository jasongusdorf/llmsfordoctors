type Rating = 'strong' | 'adequate' | 'weak';

interface PerformanceMatrixProps {
  tasks: string[];
  models: string[];
  ratings: Record<string, Record<string, Rating>>;
}

function ratingCell(rating: Rating | undefined) {
  if (!rating) {
    return {
      label: '-',
      cellClass: 'bg-clinical-50 text-clinical-400',
      textClass: '',
    };
  }

  switch (rating) {
    case 'strong':
      return {
        label: 'Strong',
        cellClass: 'bg-green-50 text-green-800',
        textClass: 'font-bold',
      };
    case 'adequate':
      return {
        label: 'Adequate',
        cellClass: 'bg-clinical-50 text-clinical-700',
        textClass: '',
      };
    case 'weak':
      return {
        label: 'Weak',
        cellClass: 'bg-red-50 text-red-700',
        textClass: '',
      };
  }
}

export default function PerformanceMatrix({ tasks, models, ratings }: PerformanceMatrixProps) {
  return (
    <div class="overflow-x-auto rounded-lg border border-clinical-200 w-full">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-clinical-800 text-clinical-100">
          <tr>
            <th class="text-left px-4 py-3 font-semibold">Task</th>
            {models.map((model) => (
              <th key={model} class="text-center px-4 py-3 font-semibold">
                {model}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => (
            <tr key={task} class={i % 2 === 0 ? 'bg-warm-white' : 'bg-clinical-50'}>
              <td class="px-4 py-3 font-medium text-clinical-800 whitespace-nowrap">
                {task}
              </td>
              {models.map((model) => {
                const rating = ratings[task]?.[model];
                const { label, cellClass, textClass } = ratingCell(rating);
                return (
                  <td key={model} class="px-4 py-3 text-center">
                    <span
                      class={[
                        'inline-block px-2 py-0.5 rounded text-xs',
                        cellClass,
                        textClass,
                      ].join(' ')}
                    >
                      {label}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
