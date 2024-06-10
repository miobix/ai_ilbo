"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Header from "@/app/components/Header/Header";
import SubArticles from "@/app/components/NewsGroups/SubArticles/SubArticles";
import SubRelated from "@/app/components/NewsGroups/SubRelated/SubRelated";
import SubPaging from "@/app/components/NewsGroups/SubPaging/SubPaging";
import Footer from "@/app/components/Footer/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ArticlePage({ params }) {
  const [articleInfo, setArticleInfo] = useState(null);

  useEffect(() => {
    const fetchArticleInfo = async () => {
      try {
        const response = await fetch(`/api/fetchArticleData/${params.articleId}`);
        if (response.ok) {
          const data = await response.json();
      
          setArticleInfo(data);
        } else {
          console.error('Failed to fetch article information:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching article information:', error);
      }
    };

    if (params.articleId) {
      fetchArticleInfo();
    }
  }, []);

  return (
    <main className={styles.main}>
         <Header />
    
        {/*SUB article*/}
        <div className={styles.sub_cont}>
            <div className={styles.sub_inner}>
              <div className={styles.article_section}>
                <SubArticles news={articleInfo}/>
                {/* <SubRelated /> */}
              </div>
               {/* <SubPaging /> */}
               <Link href={`/`}><div className={styles.ListBtn}>목록</div></Link>
            </div>
        </div>
    
        <Footer />
              
    </main>
  );
}
