import { useState, useEffect } from "react";

export default function useFetchArticleData(articleId) {
  const [articleInfo, setArticleInfo] = useState(null);

  useEffect(() => {
    const fetchArticleInfo = async () => {
      try {
        const response = await fetch(`/api/fetchArticleData/${articleId}`);
        if (response.ok) {
          const data = await response.json();
          setArticleInfo(data);
        } else {
          console.error("Failed to fetch article information:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching article information:", error);
      }
    };

    if (articleId) {
      fetchArticleInfo();
    }
  }, [articleId]);

  return articleInfo;
}
