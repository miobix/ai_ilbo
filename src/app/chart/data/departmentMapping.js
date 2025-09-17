// 부서별 기자 목록 및 부서 코드 매핑 (categoryMapping.js에서 분리)

// 부서별 기자 목록
export const departmentMembers = {
  논설실: [
    { name: "박재일", id: "park11", webId: "wa910150" },
    { name: "윤철희", id: "fehy", webId: "wa910183" },
    { name: "김수영", id: "sykim", webId: "wa910198" },
    { name: "전영", id: "younger", webId: "wa940382" },
    { name: "김진욱", id: "jwook", webId: "wa910107" },
  ],
  사진팀: [
    { name: "이지용", id: "sajahu", webId: "wa900837" },
    { name: "이현덕", id: "lhd", webId: "waa13133" },
    { name: "이윤호", id: "yoonhohi", webId: "waa14847" },
  ],
  정치: [
    { name: "진식", id: "jins", webId: "waa12700" },
    { name: "권혁준", id: "hyeokjun", webId: "waa13935" },
    { name: "정재훈", id: "jjhoon", webId: "waa13638" },
    { name: "서정혁", id: "seo1900", webId: "waa13925" },
    { name: "구경모(세종)", id: "chosim34", webId: "waa13915" },
    { name: "장태훈", id: "hun2", webId: "waa15015" },
  ],
  경제: [
    { name: "임성수", id: "s018", webId: "waa11825" },
    { name: "홍석천", id: "hongsc", webId: "waa14343" },
    { name: "이승엽", id: "sylee", webId: "waa14853" },
    { name: "이동현(경제)", id: "shineast", webId: "waa14703" },
    { name: "윤정혜", id: "hye", webId: "waa14985" },
    { name: "최미애", id: "miaechoi21", webId: "waa13850" },
    { name: "이남영", id: "lny0104", webId: "waa14589" },
  ],
  사회: [
    { name: "최수경", id: "justone", webId: "waa11863" },
    { name: "노진실", id: "know", webId: "waa13265" },
    { name: "최시웅", id: "jet123", webId: "waa14511" },
    { name: "박영민", id: "ympark", webId: "waa14895" },
    { name: "이동현(사회)", id: "leedh", webId: "waa14943" },
    { name: "구경모(대구)", id: "kk0906", webId: "waa15009" },
    { name: "조윤화", id: "truehwa", webId: "waa15021" },
    { name: "강승규", id: "kang", webId: "waa12999" },
    { name: "김종윤", id: "bell08", webId: "waa14997" },
  ],
  경북: [
    { name: "임호", id: "tiger35", webId: "waa11859" },
    { name: "이창호", id: "leech", webId: "waa13190" },
    { name: "박종진", id: "pjj", webId: "waa12885" },
    { name: "오주석", id: "farbrother", webId: "waa14517" },
    { name: "피재윤", id: "ssanaei", webId: "waa14487" },
    { name: "마창훈", id: "topgun", webId: "waa12588" },
    { name: "장석원", id: "history", webId: "waa13312" },
    { name: "황준오", id: "joono", webId: "waa13326" },
    { name: "손병현", id: "why", webId: "waa14571" },
    { name: "배운철", id: "baeuc", webId: "waa13246" },
    { name: "정운홍", id: "jwh", webId: "waa15003" },
    { name: "마창성", id: "mcs12", webId: "wa970920" },
    { name: "김기태", id: "ktk", webId: "waa14211" },
    { name: "전준혁", id: "jjh", webId: "waa14835" },
    { name: "박성우", id: "parksw", webId: "waa13015" },
    { name: "유시룡", id: "ysy" },
    { name: "원형래", id: "Hrw7349", webId: "waa14403" },
    { name: "정용태", id: "jyt", webId: "waa12475" },
    { name: "남두백", id: "dbnam", webId: "waa13307" },
    { name: "장성재", id: "blowpaper", webId: "waa14991" },
    { name: "박진관", id: "pajika", webId: "wa910230" },
    { name: "백종현", id: "baekjh", webId: "wa960235" },
    { name: "박용기", id: "ygpark", webId: "waa14865" },
    { name: "마준영", id: "mj3407", webId: "waa12376" },
    { name: "석현철", id: "shc", webId: "waa13775" },
    { name: "이하수", id: "songam", webId: "wa881073" },
    { name: "박현주", id: "hjpark", webId: "waa13825" },
    { name: "강남진", id: "75kangnj", webId: "waa15033" },
  ],
  문화: [
    { name: "백승운", id: "swback", webId: "waa11434" },
    { name: "박주희", id: "jh", webId: "waa12517" },
    { name: "임훈", id: "hoony", webId: "waa13482" },
    { name: "조현희", id: "hyunhee", webId: "waa14739" },
    { name: "정수민", id: "jsmean", webId: "waa14925" },
    { name: "김은경", id: "enigma", webId: "wa930149" },
  ],
  체육: [
    { name: "이효설", id: "hobak", webId: "waa12277" },
    { name: "정지윤", id: "yooni", webId: "waa14523" },
  ],
  디지털: [
    { name: "이지영", id: "4to11", webId: "waa14859" },
    { name: "서민지", id: "mjs858", webId: "waa14457" },
    { name: "서혜지", id: "hyeji", webId: "waa14691" },
    { name: "박지현", id: "lozpjh", webId: "waa14907" },
    { name: "서영현", id: "rhdqnsk1216" },
  ],
  스토리텔링: [
    { name: "이은경", id: "lek", webId: "waa10407" },
    { name: "박관영", id: "zone5", webId: "wa900172" },
    { name: "박준상", id: "junsang", webId: "waa14331" },
  ],
  기타: [
    { name: "변종현", id: "byeonjh", webId: "waa13208" },
    { name: "천부영", id: "exprich", webId: "waa12296" },
    { name: "김기오", id: "mvalley", webId: "wa900856" },
    { name: "이애란", id: "aerani", webId: "wa950360" },
    { name: "안희정", id: "anhj", webId: "waa11608" },
    { name: "임종규", id: "gumbo89", webId: "waa14000" },
    { name: "공미혜", id: "iskra96", webId: "waa12159" },
    { name: "나은정", id: "mercury", webId: "waa13171" },
    { name: "조영선", id: "sun0930", webId: "waa14499" },
    { name: "구지연", id: "neim35", webId: "waa14433" },
    { name: "전주현", id: "waa13581", webId: "waa13581" },
    { name: "배재석", id: "baejs", webId: "wa880787" },
    { name: "조은주", id: "funej", webId: "waa13945" },
  ],
};

// 부서명 리스트(UI 셀렉트 옵션용)
export const departmentNames = Object.keys(departmentMembers);

// 기사 데이터의 code_name과 UI 부서명을 매핑
// 데이터의 code_name이 예: '디지털뉴스부','정치부','경제부','사회부','경북부','문화부','체육부','사진부','스토리텔링팀','논설실' 등일 때를 커버
export const departmentCodeNameMap = {
  디지털: "디지털뉴스부",
  정치: "정치부",
  경제: "경제부",
  사회: "사회부",
  경북: "경북부",
  문화: "문화부",
  체육: "체육부",
  사진팀: "사진부",
  스토리텔링: "스토리텔링팀",
  논설실: "논설실",
  기타: "기타",
};

// UI 부서명을 기사 code_name으로 변환(없으면 원문 반환)
export const getDeptCodeName = (dept) => departmentCodeNameMap[dept] || dept;
