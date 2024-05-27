import ColumnList from "@/components/NewsGroups/ColumnList/ColumnList";
import styles from "./CategorySection.module.css";
import NewsCategory from "../NewsCategory/NewsCategory";
import RecommendedNews from "../RecommendedNews/RecommendedNews";

export default function CategorySection() {
  return (
    <div className={styles.root}>
      <div className={styles.divsContainer}>
        <div className={`${styles.leftDiv} ${styles.topNewsDiv}`}>
          <div className={styles.sectionWrapper}>
          <RecommendedNews />
            <div className={styles.newsCategoryWrapper}>
              <NewsCategory categoryTag="environment" />
              <NewsCategory categoryTag="construction"/>
              <NewsCategory categoryTag="batteries"/>
              <NewsCategory categoryTag="economy"/>
            </div>
          </div>
        </div>
        <div className={`${styles.rightDiv} ${styles.topNewsDiv}`}>
          <ColumnList columnTitle="Top News" snippetType="numbered" content="topNews"  />
          <ColumnList columnTitle="Most Recent"  content="mostRecent"    />
        </div>
      </div>
    </div>
  );
}
