import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
          {/*Header*/}
        <div className="Header">
          <div className="Header_inner">
            <ul className="H_left">
              <li className="ynlink"><a href="#none">영남일보</a></li>
              <li className="todate"><span className="bold">Today</span><sapn className="date">2024년 5월 25일 금요일</sapn></li>
            </ul>
            <a href="#none" className="logo">영남일보AI</a>
          </div>
        </div>
    
        <div className="sub_inner">
        </div>
  
        {/*Footer*/}
        <div className="Footer">
          <div className="Fotter_inner">
            <p className="copyrights">영남일보 AI © 2024 YeongNamAI. All rights reserved.</p>
          </div>
        </div>  
    </main>
  );
}
