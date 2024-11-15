import { useState, useEffect } from "react";
import { redirect } from "next/navigation";

export default function useFetchCategoryData(categoryId) {
  const [allNews, setAllNews] = useState([]);

  const validRoutes = {
    representatives: "/api/fetchCongressPress",
    pressrelease: "/api/fetchPressDocs",
    dgpressrelease: "/api/fetchEmailPress",
    sns: "/api/fetchSns",
  };

  useEffect(() => {
    // Validate the categoryId
    if (!validRoutes.hasOwnProperty(categoryId)) {
      redirect("/");
    }

    const fetchData = async () => {
      const endpoint = validRoutes[categoryId];
      
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        setAllNews(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [categoryId]);

  return allNews;
}
