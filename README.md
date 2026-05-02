# 🎮 SGP — 멀티 게임 센서 플랫폼

> 센서 하나로 무한한 게임을! 아마추어 행사용 범용 타이밍/게임 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ 주요 특징

- **서버 불필요** — HTML 파일만 있으면 어디서든 실행
- **Web Serial API** — Chrome에서 Arduino 직접 연결
- **HDMI 지원** — 노트북 → 대형화면 출력
- **엑셀/CSV 저장** — 기록 즉시 내보내기
- **12가지 게임 모드** — 타임랩, 반응속도, 무게, 소리 등
- **토너먼트/팀 대결** — 다양한 진행 방식 지원
- **UI 커스터마이징** — 테마, 로고, 효과음 설정

---

## 📁 파일 구조

```
sensor-game-platform/
├── index.html          ← 홈 / 게임 선택
├── setup.html          ← 참가자 설정
├── customize.html      ← UI 커스터마이징
├── game.html           ← 게임 진행 (타이머)
├── result.html         ← 최종 결과 / 내보내기
├── tournament.html     ← 토너먼트 브라켓
├── css/
│   └── style.css       ← 공통 스타일
└── js/
    ├── app.js          ← 공통 상태 관리
    ├── timer.js        ← 타이머 엔진
    ├── tournament.js   ← 토너먼트 로직
    └── export.js       ← CSV 내보내기
```

---

## 🚀 사용 방법

### 1. 센서 없이 테스트 (UI 데모)
```
index.html을 Chrome으로 열기 → 바로 사용 가능!
```

### 2. Arduino 연결 (실제 센서 사용)
Chrome에서만 지원되는 **Web Serial API** 사용

**Arduino 코드 예시:**
```cpp
void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP); // 센서 A (출발선)
  pinMode(3, INPUT_PULLUP); // 센서 B (결승선)
}

void loop() {
  if (digitalRead(2) == LOW) { Serial.println("A"); delay(200); }
  if (digitalRead(3) == LOW) { Serial.println("B"); delay(200); }
}
```

웹앱에서 **🔌 Arduino 연결** 버튼 클릭 → 포트 선택 → 완료!

### 3. HDMI 대형화면 출력
노트북 → HDMI → TV/프로젝터 연결 후 `game.html` 또는 `result.html` 전체화면(F11)

---

## 🎮 게임 모드

| 게임 | 센서 | 설명 |
|------|------|------|
| 🏁 타임랩 | 압력패드/적외선/매트 | 출발~결승 자동 측정 |
| ⚡ 반응속도 | 버튼 | 신호 후 누르는 속도 |
| 🎯 균형 버티기 | 압력패드 | 얼마나 오래 버티나 |
| 📏 멀리뛰기 | 초음파 | 착지 거리 측정 |
| ⚖️ 무게 맞추기 | 로드셀 | 목표 무게 정확도 |
| 💪 악력 측정 | 압력센서 | 최대 힘 측정 |
| 🎲 홀짝 게임 | 적외선 | 통과 횟수 홀짝 |
| 🎰 랜덤 룰렛 | 버튼 | 랜덤 미션 |
| 🔢 카운트 대결 | 적외선 | 제한시간 내 통과 횟수 |
| 🔊 소리 크기 | 마이크 | 소리 크기 대결 |

---

## 🏆 대회 진행 방식

- **👤 개인전** — 개인 기록 순위
- **👥 팀 대결** — 합산/평균/릴레이
- **🏆 토너먼트** — 싱글 엘리미네이션 대진표

---

## 💾 데이터 저장

- 로컬스토리지 자동 저장 (새로고침해도 유지)
- CSV 내보내기 (개인/팀/상세 기록)
- 결과 클립보드 복사 (카카오톡 전송용)
- 인쇄 지원

---

## 🔧 하드웨어 추천

| 구성 | 부품 | 가격 |
|------|------|------|
| 입문 | 버튼 + 적외선 | 3~5만원 |
| 스탠다드 | + 압력패드 + 로드셀 | 8~12만원 |
| 프로 | + 초음파 + 마이크 | 15~25만원 |
| 카트/자동차 | + 매트스위치 | 20~35만원 |

---

## 🌐 GitHub Pages 배포

```
Settings → Pages → Source: main branch → 저장
→ https://[username].github.io/sensor-game-platform/
```

---

## 📄 License

MIT License
