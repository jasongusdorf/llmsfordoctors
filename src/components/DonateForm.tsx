import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';

interface Props {
  stripeKey: string;
}

const PRESET_AMOUNTS = [500, 1000, 2500]; // cents
const PRESET_LABELS = ['$5', '$10', '$25'];

function PaymentForm({
  stripePromise,
  clientSecret,
  amount,
  isRecurring,
}: {
  stripePromise: Promise<Stripe | null>;
  clientSecret: string;
  amount: number;
  isRecurring: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  const label = isRecurring
    ? `Donate $${(amount / 100).toFixed(0)}/month`
    : `Donate $${(amount / 100).toFixed(0)}`;

  useEffect(() => {
    let mounted = true;
    stripePromise.then((s) => {
      if (!s || !mounted || !containerRef.current) return;
      stripeRef.current = s;
      const elements = s.elements({ clientSecret });
      elementsRef.current = elements;
      const paymentElement = elements.create('payment');
      paymentElement.mount(containerRef.current);
      paymentElement.on('ready', () => {
        if (mounted) setReady(true);
      });
    });
    return () => {
      mounted = false;
    };
  }, [clientSecret, stripePromise]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const stripe = stripeRef.current;
    const elements = elementsRef.current;
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/donate?status=complete`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message ?? 'Payment failed');
      setProcessing(false);
    } else {
      setSuccess(true);
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div class="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 text-center">
        <p class="text-green-800 dark:text-green-200 font-semibold text-lg mb-1">
          Thank you for your donation!
        </p>
        <p class="text-green-700 dark:text-green-300 text-sm">
          Your support helps keep LLMs for Doctors free and independent.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div ref={containerRef} />
      {!ready && (
        <p class="text-clinical-500 text-sm">Loading payment form...</p>
      )}
      <button
        type="submit"
        disabled={!ready || processing}
        class="w-full px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-clinical-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {processing ? 'Processing...' : label}
      </button>
      {error && (
        <p class="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
    </form>
  );
}

export default function DonateForm({ stripeKey }: Props) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable reference - loadStripe caches internally, but avoid calling in render body
  const [stripePromise] = useState(() => loadStripe(stripeKey));

  const amountInCents = isCustom
    ? Math.round(parseFloat(customAmount || '0') * 100)
    : selectedPreset;

  const isValidAmount = amountInCents !== null && amountInCents >= 100 && amountInCents <= 1000000;

  const handleContinue = useCallback(() => {
    if (!isValidAmount || !amountInCents) return;

    // Debounce: 300ms to prevent double-clicks creating orphaned intents
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setClientSecret(null);

      const endpoint = isRecurring ? '/api/create-subscription' : '/api/create-payment-intent';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountInCents, currency: 'usd' }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Something went wrong');
          setLoading(false);
          return;
        }

        setClientSecret(data.clientSecret);
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [amountInCents, isRecurring, isValidAmount]);

  const handlePreset = (amount: number) => {
    setSelectedPreset(amount);
    setIsCustom(false);
    setClientSecret(null);
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    setSelectedPreset(null);
    setClientSecret(null);
  };

  const handleFrequencyChange = (recurring: boolean) => {
    setIsRecurring(recurring);
    setClientSecret(null);
  };

  // Check for return from Stripe redirect (evaluated once on mount)
  const [isReturnFromStripe] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('status') === 'complete';
  });

  if (isReturnFromStripe) {
    return (
      <div class="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 text-center">
        <p class="text-green-800 dark:text-green-200 font-semibold text-lg mb-1">
          Thank you for your donation!
        </p>
        <p class="text-green-700 dark:text-green-300 text-sm">
          Your support helps keep LLMs for Doctors free and independent.
        </p>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Frequency toggle */}
      <div class="flex rounded-md overflow-hidden border border-clinical-300 dark:border-clinical-600 w-fit">
        <button
          type="button"
          onClick={() => handleFrequencyChange(false)}
          class={`px-4 py-2 text-sm font-medium transition-colors ${
            !isRecurring
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-clinical-800 text-clinical-700 dark:text-clinical-300 hover:bg-clinical-50 dark:hover:bg-clinical-700'
          }`}
        >
          One-time
        </button>
        <button
          type="button"
          onClick={() => handleFrequencyChange(true)}
          class={`px-4 py-2 text-sm font-medium transition-colors ${
            isRecurring
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-clinical-800 text-clinical-700 dark:text-clinical-300 hover:bg-clinical-50 dark:hover:bg-clinical-700'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Amount selection */}
      <div class="flex flex-wrap gap-2">
        {PRESET_AMOUNTS.map((amount, i) => (
          <button
            key={amount}
            type="button"
            onClick={() => handlePreset(amount)}
            class={`px-5 py-2.5 rounded-md text-sm font-semibold transition-colors border ${
              selectedPreset === amount && !isCustom
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-clinical-800 text-clinical-700 dark:text-clinical-300 border-clinical-300 dark:border-clinical-600 hover:border-blue-400'
            }`}
          >
            {PRESET_LABELS[i]}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCustomToggle}
          class={`px-5 py-2.5 rounded-md text-sm font-semibold transition-colors border ${
            isCustom
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-clinical-800 text-clinical-700 dark:text-clinical-300 border-clinical-300 dark:border-clinical-600 hover:border-blue-400'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Custom amount input */}
      {isCustom && (
        <div class="flex items-center gap-2">
          <span class="text-clinical-600 dark:text-clinical-400 font-medium">$</span>
          <input
            type="number"
            min="1"
            max="10000"
            step="1"
            value={customAmount}
            onInput={(e) => {
              setCustomAmount((e.target as HTMLInputElement).value);
              setClientSecret(null);
            }}
            placeholder="Enter amount"
            class="w-32 rounded-md border border-clinical-300 dark:border-clinical-600 bg-white dark:bg-clinical-800 px-3 py-2 text-clinical-900 dark:text-clinical-100 placeholder-clinical-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {/* Continue to payment */}
      {!clientSecret && (
        <>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isValidAmount || loading}
            class="px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-clinical-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Loading...' : 'Continue to payment'}
          </button>
          {error && (
            <p class="text-red-600 dark:text-red-400 text-sm">{error}</p>
          )}
        </>
      )}

      {/* Stripe Payment Element */}
      {clientSecret && amountInCents && (
        <PaymentForm
          stripePromise={stripePromise}
          clientSecret={clientSecret}
          amount={amountInCents}
          isRecurring={isRecurring}
        />
      )}
    </div>
  );
}
