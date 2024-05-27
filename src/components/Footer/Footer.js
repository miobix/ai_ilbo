import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <div className={styles.root}>
      <div className={styles.footerContent}>
        <div className={styles.companyInfo}>
          <div className={styles.description}>
            <p>
              The <span className={styles.ai}>AI</span> Ilbo
            </p>
          </div>
          <div className={styles.infoWrapper}>
            <p>Address: information line</p>
            <p>Contact: information line</p>
            <p>Lorem Ipsum: information line</p>
            <p>Dolor quanta: information line</p>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h4>Title</h4>
          <p>Placeholder content</p>
          <p>Placeholder content</p>
          <p>Placeholder content</p>
        </div>
        <div className={styles.footerColumn}>
          <h4>Title</h4>
          <p>Placeholder content</p>
          <p>Placeholder content</p>
          <p>Placeholder content</p>
        </div>
        <div className={styles.footerColumn}>
          <h4>Title</h4>
          <p>Placeholder content</p>
          <p>Placeholder content</p>
          <p>Placeholder content</p>
        </div>
        <div className={styles.footerColumn}>
          <h4>Title</h4>
          <p>Placeholder content</p>
          <p>Placeholder content</p>
          <p>Placeholder content</p>
        </div>
      </div>
    </div>
  );
}
