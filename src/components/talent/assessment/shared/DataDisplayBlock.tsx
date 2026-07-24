import React from 'react';

interface TableData {
  title?: string;
  headers?: string[];
  columns?: string[];
  cols?: string[];
  rows: string[][];
}

interface ChartItem {
  label: string;
  value: string | number;
}

interface ChartData {
  title?: string;
  label?: string;
  data?: ChartItem[];
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

const parseValue = (val: string | number): number => {
  if (typeof val === 'number') return val;
  const clean = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export const DataDisplayBlock: React.FC<DataDisplayBlockProps> = ({ table, chart, dataset }) => {
  const chartData = React.useMemo(() => {
    if (!chart) return null;
    if (Array.isArray(chart)) return chart;
    if (typeof chart === 'object' && Array.isArray((chart as any).data)) {
      return (chart as any).data as ChartItem[];
    }
    return null;
  }, [chart]);

  const chartTitle = React.useMemo(() => {
    if (!chart) return '';
    if (typeof chart === 'object' && !Array.isArray(chart)) {
      return (chart as any).title || (chart as any).label || '';
    }
    return '';
  }, [chart]);

  const maxVal = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return 1;
    return Math.max(...chartData.map((d) => parseValue(d.value)), 1);
  }, [chartData]);

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
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#808080] mb-4">
            {chartTitle || 'Performance Chart'}
          </div>
          <div className="flex items-end gap-3.5 p-3.5 border-b border-[#E6E6E6] relative h-[220px] justify-between">
            {chartData.map((d, idx) => {
              const val = parseValue(d.value);
              const heightPercent = maxVal > 0 ? (val / maxVal) * 90 : 0; // scale to max 90%
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="text-[11px] font-[800] text-[#4A4A4A] mb-1 tabular-nums">
                    {String(d.value)}
                  </div>
                  <div
                    className="w-full bg-gradient-to-b from-[#387DFF] to-[#0047CC] rounded-[8px_8px_0_0] transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="text-[11.5px] text-[#808080] font-[700] mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center">
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
