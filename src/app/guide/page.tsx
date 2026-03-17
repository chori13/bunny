const guides = [
  {
    category: "식이 관리",
    icon: "🥬",
    items: [
      {
        title: "올바른 건초 급여법",
        desc: "토끼의 주식인 건초는 무제한으로 제공해야 합니다. 티모시건초를 기본으로 하고, 6개월 미만 아기 토끼에게는 알팔파 건초를 급여하세요.",
      },
      {
        title: "채소 & 과일 가이드",
        desc: "로메인, 청경채, 바질 등 잎채소를 매일 급여하세요. 과일은 당분이 높으므로 소량만 간식으로 제공합니다. 양배추, 감자, 양파는 절대 금지입니다.",
      },
      {
        title: "충분한 수분 섭취",
        desc: "깨끗한 물을 항상 준비해두세요. 급수병보다 그릇이 자연스러운 자세로 마실 수 있어 더 좋습니다. 매일 물을 교체해주세요.",
      },
    ],
  },
  {
    category: "생활 환경",
    icon: "🏠",
    items: [
      {
        title: "적정 온도 & 습도",
        desc: "토끼에게 적합한 온도는 18~24°C, 습도는 40~60%입니다. 30°C 이상이면 열사병 위험이 있으므로 여름철 냉방에 신경 쓰세요.",
      },
      {
        title: "케이지 환경 관리",
        desc: "케이지는 토끼 몸 크기의 4배 이상이 적당합니다. 바닥은 발바닥 보호를 위해 매트를 깔아주고, 매일 청소해주세요.",
      },
      {
        title: "운동 & 놀이 시간",
        desc: "하루 최소 2~3시간은 케이지 밖에서 자유롭게 뛰어놀 수 있도록 해주세요. 전선이나 위험물은 미리 치워두세요.",
      },
    ],
  },
  {
    category: "건강 체크",
    icon: "🩺",
    items: [
      {
        title: "정기 건강검진",
        desc: "6개월~1년마다 동물병원에서 건강검진을 받으세요. 치아, 귀, 발바닥 상태를 주기적으로 확인하는 것이 중요합니다.",
      },
      {
        title: "이상 증상 알아보기",
        desc: "식욕 감소, 대변 크기 변화, 털 빠짐, 눈/코 분비물이 있으면 즉시 병원에 방문하세요. 토끼는 증상을 숨기는 습성이 있어 주의 깊게 관찰해야 합니다.",
      },
      {
        title: "중성화 수술",
        desc: "4~6개월 이후 중성화 수술을 권장합니다. 자궁 질환 예방(암컷)과 공격성 감소(수컷)에 효과적이며, 수명 연장에도 도움이 됩니다.",
      },
    ],
  },
  {
    category: "그루밍 & 위생",
    icon: "✨",
    items: [
      {
        title: "브러싱 관리",
        desc: "단모종은 주 1회, 장모종은 매일 브러싱해주세요. 털갈이 시기에는 더 자주 빗질하여 모구증(털뭉치)을 예방합니다.",
      },
      {
        title: "발톱 관리",
        desc: "4~6주마다 발톱을 깎아주세요. 혈관(퀵)을 자르지 않도록 주의하고, 자신 없으면 동물병원에서 해주는 것이 안전합니다.",
      },
      {
        title: "목욕은 금지",
        desc: "토끼는 목욕이 필요 없으며, 물에 젖으면 저체온증과 스트레스로 위험할 수 있습니다. 부분적으로 더러워진 경우 젖은 수건으로 닦아주세요.",
      },
    ],
  },
];

const emergencyTips = [
  { sign: "12시간 이상 먹지 않음", level: "긴급" },
  { sign: "6시간 이상 대변이 없음", level: "긴급" },
  { sign: "머리를 한쪽으로 기울임", level: "긴급" },
  { sign: "호흡이 거칠거나 입으로 숨쉼", level: "긴급" },
  { sign: "무기력하고 움직이지 않음", level: "긴급" },
  { sign: "대변이 작아지거나 묽어짐", level: "주의" },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* 헤더 */}
      <div className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60">
          <span className="text-lg">📖</span> 반려토끼 건강 백과
        </div>
        <h1 className="text-4xl font-bold gradient-text">건강 가이드</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/40 leading-relaxed">
          사랑하는 토끼가 오래오래 건강하게 함께할 수 있도록
          <br />
          꼭 알아야 할 관리 정보를 모았습니다
        </p>
      </div>

      {/* 응급 상황 배너 */}
      <section className="mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/10 p-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h2 className="text-lg font-bold text-white">응급 증상 체크리스트</h2>
          </div>
          <p className="mb-5 text-sm text-white/40">
            아래 증상이 보이면 즉시 동물병원에 방문하세요
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {emergencyTips.map((tip) => (
              <div
                key={tip.sign}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
              >
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                    tip.level === "긴급"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {tip.level}
                </span>
                <span className="text-sm text-white/70">{tip.sign}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 가이드 섹션 */}
      <div className="space-y-16">
        {guides.map((section) => (
          <section key={section.category}>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
                {section.icon}
              </span>
              <h2 className="text-xl font-bold text-white">{section.category}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {section.items.map((item) => (
                <div
                  key={item.title}
                  className="glass rounded-2xl p-6 transition hover:border-violet-500/30"
                >
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/40">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
