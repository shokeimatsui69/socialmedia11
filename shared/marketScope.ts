export type MarketContinent =
  | 'africa'
  | 'asia'
  | 'europe'
  | 'north_america'
  | 'south_america'
  | 'oceania';

export interface CompetitorMarketFilter {
  continents?: MarketContinent[];
  countries?: string[];
}

export interface MarketContinentOption {
  id: MarketContinent;
  label: string;
  aliases?: string[];
}

export interface MarketCountryOption {
  value: string;
  label: string;
  continent: MarketContinent;
  aliases?: string[];
}

export const MARKET_CONTINENT_OPTIONS: MarketContinentOption[] = [
  { id: 'europe', label: 'Europe', aliases: ['eu'] },
  { id: 'north_america', label: 'North America', aliases: ['north us', 'north_us', 'north america', 'usa region'] },
  { id: 'south_america', label: 'South America', aliases: ['south us', 'south_us', 'south america', 'latin america'] },
  { id: 'asia', label: 'Asia' },
  { id: 'africa', label: 'Africa' },
  { id: 'oceania', label: 'Australia / Oceania', aliases: ['australia', 'oceania', 'australia oceania'] },
];

export const MARKET_COUNTRY_OPTIONS: MarketCountryOption[] = [
  { value: 'Serbia', label: 'Serbia', continent: 'europe' },
  { value: 'Hungary', label: 'Hungary', continent: 'europe' },
  { value: 'Austria', label: 'Austria', continent: 'europe' },
  { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina', continent: 'europe', aliases: ['Bosnia'] },
  { value: 'Bulgaria', label: 'Bulgaria', continent: 'europe' },
  { value: 'Croatia', label: 'Croatia', continent: 'europe' },
  { value: 'Czechia', label: 'Czechia', continent: 'europe', aliases: ['Czech Republic'] },
  { value: 'Denmark', label: 'Denmark', continent: 'europe' },
  { value: 'Finland', label: 'Finland', continent: 'europe' },
  { value: 'France', label: 'France', continent: 'europe' },
  { value: 'Germany', label: 'Germany', continent: 'europe' },
  { value: 'Greece', label: 'Greece', continent: 'europe' },
  { value: 'Ireland', label: 'Ireland', continent: 'europe' },
  { value: 'Italy', label: 'Italy', continent: 'europe' },
  { value: 'Montenegro', label: 'Montenegro', continent: 'europe' },
  { value: 'Netherlands', label: 'Netherlands', continent: 'europe', aliases: ['Holland'] },
  { value: 'North Macedonia', label: 'North Macedonia', continent: 'europe', aliases: ['Macedonia'] },
  { value: 'Norway', label: 'Norway', continent: 'europe' },
  { value: 'Poland', label: 'Poland', continent: 'europe' },
  { value: 'Portugal', label: 'Portugal', continent: 'europe' },
  { value: 'Romania', label: 'Romania', continent: 'europe' },
  { value: 'Slovakia', label: 'Slovakia', continent: 'europe' },
  { value: 'Slovenia', label: 'Slovenia', continent: 'europe' },
  { value: 'Spain', label: 'Spain', continent: 'europe' },
  { value: 'Sweden', label: 'Sweden', continent: 'europe' },
  { value: 'Switzerland', label: 'Switzerland', continent: 'europe' },
  { value: 'Turkey', label: 'Turkey', continent: 'europe', aliases: ['Turkiye', 'Türkiye'] },
  { value: 'Ukraine', label: 'Ukraine', continent: 'europe' },
  { value: 'United Kingdom', label: 'United Kingdom', continent: 'europe', aliases: ['UK', 'Great Britain', 'Britain', 'England'] },
  { value: 'United States', label: 'United States', continent: 'north_america', aliases: ['US', 'USA', 'United States of America'] },
  { value: 'Canada', label: 'Canada', continent: 'north_america' },
  { value: 'Mexico', label: 'Mexico', continent: 'north_america' },
  { value: 'Costa Rica', label: 'Costa Rica', continent: 'north_america' },
  { value: 'Panama', label: 'Panama', continent: 'north_america' },
  { value: 'Dominican Republic', label: 'Dominican Republic', continent: 'north_america' },
  { value: 'Brazil', label: 'Brazil', continent: 'south_america' },
  { value: 'Argentina', label: 'Argentina', continent: 'south_america' },
  { value: 'Chile', label: 'Chile', continent: 'south_america' },
  { value: 'Colombia', label: 'Colombia', continent: 'south_america' },
  { value: 'Peru', label: 'Peru', continent: 'south_america' },
  { value: 'Uruguay', label: 'Uruguay', continent: 'south_america' },
  { value: 'Paraguay', label: 'Paraguay', continent: 'south_america' },
  { value: 'Ecuador', label: 'Ecuador', continent: 'south_america' },
  { value: 'Bolivia', label: 'Bolivia', continent: 'south_america' },
  { value: 'Venezuela', label: 'Venezuela', continent: 'south_america' },
  { value: 'Australia', label: 'Australia', continent: 'oceania' },
  { value: 'New Zealand', label: 'New Zealand', continent: 'oceania' },
  { value: 'Fiji', label: 'Fiji', continent: 'oceania' },
  { value: 'Papua New Guinea', label: 'Papua New Guinea', continent: 'oceania' },
  { value: 'China', label: 'China', continent: 'asia' },
  { value: 'India', label: 'India', continent: 'asia' },
  { value: 'Japan', label: 'Japan', continent: 'asia' },
  { value: 'South Korea', label: 'South Korea', continent: 'asia', aliases: ['Korea', 'Republic of Korea'] },
  { value: 'Singapore', label: 'Singapore', continent: 'asia' },
  { value: 'Indonesia', label: 'Indonesia', continent: 'asia' },
  { value: 'Malaysia', label: 'Malaysia', continent: 'asia' },
  { value: 'Thailand', label: 'Thailand', continent: 'asia' },
  { value: 'Philippines', label: 'Philippines', continent: 'asia' },
  { value: 'Vietnam', label: 'Vietnam', continent: 'asia', aliases: ['Viet Nam'] },
  { value: 'United Arab Emirates', label: 'United Arab Emirates', continent: 'asia', aliases: ['UAE'] },
  { value: 'Saudi Arabia', label: 'Saudi Arabia', continent: 'asia' },
  { value: 'Israel', label: 'Israel', continent: 'asia' },
  { value: 'South Africa', label: 'South Africa', continent: 'africa' },
  { value: 'Nigeria', label: 'Nigeria', continent: 'africa' },
  { value: 'Kenya', label: 'Kenya', continent: 'africa' },
  { value: 'Egypt', label: 'Egypt', continent: 'africa' },
  { value: 'Morocco', label: 'Morocco', continent: 'africa' },
  { value: 'Ghana', label: 'Ghana', continent: 'africa' },
];

const CONTINENT_BY_ID = new Map(MARKET_CONTINENT_OPTIONS.map(option => [option.id, option]));
const COUNTRY_BY_VALUE = new Map(MARKET_COUNTRY_OPTIONS.map(option => [option.value, option]));

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const CONTINENT_ALIAS_TO_ID = new Map<string, MarketContinent>();
for (const option of MARKET_CONTINENT_OPTIONS) {
  CONTINENT_ALIAS_TO_ID.set(normalizeText(option.id.replace(/_/g, ' ')), option.id);
  CONTINENT_ALIAS_TO_ID.set(normalizeText(option.label), option.id);
  for (const alias of option.aliases ?? []) {
    CONTINENT_ALIAS_TO_ID.set(normalizeText(alias), option.id);
  }
}

const COUNTRY_ALIAS_TO_VALUE = new Map<string, string>();
for (const option of MARKET_COUNTRY_OPTIONS) {
  COUNTRY_ALIAS_TO_VALUE.set(normalizeText(option.value), option.value);
  COUNTRY_ALIAS_TO_VALUE.set(normalizeText(option.label), option.value);
  for (const alias of option.aliases ?? []) {
    COUNTRY_ALIAS_TO_VALUE.set(normalizeText(alias), option.value);
  }
}

function uniqueValues<T>(items: T[]): T[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(item => String(item ?? '')) : [];
}

export function normalizeMarketContinent(value: unknown): MarketContinent | undefined {
  const normalized = normalizeText(String(value ?? ''));
  return CONTINENT_ALIAS_TO_ID.get(normalized);
}

export function normalizeMarketCountry(value: unknown): string {
  const raw = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (!raw) return '';
  return COUNTRY_ALIAS_TO_VALUE.get(normalizeText(raw)) ?? raw.slice(0, 80);
}

export function normalizeCompetitorMarketFilter(value?: CompetitorMarketFilter | null): Required<CompetitorMarketFilter> {
  const continents = uniqueValues(
    asStringArray(value?.continents)
      .map(normalizeMarketContinent)
      .filter((item): item is MarketContinent => Boolean(item)),
  );
  const countries = uniqueValues(
    asStringArray(value?.countries)
      .map(normalizeMarketCountry)
      .filter(Boolean),
  ).slice(0, 50);
  return { continents, countries };
}

export function marketFilterHasSelection(value?: CompetitorMarketFilter | null): boolean {
  const filter = normalizeCompetitorMarketFilter(value);
  return filter.continents.length > 0 || filter.countries.length > 0;
}

export function marketContinentLabel(continent: MarketContinent): string {
  return CONTINENT_BY_ID.get(continent)?.label ?? continent;
}

export function getCountryContinent(country: string): MarketContinent | undefined {
  const normalized = normalizeMarketCountry(country);
  return COUNTRY_BY_VALUE.get(normalized)?.continent;
}

export function countriesForContinents(continents: MarketContinent[]): string[] {
  const allowed = new Set(continents);
  return MARKET_COUNTRY_OPTIONS
    .filter(country => allowed.has(country.continent))
    .map(country => country.label);
}

export function countryMatchesMarketFilter(country: string | undefined, value?: CompetitorMarketFilter | null): boolean {
  const filter = normalizeCompetitorMarketFilter(value);
  if (!marketFilterHasSelection(filter)) return true;
  const rawCountry = normalizeText(country ?? '');
  const normalizedCountry = normalizeMarketCountry(country);
  if (!normalizedCountry) return false;
  const selectedCountries = new Set(filter.countries.map(item => normalizeText(normalizeMarketCountry(item))));
  if (selectedCountries.has(normalizeText(normalizedCountry))) return true;
  if ([...selectedCountries].some(selected => rawCountry.includes(selected))) return true;
  const selectedCountryOptions = MARKET_COUNTRY_OPTIONS.filter(option => selectedCountries.has(normalizeText(option.value)));
  if (selectedCountryOptions.some(option =>
    [option.value, option.label, ...(option.aliases ?? [])].some(alias => rawCountry.includes(normalizeText(alias))),
  )) return true;
  const continent = getCountryContinent(normalizedCountry);
  if (!continent && filter.continents.length) {
    return MARKET_COUNTRY_OPTIONS.some(option =>
      filter.continents.includes(option.continent) && rawCountry.includes(normalizeText(option.label)),
    );
  }
  return Boolean(continent && filter.continents.includes(continent));
}

export function candidateMatchesMarketFilter(
  candidate: { country?: string; marketScope?: string },
  value?: CompetitorMarketFilter | null,
): boolean {
  const filter = normalizeCompetitorMarketFilter(value);
  if (!marketFilterHasSelection(filter)) return true;
  if (countryMatchesMarketFilter(candidate.country, filter)) return true;

  const scope = normalizeText(candidate.marketScope ?? '');
  if (filter.continents.includes('europe') && (scope === 'eu' || scope === 'europe')) return true;
  if (filter.continents.includes('north_america') && (scope === 'us' || scope === 'usa' || scope === 'north america')) return true;
  const selectedCountries = new Set(filter.countries.map(item => normalizeText(normalizeMarketCountry(item))));
  return selectedCountries.has('united states') && (scope === 'us' || scope === 'usa');
}

export function formatMarketFilterLabel(value?: CompetitorMarketFilter | null): string {
  const filter = normalizeCompetitorMarketFilter(value);
  if (!marketFilterHasSelection(filter)) return 'Global / all markets';
  const continents = filter.continents.map(marketContinentLabel);
  return [...continents, ...filter.countries].join(', ');
}

export function marketFilterPromptContext(value?: CompetitorMarketFilter | null) {
  const filter = normalizeCompetitorMarketFilter(value);
  const selectedContinents = filter.continents.map(marketContinentLabel);
  const selectedCountries = filter.countries;
  return {
    selectedContinents,
    selectedCountries,
    allowedCountryExamples: countriesForContinents(filter.continents).slice(0, 80),
    instruction: marketFilterHasSelection(filter)
      ? `Only return competitors whose primary operating/sales market is inside: ${formatMarketFilterLabel(filter)}. Do not include origin, EU, US, global, or benchmark competitors outside this selected market.`
      : 'No user-selected competitor market constraint. Use origin-market, EU, US, and global benchmark competitors when relevant.',
  };
}
