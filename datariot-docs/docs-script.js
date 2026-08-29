/* ===========================================
   DATARIOT DOCS — Interactivity
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.doc-section');
    const sidebarLinks = document.querySelectorAll('.sidebar__link');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    // === Theme toggle ===
    const themeToggle = document.getElementById('themeToggle');
    const THEME_KEY = 'datariot-docs-theme';

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
    };

    let savedTheme;
    try {
        savedTheme = localStorage.getItem(THEME_KEY);
    } catch (_) { /* storage unavailable (private mode) */ }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try {
                localStorage.setItem(THEME_KEY, next);
            } catch (_) { /* ignore */ }
        });
    }

    // === Mobile menu ===
    const setSidebar = (open) => {
        if (!sidebar || !overlay) return;
        sidebar.classList.toggle('open', open);
        overlay.classList.toggle('show', open);
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', String(open));
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            setSidebar(!sidebar.classList.contains('open'));
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => setSidebar(false));
    }

    // === Active sidebar link tracking ===
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                sidebarLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-section') === id);
                });
            }
        });
    }, { threshold: 0.2, rootMargin: '-80px 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));

    // === Smooth scroll ===
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-section');
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                history.replaceState(null, '', '#' + id);
            }
            setSidebar(false);
        });
    });

    // === Search ===
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            sidebarLinks.forEach(link => {
                const text = link.textContent.toLowerCase();
                link.parentElement.style.display = (!query || text.includes(query)) ? '' : 'none';
            });

            // Hide sidebar groups whose links are all filtered out
            document.querySelectorAll('.sidebar__section').forEach(section => {
                const hasVisible = Array.from(section.querySelectorAll('li'))
                    .some(li => li.style.display !== 'none');
                section.style.display = hasVisible ? '' : 'none';
            });

            // Dim non-matching sections in content
            sections.forEach(section => {
                const text = section.textContent.toLowerCase();
                section.style.opacity = (!query || text.includes(query)) ? '1' : '0.3';
            });
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
            }
        });
    }
});
