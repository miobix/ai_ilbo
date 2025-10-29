"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../chart.module.css";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getWeekKey, getMonthKey } from "../../lib/dateUtils";

const chartColors={ level1:'#2563eb', levelOthers:'#16a34a'};

function transformWeekly(news){
  const m=new Map();
  for(const a of news||[]){
    const wk=getWeekKey(a.newsdate).split('T')[0];
    if(!m.has(wk)) m.set(wk,{date:wk,level1:0,levelOthers:0});
    const it=m.get(wk);
    if(String(a.level)==='1') it.level1+=1; else it.levelOthers+=1;
  }
  return Array.from(m.values()).sort((a,b)=>new Date(a.date)-new Date(b.date));
}
function transformMonthly(news){
  const m=new Map();
  for(const a of news||[]){
    const mk=getMonthKey(a.newsdate).split('T')[0];
    if(!m.has(mk)) m.set(mk,{date:mk,level1:0,levelOthers:0});
    const it=m.get(mk);
    if(String(a.level)==='1') it.level1+=1; else it.levelOthers+=1;
  }
  return Array.from(m.values()).sort((a,b)=>new Date(a.date)-new Date(b.date));
}
const fmtKorean=(v)=>v.toLocaleString();

const LevelChart=({newsData})=>{
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

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>기획기사 현황 ({period==='weekly'? '주별':'월별'})</div>
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
          <AreaChart data={filtered} margin={{left:0, right:20}}>
            <defs>
              <linearGradient id="filllevel1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.level1} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.level1} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="filllevelOthers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.levelOthers} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.levelOthers} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={4} angle={45} textAnchor="middle" interval="preserveStartEnd"
              tick={{fontSize:10}}
              tickFormatter={(v)=>{
                if(period==='weekly'){const d=new Date(v); return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;} else {const d=new Date(v); return `${d.getMonth()+1}월`;}
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={4} tickCount={3} tick={{fontSize:10}} tickFormatter={fmtKorean} />
            <Tooltip
              cursor={false}
              formatter={(value, name, props) => {
                const total = (props?.payload?.level1 || 0) + (props?.payload?.levelOthers || 0);
                const isSelf = name === 'level1';
                const label = isSelf ? '자체' : '비자체';
                const suffix = isSelf && total > 0 ? ` (전체 대비 ${((props.payload.level1 / total) * 100).toFixed(1)}%)` : '';
                return [`${fmtKorean(Number(value))} 건${suffix}` , label];
              }}
              labelFormatter={(v) => {
                if (period === 'weekly') {
                  const d = new Date(v);
                  return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
                }
                const d = new Date(v);
                return `${d.getFullYear()}년 ${d.getMonth()+1}월`;
              }}
            />
            <Area dataKey="level1" type="linear" fill="url(#filllevel1)" fillOpacity={0.4} stroke={chartColors.level1} stackId="a" />
            <Area dataKey="levelOthers" type="linear" fill="url(#filllevelOthers)" fillOpacity={0.4} stroke={chartColors.levelOthers} stackId="a" />
          </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LevelChart;
