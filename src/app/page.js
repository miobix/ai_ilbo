import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className="main">


      <div className="Header">
        <div className="Header_inner">
          <ul className="H_left">
            <li><a href="#none">영남일보</a></li>
            <li><span className="bold">Today</span><sapn className="date">2024년 5월 25일 금요일</sapn></li>
          </ul>
          <a href="#none" className="logo">영남일보AI</a>
        </div>
      </div>


      <div className="Main_cont">
        <div className="Main_cont_inner">
          <h2 className="M_title">AI NEWS</h2>
 
          <div className="M_top_news">
            <a href="#none">
              <p className="tit">경북도, 국힘에 TK특별법 제정과 저출산 극복 등 국가투자 요청</p>
              <p className="sub_tit">경북도가 22대 국회 개원 후 처음으로 5일 서울 켄싱턴호텔에서 열린 국민의 힘과의 예산정책협의회에서 대구경북통합특별법과 저출산 극복등에 대한 국가투자 지원을 요청했다.</p>
              <p className="img"></p>
            </a>           
          </div>
   
          <div className="M_list_news">
            <ul className="li_news">
              <li>
                <a href="#none">
                  <p className="img"></p>
                  <p className="tit">홍준표 국토균형발전 신호탄！… 이철우 대한민국 새판짜기</p>
                  <p className="cont">대구경북(TK)행정통합과 관련해 고위급 4자 회동이 이뤄지는 등 급물살을 타면서 다가오는 지방선거에서 TK통합 단체장을 뽑을 수 있을지 관심이 쏠린다.</p>
                  <p className="date">2024-06-05 06:45</p>
                </a>
              </li>
              <li>
                <a href="#none">
                  <p className="img"></p>
                  <p className="tit">포항 영일만 석유·가스전 프로젝트 대왕고래 사냥 시동</p>
                  <p className="cont">정부와 석유공사는 올해 말부터 상당량의 석유와 가스의 매장 가능성이 큰 동해 심해 시추 탐사에 나선다. 특히, 경북 포항 영일만항 인근 해역 중에서도 자원이 대량 매장돼 있을 것으로 추정된다.</p>
                  <p className="date">2024-06-05 06:45</p>
                </a>
              </li>
              <li>
                <a href="#none">
                  <p className="img"></p>
                  <p className="tit">보건의료노조 전공의들 환자 곁으로 돌아가야…정부 수련병원 체계 등 개선 필요</p>
                  <p className="cont">전국보건의료산업노동조합(보건의료노조)가 전공의들은 진료 거부를 중단하고 환자 곁으로 돌아가야 한다고 했다.5일 보건의료노조는 성명을 내고 (정부와) 강대강 대치를 이어갈 것인가...</p>
                  <p className="date">2024-06-05 06:45</p>
                </a>
              </li>
              <li>
                <a href="#none">
                  <p className="img"></p>
                  <p className="tit">젠슨 황 삼성 HBM 인증 테스트 실패 아니야…절차 진행 중</p>
                  <p className="cont">젠슨 황 엔비디아 최고경영자(CEO)가 삼성전자의 고대역폭 메모리(HBM)가 엔비디아 제품에 탑재될 가능성을 시사했다. 최근 일각에서 제기된 삼성전자 HBM의 엔비디아 인증 테스트 실패설에 반박했다.</p>
                  <p className="date">2024-06-05 06:45</p>
                </a>
              </li>
              <li>
                <a href="#none">
                  <p className="img"></p>
                  <p className="tit">9·19 군사합의 효력 정지 국무회의 통과…이동식 대북 확성기 사용할 듯</p>
                  <p className="cont">국무회의에서 9·19 군사합의 전체 효력을 정지하는 안건을 상정·의결했다. 4일 한덕수 국무총리 주재로 서울 청사에서 열린 국무회의에서 9·19 군사합의 전체의 효력을 정지하는 안건을 상정·심의·의결했다.</p>
                  <p className="date">2024-06-05 06:45</p>
                </a>
              </li>
              <li>
                <a href="#none">
                  <p className="img"></p>
                  <p className="tit">국민의힘, 당원 100% 당대표 투표 규정 폐지 수순… 여론조사 반영 가닥</p>
                  <p className="cont">당심이 민심이라며 개정됐던 당원 100% 당 대표 투표 규정이 국민의힘에서 폐지될 것으로 보인다.국민의힘 당헌·당규 개정 특별위원회는 4일 첫 회의를 열고 전대 룰 개정 관련 논의를 시작했다.</p>
                  <p className="date">2024-06-05 06:45</p>
                </a>
              </li>
              <li>
                <a href="#none">
                  <p className="img"></p>
                  <p className="tit">번아웃\ 셀프 충전법(2) 표정·호흡·말 마인드 훈련\…뇌과학 기반한 케어</p>
                  <p className="cont">자기경영헬스케어는 의학, 뇌과학, 양자물리학을 기반으로 한다. 건강한 심신을 위한 인문과학 융합콘텐츠라고 할 수 있다. 현대인들은 평소 자신이 하는 생각과 그리고 표정과 행동 등이 감정과 할 수 있다.</p>
                  <p className="date">2024-06-05 06:45</p>
                </a>
              </li>
            </ul>
          </div>
       
          <div className="Paging">
            <button>prev</button>
            <ul className="paging_list">
              <li><a href="#none">1</a></li>
              <li><a href="#none">2</a></li>
              <li><a href="#none">3</a></li>
              <li><a href="#none">4</a></li>
              <li><a href="#none">5</a></li>
              <li><a href="#none">6</a></li>              
            </ul>
            <button>next</button>
          </div>
        </div>
      </div>

      <div className="Footer">
        <div className="Fotter_inner">
          <p className="copyrights">영남일보 AI © 2024 YeongNamAI. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
