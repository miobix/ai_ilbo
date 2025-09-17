// CSV 다운로드 유틸리티 함수들

/**
 * 배열 데이터를 CSV 문자열로 변환
 * @param {Array} data - 변환할 데이터 배열
 * @param {Array} columns - 컬럼 정의 [{key: 'fieldName', label: 'Display Name'}]
 * @returns {string} CSV 문자열
 */
export function arrayToCSV(data, columns) {
  if (!data || data.length === 0) return '';
  
  // 헤더 생성
  const headers = columns.map(col => `"${col.label}"`).join(',');
  
  // 데이터 행 생성
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      if (value === null || value === undefined) value = '';
      if (typeof value === 'number') {
        // 숫자는 그대로 출력 (쉼표 제거)
        value = value.toString();
      } else {
        // 문자열은 따옴표로 감싸고 내부 따옴표는 이스케이프
        value = `"${String(value).replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [headers, ...rows].join('\n');
}

/**
 * CSV 파일 다운로드
 * @param {string} csvContent - CSV 내용
 * @param {string} filename - 파일명 (확장자 제외)
 */
export function downloadCSV(csvContent, filename) {
  const BOM = '\uFEFF'; // UTF-8 BOM for proper Korean encoding
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

/**
 * 현재 날짜를 기반으로 파일명 생성
 * @param {string} prefix - 파일명 접두사
 * @returns {string} 날짜가 포함된 파일명
 */
export function generateFilename(prefix) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS 형식
  return `${prefix}_${dateStr}_${timeStr}`;
}

/**
 * 날짜 범위를 포함한 파일명 생성
 * @param {string} prefix - 파일명 접두사
 * @param {Date} fromDate - 시작 날짜
 * @param {Date} toDate - 종료 날짜
 * @returns {string} 날짜 범위가 포함된 파일명
 */
export function generateFilenameWithDateRange(prefix, fromDate, toDate) {
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  };
  
  const fromStr = formatDate(fromDate);
  const toStr = formatDate(toDate);
  
  return `${prefix}_${fromStr}_${toStr}`;
}
