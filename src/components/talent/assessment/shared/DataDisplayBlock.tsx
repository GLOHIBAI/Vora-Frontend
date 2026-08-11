import React from 'react';

interface TableData {
  title?: string;
  headers?: string[];
  columns?: string[];
  cols?: string[];
  rows: string[][];
}

interface ChartItem {
  label?: string;
  value?: string | number;
  [key: string]: any;
}

interface ChartData {
  title?: string;
  label?: string;
  data?: any[];
  series?: any[];
  values?: any[];
}

interface DatasetColumn {
  name: string;
  values: any[];
}

interface DatasetTable {
  name: string;
  columns: DatasetColumn[];
}

interface DatasetPayload {
  tables?: DatasetTable[];
}

interface DataDisplayBlockProps {
  table?: TableData;
  chart?: ChartItem[] | ChartData;
  dataset?: DatasetPayload;
}

const BAR_GRADIENTS = [
  'from-[#387DFF] to-[#0047CC]',
  'from-[#8B5CF6] to-[#5B21B6]',
  'from-[#10B981] to-[#047857]',
  'from-[#F59E0B] to-[#D97706]',
  'from-[#EC4899] to-[#BE185D]',
  'from-[#06B6D4] to-[#0E7490]',
];

const BAR_SOLID_COLORS = [
  '#0047CC',
  '#5B21B6',
  '#047857',
  '#D97706',
  '#BE185D',
  '#0E7490',
];

