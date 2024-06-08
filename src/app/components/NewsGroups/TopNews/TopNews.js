import Image from "next/image";
import styles from "./TopNews.module.css";

export default function TopNews() {
  return (

    <div className={styles.M_top_news}>
      <h2 className={styles.M_title}>AI NEWS</h2>
      <a href="#none">
        <p className={styles.tit}>경북도, 국힘에 TK특별법 제정과 저출산 극복 등 국가투자 요청</p>
        <p className={styles.sub_tit}>경북도가 22대 국회 개원 후 처음으로 5일 서울 켄싱턴호텔에서 열린 국민의 힘과의 예산정책협의회에서 대구경북통합특별법과 저출산 극복등에 대한 국가투자 지원을 요청했다.</p>
        <p className={styles.img}><img src="/sample_01.png" /></p>
        <p className={styles.date}>2024-06-05 12:20</p>
      </a>           
    </div>

  );
}
