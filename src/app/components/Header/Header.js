import Image from "next/image";
import styles from "./Header.module.css";
import Link from "next/link";

export default function Header() {
  return (

      //-- Header --//
      <div className={styles.Header}>
        <div className={styles.Header_inner}>
          <ul className={styles.H_left}>
          <Link href="/"><li className={styles.ynlink}>영남일보</li></Link>
            <li className={styles.todate}><span className={styles.bold}>Today</span><sapn className={styles.date}>2024년 5월 25일 금요일</sapn></li>
          </ul>
          <Link href="/"><div className={styles.logo}>영남일보AI</div></Link>
        </div>
      </div>

  );
}


