import Image from "next/image";
import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import TopNews from "@/components/NewsGroups/TopNews/TopNews";
import NewsList from "@/components/NewsGroups/NewsList/NewsList";

export default function Home() {
  return (
    <main className={styles.main}>      
    
        <Header />
        <div className={styles.main_inner}>
          {/*Main News*/}
          <div className={styles.Main_cont}>
            <div className={styles.Main_cont_inner}>
              <TopNews />
              <NewsList />
              {/*Paging*/}
              <div className={styles.Paging}>
                <button>prev</button>
                <ul className={styles.paging_list}>
                  <li><a href="#none">1</a></li>
                  <li><a href="#none">2</a></li>
                  <li><a href="#none">3</a></li>
                  <li><a href="#none">4</a></li>
                  <li><a href="#none">5</a></li>
                  <li><a href="#none">6</a></li>              
                </ul>
                <button>next</button>
              </div>
            </div>
          </div>
        </div>
  
        <Footer />
          
    </main>
  );
}
