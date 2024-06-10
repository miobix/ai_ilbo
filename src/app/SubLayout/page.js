import Image from "next/image";
import styles from "./page.module.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Footer from "../components/NewsGroups/SubArticles/SubArticles";

export default function Home() {
  return (
    <main className={styles.main}>
         <Header />
    
        {/*SUB article*/}
        <div className={styles.sub_inner}>
          <div className={styles.article_section}>
            <SubArticles />
            {/*related article section*/}
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
          </div>
           {/*paging news section*/}
           <div className={styles.paging_news}>
            {/*prev*/}
            <div className={styles.prev}>
              <h5 className={styles.tit}>이전뉴스</h5>
              <div className={styles.pnews}>
                <p className={styles.img}><img src="/sample_10.png" /></p>
                <div className={styles.cnt}>
                  <p className={styles.tit}>홍준표 대구시장, 현충일 맞아 대구호국 정신계승해 한반도 제2도시 만들것</p>
                  <p className={styles.date}>2024.06.07</p>
                </div>
              </div>                  
            </div>
            {/*next*/}
            <div className={styles.next}>
              <h5 className={styles.tit}>다음뉴스</h5>
              <div className={styles.pnews}>
                <p className={styles.img}><img src="/sample_11.png" /></p>
                <div className={styles.cnt}>
                  <p className={styles.tit}>尹대통령 유공자·제복영웅 최고 예우로 보답.. 北도발은 압도적 대응</p>
                  <p className={styles.date}>2024.06.07</p>
                </div>
              </div>                  
            </div>
           </div>
        </div>
  
        <Footer />
              
    </main>
  );
}
