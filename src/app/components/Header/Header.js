import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  return (

      //-- Header --//
      <div className="Header">
        <div className="Header_inner">
          <ul className="H_left">
            <li><a href="#none">영남일보</a></li>
            <li><span className="bold">Today</span><sapn className="date">2024년 5월 25일 금요일</sapn></li>
          </ul>
          <a href="#none" className="logo">영남일보AI</a>
        </div>
      </div>

  );
}
