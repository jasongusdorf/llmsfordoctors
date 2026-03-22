const SUFFIXES = [
  'md', 'do', 'phd', 'dds', 'dmd', 'dpm', 'dvm', 'rn', 'np', 'pa',
  'facp', 'facs', 'facog', 'faan', 'facc', 'fasn',
  'jr', 'sr', 'ii', 'iii', 'iv', 'v',
];

/**
 * Compute Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Remove suffixes, punctuation, and normalize to lowercase.
 */
export function stripSuffixes(name: string): string {
  // Remove apostrophes entirely, replace other punctuation with spaces
  let result = name.toLowerCase()
    .replace(/[`']/g, '')         // remove apostrophes entirely (O'Brien → obrien)
    .replace(/[.,\-]/g, ' ')      // commas, periods, hyphens → space
    .replace(/\s+/g, ' ')
    .trim();

  // Repeatedly strip known suffixes from the end
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of SUFFIXES) {
      // Match suffix at end of string, preceded by whitespace
      const pattern = new RegExp(`\\s+${suffix}$`);
      if (pattern.test(result)) {
        result = result.replace(pattern, '').trim();
        changed = true;
      }
    }
  }

  return result.trim();
}

/**
 * Match input name against NPI registry name.
 * Exact match on last name (after stripping), Levenshtein ≤ 2 on first name.
 */
export function matchName(
  inputFirst: string,
  inputLast: string,
  npiFirst: string,
  npiLast: string
): boolean {
  const cleanInputFirst = stripSuffixes(inputFirst);
  const cleanInputLast = stripSuffixes(inputLast);
  const cleanNpiFirst = stripSuffixes(npiFirst);
  const cleanNpiLast = stripSuffixes(npiLast);

  // Exact match on last name
  if (cleanInputLast !== cleanNpiLast) return false;

  // Exact or Levenshtein ≤ 2 on first name
  if (cleanInputFirst === cleanNpiFirst) return true;
  return levenshtein(cleanInputFirst, cleanNpiFirst) <= 2;
}

interface NpiResult {
  valid: boolean;
  error?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Verify NPI number against NPPES API and match provided name.
 */
export async function verifyNpi(
  npiNumber: string,
  inputFirst: string,
  inputLast: string
): Promise<NpiResult> {
  const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${encodeURIComponent(npiNumber)}`;

  let data: {
    result_count?: number;
    results?: Array<{
      enumeration_type?: string;
      basic?: {
        first_name?: string;
        last_name?: string;
      };
    }>;
  };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { valid: false, error: `NPPES API returned status ${response.status}` };
    }
    data = await response.json() as typeof data;
  } catch (err) {
    return { valid: false, error: 'Failed to reach NPPES API' };
  }

  if (!data.result_count || data.result_count === 0 || !data.results?.length) {
    return { valid: false, error: 'NPI not found' };
  }

  const record = data.results[0];

  if (record.enumeration_type !== 'NPI-1') {
    return { valid: false, error: 'NPI is not an individual provider (NPI-1)' };
  }

  const npiFirst = record.basic?.first_name ?? '';
  const npiLast = record.basic?.last_name ?? '';

  if (!matchName(inputFirst, inputLast, npiFirst, npiLast)) {
    return { valid: false, error: 'Name does not match NPI registry' };
  }

  return { valid: true, firstName: npiFirst, lastName: npiLast };
}
