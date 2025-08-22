<template>
    <div class="landing">
        <!-- 헤더 (고정) -->
        <Header />

        <!-- Hero -->
        <section class="hero section" id="hero" data-reveal>
            <div class="hero-inner">
                <h1 class="title">
                    부산 동물보호센터를 <br class="br" />
                    더 똑똑하게 연결합니다
                </h1>
                <p class="subtitle">
                    수용률 모니터링 · 이관 추천 · 이송 관리까지<br />
                    한 곳에서 끝내는 Paw-On
                </p>

                <div class="cta">
                    <RouterLink to="/login" class="btn primary">로그인 하기</RouterLink>
                    <RouterLink to="/map" class="btn ghost">서비스 둘러보기</RouterLink>
                </div>
            </div>

            <!-- 간단 파랄랙스 장식 -->
            <div class="parallax p1" aria-hidden="true"></div>
            <div class="parallax p2" aria-hidden="true"></div>
            <div class="parallax p3" aria-hidden="true"></div>
        </section>

        <!-- 핵심 기능 3열 -->
        <section class="features section" data-reveal>
            <div class="section-head">
                <h2>핵심 기능</h2>
                <p>보호기간·중증도·수용률을 고려한 이관 추천</p>
            </div>

            <div class="grid">
                <article class="card" data-reveal>
                    <h3>실시간 수용률</h3>
                    <p>보호소별 정원 대비 현 수용 상태를 한눈에.</p>
                </article>
                <article class="card" data-reveal>
                    <h3>이관 후보 자동선정</h3>
                    <p>보호기간 임박/경과, 질병 중증도 기반 추천.</p>
                </article>
                <article class="card" data-reveal>
                    <h3>이송 관리</h3>
                    <p>이관 신청 → 승인 → 이송 기록까지 트래킹.</p>
                </article>
            </div>
        </section>

        <!-- 스티키 스크롤 섹션 (애플 느낌) -->
        <section class="sticky-showcase section" data-reveal>
            <div class="sticky-wrap">
                <div class="sticky-left">
                    <h2>보호소 운영 흐름에<br />자연스럽게 녹아듭니다</h2>
                    <p class="desc">
                        기존 업무 방식을 바꾸지 않고도,<br />
                        데이터 기반 의사결정과 협업이 쉬워집니다.
                    </p>
                    <RouterLink to="/login" class="btn primary sm">지금 시작하기</RouterLink>
                </div>
                <div class="sticky-right">
                    <!-- 스크롤에 반응해 확대/이동 -->
                    <div class="panel" :style="panelStyle">
                        <div class="bubble b1">수용률 ↓</div>
                        <div class="bubble b2">이관 추천</div>
                        <div class="bubble b3">진행 상황</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="cta-final section" data-reveal>
            <h2>지금, 당신의 보호소를 가볍게 연결해 보세요</h2>
            <RouterLink to="/login" class="btn primary lg">로그인 하고 시작하기</RouterLink>
        </section>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import Header from '@/components/common/Header.vue';
import { RouterLink } from 'vue-router';

/** --- Scroll Reveal (IntersectionObserver) --- */
const observer = ref(null);
onMounted(() => {
    const targets = document.querySelectorAll('[data-reveal]');
    observer.value = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) e.target.classList.add('revealed');
            });
        },
        { threshold: 0.2 }
    );
    targets.forEach((el) => observer.value.observe(el));
});
onBeforeUnmount(() => observer.value?.disconnect());

/** --- Parallax & Sticky Anim --- */
let ticking = false;
const scrollY = ref(0);
const onScroll = () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            scrollY.value = window.scrollY || window.pageYOffset;
            ticking = false;
        });
        ticking = true;
    }
};
onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
});

/** 패널 애니메이션: 스크롤에 따라 scale/translate 살짝 변화 */
const panelStyle = computed(() => {
    // 히어로 이후 스크롤 구간에서만 살짝 반응
    const s = Math.min(Math.max((scrollY.value - 200) / 600, 0), 1);
    const scale = 0.95 + s * 0.1;
    const y = 10 - s * 10;
    return {
        transform: `translateY(${y}px) scale(${scale})`,
    };
});
</script>

<style scoped>
/* 공통 */
.landing {
    background: #fafafa;
}

/* 섹션 공통 */
.section {
    min-height: 100vh;
    padding: 100px 20px 80px;
    display: grid;
    place-items: center;
}

