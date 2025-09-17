export function getWeekKey(dateStr){
  const d=new Date(dateStr);const day=d.getDay();const diff=d.getDate()-day;const start=new Date(d);start.setDate(diff);start.setHours(0,0,0,0);return start.toISOString();}
export function getMonthKey(dateStr){const d=new Date(dateStr);const m=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1));return m.toISOString();}
export function formatMonth(d){const dt=new Date(d);return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;}

// Format a Date for <input type="date"> as local YYYY-MM-DD (avoids UTC shift to previous day)
export function toDateInputValue(date){
  const d=new Date(date);
  const tzOffset=d.getTimezoneOffset()*60000; // minutes -> ms
  return new Date(d.getTime()-tzOffset).toISOString().slice(0,10);
}
