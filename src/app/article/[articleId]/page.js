import Image from "next/image";
import styles from "./page.module.css";
import Header from "@/app/components/Header/Header";
import SubArticles from "@/app/components/NewsGroups/SubArticles/SubArticles";
import SubRelated from "@/app/components/NewsGroups/SubRelated/SubRelated";
import SubPaging from "@/app/components/NewsGroups/SubPaging/SubPaging";
import Footer from "@/app/components/Footer/Footer";


export default function ArticlePage({ params }) {
  function getNewsInfo(id) {
    
  }

  const articleInfo = getNewsInfo(params.articleId)
  console.log(params.articleId)


  return (
    <main className={styles.main}>
         <Header />
    
        {/*SUB article*/}
        <div className={styles.sub_cont}>
            <div className={styles.sub_inner}>
              <div className={styles.article_section}>
                <SubArticles />
                {/* <SubRelated /> */}
              </div>
               <SubPaging />
               <a href="#none" className={styles.ListBtn}>목록</a>
            </div>
        </div>
    
        <Footer />
              
    </main>
  );
}
