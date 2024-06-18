import Image from "next/image";
import styles from "./Header.module.css";
import Link from "next/link";

export default function Header() {
  function formatDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because January is 0
    const day = String(currentDate.getDate()).padStart(2, "0");

    // Array of Korean day names
    const koreanDays = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = koreanDays[currentDate.getDay()]; // Get day of the week and map to Korean day name

    return `${year}년 ${month}월 ${day}일 ${dayOfWeek}요일`;
  }
  const currentDate = formatDate();
  return (
    //-- Header --//
    <div className={styles.Header}>
      <div className={styles.Header_inner}>
        <ul className={styles.H_left}>
          <Link href="/">
            <li className={styles.ynlink}>영남일보</li>
          </Link>
          <li className={styles.todate}>
            <span className={styles.bold}>Today</span>
            <span className={styles.date}>{currentDate} </span>
          </li>
        </ul>
        <Link href="/">
          <div className={styles.logo}>영남일보AI</div>
        </Link>
        <div className={styles.headerButtonsContainer}>
        <Link href="/category/1a"><button className={styles.headerButton}>{`증권`}</button></Link>
        <Link href="/category/pressrelease"><button className={styles.headerButton}>{`보도자료`}</button></Link>
        </div>
      </div>

      
    </div>
  );
}