/* ---- Hero ---- */
.hero {
    position: relative;
    padding-top: 140px; /* 고정 헤더(60px) + 여백 */
    background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
    overflow: hidden;
}
.hero-inner {
    text-align: center;
    max-width: 900px;
}
.title {
    font-size: clamp(32px, 5vw, 56px);
    line-height: 1.1;
    margin: 0 0 14px;
    letter-spacing: -0.02em;
}
.subtitle {
    font-size: clamp(16px, 2.2vw, 20px);
    color: #556;
    margin-bottom: 28px;
}
.cta {
    display: inline-flex;
    gap: 12px;
}

/* 버튼 */
.btn {
    padding: 12px 18px;
    border-radius: 999px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid #d6dbe1;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.btn.primary {
    background: #0ea5e9;
    color: #fff;
    border-color: transparent;
}
.btn.primary:hover {
    box-shadow: 0 6px 18px rgba(14, 165, 233, 0.35);
    transform: translateY(-1px);
}
.btn.ghost {
    background: #fff;
    color: #111;
}
.btn.ghost:hover {
    box-shadow: 0 6px 18px rgba(17, 17, 17, 0.08);
    transform: translateY(-1px);
}
.btn.sm {
    padding: 10px 14px;
    font-size: 14px;
}
.btn.lg {
    padding: 14px 22px;
    font-size: 18px;
}

/* 파랄랙스 장식 */
.parallax {
    position: absolute;
    border-radius: 999px;
    filter: blur(6px);
    opacity: 0.25;
    will-change: transform;
}
.p1 {
    width: 260px;
    height: 260px;
    left: -60px;
    top: 120px;
    background: #60a5fa;
    transform: translateY(calc(var(--sy, 0) * 0.1));
}
.p2 {
    width: 180px;
    height: 180px;
    right: 10vw;
    top: 40px;
    background: #34d399;
    transform: translateY(calc(var(--sy, 0) * 0.15));
}
.p3 {
    width: 320px;
    height: 320px;
    right: -80px;
    bottom: -40px;
    background: #f472b6;
    transform: translateY(calc(var(--sy, 0) * 0.08));
}

/* ---- Features ---- */
.features {
    background: #fff;
}
.section-head {
    text-align: center;
    margin-bottom: 28px;
}
.section-head h2 {
    font-size: clamp(24px, 3.4vw, 36px);
    margin-bottom: 8px;
}
.section-head p {
    color: #667085;
}

.grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    width: min(1080px, 100%);
}
@media (max-width: 960px) {
    .grid {
        grid-template-columns: 1fr;
    }
}

.card {
    background: #f7fafc;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}
.card h3 {
    margin: 0 0 8px;
}

/* ---- Sticky Showcase ---- */
.sticky-showcase {
    background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}
.sticky-wrap {
    display: grid;
    grid-template-columns: 520px 1fr;
    gap: 32px;
    align-items: center;
    width: min(1200px, 100%);
}
@media (max-width: 1024px) {
    .sticky-wrap {
        grid-template-columns: 1fr;
    }
}
.sticky-left h2 {
    font-size: clamp(24px, 3.6vw, 40px);
    margin: 0 0 12px;
}
.sticky-left .desc {
    color: #5b6470;
    margin-bottom: 18px;
}

.sticky-right {
    min-height: 420px;
    position: relative;
}
.panel {
    position: sticky;
    top: 120px; /* 헤더 + 여유 */
    height: 360px;
    border-radius: 24px;
    background: #fff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;
}

.bubble {
    position: absolute;
    padding: 10px 14px;
    background: #0ea5e9;
    color: #fff;
    border-radius: 999px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 6px 16px rgba(14, 165, 233, 0.3);
}
.b1 {
    left: 18px;
    top: 18px;
}
.b2 {
    right: 20px;
    top: 42%;
    transform: translateY(-50%);
    background: #22c55e;
    box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
}
.b3 {
    left: 24px;
    bottom: 18px;
    background: #f59e0b;
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}

/* ---- Final CTA ---- */
.cta-final {
    min-height: 60vh;
    text-align: center;
    background: #fff;
}
.cta-final h2 {
    font-size: clamp(24px, 3.6vw, 40px);
    margin-bottom: 18px;
}

/* ---- Reveal Animations ---- */
[data-reveal] {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
    transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.revealed {
    opacity: 1;
    transform: translateY(0) scale(1);
}
</style>
