export function prepareVisitsChartData(visitsData) {
  if (!visitsData || !visitsData.total) return [];

  const visitsChartData = visitsData.total.map((tEntry, i) => {
    const date = formatDateMMDD(tEntry.date);
    const obj = { date };

    const homeDesktop = visitsData.homeDesktop?.[i]?.pageViews || 0;
    const homeMobile = visitsData.homeMobile?.[i]?.pageViews || 0;
    const total = visitsData.total?.[i]?.pageViews || 0;

    obj.homeTotal = homeDesktop + homeMobile;

    obj.homeDesktop = homeDesktop;
    obj.homeMobile = homeMobile;
    obj.total = total;

    return obj;
  });

  return visitsChartData;
}

export function prepareActiveUsersChartData(visitsData) {
  if (!visitsData || !visitsData.total) return [];

  const visitsChartData = visitsData.total.map((tEntry, i) => {
    const date = formatDateMMDD(tEntry.date);
    const obj = { date };

    const homeDesktop = visitsData.homeDesktop?.[i]?.activeUsers || 0;
    const homeMobile = visitsData.homeMobile?.[i]?.activeUsers || 0;
    const total = visitsData.total?.[i]?.activeUsers || 0;

    obj.homeTotal = homeDesktop + homeMobile;

    obj.homeDesktop = homeDesktop;
    obj.homeMobile = homeMobile;
    obj.total = total;

    return obj;
  });

  return visitsChartData;
}

export function formatDateMMDD(dateStr) {
  return dateStr.slice(4, 6) + "-" + dateStr.slice(6, 8);
}

export function prepareSectionChartData(sectionData, platform) {
  if (!sectionData || !sectionData[platform]) return [];
  
  return sectionData[platform].map(dayData => {
    const obj = { date: formatDateMMDD(dayData.date) };
    dayData.categories.forEach(cat => {
      obj[cat.ncid] = cat.pageViews;
    });
    return obj;
  });
}

export function prepareSectionActiveUsersData(sectionData, platform) {
  if (!sectionData || !sectionData[platform]) return [];
  
  return sectionData[platform].map(dayData => {
    const obj = { date: formatDateMMDD(dayData.date) };
    dayData.categories.forEach(cat => {
      obj[cat.ncid] = cat.activeUsers;
    });
    return obj;
  });
}

export function getAllNcids(sectionData) {
  const ncids = new Set();
  const totals = {};
  
  ['desktop', 'mobile'].forEach(platform => {
    sectionData[platform]?.forEach(dayData => {
      dayData.categories.forEach(cat => {
        ncids.add(cat.ncid);
        totals[cat.ncid] = (totals[cat.ncid] || 0) + cat.pageViews;
      });
    });
  });
  
  // Sort by total pageViews descending (highest first = bottom of stack)
  return Array.from(ncids).sort((a, b) => totals[b] - totals[a]);
}


export function getTopNcids(sectionData, platform, limit = 5) {
  const totals = {};
  
  sectionData[platform]?.forEach(dayData => {
    dayData.categories.forEach(cat => {
      totals[cat.ncid] = (totals[cat.ncid] || 0) + cat.pageViews;
    });
  });
  
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ncid]) => ncid);
}