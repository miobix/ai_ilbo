import styles from "./Header.module.css";
import BannerButton from "../UI/BannerButton/BannerButton";
import Link from "next/link";

export default function Header() {
  return (
    <div className={styles.bannerContainer}>
      <Link href="/">
        <div className={styles.description}>
          <p>
            The <span className={styles.ai}>AI</span> Ilbo
          </p>
        </div>
      </Link>

      <div className={styles.sectionsContainer}>
        <BannerButton>
          <Link href="/category/economy">Economy</Link>
        </BannerButton>
        <BannerButton>
          <Link href="/category/construction">Construction</Link>
        </BannerButton>
        <BannerButton>
          <Link href="/category/environment">Environment</Link>
        </BannerButton>
        <BannerButton>
          <Link href="/category/batteries">Batteries</Link>
        </BannerButton>
      </div>
    </div>
  );
}
