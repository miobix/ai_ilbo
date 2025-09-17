import { useCallback, useState } from "react";

export function useTableSort(defaultCol, defaultDir='desc'){
  const [sortColumn,setSortColumn]=useState(defaultCol);
  const [sortDirection,setSortDirection]=useState(defaultDir);
  const handleSort=useCallback((col)=>{
    if(col===sortColumn){setSortDirection(d=>d==='asc'?'desc':'asc');}
    else{setSortColumn(col);setSortDirection('asc');}
  },[sortColumn]);
  const sortData=useCallback((data)=>{
    const arr=[...(data||[])];
    arr.sort((a,b)=>{
      const av=a?.[sortColumn]; const bv=b?.[sortColumn];
      if(av==null&&bv==null) return 0; if(av==null) return 1; if(bv==null) return -1;
      if(typeof av==='number' && typeof bv==='number') return sortDirection==='asc'?av-bv:bv-av;
      const as=String(av); const bs=String(bv);
      return sortDirection==='asc'?as.localeCompare(bs):bs.localeCompare(as);
    });
    return arr;
  },[sortColumn,sortDirection]);
  return {sortColumn,sortDirection,handleSort,sortData};
}
