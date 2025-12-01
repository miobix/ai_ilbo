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

export function prepareHourlyChartData(hourlyData, showAverage = false) {
  console.log("prepareHourlyChartData input:", hourlyData, "showAverage:", showAverage);
  
  if (!hourlyData) {
    console.log("No hourly data available");
    return [];
  }

  // Check if we have total data
  const hasTotalData = hourlyData.total && hourlyData.total.length > 0;
  const hasHomeData = hourlyData.homeDesktop && hourlyData.homeDesktop.length > 0;
  
  if (!hasTotalData && !hasHomeData) {
    console.log("No data available at all");
    return [];
  }

  // Exclude the last 2 days from all available data
  const totalData = hasTotalData ? hourlyData.total.slice(0, -2) : [];
  const desktopData = hasHomeData ? hourlyData.homeDesktop.slice(0, -2) : [];
  const mobileData = hourlyData.homeMobile ? hourlyData.homeMobile.slice(0, -2) : [];
  
  const daysCount = Math.max(totalData.length, desktopData.length);
  
  if (daysCount === 0) {
    console.log("No data available after excluding last 2 days");
    return [];
  }
  
  console.log(`Summing data from ${daysCount} days (excluding last 2 days)`);
  
  // Initialize 24-hour arrays for summing
  const summedTotal = new Array(24).fill(0);
  const summedDesktop = new Array(24).fill(0);
  const summedMobile = new Array(24).fill(0);
  
  // Sum total data with PST to KST conversion
  totalData.forEach(dayData => {
    for (let hour = 0; hour < 24; hour++) {
      // PST to KST conversion: PST + 17 hours = KST
      const kstHour = (hour + 17) % 24;
      summedTotal[kstHour] += (dayData.pageViews?.[hour] || 0);
    }
  });
  
  // Sum home desktop data with PST to KST conversion
  desktopData.forEach(dayData => {
    for (let hour = 0; hour < 24; hour++) {
      // PST to KST conversion: PST + 17 hours = KST
      const kstHour = (hour + 17) % 24;
      summedDesktop[kstHour] += (dayData.pageViews?.[hour] || 0);
    }
  });
  
  // Sum home mobile data with PST to KST conversion
  mobileData.forEach(dayData => {
    for (let hour = 0; hour < 24; hour++) {
      // PST to KST conversion: PST + 17 hours = KST
      const kstHour = (hour + 17) % 24;
      summedMobile[kstHour] += (dayData.pageViews?.[hour] || 0);
    }
  });
  
  // Create chart data for 24 hours (already in KST)
  const chartData = [];
  for (let hour = 0; hour < 24; hour++) {
    const homeDesktop = showAverage ? Math.round(summedDesktop[hour] / daysCount) : summedDesktop[hour];
    const homeMobile = showAverage ? Math.round(summedMobile[hour] / daysCount) : summedMobile[hour];
    const total = showAverage ? Math.round(summedTotal[hour] / daysCount) : summedTotal[hour];

    chartData.push({
      hour: `${hour}시`,
      homeDesktop,
      homeMobile,
      homeTotal: homeDesktop + homeMobile,
      total: total
    });
  }
  
  console.log(`Chart data prepared (${showAverage ? 'averaged over' : 'summed'} ${daysCount} days, converted to KST):`, chartData);
  return chartData;
}