import Image from "next/image";
import styles from "./page.module.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Footer from "../components/NewsGroups/SubArticles/SubArticles";
import Footer from "../components/NewsGroups/SubRelated/SubRelated";

export default function Home() {
  return (
    <main className={styles.main}>
         <Header />
    
        {/*SUB article*/}
        <div className={styles.sub_inner}>
          <div className={styles.article_section}>
            <SubArticles />
            <SubRelated />
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
