import { NewsPost } from '@/components/modals/NewsDetailModal';

export const initialNewsPosts: NewsPost[] = [
  {
    id: 'news-todays-1',
    title: "구글(Google), 새로운 차원의 지능형 에이전트 'Stitch' 및 초경량 'Nano' 모델 동시 출격",
    summary: "구글이 모든 구글 워크스페이스와 연동되는 범용 에이전트 Stitch를 공개하고 온디바이스용 초경량 Nano 모델을 발표하며 생태계 확장에 나섰다.",
    content: `글로벌 테크 대전에서 구글이 던진 승부수가 화제다. 2026년 4월 2일, 구글은 자체 개발자 콘퍼런스를 앞두고 차세대 범용 에이전트 'Stitch(스티치)'와 모바일 온디바이스 전용 초경량 AI 'Gemini Nano'의 최적화 파생 모델 일명 '나노바나나(Nano-Banana)' 프로젝트를 기습 공개했다.

Stitch는 기존 구글 어시스턴트나 제미나이를 뛰어넘는 백그라운드 통합형 에이전트로, 사용자의 구글 드라이브, 지메일, 캘린더 등 워크스페이스 전역을 누비며 명령 없이도 작업(예: 주간 보고서 초안 작성, 일정 조율 등)을 선행적으로 완수하는 자율 엔진이다.

특히 이번 행사에서 시연된 구글 'Flow(플로우)' 아키텍처는 에이전트가 복잡한 다단계 업무를 스스로 나누고 중간 검증을 거치는 획기적 런타임 환경으로 극찬받았다. 구글은 "진정한 의미의 액션 모델(Action Model)의 시대가 열렸다"며 시장 리더십을 확고히 했다.`,
    imgSrc: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://news.google.com',
    sourceName: 'Google AI Blog',
    tag: 'Model Update',
    timeLabel: '2026-04-02'
  },
  {
    id: 'news-todays-2',
    title: "LLM 삼국지 격화: GPT-5 (Sora 통합), Claude 3.5 Opus, Gemini 2.0 울트라의 불꽃 튀는 경쟁",
    summary: "오픈AI의 차세대 GPT와 앤스로픽의 진화된 Claude, 구글의 제미나이 2.0이 나란히 벤치마크 신기록을 경신하며 26년 4월을 뜨겁게 달구고 있다.",
    content: `전통적인 대형언어모델(LLM) 시장이 단순한 파라미터 경쟁을 넘어 '추론(Reasoning)'과 '멀티모달 통합' 전쟁으로 진입했다. 이번 주, 오픈AI는 기존 Sora 비디오 생성기를 완전히 통합한 네이티브 티어 'GPT-5' 아키텍처의 일부를 연구자들에게 제한적으로 공개하며 주가를 올렸다.

이에 질세라 앤스로픽(Anthropic)은 코딩과 고도화된 논리 능력이 15% 이상 상승한 Claude 3.5 Opus(클로드 3.5 오푸스)의 상용 API를 정식 런칭했다. 클로드는 할루시네이션(환각)을 제로에 가깝게 통제하는 '체크-리트리브' 체계를 내재화해 금융, 법률 등 B2B 엔터프라이즈의 압도적 지지를 받고 있다.

한편, 구글 역시 제미나이 2.0 울트라(Gemini 2.0 Ultra)가 글로벌 생태계 통합형 모델로서 가장 방대한 실시간 지식 체계를 증명했다. 업계 전문가들은 "이제 LLM은 단순한 문장 생성기가 아닌, 전 산업을 자동화하는 논리 코어로 자리 잡았다"고 진단했다.`,
    imgSrc: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://www.reuters.com',
    sourceName: 'AI Daily',
    tag: 'Hot Issue',
    timeLabel: '2026-04-02'
  },
  {
    id: 'news-todays-3',
    title: "미드저니(Midjourney) V8.1 업데이트 초읽기... 애플 출신 엔지니어 합류로 하드웨어 루머 점화",
    summary: "사진보다 더 사진 같은 V8 알파 모델을 건너뛰고 강력해진 V8.1의 정식 배포를 예고한 미드저니, 하드웨어 시장 진출설까지 터져나왔다.",
    content: `디자이너들의 절대적 지지를 받고 있는 이미지 생성 AI 스튜디오 미드저니(Midjourney)가 외부 벤처 펀딩을 받지 않는 일명 '부트스트래핑(Bootstrapping)' 경영 방식으로 연 매출 2억 달러를 돌파한 가운데 새로운 V8.1 업데이트 일정을 공개했다.

이번 4월 첫째 주에 배포되는 'V8.1' 정식 버전은 이전 대비 생성 속도가 5배 단축되고, 텍스트 일치성 및 개인 화풍을 고정할 수 있는 '커스텀 레퍼런스' 제어력이 역대 최강 수준으로 올라설 예정이다. 

더욱 놀라운 점은 데이비드 홀츠 CEO가 애플 비전 프로(Apple Vision Pro) 수석 엔지니어들을 대거 영입하며, AI 생성 공간을 현실로 뿌려주는 '독자 하드웨어' 시장 진출 기조를 비쳤다는 점이다. 생성형 AI가 증강 현실(AR/VR) 폼팩터로 진출하는 신호탄이 되리라 분석되고 있다.`,
    imgSrc: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://zdnet.co.kr',
    sourceName: 'ZDNet',
    tag: 'Midjourney',
    timeLabel: '2026-04-01'
  },
  {
    id: 'news-todays-4',
    title: "런웨이(Runway), 비디오 AI 절대강자 등극... 'Gen-4.5' 할리우드 진출 및 글로벌 펀드 조성",
    summary: "생성형 비디오 시장의 강자 런웨이가 할리우드 프로덕션을 타깃으로 한 Gen-4.5를 공개하고 천만 달러 규모의 창작자 펀드를 출범했다.",
    content: `비디오 AI 시장에서 압도적인 선두 그룹을 유지 중인 런웨이(Runway)가 또 한 번 시장을 뒤집어 놨다. 오픈AI의 소라(Sora)가 상용화 문턱에서 주춤한 사이, 런웨이는 물리 엔진(Physics Engine)의 현실 감각을 더 완벽히 구현한 차세대 모델 'Gen-4.5'를 기습 발매했다.

신규 모델인 Gen-4.5 커스텀 렌더 기술은 할리우드 영화 스튜디오 및 애니메이션 업계에서 "별도 후반 작업(VFX) 없이 곧바로 사용 가능한 수준"이라는 평을 들으며 블록버스터급 영화 파이프라인에 대거 편입되고 있다. 

이와 함께 런웨이는 전 세계 독립 영화 감독과 크리에이터들을 지원하기 위한 1,000만 달러 규모의 '글로벌 런웨이 펀드(Global Runway Fund)'를 발표하며 영상 AI 생태계 자체를 그들의 리그로 만들기 위한 거대한 포석을 던졌다.`,
    imgSrc: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://www.bloomberg.com',
    sourceName: 'Bloomberg',
    tag: 'Investment',
    timeLabel: '2026-04-01'
  },
  {
    id: 'news-todays-5',
    title: "GS리테일, 생성형 AI 기반 'O4O 스마트 유통망' 구축 박차... 오프라인 혁신 주도",
    summary: "유통 강자 GS리테일(GS홈쇼핑)이 AI 알고리즘을 물류 및 옴니채널 전반에 결합하며 초개인화된 O4O 시대의 포문을 열었다.",
    content: `최근 한국 유통 시장 내 AI 패권 경쟁이 뜨거운 가운데, 유통 플랫폼 강자 GS리테일(GS홈쇼핑 포함)의 파격적인 행보가 주목받고 있다. 금일 4월 2일 진행된 'GS AI 파트너스 데이'에서 GS는 데이터 분석 시스템(BI) 및 공급망 전반에 대화형 AI 알고리즘을 도입한다고 밝혔다.

단순 상품 큐레이션을 넘어, 날씨 및 지역 축제, SNS의 마이크로 트렌드 같은 광범위한 외부 데이터를 LLM으로 분석하고 재고 예측률을 98% 이상 끌어올리는 '하이퍼 로컬 스마트 재고망' 모델을 선보였다.

또한 IBK기업은행 등 페이 파트너스들과 협업하여 디지털 결제망을 고도화하고, GS페이 기반 O4O(Online for Offline) 플랫폼의 결합을 통해 전국 수만 개의 GS25 및 GS더프레시 등 오프라인 거점을 거대한 AI 데이터 파이프라인으로 전환하겠다는 비전을 제시했다.`,
    imgSrc: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://www.hankyung.com',
    sourceName: '한국경제',
    tag: 'Domestic',
    timeLabel: '2026-04-02'
  },
  {
    id: 'news-todays-6',
    title: "어도비(Adobe AI), 엔비디아와 특급 동맹... '파이어플라이' 상업용 절대 패권 선언",
    summary: "저작권에서 가장 자유로운 이미지 AI 파이어플라이를 보유한 어도비가 엔비디아의 디지털 트윈 파운드리와 손잡고 기업 시장을 공략한다.",
    content: `어도비(Adobe)가 저작권 문제 없이 상업적으로 활용 가능한 AI 모델 '파이어플라이(Firefly)' 시리즈의 무제한 스탠다드 요금제를 새롭게 런칭하며 크리에이티브 클라우드의 우위를 굳건히 하고 있다.

가장 이목을 집중시킨 것은 어도비와 '엔비디아(NVIDIA)' 간의 이른바 '디지털 트윈 매트릭스' 동맹이다. 엔비디아의 차세대 브랙웰(Blackwell) 아키텍처 및 옴니버스(Omniverse) 클라우드 환경에 어도비 AI API가 통합됨으로써, 기업 고객들은 저작권 침해 우려(IP Safe)가 없는 산업용 에셋, 3D 렌더링, 패키징 시안 등을 단 몇 분 만에 뚝딱 만들어 낼 수 있게 되었다.

어도비 측 디렉터는 "생성형 AI 시대에서 기업이 가장 두려워하는 것은 '법적 리스크'다. 어도비는 가장 안전하고 합법적인 형태의 최고 퀄리티를 보장하며 글로벌 B2B 시장의 패권을 선점했다"고 자신감을 보였다.`,
    imgSrc: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://techcrunch.com',
    sourceName: 'TechCrunch',
    tag: 'Hot Issue',
    timeLabel: '2026-04-01'
  },
  {
    id: 'news-todays-7',
    title: "오픈소스 AI의 심장, 컴피UI(ComfyUI)... 3D 모델링 생성 전면 돌입",
    summary: "복잡한 노드 기반의 이미지 생성 워크플로우로 사랑받는 ComfyUI가 3D/멀티미디어 OS로의 폭발적 진화를 거듭하고 있다.",
    content: `마니아층과 AI 연구자들에게 필수적인 도구로 자리매김한 '컴피UI (ComfyUI)'. 복잡한 노드를 시각화하여 가장 디테일한 제어력을 선사해 온 이 플랫폼이 텐센트 클라우드 3.0 공식 파트너십과 전격 손을 잡으며 3D 모델링 생성 파이프라인 패치를 단행했다.

기존 2D 이미지의 선을 따서 채색하고 스타일을 변환하는 영역을 한 단계 뛰어넘어, 프롬프트 한 번이면 하이폴리곤(High-Polygon) 3D 객체를 렌더링 할 수 있는 노드 통합 기능이 추가된 것이다. 

메시(mesh) 구축부터 텍스쳐 UV 매핑까지 노드 한 두 번의 연결로 자동화되는 기술적 진보는 개별 AI 프로그래머들의 폭발적인 환호를 끌어냈으며, 스테이블디퓨전(Stable Diffusion) 생태계에서 ComfyUI의 단독 왕국 체제를 더욱 공고히 하고 있다.`,
    imgSrc: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://aws.amazon.com/ko/blogs',
    sourceName: 'AI OS Insight',
    tag: 'Model Update',
    timeLabel: '2026-03-31'
  },
  {
    id: 'news-todays-8',
    title: "소셜 미디어에 맞춘 숏폼 비디오 생성 AI, '힉스필드(Higgsfield.ai)' 혜성처럼 등장",
    summary: "틱톡 및 릴스를 겨냥해 스마트폰 중심의 비디오를 생성하는 신규 AI 스타트업 힉스필드가 핫 트렌드로 부상했다.",
    content: `런웨이나 소라(Sora)가 할리우드 등 전문가 시네마틱 레벨을 노리고 있다면, 가볍지만 파괴력 있는 숏폼 비디오를 겨냥하며 태어난 스타트업 'Higgsfield.ai (힉스필드)'가 주목을 받고 있다.

이들의 앱 '디퓨즈(Diffuse)'는 사용자 본인의 셀카나 이미지를 가져와 소셜 미디어 포맷(세로형 9:16)에 적합한 댄스 영상, 밈 형태의 액션 비디오를 실시간으로 추출해 낸다. 이 새로운 시각의 모델은 공개 직후 글로벌 Z세대를 사로잡으며 일일 활성 사용자 수백만 명을 기록하고 있다.

특히 영상 마케팅을 고려하는 유통업계 등에서 광고 전용 숏폼 모델 제작 툴로써의 협업 문의가 줄을 잇고 있어 차세대 유니콘 탄생의 서막을 알리는 중이다.`,
    imgSrc: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://news.ycombinator.com',
    sourceName: 'HackerNews',
    tag: 'Hot Issue',
    timeLabel: '2026-04-02'
  },
  {
    id: 'news-todays-9',
    title: "3D 생성형 AI 패러다임 전환: meshy, Varco 등의 시장 개편 고도화",
    summary: "고품질 3D 모델을 수초 만에 깎아내는 Meshy, 국산 초거대 플랫폼 Varco 등 3D 공간을 구축하는 AI 기업들의 눈부신 성과가 기록되었다.",
    content: `글로벌 메타버스와 게임 업계를 겨냥해 '텍스트-투-3D' 및 '이미지-투-3D' 기술이 극적인 전환점을 맞이했다. 대표적으로 Meshy(메시) AI는 가장 최신의 PBR(물리 기반 렌더링) 질감을 완벽히 입히는 3D 제너레이터를 출시해 이목을 끌었다. 

수백만 개의 폴리곤을 몇 단어의 프롬프트로 깎아내는 이 기술은 기존 아티스트들에게 일주일에 걸리던 모델링 작업을 단 20초 만에 끝낸다. 아울러 엔씨소프트 등의 국산 거대 AI 모델인 Varco(바르코) 스튜디오 역시 게임 개발 내의 NPC 대사, 텍스처, 월드 에셋 생성을 원스톱으로 지원하며 고도화를 완료했다.

이 같은 3D AI 생태계의 도약은, 향후 AR 글래스 및 공간 컴퓨팅 디바이스에 필요한 광범위한 3D 가상 공간 에셋 채우기 경쟁의 핵심 무기가 될 예정이다.`,
    imgSrc: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://www.gamasutra.com',
    sourceName: 'Game Developer',
    tag: 'Model Update',
    timeLabel: '2026-04-01'
  },
  {
    id: 'news-todays-10',
    title: "한국 유통 대격변, 'AI와 커머스의 화학적 결합' 가속화... GS 전략 분석",
    summary: "단순 무인 매장을 넘어 융합 리테일로, 한국 유통업체들은 AI 시스템을 핵심으로 한 개인맞춤 소비 패턴 분석을 전면 돌입한다.",
    content: `온라인 커머스의 강세 속에 전통 유통 기업들의 'AI 대반격'이 시작되었다. 국내 유통시장의 빅플레이어들은 생성형 AI 챗봇을 전면 배포하는 한편, AI에 기반한 홈쇼핑 제품 소싱, 수요 예측, 맞춤형 모바일 숏폼 큐레이션 등 융합 시스템을 고도화하고 있다.

특히 GS그룹 핵심 채널인 대형마트와 편의점, 홈쇼핑은 실시간 고객 피드백 자연어 텍스트를 분석하여 2주 단위의 트렌드로 상품군을 갈아치우는 기민한 공급 체계를 구축했다. 업계 리포트에 따르면 유통가에 적용된 LLM 콜봇이 구매 전환율을 평균 7.3% 상승시키면서 실적 견인차 노릇을 톡톡히 하는 것으로 나타났다. 

유통 전문가들은 "대한민국 시장은 고객의 빠른 피드백 주기 덕분에 AI 기술을 가장 강력하게 이식해 볼 수 있는 최고의 샌드박스"라고 입을 모았다. AI와 커머스의 결합은 전례없는 속도로 가속화되고 있다.`,
    imgSrc: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
    sourceUrl: 'https://biz.chosun.com',
    sourceName: '조선비즈',
    tag: 'Domestic',
    timeLabel: '2026-04-02'
  }
];
