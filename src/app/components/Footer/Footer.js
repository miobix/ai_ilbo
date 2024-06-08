import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (

       <div className={styles.Footer}>
       <div className={styles.Fotter_inner}>
         <p className={styles.copyrights}>영남일보 AI © 2024 YeongNamAI. All rights reserved.</p>
       </div>
     </div>  

  );
}
