import styles from './page.module.css'

export default function HomepageNewsCard(){
    return (
        <a href="#none">
        <p className={styles.img}><img src="/sample_02.png" /></p>
        <div className={styles.cnt}>
          <p className={styles.tit}>홍준표 국토균형발전 신호탄！… 이철우 대한민국 새판짜기</p>
          <p className={styles.cont}>대구경북(TK)행정통합과 관련해 고위급 4자 회동이 이뤄지는 등 급물살을 타면서 다가오는 지방선거에서 TK통합 단체장을 뽑을 수 있을지 관심이 쏠린다.</p>
          <p className={styles.date}>2024-06-05 06:45</p>
        </div>
      </a>
    )
}