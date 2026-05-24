import type { LocationOption } from './locationSearch.types';

export type { LocationOption };

const SPECIAL_LOCATIONS = ['Multiple locations', 'Remote'];

const MAX_LOCAL_RESULTS = 8;
const MAX_ONLINE_RESULTS = 8;
const MAX_TOTAL = 12;

type CountryStateCity = typeof import('country-state-city');

let cscModule: CountryStateCity | null = null;
let countriesCache: ReturnType<CountryStateCity['Country']['getAllCountries']> | null =
  null;
let statesCache: ReturnType<CountryStateCity['State']['getAllStates']> | null = null;

async function loadCountryStateCity(): Promise<CountryStateCity> {
  if (!cscModule) {
    cscModule = await import('country-state-city');
  }
  return cscModule;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/** Display name for states/regions — drops redundant suffixes like "State" or "District". */
export function normalizeRegionName(name: string): string {
  return name
    .trim()
    .replace(
      /\s+(State|Province|Region|Prefecture|Governorate|County|District|Territory|Department|Oblast|Voivodeship)$/i,
      ''
    )
    .trim();
}

function formatStateRegionLabel(regionName: string, country: string): string {
  const region = normalizeRegionName(regionName);
  return `${region}, ${country}`;
}

function locationDedupeKey(label: string): string {
  const parts = label.split(',').map((p) => normalizeRegionName(p.trim()).toLowerCase());
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]},${parts[parts.length - 1]}`;
  }
  return label.trim().toLowerCase();
}

/** Offline search: countries and states/regions worldwide. */
export async function searchLocationsLocal(
  query: string
): Promise<LocationOption[]> {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  const { Country, State } = await loadCountryStateCity();
  if (!countriesCache) countriesCache = Country.getAllCountries();
  if (!statesCache) statesCache = State.getAllStates();

  const seen = new Set<string>();
  const results: LocationOption[] = [];

  const push = (option: LocationOption) => {
    const key = locationDedupeKey(option.value);
    if (seen.has(key)) return;
    seen.add(key);
    results.push(option);
  };

  for (const special of SPECIAL_LOCATIONS) {
    if (special.toLowerCase().includes(q)) {
      push({ label: special, value: special, type: 'special' });
    }
  }

  for (const country of countriesCache) {
    if (results.length >= MAX_LOCAL_RESULTS) break;
    if (!country.name.toLowerCase().includes(q)) continue;
    push({ label: country.name, value: country.name, type: 'country' });
  }

  for (const state of statesCache) {
    if (results.length >= MAX_LOCAL_RESULTS) break;
    const stateName = state.name.toLowerCase();
    const stateShort = normalizeRegionName(state.name).toLowerCase();
    if (!stateName.includes(q) && !stateShort.includes(q)) continue;
    const country = Country.getCountryByCode(state.countryCode);
    const countryName = country?.name ?? state.countryCode;
    const label = formatStateRegionLabel(state.name, countryName);
    push({ label, value: label, type: 'state' });
  }

  return results.slice(0, MAX_LOCAL_RESULTS);
}

/** Offline search: special entries + states/regions only (no countries or cities). */
export async function searchStatesRegionsLocal(
  query: string
): Promise<LocationOption[]> {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  const { Country, State } = await loadCountryStateCity();
  if (!countriesCache) countriesCache = Country.getAllCountries();
  if (!statesCache) statesCache = State.getAllStates();

  const seen = new Set<string>();
  const results: LocationOption[] = [];

  const push = (option: LocationOption) => {
    const key = locationDedupeKey(option.value);
    if (seen.has(key)) return;
    seen.add(key);
    results.push(option);
  };

  for (const special of SPECIAL_LOCATIONS) {
    if (special.toLowerCase().includes(q)) {
      push({ label: special, value: special, type: 'special' });
    }
  }

  for (const state of statesCache) {
    if (results.length >= MAX_LOCAL_RESULTS) break;
    const stateName = state.name.toLowerCase();
    const stateShort = normalizeRegionName(state.name).toLowerCase();
    if (!stateName.includes(q) && !stateShort.includes(q)) continue;
    const country = Country.getCountryByCode(state.countryCode);
    const countryName = country?.name ?? state.countryCode;
    const label = formatStateRegionLabel(state.name, countryName);
    push({ label, value: label, type: 'state' });
  }

  return results.slice(0, MAX_LOCAL_RESULTS);
}

/** States/regions only — excludes city-level Nominatim results. */
export async function searchStatesRegions(
  query: string,
  signal?: AbortSignal
): Promise<LocationOption[]> {
  const [local, online] = await Promise.all([
    searchStatesRegionsLocal(query),
    searchLocationsOnline(query, signal)
      .then((items) => items.filter((o) => o.type === 'state' || o.type === 'special'))
      .catch((err) => {
        if ((err as Error).name === 'AbortError') throw err;
        return [] as LocationOption[];
      }),
  ]);

  const seen = new Set<string>();
  const merged: LocationOption[] = [];

  for (const option of [...local, ...online]) {
    const key = locationDedupeKey(option.value);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(option);
    if (merged.length >= MAX_TOTAL) break;
  }

  return merged;
}

const MAX_COUNTRY_RESULTS = 15;
const MAX_CITY_RESULTS = 15;

/** Resolve a country display name or ISO code to ISO 3166-1 alpha-2. */
export async function resolveCountryIsoCode(countryInput: string): Promise<string | null> {
  const trimmed = countryInput.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
  const countryName = parts.length >= 2 ? parts[parts.length - 1] : trimmed;

  const { Country } = await loadCountryStateCity();
  if (!countriesCache) countriesCache = Country.getAllCountries();

  if (countryName.length === 2) {
    const byCode = Country.getCountryByCode(countryName.toUpperCase());
    if (byCode) return byCode.isoCode;
  }

  const normalized = countryName.toLowerCase();
  const match = countriesCache.find(
    (c) =>
      c.name.toLowerCase() === normalized || c.isoCode.toLowerCase() === normalized
  );
  return match?.isoCode ?? null;
}

/** Offline search: countries only (for residence / study country fields). */
export async function searchCountries(query: string): Promise<LocationOption[]> {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  const { Country } = await loadCountryStateCity();
  if (!countriesCache) countriesCache = Country.getAllCountries();

  const results: LocationOption[] = [];
  for (const country of countriesCache) {
    if (results.length >= MAX_COUNTRY_RESULTS) break;
    if (!country.name.toLowerCase().includes(q)) continue;
    results.push({ label: country.name, value: country.name, type: 'country' });
  }
  return results;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  display_name: string;
  address?: NominatimAddress;
}

function formatNominatimResult(item: NominatimResult): LocationOption | null {
  const addr = item.address;
  if (!addr) return null;

  const placeRaw =
    addr.city || addr.town || addr.village || addr.municipality;
  const place = placeRaw ? normalizeRegionName(placeRaw) : '';
  const state = addr.state ? normalizeRegionName(addr.state) : '';
  const country = addr.country?.trim() ?? '';

  if (place && country) {
    if (state && place.toLowerCase() === state.toLowerCase()) {
      const label = formatStateRegionLabel(state, country);
      return { label, value: label, type: 'state' };
    }
    const label = `${place}, ${country}`;
    return { label, value: label, type: 'city' };
  }

  if (state && country) {
    const label = formatStateRegionLabel(state, country);
    return { label, value: label, type: 'state' };
  }

  if (country) {
    return { label: country, value: country, type: 'country' };
  }

  const parts = item.display_name
    .split(',')
    .map((p) => normalizeRegionName(p.trim()))
    .filter(Boolean);
  if (parts.length >= 2 && country) {
    const label = `${parts[0]}, ${parts[parts.length - 1]}`;
    return { label, value: label, type: 'city' };
  }
  if (parts[0]) {
    return { label: parts[0], value: parts[0], type: 'city' };
  }
  return null;
}

/** Online geocoding for city-level suggestions (OpenStreetMap Nominatim). */
export async function searchLocationsOnline(
  query: string,
  signal?: AbortSignal
): Promise<LocationOption[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    q,
    format: 'json',
    addressdetails: '1',
    limit: String(MAX_ONLINE_RESULTS),
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      signal,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'VoraFrontend/1.0 (job location autocomplete)',
      },
    }
  );

  if (!response.ok) return [];

  const data = (await response.json()) as NominatimResult[];
  const seen = new Set<string>();
  const results: LocationOption[] = [];

  for (const item of data) {
    const option = formatNominatimResult(item);
    if (!option) continue;
    const key = locationDedupeKey(option.value);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(option);
  }

  return results;
}

/** Offline search: cities within a single country (from country-state-city). */
export async function searchCitiesInCountryLocal(
  query: string,
  countryName: string
): Promise<LocationOption[]> {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  const countryCode = await resolveCountryIsoCode(countryName);
  if (!countryCode) return [];

  const { City } = await loadCountryStateCity();
  const cities = City.getCitiesOfCountry(countryCode) ?? [];
  const seen = new Set<string>();
  const results: LocationOption[] = [];

  for (const city of cities) {
    if (results.length >= MAX_CITY_RESULTS) break;
    if (!city.name.toLowerCase().includes(q)) continue;
    const key = city.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ label: city.name, value: city.name, type: 'city' });
  }

  return results;
}

function formatNominatimCityInCountry(
  item: NominatimResult,
  expectedCountryName: string
): LocationOption | null {
  const addr = item.address;
  if (!addr?.country) return null;

  const country = addr.country.trim();
  if (country.toLowerCase() !== expectedCountryName.trim().toLowerCase()) {
    return null;
  }

  const placeRaw =
    addr.city || addr.town || addr.village || addr.municipality;
  if (!placeRaw) return null;

  const cityName = normalizeRegionName(placeRaw);
  return { label: cityName, value: cityName, type: 'city' };
}

/** Online geocoding for cities scoped to one country (Nominatim countrycodes). */
export async function searchCitiesInCountryOnline(
  query: string,
  countryName: string,
  signal?: AbortSignal
): Promise<LocationOption[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const countryCode = await resolveCountryIsoCode(countryName);
  if (!countryCode) return [];

  const { Country } = await loadCountryStateCity();
  const country = Country.getCountryByCode(countryCode);
  const expectedCountryName = country?.name ?? countryName;

  const params = new URLSearchParams({
    q,
    format: 'json',
    addressdetails: '1',
    limit: String(MAX_ONLINE_RESULTS),
    countrycodes: countryCode.toLowerCase(),
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      signal,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'VoraFrontend/1.0 (city autocomplete)',
      },
    }
  );

  if (!response.ok) return [];

  const data = (await response.json()) as NominatimResult[];
  const seen = new Set<string>();
  const results: LocationOption[] = [];

  for (const item of data) {
    const option = formatNominatimCityInCountry(item, expectedCountryName);
    if (!option) continue;
    const key = option.value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(option);
    if (results.length >= MAX_ONLINE_RESULTS) break;
  }

  return results;
}

/** Cities filtered to the selected country (offline + Nominatim). */
export async function searchCitiesInCountry(
  query: string,
  countryName: string,
  signal?: AbortSignal
): Promise<LocationOption[]> {
  if (!countryName.trim()) return [];

  const [local, online] = await Promise.all([
    searchCitiesInCountryLocal(query, countryName),
    searchCitiesInCountryOnline(query, countryName, signal).catch((err) => {
      if ((err as Error).name === 'AbortError') throw err;
      return [] as LocationOption[];
    }),
  ]);

  const seen = new Set<string>();
  const merged: LocationOption[] = [];

  for (const option of [...local, ...online]) {
    const key = option.value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(option);
    if (merged.length >= MAX_CITY_RESULTS) break;
  }

  return merged;
}

export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<LocationOption[]> {
  const [local, online] = await Promise.all([
    searchLocationsLocal(query),
    searchLocationsOnline(query, signal).catch((err) => {
      if ((err as Error).name === 'AbortError') throw err;
      return [] as LocationOption[];
    }),
  ]);

  const seen = new Set<string>();
  const merged: LocationOption[] = [];

  for (const option of [...local, ...online]) {
    const key = locationDedupeKey(option.value);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(option);
    if (merged.length >= MAX_TOTAL) break;
  }

  return merged;
}
