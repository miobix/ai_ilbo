import Image from "next/image";
import styles from "./NewsList.module.css";
import HomepageNewsCard from "../../HomepageNewsCard/page";

export default function NewsList() {
  return (

    <div className={styles.M_list_news}>
                <ul className={styles.li_news}>
                  <li>
                   <HomepageNewsCard />
                  </li>
                  <li>
                  <HomepageNewsCard />
                    
                  </li>
                  <li>
                  <HomepageNewsCard />
                    
                  </li>
                  <li>
                  <HomepageNewsCard />
                  </li>
                  <li>
                  <HomepageNewsCard />
                  </li>
                  <li>
                  <HomepageNewsCard />
                  </li>
                  <li>
                  <HomepageNewsCard />
                  </li>
                </ul>
              </div>

  );
}
