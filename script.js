/* ===========================================
   ORVELIS Landing Page — Interactions & FX
   =========================================== */

// Initialize Supabase (Global)
let supabase = null;

// Immediate Theme Initialization to prevent flash
(function () {
    const html = document.documentElement;
    let savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('orvelis-theme') || 'dark';
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
        localStorage.setItem('orvelis-theme', next);
    } catch (e) { }
    console.log('Theme manual toggle to:', next);
};

document.addEventListener('DOMContentLoaded', () => {
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

    // === Theme toggle (handled via onclick in HTML) ===

    // === Mouse Spotlight Effect ===
    const spotlight = document.getElementById('mouseSpotlight');
    if (spotlight) {
        window.addEventListener('mousemove', (e) => {
            spotlight.style.left = e.clientX + 'px';
            spotlight.style.top = e.clientY + 'px';
            if (!spotlight.classList.contains('active')) {
                spotlight.classList.add('active');
            }
        });
    }

    // === Intersection Observer for reveal animations ===
    const revealElements = document.querySelectorAll(
        '.section__header, .manifesto__letter, .manifesto__values, .value-card, ' +
        '.feature-card, .screen-card, .debates__info, .debates__preview, .debate-step, ' +
        '.live-card, .live__feed, .beta__info, .beta__card'
    );

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach((el, i) => {
        el.classList.add('reveal');
        // Add staggered delay for grid items
        if (el.classList.contains('value-card') || el.classList.contains('feature-card') || el.classList.contains('screen-card') || el.classList.contains('live-card')) {
            el.style.transitionDelay = `${(i % 3) * 0.15}s`;
        }
        observer.observe(el);
    });

    // === Sidebar active link tracking ===
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

    // === Smooth scroll for sidebar links ===
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.section);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }

            // Close mobile nav if open
            const sidebar = document.getElementById('sidebar');
            const toggle = document.getElementById('mobileNavToggle');
            if (sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                toggle.classList.remove('active');
            }
        });
    });

    // === Mobile nav toggle ===
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.getElementById('sidebar');

    mobileNavToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        mobileNavToggle.classList.toggle('active');
    });

    // === Feature card hover glow effect ===
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });
    });

    // === Beta form submission (redesigned) ===
    const betaForm = document.getElementById('betaForm');
    const betaCard = document.getElementById('betaCard');
    const betaSuccess = document.getElementById('betaSuccess');

    betaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = betaForm.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : '';
        const btn = betaForm.querySelector('.beta__submit-btn');

        if (!email) return;

        btn.style.opacity = '0.5';
        btn.disabled = true;

        if (supabase) {
            try {
                const { error } = await supabase
                    .from('waitlist')
                    .insert([{ email: email }]);

                if (error) throw error;

                betaCard.style.display = 'none';
                betaSuccess.classList.add('show');
            } catch (err) {
                console.error('Error saving to waitlist:', err);
                alert('Connection error. Please try again later.');
                btn.style.opacity = '1';
                btn.disabled = false;
            }
        } else {
            // Fallback for local testing if Supabase isn't loaded
            setTimeout(() => {
                betaCard.style.display = 'none';
                betaSuccess.classList.add('show');
            }, 800);
        }
    });

    // === Live Stats — Simulated realtime updates ===
    const liveData = {
        users: 1247,
        videos: 384,
        debates: 56,
        minutes: 12891
    };

    function formatNumber(n) {
        return n.toLocaleString('en-US');
    }

    function updateLiveStats() {
        // Simulate small fluctuations
        liveData.users += Math.floor(Math.random() * 7) - 2;
        liveData.videos += Math.floor(Math.random() * 5) - 1;
        liveData.debates += Math.random() > 0.7 ? 1 : 0;
        liveData.minutes += Math.floor(Math.random() * 15) + 3;

        // Clamp
        liveData.users = Math.max(800, liveData.users);
        liveData.videos = Math.max(100, liveData.videos);
        liveData.debates = Math.max(20, liveData.debates);

        const usersEl = document.getElementById('liveUsers');
        const videosEl = document.getElementById('liveVideos');
        const debatesEl = document.getElementById('liveDebates');
        const minutesEl = document.getElementById('liveMinutes');

        if (usersEl) usersEl.textContent = formatNumber(liveData.users);
        if (videosEl) videosEl.textContent = formatNumber(liveData.videos);
        if (debatesEl) debatesEl.textContent = formatNumber(liveData.debates);
        if (minutesEl) minutesEl.textContent = formatNumber(liveData.minutes);
    }

    setInterval(updateLiveStats, 3000);

    // === Live Activity Feed ===
    const feedEvents = [
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@curiosity_lab</b> uploaded video "Quantum Entanglement"' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@neural_mind</b> started debate "Will AGI arrive by 2030?"' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@alex_learns</b> joined the platform' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@philosophy_fan</b> added an argument to "AI Consciousness"' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@data_wizard</b> reached Logic Score 500' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@space_educator</b> uploaded video "Mars Colony"' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@bio_student</b> rated "CRISPR Gene Editing"' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@tech_debater</b> started debate "Remote Work Kills Creativity"' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@science_girl</b> joined the platform' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@logic_king</b> responded in "Crypto vs Traditional Finance"' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@history_buff</b> uploaded video "Fall of Rome: Causes..."' },
        { icon: '<span class="live__feed-dot"></span>', text: '<b>@debate_queen</b> won 10 debates in a row' },
    ];

    const liveFeed = document.getElementById('liveFeed');
    let feedIndex = 0;

    function getTimeAgo() {
        const seconds = Math.floor(Math.random() * 30) + 1;
        return seconds + 's ago';
    }

    function addFeedItem() {
        const event = feedEvents[feedIndex % feedEvents.length];
        feedIndex++;

        const item = document.createElement('div');
        item.className = 'live__feed-item';
        item.innerHTML = `
            <span class="live__feed-item__icon">${event.icon}</span>
            <span class="live__feed-item__text">${event.text}</span>
            <span class="live__feed-item__time">${getTimeAgo()}</span>
        `;

        if (liveFeed.firstChild) {
            liveFeed.insertBefore(item, liveFeed.firstChild);
        } else {
            liveFeed.appendChild(item);
        }

        // Keep max 8 items
        while (liveFeed.children.length > 8) {
            liveFeed.removeChild(liveFeed.lastChild);
        }
    }

    // Initial feed items
    for (let i = 0; i < 5; i++) {
        addFeedItem();
    }

    // Add new items periodically
    setInterval(addFeedItem, 4000);

    // === Parallax on ambient glows ===
    let ticking = false;
    window.addEventListener('mousemove', (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;

            document.querySelectorAll('.ambient-glow').forEach((glow, i) => {
                const factor = (i + 1) * 0.5;
                glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
            });
            ticking = false;
        });
    });

});
