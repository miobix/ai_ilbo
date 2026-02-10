/**
 * 뉴스 데이터를 newskey 기준으로 중복 제거하여 고유한 기사만 반환
 * - 같은 기사(동일 newskey)가 여러 행으로 존재하는 경우 1개로 병합
 * - 예: 같은 기사를 다른 작성자로 등록한 경우
 */
export function deduplicateNewsByKey(newsData) {
  if (!newsData?.length) return [];
  
  const grouped = {};
  
  newsData.forEach(article => {
    if (!grouped[article.newskey]) {
      grouped[article.newskey] = article;
    }
    // 같은 newskey면 첫 번째만 유지 (이후 타입별 필터링은 거치지 않음)
  });
  
  return Object.values(grouped);
}

/**
 * 뉴스 데이터를 newskey로 중복 제거한 후 level별로 분류
 * @returns { unique: 고유 기사 수, level1: 기획기사, others: 비기획기사 }
 */
export function getNewsStatsByLevel(newsData) {
  const unique = deduplicateNewsByKey(newsData);
  
  let level1 = 0;
  let others = 0;
  
  unique.forEach(article => {
    if (String(article.level) === '1') {
      level1++;
    } else {
      others++;
    }
  });
  
  return { unique: unique.length, level1, others };
}
