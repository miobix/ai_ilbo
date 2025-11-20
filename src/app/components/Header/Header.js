import Image from "next/image";
import styles from "./Header.module.css";
import Link from "next/link";
import * as utils from "../../utils/common.js";

export default function Header() {

  const currentDate = utils.formatTodayDate();

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
        <div className={styles.headerButtonsContainer}>
          <Link href="/chart"><button className={styles.headerButton}>{`기획기사`}</button></Link>
          <Link href="/visits"><button className={styles.headerButton}>{`방문 통계`}</button></Link>
          <Link href="/check"><button className={styles.headerButton}>{`표절 검사기`}</button></Link>
          <Link href="/category/dgpressrelease"><button className={styles.headerButton}>{`대구/경북`}</button></Link>
          <Link href="/category/representatives"><button className={styles.headerButton}>{`의원실`}</button></Link>
          <Link href="/category/sns"><button className={styles.headerButton}>{`SNS`}</button></Link>
          <Link href="/youtube"><button className={styles.headerButton}>{`유튜브`}</button></Link>

        </div>
        </div>
      </div>

      
   
  );
}
