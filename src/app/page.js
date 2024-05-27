import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import TopNews from "@/components/NewsGroups/TopNewsSection/TopNews";
import CategorySection from "@/components/NewsGroups/CategorySection/CategorySection";
import AllNewsSection from "@/components/NewsGroups/AllNewsSection/AllNewsSection";
import Footer from "@/components/Footer/Footer";


export default function Home() {

  return (
    <main className={styles.main}>
      <section>
        <Header />
        <TopNews />
        <CategorySection />
        <div className={styles.allNewsContainer}>
          <AllNewsSection />
        </div>  
        <Footer />
      </section>
    </main>
  );
}
