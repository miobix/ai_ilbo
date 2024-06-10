import Image from "next/image";
import styles from "./SubPaging.module.css";

export default function SubPaging() {
  return (

    <div className={styles.paging_news}>
            {/*prev*/}
            <div className={styles.prev}>
              <h5 className={styles.tit}>이전뉴스</h5>
              <div className={styles.pnews}>
                <a href="#none">
                  <p className={styles.img}><img src="/sample_10.png" /></p>
                  <div className={styles.cnt}>
                    <p className={styles.tit}>홍준표 대구시장, 현충일 맞아 대구호국 정신계승해 한반도 제2도시 만들것</p>
                    <p className={styles.date}>2024.06.07</p>
                  </div>
                </a>
              </div>                  
            </div>
            {/*next*/}
            <div className={styles.next}>
              <h5 className={styles.tit}>다음뉴스</h5>
              <div className={styles.pnews}>
                <a href="#none">
                    <p className={styles.img}><img src="/sample_11.png" /></p>
                    <div className={styles.cnt}>
                      <p className={styles.tit}>尹대통령 유공자·제복영웅 최고 예우로 보답.. 北도발은 압도적 대응</p>
                      <p className={styles.date}>2024.06.07</p>
                    </div>
                </a>
              </div>                  
            </div>
     </div>

  );
}
