// CSV 다운로드 유틸리티 함수들 (test 전용 복사본)

export function arrayToCSV(data, columns) {
  if (!data || data.length === 0) return '';
  const headers = columns.map(col => `"${col.label}"`).join(',');
  const rows = data.map(row => columns.map(col => {
    let value = row[col.key];
    if (value === null || value === undefined) value = '';
    if (typeof value === 'number') {
      return value.toString();
    }
    return `"${String(value).replace(/"/g, '""')}"`;
  }).join(',')).join('\n');
  return [headers, rows].filter(Boolean).join('\n');
}

export function downloadCSV(csvContent, filename) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function generateFilename(prefix) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${prefix}_${dateStr}_${timeStr}`;
}

export function generateFilenameWithDateRange(prefix, fromDate, toDate) {
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  const fromStr = formatDate(fromDate);
  const toStr = formatDate(toDate);
  return `${prefix}_${fromStr}_${toStr}`;
}
