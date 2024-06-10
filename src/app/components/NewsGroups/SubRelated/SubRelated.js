import Image from "next/image";
import styles from "./SubRelated.module.css";

export default function SubRelated() {
  return (

    <div className={styles.related}>
      <h4 className={styles.tit}>관련뉴스</h4>
      <ul className={styles.related_list}>
        <li>
          <a href="#none">
            <p className={styles.img}><img src="/sample_12.png" /></p>
            <div className={styles.cnt}>
              <p className={styles.tit}>일본정부, 한국 국립해양조사원 독도주변 해양조사에 항의</p>
              <p className={styles.date}>2024.06.07</p>
            </div>
          </a>
        </li>
        <li>
          <a href="#none">
            <p className={styles.img}><img src="/sample_13.png" /></p>
            <div className={styles.cnt}>
              <p className={styles.tit}>[속보] 아브레우 고문20% 추정 성공률 양호하고 높은 수준</p>
              <p className={styles.date}>2024.06.07</p>
            </div>
          </a>
        </li>
        <li>
          <a href="#none">
            <p className={styles.img}><img src="/sample_14.png" /></p>
            <div className={styles.cnt}>
              <p className={styles.tit}>경주시, 교육발전특구 지정에 힘쓴다.</p>
              <p className={styles.date}>2024.06.07</p>
            </div>
          </a>
        </li>
        <li>
          <a href="#none">
            <p className={styles.img}><img src="/sample_12.png" /></p>
            <div className={styles.cnt}>
              <p className={styles.tit}>일본정부, 한국 국립해양조사원 독도주변 해양조사에 항의</p>
              <p className={styles.date}>2024.06.07</p>
            </div>
          </a>
        </li>
        <li>
          <a href="#none">
            <p className={styles.img}><img src="/sample_12.png" /></p>
            <div className={styles.cnt}>
              <p className={styles.tit}>일본정부, 한국 국립해양조사원 독도주변 해양조사에 항의</p>
              <p className={styles.date}>2024.06.07</p>
            </div>
          </a>
        </li>
      </ul>
    </div>


  );
}
