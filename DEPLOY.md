# Vercel 배포 가이드

## 1단계: GitHub에 프로젝트 올리기

```bash
cd gs-ai-insight
git init
git add .
git commit -m "Initial commit: GS AI Insight"
# GitHub에서 새 Repository 만들고:
git remote add origin https://github.com/YOUR_USERNAME/gs-ai-insight.git
git push -u origin main
```

## 2단계: Vercel 배포

1. https://vercel.com 접속 → GitHub 계정으로 로그인
2. "Add New Project" → gs-ai-insight 저장소 선택
3. Framework: Next.js (자동 감지)
4. 아래 환경변수 설정:

## 3단계: 환경변수 설정 (Vercel Dashboard)

| 변수명 | 값 |
|--------|-----|
| `ANTHROPIC_API_KEY` | (발급받은 API 키) |
| `ADMIN_PASSWORD` | gsai2024admin |
| `NEXTAUTH_SECRET` | gs-ai-insight-secret-2024 |

## 4단계: Vercel Postgres 연결 (DB용)

1. Vercel Dashboard → Storage → Create → Postgres
2. 프로젝트에 연결
3. `POSTGRES_URL` 환경변수 자동 설정됨

## 5단계: Deploy!

"Deploy" 버튼 클릭 → 약 2분 후 URL 발급
예: https://gs-ai-insight.vercel.app

---

## 로컬 실행
```bash
npm run dev  # http://localhost:3000
```

## 관리자 로그인
- URL: /admin
- 비밀번호: gsai2024admin (변경 권장)
