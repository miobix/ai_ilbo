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
    
        {/*SUB article*/}
        <div className="sub_inner">
          {/*article section*/}
          <div className="article_section">
            <div className="article">
              <h3 className="category">정치</h3>
              <p className="tit">경북도, 국힘에 TK특별법 제정과 저출산 극복 등 국가투자 요청</p>
              <ul className="datelist">
                <li className="name">정지윤</li>
                <li className="date">입력 2024-06-07 10:29</li>
                <li className="date">수정 2024-06-07 10:29</li>
                <li className="date">발행일 2024-06-07 10:29</li>
              </ul>
              <p className="img"><img src="/sample_09.png" /></p>
              <p className="imgtxt">경북 포항 영일만 일대에 최대 140억배럴 규모의 석유·가스가 매장돼 있을 가능성이 있다고 분석한 미국 액트지오(Act-Geo)의 비토르 아브레우대표가 7일 오전 정부세종청사 산업통상자원부 기자실에서 동해 심해 가스전 개발과 관련한 브리핑을 하고 있다. 연합뉴스</p>
              <div className="article_cnts">
                <p>비토르 아브레우 액트지오 고문은 7일 동해 심해 탐사와 관련해 프로젝트 유망성은 상당히 높아 전 세계적인 석유 관련 회사들이 주목하는 상황이라고 밝혔다. 아브레우 고문은 이날 정부세종청사에서 열린 브리핑에서 우리가 분석한 모든 유정이 석유와 가스의 존재를 암시하는 모든 재요소가 갖춰져 있다며 이같이 말했다.</p>
                <p>그는 석유와 가스가 존재하기 위해서는 모래(저류층)가 있고, 대륙붕 4면이 진흙(덮개암)으로 가득 차 있어야하는데 (포항 영일만 일대) 분지에 모두 존재한다는 사실을 발견했다며 모래의 공극 사이에 석유가 존재하게 되고 덮개암이 가져 있는 석유를 가두어주는 역할을 하게 되는 것이라고 설명했다.</p>
                <p>아부레우 고문은 지난 3일 윤석열 대통령이 포항 영일만 일대에 석유·가스 최대 140억 배럴이 매장돼 있을가능성이 높다고 발표한 지 이틀 만에 직접 한국을 찾았다.</p>
                <p>다만 아브레우 고문은 큰 규모의 경제성 있는 탄화수소가 누적돼 있다는 사실은 찾지 못했다고 설명했다.</p>
                <p>그는 리스크가 있을 수 있다는 의미라며 석유가 실제로 매장돼 있는지 전망하기 위해서는 4가지 요소가 있는데 기반암, 적유층, 덮개암, 트랙인데, (포항 영일만 일대) 분석 진행 결과, 시추공이 3개가 이미 있고,탄성적 품질이 좋았다는 점은 이점이라고 분석했다.</p>
                <p>그러면서 기존에 있던 3개의 시추공(유정)을 대상으로 연구한 결과 실패 요인을 확인할 수 있었다며 이를 통해 유망구조를 도출하게 됐다고 강조했다.</p>
                <p>아브레우 고문은 입증할 수 있는 방법은 시추하는 것밖에 남아 있지 않다고 덧붙였다.</p>
              </div>
              <span className="name">정지윤 기자</span>
            </div>
            {/*related article section*/}
            <div className="related">
              <h4 className="tit">관련뉴스</h4>
              <ul className="related_list">
                <li>
                  <a href="#none">
                    <p className="img"><img src="/sample_12.png" /></p>
                    <div className="cnt">
                      <p className="tit">일본정부, 한국 국립해양조사원 독도주변 해양조사에 항의</p>
                      <p className="date">2024.06.07</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#none">
                    <p className="img"><img src="/sample_13.png" /></p>
                    <div className="cnt">
                      <p className="tit">[속보] 아브레우 고문20% 추정 성공률 양호하고 높은 수준</p>
                      <p className="date">2024.06.07</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#none">
                    <p className="img"><img src="/sample_14.png" /></p>
                    <div className="cnt">
                      <p className="tit">경주시, 교육발전특구 지정에 힘쓴다.</p>
                      <p className="date">2024.06.07</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#none">
                    <p className="img"><img src="/sample_12.png" /></p>
                    <div className="cnt">
                      <p className="tit">일본정부, 한국 국립해양조사원 독도주변 해양조사에 항의</p>
                      <p className="date">2024.06.07</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#none">
                    <p className="img"><img src="/sample_12.png" /></p>
                    <div className="cnt">
                      <p className="tit">일본정부, 한국 국립해양조사원 독도주변 해양조사에 항의</p>
                      <p className="date">2024.06.07</p>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>
           {/*paging news section*/}
           <div className="paging_news">
            {/*prev*/}
            <div className="prev">
              <h5 className="tit">이전뉴스</h5>
              <div className="pnews">
                <p className="img"><img src="/sample_10.png" /></p>
                <div className="cnt">
                  <p className="tit">홍준표 대구시장, 현충일 맞아 대구호국 정신계승해 한반도 제2도시 만들것</p>
                  <p className="date">2024.06.07</p>
                </div>
              </div>                  
            </div>
            {/*next*/}
            <div className="next">
              <h5 className="tit">이전뉴스</h5>
              <div className="pnews">
                <p className="img"><img src="/sample_11.png" /></p>
                <div className="cnt">
                  <p className="tit">尹대통령 유공자·제복영웅 최고 예우로 보답.. 北도발은 압도적 대응</p>
                  <p className="date">2024.06.07</p>
                </div>
              </div>                  
            </div>
           </div>
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
