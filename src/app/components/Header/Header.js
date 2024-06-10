import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  return (

      //-- Header --//
      <div className={styles.Header}>
        <div className={styles.Header_inner}>
          <ul className={styles.H_left}>
            <li className={styles.ynlink}><a href="#none">영남일보</a></li>
            <li className={styles.todate}><span className={styles.bold}>Today</span><sapn className={styles.date}>2024년 5월 25일 금요일</sapn></li>
          </ul>
          <a href="#none" className={styles.logo}>영남일보AI</a>
        </div>
      </div>

  );
}
