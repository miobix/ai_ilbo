import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import styles from "../../category/[categoryId]/page.module.css";
import AllNewsSection from "@/components/NewsGroups/AllNewsSection/AllNewsSection";
import ColumnList from "@/components/NewsGroups/ColumnList/ColumnList";

export default function CategoryPage({ params }) {
  return (
    <main className={styles.rootContainer}>
      <section>
        <Header />
        <div className={styles.sectionContainer}>
          <div className={styles.allNewsContainer}>
            <AllNewsSection />
          </div>
          <div className={styles.columnListContainer}>
            <ColumnList columnTitle="Most Viewed" snippetType="numbered" />
          </div>
        </div>

        <Footer />
      </section>
    </main>
  );
}
