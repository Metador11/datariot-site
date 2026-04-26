console.log('3D FX Script: Initiating...');

// Ensure ThreeJS is loaded
window.addEventListener('load', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js failed to load.');
        return;
    }

    /* =========================================================
       ANIMATION 1: THE AI CORE (Middle - Manifesto Section)
       ========================================================= */
    function initMiddleAnimation() {
        const container = document.getElementById('canvas-3d-middle');
        if (!container) return;

        // Scene Setup
        const scene = new THREE.Scene();
        // The background is handled by CSS, so we set transparent alpha
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: window.innerWidth > 768 // Disable AA on mobile for performance
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.innerWidth > 768 ? Math.min(window.devicePixelRatio, 1.5) : 1);
        container.appendChild(renderer.domElement);

        // Lights
        const light = new THREE.DirectionalLight(0x0EA5E9, 1);
        light.position.set(1, 1, 2);
        scene.add(light);
        const ambient = new THREE.AmbientLight(0x404040); // Soft white light
        scene.add(ambient);

        // Object: AI Core Sphere (Icosahedron) - reduced detail
        const geometry = new THREE.IcosahedronGeometry(2, 1);

        // We will create a dual-material setup to make it look premium
        const materialCore = new THREE.MeshPhongMaterial({
            color: 0x0EA5E9,
            emissive: 0x0EA5E9,
            emissiveIntensity: 0.2,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        const sphereCore = new THREE.Mesh(geometry, materialCore);
        scene.add(sphereCore);

        // Orbiting particles
        const particleCount = window.innerWidth > 768 ? 200 : 50;
        const particlesGeometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 8;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x7DD3FC,
            transparent: true,
            opacity: 0.6
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
        scene.add(particlesMesh);

        camera.position.z = 5;

        // Mouse interaction variables
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.001;
            mouseY = (event.clientY - windowHalfY) * 0.001;
        });

        // Setup scroll scaling using GSAP
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.to(sphereCore.scale, {
                scrollTrigger: {
                    trigger: "#manifesto",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                },
                x: 1.5,
                y: 1.5,
                z: 1.5,
                ease: "none"
            });
        }

        // Animation Loop
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);

            // Rotate core
            sphereCore.rotation.y += 0.005;
            sphereCore.rotation.x += 0.002;

            // Rotate particles slowly
            particlesMesh.rotation.y -= 0.002;

            // Mouse interaction
            targetX = mouseX * 2;
            targetY = mouseY * 2;
            sphereCore.rotation.y += 0.05 * (targetX - sphereCore.rotation.y);
            sphereCore.rotation.x += 0.05 * (targetY - sphereCore.rotation.x);

            // Float up and down
            const elapsedTime = clock.getElapsedTime();
            sphereCore.position.y = Math.sin(elapsedTime * 0.5) * 0.3;

            renderer.render(scene, camera);
        }
        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    /* =========================================================
       ANIMATION 2: THE IDEA COLLISION (End - Debates Section)
       ========================================================= */
    function initEndAnimation() {
        const container = document.getElementById('canvas-3d-end');
        if (!container) return;

        // Scene Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        container.appendChild(renderer.domElement);

        camera.position.z = 6;

        // Lights
        const pointLight1 = new THREE.PointLight(0x38BDF8, 2, 50);
        pointLight1.position.set(2, 3, 4);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x0EA5E9, 2, 50);
        pointLight2.position.set(-2, -3, -4);
        scene.add(pointLight2);

        // The central Torus Knot
        const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 128, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x0EA5E9,
            metalness: 0.8,
            roughness: 0.2,
            wireframe: true,
            emissive: 0x38BDF8,
            emissiveIntensity: 0.4
        });
        const torusKnot = new THREE.Mesh(geometry, material);
        scene.add(torusKnot);

        // Surrounding geometry logic (Ideals colliding)
        const boxes = [];
        const boxGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const boxMat = new THREE.MeshStandardMaterial({
            color: 0x7DD3FC,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.9
        });

        for (let i = 0; i < 12; i++) {
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            // Save initial position for orbiting math
            box.userData = {
                angle: Math.random() * Math.PI * 2,
                radius: 2 + Math.random() * 3,
                speed: 0.01 + Math.random() * 0.02
            };
            scene.add(box);
            boxes.push(box);
        }

        // GSAP Scroll Interaction
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.to(torusKnot.rotation, {
                scrollTrigger: {
                    trigger: "#debates",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                },
                x: 4,
                y: 4,
                ease: "none"
            });
        }

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);

            // Default slow rotation
            torusKnot.rotation.z += 0.001;

            // Orbit the boxes around the torus
            boxes.forEach(box => {
                box.userData.angle += box.userData.speed;
                box.position.x = Math.cos(box.userData.angle) * box.userData.radius;
                box.position.z = Math.sin(box.userData.angle) * box.userData.radius;
                box.rotation.x += box.userData.speed;
                box.rotation.y += box.userData.speed;
            });

            renderer.render(scene, camera);
        }
        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    /* =========================================================
       ANIMATION 3: PHONE SCREENS VORTEX (Top - Hero Section)
       ========================================================= */
    function initVideoScreensAnimation() {
        const container = document.getElementById('canvas-3d-hero');
        if (!container) return;

        const scene = new THREE.Scene();
        // Fog makes distant ones fade out
        scene.fog = new THREE.Fog(0x020408, 5, 20);

        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: window.innerWidth > 768,
            logarithmicDepthBuffer: window.innerWidth > 768
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.innerWidth > 768 ? Math.min(window.devicePixelRatio, 2) : 1);
        container.appendChild(renderer.domElement);

        camera.position.z = 8;
        camera.position.y = 2; // looking slightly down

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);

        const pointLight = new THREE.PointLight(0x0EA5E9, 2, 50);
        pointLight.position.set(0, 5, 5);
        scene.add(pointLight);

        // Videos/Phones (vertical 9:16 aspect ratio roughly)
        const frameWidth = 1.2;
        const frameHeight = 2.1;
        const geometry = new THREE.PlaneGeometry(frameWidth, frameHeight);

        // A glassmorphic wireframe material or slightly opaque panel
        const material = new THREE.MeshBasicMaterial({
            color: 0x0EA5E9,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            wireframe: false
        });

        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.8 });

        const screens = [];
        const numScreens = window.innerWidth < 768 ? 15 : 22;

        for (let i = 0; i < numScreens; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial);
            mesh.add(edges);

            // Position them in a large cylinder/funnel around the user
            const angle = (i / numScreens) * Math.PI * 2 + Math.random();
            const radius = 6 + Math.random() * 4;
            const yPos = (Math.random() - 0.5) * 15;

            mesh.position.set(Math.cos(angle) * radius, yPos, Math.sin(angle) * radius);

            // Point the screens generally towards the center
            mesh.lookAt(0, mesh.position.y, 0);

            // Add some unique floating parameters
            mesh.userData = {
                angle: angle,
                radius: radius,
                ySpeed: 0.01 + Math.random() * 0.02,
                rotSpeed: (Math.random() - 0.5) * 0.01
            };

            scene.add(mesh);
            screens.push(mesh);
        }

        // Add some floating glowing orbs (like play buttons)
        const orbGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const orbMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        for (let i = 0; i < 15; i++) {
            const orb = new THREE.Mesh(orbGeo, orbMat);
            orb.position.set(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10
            );
            scene.add(orb);
        }

        // Mouse interaction for the camera
        let mouseX = 0;
        let mouseY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.0005; // very subtle
            mouseY = (event.clientY - windowHalfY) * 0.0005;
        });

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            // Move screens up, mimicking vertical scroll feed
            screens.forEach(screen => {
                screen.position.y += screen.userData.ySpeed;
                screen.userData.angle += 0.001; // slow rotation around center
                screen.position.x = Math.cos(screen.userData.angle) * screen.userData.radius;
                screen.position.z = Math.sin(screen.userData.angle) * screen.userData.radius;
                screen.lookAt(0, screen.position.y, 0);

                // Reset position if too high
                if (screen.position.y > 10) {
                    screen.position.y = -10;
                }
            });

            // Camera subtle lag to mouse
            camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 5 + 2 - camera.position.y) * 0.05;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    /* =========================================================
       ANIMATION 4: NEURAL WEB (Features Section)
       ========================================================= */
    function initFeaturesAnimation() {
        const container = document.getElementById('canvas-3d-features');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: window.innerWidth > 768 });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.innerWidth > 768 ? Math.min(window.devicePixelRatio, 2) : 1);
        container.appendChild(renderer.domElement);

        camera.position.z = 10;

        const group = new THREE.Group();
        scene.add(group);

        const particleCount = window.innerWidth < 768 ? 60 : 100;
        const maxDistance = 2.8;

        // Create particles (nodes)
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            // Spherical distribution
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(Math.random() * 2 - 1);
            const r = Math.cbrt(Math.random()) * 5; // Radius up to 5

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();

        // White/Cyan glowing points
        const material = new THREE.PointsMaterial({
            color: 0x38BDF8,
            size: 0.15,
            transparent: true,
            opacity: 0.8
        });

        const particles = new THREE.Points(geometry, material);
        group.add(particles);

        // Lines connecting proximal nodes
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x0EA5E9,
            transparent: true,
            opacity: 0.15
        });

        // We use a completely dynamic approach to lines
        const linesGeometry = new THREE.BufferGeometry();
        // Allocate space for maximum possible lines, this is just visual approximations
        const maxLines = particleCount * 4;
        const linePositions = new Float32Array(maxLines * 6);
        linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

        const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
        group.add(linesMesh);

        // GSAP Scroll Interaction
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.to(group.rotation, {
                scrollTrigger: {
                    trigger: "#features",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                },
                y: Math.PI * 2,
                x: Math.PI,
                ease: "none"
            });
            gsap.fromTo(group.scale,
                { x: 0.6, y: 0.6, z: 0.6 },
                {
                    scrollTrigger: {
                        trigger: "#features",
                        start: "top bottom",
                        end: "center center",
                        scrub: 1
                    },
                    x: 1, y: 1, z: 1,
                    ease: "power2.out"
                }
            );
        }

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.001;
            mouseY = (event.clientY - windowHalfY) * 0.001;
        });

        function animate() {
            requestAnimationFrame(animate);

            // Subtle base rotation
            group.rotation.y += 0.002;
            group.rotation.x += 0.001;

            // Mouse drift
            group.rotation.y += 0.05 * (mouseX - group.rotation.y);
            group.rotation.x += 0.05 * (mouseY - group.rotation.x);

            // Animate particles directly inside buffer
            const positions = particles.geometry.attributes.position.array;
            let lineIndex = 0;

            // Performance optimization: only recalculate lines every 2nd frame
            const frameCount = Math.floor(Date.now() / 16) % 2;
            const updateLines = frameCount === 0;

            // Move points
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += velocities[i].x;
                positions[i3 + 1] += velocities[i].y;
                positions[i3 + 2] += velocities[i].z;

                // Bounce off abstract boundary
                if (Math.abs(positions[i3]) > 5) velocities[i].x *= -1;
                if (Math.abs(positions[i3 + 1]) > 5) velocities[i].y *= -1;
                if (Math.abs(positions[i3 + 2]) > 5) velocities[i].z *= -1;

                // Update connections (Only if it's the update frame)
                if (updateLines) {
                    for (let j = i + 1; j < particleCount; j++) {
                        const j3 = j * 3;
                        const dx = positions[i3] - positions[j3];
                        const dy = positions[i3 + 1] - positions[j3 + 1];
                        const dz = positions[i3 + 2] - positions[j3 + 2];
                        const distSq = dx * dx + dy * dy + dz * dz;

                        // If close enough, draw/update a line
                        if (distSq < maxDistance * maxDistance && lineIndex < maxLines * 6) {
                            linePositions[lineIndex++] = positions[i3];
                            linePositions[lineIndex++] = positions[i3 + 1];
                            linePositions[lineIndex++] = positions[i3 + 2];
                            linePositions[lineIndex++] = positions[j3];
                            linePositions[lineIndex++] = positions[j3 + 1];
                            linePositions[lineIndex++] = positions[j3 + 2];
                        }
                    }
                }

            }

            // Zero out remaining line segments
            for (let i = lineIndex; i < maxLines * 6; i++) {
                linePositions[i] = 0;
            }

            particles.geometry.attributes.position.needsUpdate = true;
            linesMesh.geometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    /* =========================================================
       ANIMATION 5: THE GLOBAL GLOBE (Global Platform Section)
       ========================================================= */
    function initGlobeAnimation() {
        const container = document.getElementById('canvas-3d-globe');
        if (!container) return;

        console.log('Globe: Initializing...');

        function start2D() {
            console.log('Globe: Falling back to 2D.');
            render2DFallback(container);
        }

        // Try 3D
        try {
            const W = container.clientWidth || 800;
            const H = container.clientHeight || 500;

            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, failIfMajorPerformanceCaveat: true });
            renderer.setSize(W, H);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(renderer.domElement);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
            camera.position.z = 12;

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const globeColor = isDark ? 0x0EA5E9 : 0x0284C7;

            const radius = 5;
            const globe = new THREE.Points(
                new THREE.SphereGeometry(radius, 48, 48),
                new THREE.PointsMaterial({ color: globeColor, size: 0.08, transparent: true, opacity: 0.85 })
            );
            scene.add(globe);

            const cities = [
                { lat: 55.75, lon: 37.62 }, { lat: 35.68, lon: 139.69 },
                { lat: -23.55, lon: -46.63 }, { lat: 40.71, lon: -74.00 },
                { lat: 6.52, lon: 3.38 }, { lat: 52.52, lon: 13.41 },
                { lat: 19.08, lon: 72.88 }, { lat: -33.87, lon: 151.21 },
                { lat: 25.20, lon: 55.27 }, { lat: 1.35, lon: 103.82 }
            ];

            const cityGroup = new THREE.Group();
            globe.add(cityGroup);

            cities.forEach(city => {
                const phi = (90 - city.lat) * (Math.PI / 180);
                const theta = (city.lon + 180) * (Math.PI / 180);
                const dot = new THREE.Mesh(
                    new THREE.SphereGeometry(0.12, 12, 12),
                    new THREE.MeshBasicMaterial({ color: isDark ? 0x38BDF8 : 0x0369A1 })
                );
                dot.position.set(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
                cityGroup.add(dot);
                dot.userData = { pulse: Math.random() * Math.PI };
            });

            function animate() {
                requestAnimationFrame(animate);
                globe.rotation.y += 0.003;
                cityGroup.children.forEach(c => {
                    c.userData.pulse += 0.05;
                    c.scale.setScalar(1 + Math.sin(c.userData.pulse) * 0.4);
                });
                renderer.render(scene, camera);
            }
            animate();

            window.addEventListener('resize', () => {
                const nW = container.clientWidth;
                const nH = container.clientHeight;
                camera.aspect = nW / nH;
                camera.updateProjectionMatrix();
                renderer.setSize(nW, nH);
            });

            console.log('Globe: 3D Render active.');

        } catch (e) {
            start2D();
        }
    }

    function render2DFallback(container) {
        if (container.querySelector('canvas')) return; // Avoid double init

        const canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const cities = [
            [55.75, 37.62], [35.68, 139.69], [-23.55, -46.63], [40.71, -74],
            [6.52, 3.38], [52.52, 13.41], [19.08, 72.88], [-33.87, 151], [25.2, 55.2]
        ];

        function resize() {
            canvas.width = container.clientWidth * window.devicePixelRatio;
            canvas.height = container.clientHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        resize();
        window.addEventListener('resize', resize);

        function draw(now) {
            const W = container.clientWidth;
            const H = container.clientHeight;
            if (W === 0 || H === 0) {
                requestAnimationFrame(draw);
                return;
            }

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const barColor = isDark ? 'rgba(14, 165, 233,' : 'rgba(2, 132, 199,';
            const accent = isDark ? '14, 165, 233' : '2, 132, 199';

            ctx.clearRect(0, 0, W, H);

            // Draw Vertical Bars (Base Style)
            const gap = 4;
            const bw = (W / 80) - gap;
            for (let x = 0; x < W; x += bw + gap) {
                const nx = x / W;
                for (let y = 0; y < H; y += gap + 2) {
                    const ny = y / H;
                    const land = Math.sin(nx * 10 + Math.sin(ny * 12)) * Math.cos(ny * 8 + Math.cos(nx * 6));
                    if (land > 0.15) {
                        ctx.fillStyle = barColor + (0.05 + Math.sin(nx * 15 + now * 0.001) * 0.1) + ')';
                        ctx.fillRect(x, y, bw, 3);
                    }
                }
            }

            // City Markers
            cities.forEach(([lat, lon], i) => {
                const x = ((lon + 180) / 360) * W;
                const y = ((90 - lat) / 180) * H;
                const p = Math.sin(now * 0.005 + i) * 0.5 + 0.5;

                ctx.fillStyle = `rgba(${accent}, ${0.1 + p * 0.2})`;
                ctx.beginPath(); ctx.arc(x, y, 12 + p * 15, 0, Math.PI * 2); ctx.fill();

                ctx.fillStyle = `rgb(${accent})`;
                ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
            });

            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }

    // Initialize all
    initVideoScreensAnimation();
    initMiddleAnimation();
    initFeaturesAnimation();
    initEndAnimation();
    initGlobeAnimation();
});
