/* ===========================================
   DATARIOT Landing Page — Interactions & FX
   =========================================== */
console.log('Datariot Script: Initiating...');

// Initialize Supabase (Global)
let supabase = null;

// Immediate Theme Initialization to prevent flash
(function () {
    const html = document.documentElement;
    let savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('datariot-theme') || 'dark';
    } catch (e) { }
    html.setAttribute('data-theme', savedTheme);
})();

// Global Toggle Function (Bulletproof)
window.toggleTheme = function () {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try {
        localStorage.setItem('datariot-theme', next);
    } catch (e) { }
    console.log('Theme manual toggle to:', next);
};

/* =======================================
   UI INTERACTIONS & NAVIGATION
   ======================================= */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Datariot Script: DOMContentLoaded triggered.');

    // Initialize Supabase
    try {
        const supabaseUrl = 'https://uycrtobdewnscwazshcu.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3J0b2JkZXduc2N3YXpzaGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzU1NjYsImV4cCI6MjA3NTI1MTU2Nn0.EsZQOIE879QwU_FKk0Agh-yJBdRJcLTmYi-DCMjYaxU';
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        }
    } catch (e) {
        console.error('Supabase initialization failed:', e);
    }

    // === Mobile Navigation Toggle ===
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.getElementById('sidebar');

    if (mobileNavToggle && sidebar) {
        console.log('Datariot Script: Mobile toggle and sidebar found.');

        let lastToggleTime = 0;
        const toggleMenu = (e) => {
            const now = Date.now();
            if (now - lastToggleTime < 300) return; // Debounce
            lastToggleTime = now;

            console.log('Datariot Script: toggleMenu triggered via', e ? e.type : 'manual');

            if (e && e.cancelable) {
                e.preventDefault();
                e.stopPropagation();
            }

            sidebar.classList.toggle('mobile-open');
            mobileNavToggle.classList.toggle('active');
            console.log('Datariot Script: Menu state is now:', sidebar.classList.contains('mobile-open'));
        };

        mobileNavToggle.addEventListener('click', toggleMenu);
        mobileNavToggle.addEventListener('touchstart', toggleMenu, { passive: false });
    } else {
        console.warn('Datariot Script: Mobile toggle elements NOT found!');
    }

    // === Sidebar Active Section Tracking ===
    const sections = document.querySelectorAll('.section');
    const sidebarLinks = document.querySelectorAll('.sidebar__link');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                sidebarLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.section === id);
                });
            }
        });
    }, { threshold: 0.25 });
    sections.forEach(s => sectionObserver.observe(s));

    // === Sidebar Link Clicks ===
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.section);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                if (sidebar && sidebar.classList.contains('mobile-open')) {
                    sidebar.classList.remove('mobile-open');
                    mobileNavToggle && mobileNavToggle.classList.remove('active');
                }
            }
        });
    });

    // === Sidebar Logo Click (Scroll to Top) ===
    const sidebarLogo = document.querySelector('.sidebar__logo');
    if (sidebarLogo) {
        sidebarLogo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                mobileNavToggle && mobileNavToggle.classList.remove('active');
            }
        });
    }

    // === Reveal Animations ===
    const revealElements = document.querySelectorAll('.reveal, .section__header, .value-card, .feature-card, .live-card');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    // === Feature Card 3D Tilt ===
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            // 3D tilt math
            const tiltX = (y / 100 - 0.5) * 8;
            const tiltY = (x / 100 - 0.5) * -8;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px) scale(1.02)`;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // === Live Stats Count-Up ===
    const liveSection = document.getElementById('live');
    if (liveSection) {
        let statsAnimated = false;
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateStats();
            }
        }, { threshold: 0.4 });
        statsObserver.observe(liveSection);
    }

    function animateStats() {
        const stats = [
            { id: 'liveUsers', target: 1247 },
            { id: 'liveVideos', target: 384 },
            { id: 'liveDebates', target: 56 },
            { id: 'liveMinutes', target: 12891 }
        ];
        stats.forEach(s => {
            const el = document.getElementById(s.id);
            if (!el) return;
            let current = 0;
            const duration = 2000;
            const step = (now) => {
                if (!current) current = now;
                const progress = Math.min((now - current) / duration, 1);
                const value = Math.floor(progress * s.target);
                el.textContent = value.toLocaleString();
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }

    // === Beta Form Submission ===
    const betaForm = document.getElementById('betaForm');
    if (betaForm) {
        betaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('betaEmail');
            const submitBtn = betaForm.querySelector('button[type="submit"]');
            if (emailInput && emailInput.value) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
                console.log('Beta registration for:', emailInput.value);
                // Simulate success
                setTimeout(() => {
                    document.getElementById('betaCard').style.display = 'none';
                    document.getElementById('betaSuccess').style.display = 'flex';
                }, 1000);
            }
        });
    }
});

/* =======================================
   HEAVY EFFECTS (DEFERRED)
   ======================================= */
window.addEventListener('load', () => {
    console.log('Datariot Script: Window load triggered. Starting heavy effects.');

    // Particle Canvas Animation
    (function () {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h;
        const particles = [];
        const PARTICLE_COUNT = 60; // Reduced for performance
        const colors = ['rgba(14,165,233,', 'rgba(168,85,247,', 'rgba(20,184,166,'];

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + '0.4)';
                ctx.fill();

                // Limited connections for performance
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
                    if (d < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = p.color + (0.1 * (1 - d / 100)) + ')';
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(draw);
        }
        draw();
    })();

    // Live Feed Simulation
    const feed = document.getElementById('liveFeed');
    if (feed) {
        const activities = [
            '<b>@neural_mind</b> started a new debate',
            '<b>@quantum_cat</b> joined the platform',
            '<b>@logic_king</b> shared a short video',
            '<b>@data_viz</b> uploaded a research clip'
        ];
        setInterval(() => {
            const item = document.createElement('div');
            item.className = 'live__feed-item reveal visible';
            item.innerHTML = `<span>${activities[Math.floor(Math.random() * activities.length)]}</span><span class="live__feed-item__time">just now</span>`;
            feed.prepend(item);
            if (feed.children.length > 6) feed.lastChild.remove();
        }, 5000);
    }
});
