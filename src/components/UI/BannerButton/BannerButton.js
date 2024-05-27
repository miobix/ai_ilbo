import styles from "./BannerButton.module.css";

export default function BannerButton({ props, children }) {
  return (
    <div className={styles.container}>
      <p className={styles.text}>{children}</p>
    </div>
  );
}
