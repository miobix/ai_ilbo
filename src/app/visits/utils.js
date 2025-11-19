export function prepareVisitsChartData(visitsData) {
  if (!visitsData || !visitsData.total) return [];

  const visitsChartData = visitsData.total.map((tEntry) => {
    const date = formatDateMMDD(tEntry.date);
    const obj = { date };

    // Match by date instead of index
    const homeDesktopEntry = visitsData.homeDesktop?.find(d => d.date === tEntry.date);
    const homeMobileEntry = visitsData.homeMobile?.find(d => d.date === tEntry.date);
    
    const homeDesktop = homeDesktopEntry?.pageViews || 0;
    const homeMobile = homeMobileEntry?.pageViews || 0;
    const total = tEntry.pageViews || 0;

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

  const visitsChartData = visitsData.total.map((tEntry) => {
    const date = formatDateMMDD(tEntry.date);
    const obj = { date };

    // Match by date instead of index
    const homeDesktopEntry = visitsData.homeDesktop?.find(d => d.date === tEntry.date);
    const homeMobileEntry = visitsData.homeMobile?.find(d => d.date === tEntry.date);
    
    const homeDesktop = homeDesktopEntry?.activeUsers || 0;
    const homeMobile = homeMobileEntry?.activeUsers || 0;
    const total = tEntry.activeUsers || 0;

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