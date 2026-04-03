"use client";

import styles from "./Header.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as utils from "../../utils/common.js";

export default function Header() {
  const router = useRouter();
  const currentDate = utils.formatTodayDate();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className={styles.Header}>
      <div className={styles.Header_inner}>
        <ul className={styles.H_left}>
          <Link href="/">
            <li className={styles.ynlink}>영남일보</li>
          </Link>
          <li className={styles.todate}>
            <span className={styles.bold}>Today</span>
            <span className={styles.date}>{currentDate}</span>
          </li>
        </ul>
        <Link href="/">
          <div className={styles.logo}>영남일보AI</div>
        </Link>
        {/* 오른쪽 상단 로그아웃 버튼 */}
        <div className={styles.logoutTopRight}>
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
        <div className={styles.headerButtonsContainer}>
          <Link href="/chart">
            <button className={styles.headerButton}>{`기획기사`}</button>
          </Link>
          <Link href="/typos">
            <button className={styles.headerButton}>{`오탈자`}</button>
          </Link>

          <Link href="/visits">
            <button className={styles.headerButton}>{`방문 통계`}</button>
          </Link>
           <Link href="/seeds">
            <button className={styles.headerButton}>{`글감`}</button>
          </Link>

          <Link href="/check">
            <button className={styles.headerButton}>{`표절 검사기`}</button>
          </Link>
          <Link href="/category/dgpressrelease">
            <button className={styles.headerButton}>{`대구/경북`}</button>
          </Link>
          {/* <Link href="/category/representatives">
            <button className={styles.headerButton}>{`의원실`}</button>
          </Link> */}
          {/* <Link href="/category/pressrelease"><button className={styles.headerButton}>{`보도자료`}</button></Link> */}
          {/* <Link href="/category/sns">
            <button className={styles.headerButton}>{`SNS`}</button>
          </Link> */}
          {/* <Link href="/youtube"><button className={styles.headerButton}>{`유튜브`}</button></Link> */}
        </div>
      </div>
    </div>
  );
}