const parseValue = (val: any): number => {
  if (typeof val === 'number') return val;
  if (val === undefined || val === null) return 0;
  const clean = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

const getChartItemLabel = (item: any): string => {
  if (!item) return '';
  if (typeof item !== 'object') return String(item);
  const label =
    item.label ??
    item.year ??
    item.x ??
    item.category ??
    item.name ??
    item.region ??
    item.title ??
    item.period ??
    item.date ??
    item.quarter ??
    item.key ??
    '';
  return String(label);
};

const getNestedItems = (seriesItem: any): any[] | null => {
  if (!seriesItem || typeof seriesItem !== 'object') return null;
  const nested =
    seriesItem.values ??
    seriesItem.data ??
    seriesItem.points ??
    seriesItem.items ??
    seriesItem.series;
  if (Array.isArray(nested) && nested.length > 0) {
    return nested;
  }
  return null;
};

const getChartItemValue = (item: any): number => {
  if (!item) return 0;
  if (typeof item === 'number') return item;
  if (typeof item !== 'object') return parseValue(item);

  const raw =
    item.value ??
    item.val ??
    item.y ??
    item.performance ??
    item.cost ??
    item.amount ??
    item.return ??
    item.percentage ??
    item.rate ??
    item.score ??
    item.count ??
    0;
  return parseValue(raw);
};

const formatChartDisplayValue = (item: any): string => {
  if (item === undefined || item === null) return '';
  if (typeof item === 'number') return String(item);
  if (typeof item === 'string') return item;
  if (typeof item !== 'object') return String(item);

  if (item.performance !== undefined) return `${item.performance}%`;
  if (item.cost !== undefined) return `₦${Number(item.cost).toLocaleString()}`;
  if (item.y !== undefined && typeof item.y === 'number') return `${item.y}%`;

  const raw =
    item.displayValue ??
    item.value ??
    item.val ??
    item.y ??
    item.amount ??
    item.return ??
    item.percentage ??
    item.rate ??
    item.score ??
    item.count;

  if (raw === undefined || raw === null) return '';
  return String(raw);
};

export const DataDisplayBlock: React.FC<DataDisplayBlockProps> = ({ table, chart, dataset }) => {
  const chartData = React.useMemo(() => {
    if (!chart) return null;
    if (Array.isArray(chart)) return chart;
    if (typeof chart === 'object') {
      const raw = (chart as any).data ?? (chart as any).series ?? (chart as any).values;
      if (Array.isArray(raw)) {
        if (raw.length === 1 && Array.isArray(raw[0]?.data)) {
          return raw[0].data as any[];
        }
        if (raw.length === 1 && Array.isArray(raw[0]?.values)) {
          return raw[0].values as any[];
        }
        return raw as any[];
      }
    }
    return null;
  }, [chart]);

  const isMultiSeries = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return false;
    return chartData.some((item: any) => getNestedItems(item) !== null);
  }, [chartData]);

  const subItemLabels = React.useMemo(() => {
    if (!isMultiSeries || !chartData) return [];
    const labels: string[] = [];
    chartData.forEach((d) => {
      const subItems = getNestedItems(d);
      if (subItems) {
        subItems.forEach((sub) => {
          const lbl = getChartItemLabel(sub);
          if (lbl && !labels.includes(lbl)) {
            labels.push(lbl);
          }
        });
      }
    });
    return labels;
  }, [chartData, isMultiSeries]);

  const chartTitle = React.useMemo(() => {
    if (!chart) return '';
    if (typeof chart === 'object' && !Array.isArray(chart)) {
      return (chart as any).title || (chart as any).label || '';
    }
    return '';
  }, [chart]);

  const maxVal = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return 1;
    if (isMultiSeries) {
      const allVals = chartData.flatMap((d) => {
        const subItems = getNestedItems(d);
        if (subItems) {
          return subItems.map((sub) => getChartItemValue(sub));
        }
        return [getChartItemValue(d)];
      });
      return Math.max(...allVals, 1);
    }
    return Math.max(...chartData.map((d) => getChartItemValue(d)), 1);
  }, [chartData, isMultiSeries]);

  if (!table && !chartData && (!dataset || !dataset.tables || dataset.tables.length === 0)) return null;

  return (
    <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-6 mb-6 shadow-sm">
      {/* 0. Render Dataset Tables */}
      {dataset?.tables && dataset.tables.map((t, tIdx) => {
        const headers = t.columns.map((c) => c.name);
        const rowCount = Math.max(...t.columns.map((c) => c.values?.length ?? 0), 0);
        const rows = Array.from({ length: rowCount }).map((_, rIdx) =>
          t.columns.map((c) => c.values?.[rIdx] ?? '')
        );

        return (
          <div key={tIdx} className="overflow-x-auto mb-6 last:mb-0">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-3">
              {t.name || `Table ${tIdx + 1}`}
            </div>
            <table className="w-full border-collapse text-left text-[13.5px]">
              <thead>
                <tr>
                  {headers.map((h, idx) => (
                    <th
                      key={idx}
                      className="bg-[#F7F7F7] text-[#4A4A4A] font-[800] text-[11.5px] tracking-[0.4px] uppercase p-3 border-b-2 border-[#E6E6E6]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-[#F7F7F7] hover:bg-[#F8FAFC]">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-[#1A1A1A] font-[600] tabular-nums">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
      {/* 1. Render Table */}
      {table && (
        <div className="overflow-x-auto mb-6">
          {(table.title || chartTitle) && (
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#808080] mb-3">
              {table.title || chartTitle}
            </div>
          )}
          <table className="w-full border-collapse text-left text-[13.5px]">
            <thead>
              <tr>
                {(table.headers || table.columns || table.cols || [
                  'Category',
                  'Actual',
                  'Target',
                  'Variance',
                ]).map((header, idx) => (
                  <th
                    key={idx}
                    className="bg-[#F7F7F7] text-[#4A4A4A] font-[800] text-[11.5px] tracking-[0.4px] uppercase p-3 border-b-2 border-[#E6E6E6]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(table.rows) &&
                table.rows.map((row, rIdx) => {
                  const isTotalRow =
                    Array.isArray(row) &&
                    (String(row[0]).toLowerCase() === 'total' ||
                      String(row[0]).toLowerCase() === 'total / average');
                  return (
                    <tr
                      key={rIdx}
                      className={
                        isTotalRow
                          ? 'bg-[#EBF6FF] font-[800] border-b-0'
                          : 'border-b border-[#F7F7F7]'
                      }
                    >
                      {Array.isArray(row) &&
                        row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-3 text-[#1A1A1A] ${
                              isTotalRow ? 'font-[800]' : 'font-[600]'
                            } tabular-nums`}
                          >
                            {String(cell)}
                          </td>
                        ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Render Bar Chart */}
      {chartData && chartData.length > 0 && (
        <div>
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#808080] mb-3">
            {chartTitle || 'Performance Chart'}
          </div>

          {/* Legend for Multi-Series */}
          {isMultiSeries && subItemLabels.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 mb-4 text-[12px] font-[700] text-[#4A4A4A]">
              {subItemLabels.map((lbl, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-md inline-block shadow-sm"
                    style={{ backgroundColor: BAR_SOLID_COLORS[idx % BAR_SOLID_COLORS.length] }}
                  />
                  <span>{lbl}</span>
                </div>
              ))}
            </div>
          )}

          {isMultiSeries ? (
            <div className="flex items-end gap-4 sm:gap-6 p-4 border-b border-[#E6E6E6] relative min-h-[240px] justify-around overflow-x-auto">
              {chartData.map((group, gIdx) => {
                const groupLabel = getChartItemLabel(group);
                const subItems = getNestedItems(group) || [];
                return (
                  <div key={gIdx} className="flex-1 flex flex-col items-center h-full justify-end min-w-[120px]">
                    {/* Bars within group */}
                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-[180px] pb-2 border-b border-[#E6E6E6]">
                      {subItems.map((sub, sIdx) => {
                        const val = getChartItemValue(sub);
                        const subLabel = getChartItemLabel(sub);
                        const displayVal = formatChartDisplayValue(sub);
                        const heightPercent = maxVal > 0 ? Math.max((val / maxVal) * 85, 4) : 0;
                        const gradient = BAR_GRADIENTS[sIdx % BAR_GRADIENTS.length];

                        return (
                          <div key={sIdx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end max-w-[48px]">
                            <div className="text-[10.5px] font-[800] text-[#4A4A4A] tabular-nums whitespace-nowrap">
                              {displayVal}
                            </div>
                            <div
                              className={`w-full bg-gradient-to-b ${gradient} rounded-[6px_6px_0_0] transition-all duration-300 shadow-sm hover:opacity-90`}
                              style={{ height: `${heightPercent}%` }}
                              title={`${groupLabel} - ${subLabel}: ${displayVal}`}
                            />
                            <div className="text-[10px] text-[#808080] font-[700] whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center">
                              {subLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Main Group Label */}
                    <div className="text-[12px] font-[800] text-[#1A1A1A] mt-2.5 text-center">
                      {groupLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-end gap-3.5 p-3.5 border-b border-[#E6E6E6] relative h-[220px] justify-between">
              {chartData.map((d, idx) => {
                const val = getChartItemValue(d);
                const label = getChartItemLabel(d);
                const displayVal = formatChartDisplayValue(d);
                const heightPercent = maxVal > 0 ? Math.max((val / maxVal) * 85, 4) : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[11px] font-[800] text-[#4A4A4A] mb-1 tabular-nums">
                      {displayVal}
                    </div>
                    <div
                      className="w-full bg-gradient-to-b from-[#387DFF] to-[#0047CC] rounded-[8px_8px_0_0] transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <div className="text-[11.5px] text-[#808080] font-[700] mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

