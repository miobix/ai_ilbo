"use client";
import React, { useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getWeekKey, getMonthKey } from "../../lib/dateUtils";

const colors={ total:'#0ea5e9', digital:'#f59e0b' };
const FILTER_MONTHS=3;
const fmtKorean=(v)=>{ if(v>=1e8) return `${Math.round(v/1e7)/10}억`; if(v>=1e4) return `${Math.round(v/1e3)/10}만`; return v.toLocaleString(); };
const fmtDate=(s)=>{ const d=new Date(s); return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; };

const toWeekly=(arts)=>{ const m=new Map(); for(const a of arts||[]){ if(a.newsclass_names?.includes('운세')) continue; const wk=getWeekKey(a.newsdate).split('T')[0]; if(!m.has(wk)) m.set(wk,{date:wk,total:0,digital:0}); const it=m.get(wk); const ref=Number(a.ref)||0; it.total+=ref; if(a.code_name==='디지털뉴스부') it.digital+=ref; } return Array.from(m.values()).sort((a,b)=>new Date(a.date)-new Date(b.date)); };
const toMonthly=(arts)=>{ const m=new Map(); for(const a of arts||[]){ if(a.newsclass_names?.includes('운세')) continue; const mk=getMonthKey(a.newsdate).split('T')[0]; if(!m.has(mk)) m.set(mk,{date:mk,total:0,digital:0}); const it=m.get(mk); const ref=Number(a.ref)||0; it.total+=ref; if(a.code_name==='디지털뉴스부') it.digital+=ref; } return Array.from(m.values()).sort((a,b)=>new Date(a.date)-new Date(b.date)); };

const ViewChart=({newsData})=>{
  const [period,setPeriod]=useState('weekly');
  const [selectedMonth,setSelectedMonth]=useState('all');

  const weekly=useMemo(()=>toWeekly(newsData),[newsData]);
  const monthly=useMemo(()=>toMonthly(newsData),[newsData]);

  const months=useMemo(()=>{ if(period!=='weekly'||!weekly.length) return []; const set=new Set(); weekly.forEach(i=>{const d=new Date(i.date); const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; set.add(key);}); return Array.from(set).sort().reverse().map(v=>({value:v,label:`${v.split('-')[0]}년 ${parseInt(v.split('-')[1])}월`})); },[weekly,period]);

  const data=useMemo(()=>{
    const transformed = period==='weekly'?weekly:monthly;
    if(period==='monthly') return transformed;
    if(selectedMonth==='all'){ const cutoff=new Date(); cutoff.setMonth(cutoff.getMonth()-FILTER_MONTHS); return transformed.filter(i=>new Date(i.date)>=cutoff); }
    const [y,m]=selectedMonth.split('-'); return transformed.filter(i=>{const d=new Date(i.date); return d.getFullYear()===parseInt(y) && (d.getMonth()+1)===parseInt(m);});
  },[weekly,monthly,period,selectedMonth]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>디지털팀 조회수 현황 ({period==='weekly'? '주별':'월별'})</div>
          <div className={styles.cardDesc}>{period==='weekly'? '매주 일요일 ~ 토요일 기준':'월별 기준'}</div>
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
          <AreaChart data={data} margin={{left:0, right:20}}>
            <defs>
              <linearGradient id="filltotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.total} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.total} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="filldigital" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.digital} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.digital} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={4} angle={45} textAnchor="middle" interval="preserveStartEnd" tick={{fontSize:10}}
              tickFormatter={(v)=> period==='weekly'? fmtDate(v) : `${new Date(v).getMonth()+1}월`}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={4} tickCount={3} tick={{fontSize:10}} tickFormatter={fmtKorean} />
            <Tooltip 
              cursor={false}
              formatter={(value, name) => {
                const label = name === 'digital' ? '디지털뉴스부' : '전체부서';
                return [fmtKorean(Number(value)), label];
              }}
              labelFormatter={(v) => {
                if(period==='weekly') return fmtDate(v);
                const d = new Date(v);
                return `${d.getFullYear()}년 ${d.getMonth()+1}월`;
              }}
            />
            <Area dataKey="digital" type="linear" fill="url(#filldigital)" fillOpacity={0.4} stroke={colors.digital} stackId="a" />
            <Area dataKey="total" type="linear" fill="url(#filltotal)" fillOpacity={0.4} stroke={colors.total} stackId="a" />
          </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ViewChart;
