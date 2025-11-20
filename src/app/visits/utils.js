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

  // Use homeDesktop as primary source if total is empty
  if (hourlyData.homeDesktop && hourlyData.homeDesktop.length > 0) {
    // Exclude the last 2 days from all available data
    const desktopData = hourlyData.homeDesktop.slice(0, -2);
    const mobileData = hourlyData.homeMobile?.slice(0, -2) || [];
    
    const daysCount = desktopData.length;
    console.log(`Summing data from ${daysCount} days (excluding last 2 days)`);
    
    // Initialize 24-hour arrays for summing
    const summedDesktop = new Array(24).fill(0);
    const summedMobile = new Array(24).fill(0);
    
    // Sum all days' hourly data
    desktopData.forEach(dayData => {
      for (let hour = 0; hour < 24; hour++) {
        summedDesktop[hour] += (dayData.pageViews?.[hour] || 0);
      }
    });
    
    mobileData.forEach(dayData => {
      for (let hour = 0; hour < 24; hour++) {
        summedMobile[hour] += (dayData.pageViews?.[hour] || 0);
      }
    });
    
    // Create chart data for 24 hours with UTC to KST conversion (UTC-9 hours)
    const chartData = [];
    for (let hour = 0; hour < 24; hour++) {
      // Convert UTC to KST by shifting -9 hours (data at UTC 9 → KST 0)
      const utcHour = (hour + 9) % 24;
      const homeDesktop = showAverage ? Math.round(summedDesktop[utcHour] / daysCount) : summedDesktop[utcHour];
      const homeMobile = showAverage ? Math.round(summedMobile[utcHour] / daysCount) : summedMobile[utcHour];

      chartData.push({
        hour: `${hour}시`,
        homeDesktop,
        homeMobile,
        homeTotal: homeDesktop + homeMobile,
        total: 0  // total 데이터가 없음
      });
    }
    
    console.log(`Chart data prepared (${showAverage ? 'averaged over' : 'summed'} ${daysCount} days, UTC to KST converted):`, chartData);
    return chartData;
  }

  // Fallback to total data if available
  if (hourlyData.total && hourlyData.total.length > 0) {
    const totalData = hourlyData.total.slice(0, -2);
    const homeDesktopData = hourlyData.homeDesktop?.slice(0, -2) || [];
    const homeMobileData = hourlyData.homeMobile?.slice(0, -2) || [];
    
    const daysCount = totalData.length;
    
    const summedTotal = new Array(24).fill(0);
    const summedDesktop = new Array(24).fill(0);
    const summedMobile = new Array(24).fill(0);
    
    totalData.forEach(dayData => {
      for (let hour = 0; hour < 24; hour++) {
        summedTotal[hour] += (dayData.pageViews?.[hour] || 0);
      }
    });
    
    homeDesktopData.forEach(dayData => {
      for (let hour = 0; hour < 24; hour++) {
        summedDesktop[hour] += (dayData.pageViews?.[hour] || 0);
      }
    });
    
    homeMobileData.forEach(dayData => {
      for (let hour = 0; hour < 24; hour++) {
        summedMobile[hour] += (dayData.pageViews?.[hour] || 0);
      }
    });
    
    const chartData = [];
    for (let hour = 0; hour < 24; hour++) {
      // Convert UTC to KST by shifting -9 hours
      const utcHour = (hour + 9) % 24;
      
      chartData.push({
        hour: `${hour}시`,
        homeDesktop: showAverage ? Math.round(summedDesktop[utcHour] / daysCount) : summedDesktop[utcHour],
        homeMobile: showAverage ? Math.round(summedMobile[utcHour] / daysCount) : summedMobile[utcHour],
        homeTotal: showAverage ? Math.round((summedDesktop[utcHour] + summedMobile[utcHour]) / daysCount) : summedDesktop[utcHour] + summedMobile[utcHour],
        total: showAverage ? Math.round(summedTotal[utcHour] / daysCount) : summedTotal[utcHour]
      });
    }
    
    return chartData;
  }

  console.log("No data available at all");
  return [];
}