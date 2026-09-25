import React, { useState, useMemo } from 'react';
import Select from '../common/Select';
import { LocationIcon } from '../common/Icons';

interface TopCountry {
  country: string;
  count: number;
}

interface GeoData {
  topCountries?: TopCountry[];
  countryCodes?: string[];
}

interface ApplicantItem {
  location?: string | null;
  country?: string | null;
  applicantCode?: string;
}

interface GeoDistributionMapProps {
  geo?: GeoData;
  applicants?: ApplicantItem[];
  totalApplicants?: number;
}

export const GeoDistributionMap: React.FC<GeoDistributionMapProps> = ({
  geo,
  applicants = [],
  totalApplicants = 0,
}) => {
  const topCountries = geo?.topCountries || [];
  const primaryCountry = topCountries[0]?.country || 'Nigeria';
  const poolTotal = totalApplicants || topCountries.reduce((acc, c) => acc + c.count, 0) || 0;

  // Selected location for the Google Map
  const [selectedLocation, setSelectedLocation] = useState<string>(primaryCountry);
  const [zoomLevel, setZoomLevel] = useState<number>(6);
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' for standard roadmap, 'k' for satellite

  // Derive unique cities from applicant locations
  const availableLocations = useMemo(() => {
    const list: { label: string; query: string; zoom: number; count?: number }[] = [];

    // Add primary countries
    topCountries.forEach((c) => {
      list.push({
        label: `${c.country} (National Pool)`,
        query: c.country,
        zoom: 6,
        count: c.count,
      });
    });

    // Add specific cities found in applicant locations
    const cityCounts = new Map<string, number>();
    applicants.forEach((a) => {
      if (a.location) {
        const city = a.location.split(',')[0].trim();
        if (city) {
          cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
        }
      }
    });

    cityCounts.forEach((count, city) => {
      list.push({
        label: `${city}, ${primaryCountry}`,
        query: `${city}, ${primaryCountry}`,
        zoom: 11,
        count,
      });
    });

    // Fallback if empty
    if (list.length === 0) {
      list.push({ label: 'Nigeria', query: 'Nigeria', zoom: 6, count: poolTotal });
    }

    return list;
  }, [topCountries, applicants, primaryCountry, poolTotal]);

  const selectOptions = useMemo(() => {
    return availableLocations.map((loc) => ({
      value: loc.query,
      label: loc.count ? `${loc.label} (${loc.count} app)` : loc.label,
    }));
  }, [availableLocations]);

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    selectedLocation
  )}&t=${mapType}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative w-full h-[360px] bg-gray-100 rounded-2xl overflow-visible border border-gray-200/80 shadow-xs flex flex-col">
      {/* Top Map Control Bar */}
      <div className="relative z-40 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-t-2xl border-b border-gray-200/70 flex flex-wrap items-center justify-between gap-3 text-[12px]">
        {/* Left: Custom Select Dropdown */}
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center gap-1.5 font-medium text-gray-700 shrink-0">
            <LocationIcon size={16} className="text-[#0047CC]" />
            <span className="text-gray-900 font-semibold text-[13px]">Location:</span>
          </div>

          <div className="min-w-[220px] sm:min-w-[260px] relative">
            <Select
              variant="compact"
              hideLabel
              placeholder="Select location"
              value={selectedLocation}
              options={selectOptions}
              onChange={(e: any) => {
                const val = e?.target?.value ?? e;
                setSelectedLocation(val);
                const loc = availableLocations.find((l) => l.query === val);
                if (loc) setZoomLevel(loc.zoom);
              }}
              className="py-1.5 bg-gray-50/80 border-gray-200 text-gray-800 text-[12px] font-medium"
              menuClassName="w-full min-w-[260px] shadow-2xl z-50"
            />
          </div>
        </div>

        {/* Right: Map Type & External Link */}
        <div className="flex items-center gap-2">
          {/* Roadmap vs Satellite Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setMapType('m')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                mapType === 'm' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMapType('k')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                mapType === 'k' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Open directly in Google Maps */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-[#0047CC] hover:underline bg-blue-50/80 hover:bg-blue-100/70 px-2.5 py-1 rounded-lg border border-blue-200/50 transition-colors"
          >
            Open in Google Maps
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Embedded Real Google Map */}
      <div className="relative flex-1 w-full bg-gray-200 rounded-b-2xl overflow-hidden z-10">
        <iframe
          title="Google Map Distribution"
          width="100%"
          height="100%"
          src={mapSrc}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Floating Pool Stats Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-200/80 pointer-events-none flex items-center gap-2 z-20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0047CC] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0047CC]" />
          </span>
          <span className="text-[11px] font-semibold text-gray-800">
            {poolTotal} Candidates in {selectedLocation}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeoDistributionMap;
