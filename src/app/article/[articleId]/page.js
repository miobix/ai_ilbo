"use client";
import styles from "./page.module.css";
import Header from "@/app/components/Header/Header";
import MainArticle from "@/app/components/NewsGroups/MainArticle/MainArticle";
import Footer from "@/app/components/Footer/Footer";
import { useParams } from "next/navigation";
import Link from "next/link";
import useFetchArticleData from "../../hooks/useFetchArticleData";
import * as utils from "../../utils/common"
import PressRelease from "@/app/components/NewsGroups/PressRelease/PressRelease";

export default function ArticlePage() {
  const { articleId } = useParams();
  const articleInfo = useFetchArticleData(articleId);

  if (!articleInfo) {
    return <div>Loading...</div>;
  }

  let articleToRender = <MainArticle news={articleInfo} />

  if (utils.isPressRelease(articleInfo)) {
    articleToRender = <PressRelease news={articleInfo} />
  } 

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.sub_cont}>
        <div className={styles.sub_inner}>
          <div className={styles.article_section}>
            {articleToRender}
          </div>

          <Link href={`/`}>
            <div className={styles.ListBtn}>목록</div>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
