"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Label } from "recharts";
import { getWeekKey, getMonthKey } from "../../lib/dateUtils";
import { deduplicateNewsByKey } from "../../lib/dataUtils";

const chartColors={ percentage:'#dc2626'};

const CustomLabel = (props) => {
  const { x, y, value } = props;
  return (
    <text x={x} y={y - 8} fill="#666" fontSize={10} textAnchor="middle">
      {value.toFixed(1)}
    </text>
  );
};

function transformWeekly(news){
  // 같은 기사(newskey 중복)를 하나로 취급하여 기사별 카운트 정확도 향상
  const uniqueNews = deduplicateNewsByKey(news);
  const m=new Map();
  for(const a of uniqueNews||[]){
    const wk=getWeekKey(a.newsdate).split('T')[0];
    if(!m.has(wk)) m.set(wk,{date:wk,level1:0,levelOthers:0});
    const it=m.get(wk);
    if(String(a.level)==='1') it.level1+=1; else it.levelOthers+=1;
  }
  return Array.from(m.values()).sort((a,b)=>new Date(a.date)-new Date(b.date));
}
function transformMonthly(news){
  // 같은 기사(newskey 중복)를 하나로 취급하여 기사별 카운트 정확도 향상
  const uniqueNews = deduplicateNewsByKey(news);
  const m=new Map();
  for(const a of uniqueNews||[]){
    const mk=getMonthKey(a.newsdate).split('T')[0];
    if(!m.has(mk)) m.set(mk,{date:mk,level1:0,levelOthers:0});
    const it=m.get(mk);
    if(String(a.level)==='1') it.level1+=1; else it.levelOthers+=1;
  }
  return Array.from(m.values()).sort((a,b)=>new Date(a.date)-new Date(b.date));
}

const LevelPercentageChart=({newsData})=>{
  const [period,setPeriod]=useState('monthly');
  const [selectedMonth,setSelectedMonth]=useState('all');
  const weekly=useMemo(()=>transformWeekly(newsData),[newsData]);
  const monthly=useMemo(()=>transformMonthly(newsData),[newsData]);
  const data = period==='weekly'?weekly:monthly;

  const months=useMemo(()=>{
    if(period!=='weekly'||!weekly.length) return [];
    const s=new Set(); weekly.forEach(i=>{const d=new Date(i.date); const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; s.add(key);});
    return Array.from(s).sort().reverse().map(v=>{const [y,m]=v.split('-'); return {value:v,label:`${y}년 ${parseInt(m)}월`};});
  },[weekly,period]);

  const filtered=useMemo(()=>{
    if(period==='monthly') return data;
    if(selectedMonth==='all'){
      const cutoff=new Date(); cutoff.setMonth(cutoff.getMonth()-3);
      return data.filter(i=>new Date(i.date)>=cutoff);
    }
    const [y,m]=selectedMonth.split('-').map(Number);
    return data.filter(i=>{const d=new Date(i.date); return d.getFullYear()===y && (d.getMonth()+1)===m;});
  },[data,period,selectedMonth]);

  const percentageData = useMemo(() => {
    return filtered.map(item => {
      const total = item.level1 + item.levelOthers;
      const percentage = total > 0 ? (item.level1 / total) * 100 : 0;
      return { ...item, percentage };
    });
  }, [filtered]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>기획기사 비율 ({period==='weekly'? '주별':'월별'})</div>
          <div className={styles.cardDesc}>전체 기사 대비 기획기사 비율</div>
        </div>
        <div className={styles.selectRow}>
          <select className={styles.select} value={period} onChange={e=>setPeriod(e.target.value)}>
            <option value="weekly">주별</option>
            <option value="monthly">월별</option>
          </select>
          {period==='weekly' && months.length>0 && (
            <select className={styles.select} value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>
              <option value="all">전체 (최근 3개월)</option>
              {months.map(m=>(<option key={m.value} value={m.value}>{m.label}</option>))}
            </select>
          )}
        </div>
      </div>
      <div className={styles.cardContent}>
        <div style={{width:'100%',height:250}}>
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={percentageData} margin={{left:0, right:20}}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={4} angle={45} textAnchor="middle" interval="preserveStartEnd"
              tick={{fontSize:10}}
              tickFormatter={(v)=>{
                if(period==='weekly'){const d=new Date(v); return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;} else {const d=new Date(v); return `${d.getMonth()+1}월`;}
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={4} tickCount={5} tick={{fontSize:10}} 
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={false}
              formatter={(value) => [`${value.toFixed(1)}%`, '기획기사 비율']}
              labelFormatter={(v) => {
                if (period === 'weekly') {
                  const d = new Date(v);
                  return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
                }
                const d = new Date(v);
                return `${d.getFullYear()}년 ${d.getMonth()+1}월`;
              }}
            />
            <Line dataKey="percentage" type="monotone" stroke={chartColors.percentage} strokeWidth={2} dot={{r:3}} label={<CustomLabel />} />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LevelPercentageChart;
