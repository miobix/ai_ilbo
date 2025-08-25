import styles from "../chart.module.css";

export function truncateText(text,max){if(!text) return "-";return text.length>max?text.slice(0,max)+"…":text;}
export function formatLevel(level){const l=String(level||"5");if(l==="1") return "자체";return `비자체`;}
export function getLevelClass(level){return String(level)==="1"?`${styles.badge} ${styles.levelSelf}`:`${styles.badge} ${styles.levelNonSelf}`;}
export function getSelfRatioClass(r){if(r>=35) return `${styles.badge} ${styles.badgeGreen}`; if(r>=20) return `${styles.badge} ${styles.badgeYellow}`; return `${styles.badge} ${styles.badgeGray}`;}
