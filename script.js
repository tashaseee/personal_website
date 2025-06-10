"use strict";

let scene, camera, renderer;
let videoPanels = [];
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let isRotating = true;
let isSectionMode = false;
let currentSection = null;

const colors = {
    background: 0x000000,
    textPrimary: 0xffffff,
    textSecondary: 0xcccccc,
    accent: 0x007aff,
    panelColors: [
        0x1a1a1a, 0x252525, 0x303030, 0x3a3a3a,
        0x454545, 0x505050, 0x5a5a5a, 0x656565
    ]
};

const videoUrls = [
    'таксирамина.mp4',
    'аидка.mp4',
    'алдиярпоезд.mp4',
    'аринка.mp4',
    'аринкаугощает.mp4',
    'бритиш.mp4',
    'воло.mp4',
    'группаши.mp4'
];

const panelData = [
    { videoUrl: videoUrls[0], size: [6, 3.5], position: [-15, 5, -8], section: 'home' },
    { videoUrl: videoUrls[1], size: [5, 3], position: [12, 6, -5], section: 'about' },
    { videoUrl: videoUrls[2], size: [5.5, 3.2], position: [-10, -4, 10], section: 'skills' },
    { videoUrl: videoUrls[3], size: [5, 3], position: [9, -5, 8], section: 'work' },
    { videoUrl: videoUrls[4], size: [6, 3], position: [-12, 3, 6], section: 'volunteering' },
    { videoUrl: videoUrls[5], size: [5, 2.8], position: [11, 4, -10], section: 'journey' },
    { videoUrl: videoUrls[6], size: [5.5, 3], position: [-8, -6, -9], section: 'connect' },
    { videoUrl: videoUrls[7], size: [5, 2.8], position: [10, 0, 11], section: null }
];

const modalContent = {
    'cosmic-gallery': {
        title: 'NOTO',
        description: 'The site is designed for the ice cream company "NOTO" and includes the ability to purchase products online. All orders are sent directly to the "NOTO" Telegram bot. The site features many animated elements aimed at marketing and attracting customers.',
    },
    'data-dashboard': {
        title: 'Wait" - Electronic Queue System',
        description: 'A full-fledged website and Telegram bot have been developed, which allows users to take a ticket or sign up for a consultation in advance. Consultants can manage the queue by calling clients through the system. https://github.com/wait-2301',
    },
    'interactive-game': {
        title: 'Framer',
        description: 'To improve skills in the frame builder, a website was created for Qara Studios.',
    },
    'code-for-kids': {
        title: 'Code for Kids',
        description: 'Organized coding bootcamps teaching Scratch and Python to underprivileged children, fostering computational thinking and creativity.',
    },
    'tech-for-all': {
        title: 'Astana Zhastar',
        description: 'Participated in various events from Astana Zhastar such as fashion shows, matches at Barys Arena and others.',
    },
    'women-in-tech': {
        title: 'Asut Birge',
        description: 'I was on a team of school volunteers where they helped disabled grandmothers and other things.',
    }
};

function init() {
    try {
        console.log('Initializing Three.js scene');
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(colors.background, 10, 80);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 20);

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(colors.background);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.8;

        const container = document.getElementById('container');
        if (!container) throw new Error('Container element not found');
        container.appendChild(renderer.domElement);

        createLighting();
        createVideoPanels();
        createCosmicBackground();
        setupEventListeners();

        setTimeout(() => {
            const logo = document.getElementById('logo');
            if (logo) logo.classList.add('visible');
            console.log('Logo visible');
        }, 500);
        setTimeout(() => {
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.classList.add('visible');
            console.log('Start button visible');
        }, 1000);

        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
        console.log('Loading screen hidden');

        animate();
    } catch (error) {
        console.error('Init error:', error);
        showMainContent();
    }
}

function createLighting() {
    try {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(20, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        scene.add(directionalLight);

        const pointLight1 = new THREE.PointLight(colors.accent, 1.5, 80);
        pointLight1.position.set(-25, 8, -20);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(colors.accent, 1.5, 80);
        pointLight2.position.set(25, -8, 20);
        scene.add(pointLight2);
    } catch (e) {
        console.error('Lighting error:', e);
    }
}

function createVideoElement(url) {
    try {
        if (!url) return null;

        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.src = url;

        video.addEventListener('loadeddata', () => {
            video.play().catch(e => console.log('Video autoplay failed:', e));
        });

        return video;
    } catch (e) {
        console.error('Video element error:', e);
        return null;
    }
}

function createVideoPanels() {
    try {
        console.log('Creating video panels');
        panelData.forEach((data, index) => {
            const geometry = new THREE.PlaneGeometry(data.size[0], data.size[1]);
            let material;

            if (data.videoUrl) {
                const video = createVideoElement(data.videoUrl);
                if (video) {
                    const videoTexture = new THREE.VideoTexture(video);
                    videoTexture.minFilter = THREE.LinearFilter;
                    videoTexture.magFilter = THREE.LinearFilter;

                    material = new THREE.MeshStandardMaterial({
                        map: videoTexture,
                        side: THREE.DoubleSide,
                        metalness: 0.2,
                        roughness: 0.7,
                        transparent: true,
                        opacity: 0.95
                    });
                } else {
                    material = createPlaceholderMaterial(colors.panelColors[index % colors.panelColors.length]);
                }
            } else {
                material = createPlaceholderMaterial(colors.panelColors[index % colors.panelColors.length]);
            }

            const panel = new THREE.Mesh(geometry, material);
            panel.position.set(...data.position);
            panel.rotation.x = Math.random() * 0.2 - 0.1;
            panel.rotation.y = Math.random() * 0.2 - 0.1;
            panel.rotation.z = Math.random() * 0.1 - 0.05;
            panel.userData = { section: data.section };

            const edgesGeometry = new THREE.EdgesGeometry(geometry);
            const edgesMaterial = new THREE.LineBasicMaterial({
                color: colors.textPrimary,
                transparent: true,
                opacity: 0.3,
                linewidth: 2
            });
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            panel.add(edges);

            scene.add(panel);

            videoPanels.push({
                mesh: panel,
                originalPosition: data.position.slice(),
                backgroundPosition: [
                    (Math.random() - 0.5) * 80,
                    (Math.random() - 0.5) * 80,
                    (Math.random() - 0.5) * 80
                ],
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.001,
                    y: (Math.random() - 0.5) * 0.001,
                    z: (Math.random() - 0.5) * 0.0005
                }
            });
        });
        console.log('Video panels created:', videoPanels.length);
    } catch (e) {
        console.error('Create panels error:', e);
    }
}

function createPlaceholderMaterial(color) {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const context = canvas.getContext('2d');

        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, `#${Math.floor(color * 0.8).toString(16).padStart(6, '0')}`);
        gradient.addColorStop(1, `#${color.toString(16).padStart(6, '0')}`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        context.lineWidth = 2;

        for (let i = 0; i < canvas.width; i += 64) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, canvas.height);
            context.stroke();

            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(canvas.width, i);
            context.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);

        return new THREE.MeshStandardMaterial({
            map: texture,
            emissive: new THREE.Color(color).multiplyScalar(0.1),
            metalness: 0.3,
            roughness: 0.7,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
    } catch (e) {
        console.error('Placeholder material error:', e);
        return new THREE.MeshStandardMaterial({ color: color });
    }
}

function createCosmicBackground() {
    try {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 5000;
        const posArray = new Float32Array(particlesCount * 3);
        const sizes = new Float32Array(particlesCount);
        const colorsArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 2000;
            posArray[i + 1] = (Math.random() - 0.5) * 2000;
            posArray[i + 2] = (Math.random() - 0.5) * 2000;

            sizes[i / 3] = Math.random() * 1.5;

            colorsArray[i] = 0.9;
            colorsArray[i + 1] = 0.9;
            colorsArray[i + 2] = 0.9;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        const galaxyGeometry = new THREE.SphereGeometry(50, 32, 32);
        const galaxyMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        scene.add(galaxy);
    } catch (e) {
        console.error('Cosmic background error:', e);
    }
}

function showMainContent() {
    try {
        console.log('Showing main content');
        const container = document.querySelector('#container');
        const header = document.querySelector('#header');
        const mainContent = document.querySelector('#mainContent');

        if (!container || !header || !mainContent) {
            throw new Error('Required elements not found');
        }

        container.classList.add('hidden');
        document.querySelector('#back-btn').classList.add('visible');

        setTimeout(() => {
            container.style.display = 'none';
            header.classList.add('visible');
            mainContent.classList.add('active');
            console.log('Main content activated:', mainContent.classList);
            initScrollAnimations();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
    } catch (error) {
        console.error('Show main content error:', error);
        const container = document.querySelector('#container');
        const header = document.querySelector('#header');
        const mainContent = document.querySelector('#mainContent');
        if (container) container.style.display = 'none';
        if (mainContent) mainContent.classList.add('active');
        if (header) header.classList.add('visible');
        document.querySelectorAll('.section, .fade-in').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
}

function showSpace() {
    try {
        console.log('Showing space view');
        const container = document.querySelector('#container');
        const header = document.querySelector('#header');
        const mainContent = document.querySelector('#mainContent');

        if (!container || !header || !mainContent) {
            throw new Error('Required elements not found');
        }

        header.classList.remove('visible');
        mainContent.classList.remove('active');
        document.querySelector('#back-btn').classList.remove('visible');

        setTimeout(() => {
            container.style.display = 'block';
            container.classList.remove('hidden');
            document.querySelector('#logo').classList.add('visible');
            document.querySelector('#start-btn').classList.add('visible');

            isRotating = true;
            isSectionMode = false;
            currentSection = null;
            camera.position.set(0, 0, 20);

            videoPanels.forEach(panel => {
                panel.mesh.position.set(...panel.originalPosition);
                panel.mesh.material.opacity = 0.95;
                panel.mesh.scale.set(1, 1, 1);
            });
        }, 800);
    } catch (error) {
        console.error('Show space error:', error);
    }
}

function initScrollAnimations() {
    try {
        console.log('Initializing scroll animations');
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        gsap.utils.toArray('.section, .fade-in').forEach(el => {
            gsap.set(el, {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                x: 0,
                rotate: 0
            });

            ScrollTrigger.create({
                trigger: el,
                start: 'top 90%',
                onEnter: () => {
                    gsap.to(el, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                        x: 0,
                        rotate: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                },
                toggleActions: 'play none none none'
            });
        });

        gsap.utils.toArray('.skill-progress').forEach((bar, index) => {
            gsap.fromTo(bar, {
                width: 0
            }, {
                width: bar.style.width,
                duration: 1.5,
                ease: 'power2.out',
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: bar,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            });
        });

        gsap.to('.marquee-track.left', {
            xPercent: -50,
            duration: 30,
            ease: 'none',
            repeat: -1
        });

        gsap.to('.marquee-track.right', {
            xPercent: 50,
            duration: 30,
            ease: 'none',
            repeat: -1
        });

        const sections = document.querySelectorAll('.section');
        const navItems = document.querySelectorAll('.nav-item a');

        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: self => {
                    if (self.isActive) {
                        navItems.forEach(item => {
                            item.classList.remove('active');
                            if (item.dataset.section === section.id) {
                                item.classList.add('active');
                            }
                        });
                    }
                }
            });
        });

        gsap.to('.scroll-progress', {
            width: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true
            }
        });

        console.log('Scroll animations initialized');
    } catch (e) {
        console.error('Scroll animations error:', e);
        document.querySelectorAll('.section, .fade-in').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
}

function animateToSection(sectionId) {
    try {
        console.log('Animating to section:', sectionId);
        isSectionMode = true;
        isRotating = false;
        currentSection = sectionId;
        const duration = 1800;
        const startTime = Date.now();

        gsap.to(['#logo', '#start-btn'], {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        });

        const targetPanel = videoPanels.find(panel => panel.mesh.userData.section === sectionId);
        const targetPosition = targetPanel ? {
            x: targetPanel.mesh.position.x,
            y: targetPanel.mesh.position.y,
            z: targetPanel.mesh.position.z + 8
        } : { x: 0, y: 0, z: 15 };

        const startPosition = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        };

        function animateStep() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
            camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeProgress;
            camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;

            videoPanels.forEach(panel => {
                if (panel.mesh.userData.section === sectionId) {
                    panel.mesh.position.x = panel.originalPosition[0];
                    panel.mesh.position.y = panel.originalPosition[1];
                    panel.mesh.position.z = panel.originalPosition[2];
                    panel.mesh.material.opacity = 1;
                    const pulseScale = 1.5 + Math.sin(Date.now() * 0.002) * 0.05;
                    panel.mesh.scale.set(pulseScale, pulseScale, pulseScale);
                } else {
                    const targetX = panel.backgroundPosition[0];
                    const targetY = panel.backgroundPosition[1];
                    const targetZ = panel.backgroundPosition[2] - 30;

                    panel.mesh.position.x = panel.originalPosition[0] + (targetX - panel.originalPosition[0]) * easeProgress;
                    panel.mesh.position.y = panel.originalPosition[1] + (targetY - panel.originalPosition[1]) * easeProgress;
                    panel.mesh.position.z = panel.originalPosition[2] + (targetZ - panel.originalPosition[2]) * easeProgress;

                    panel.mesh.material.opacity = 0.95 - (0.8 * easeProgress);
                    panel.mesh.scale.set(1, 1, 1);
                }
            });

            if (progress >= 1) {
                showMainContent();
            } else {
                requestAnimationFrame(animateStep);
            }
        }

        animateStep();
    } catch (error) {
        console.error('Animate to section error:', error);
        showMainContent();
    }
}

function setupEventListeners() {
    try {
        console.log('Setting up event listeners');
        window.addEventListener('resize', () => {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.0005;
            mouseY = (event.clientY - windowHalfY) * 0.0005;

            const cursorTrail = document.querySelector('.cursor-trail');
            if (cursorTrail) {
                cursorTrail.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
            }
        });

        document.addEventListener('wheel', (event) => {
            if (!isSectionMode) {
                const delta = event.deltaY * 0.005;
                camera.position.z = Math.max(8, Math.min(40, camera.position.z + delta));
            }
        });

        const startBtn = document.querySelector('#start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Start button clicked, navigating to home section');
                animateToSection('home');
            });
        }

        const backBtn = document.querySelector('#back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('Back button clicked');
                showSpace();
            });
        }

        document.querySelectorAll('.nav-item a').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section;
                console.log('Nav item clicked:', sectionId);
                const section = document.querySelector(`#${sectionId}`);

                gsap.to(window, {
                    scrollTo: { y: section, offsetY: 80 },
                    duration: 1,
                    ease: 'power2.inOut'
                });
            });
        });

        document.querySelectorAll('[data-modal]').forEach(item => {
            item.addEventListener('click', () => {
                const modalId = item.dataset.modal;
                const modal = document.querySelector('#modal');
                const modalTitle = modal.querySelector('.modal-title');
                const modalDescription = modal.querySelector('.modal-description');
                const modalDetails = modal.querySelector('.modal-details');

                if (modalContent[modalId]) {
                    modalTitle.textContent = modalContent[modalId].title;
                    modalDescription.textContent = modalContent[modalId].description;
                    modal.classList.add('active');
                }
            });
        });

        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                document.querySelector('#modal').classList.remove('active');
            });
        }

        const modal = document.querySelector('#modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        const contactForm = document.querySelector('#contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.querySelector('#name').value;
                const email = document.querySelector('#email').value;
                const message = document.querySelector('#message').value;
                console.log('Form submitted:', { name, email, message });
                alert('Thank you for your message! I will get back to you soon.');
                contactForm.reset();
            });
        }

        VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
            max: 15,
            speed: 400,
            glare: true,
            'max-glare': 0.5
        });

        gsap.to(document.body, {
            backgroundColor: '#1a1a1a',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true
            }
        });

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        document.addEventListener('mousemove', (event) => {
            if (isSectionMode) return;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(videoPanels.map(p => p.mesh));

            videoPanels.forEach(panel => {
                panel.mesh.scale.set(1, 1, 1);
                if (panel.mesh.material.emissive) {
                    panel.mesh.material.emissive.setHex(panel.mesh.material.color?.getHex() || 0x000000);
                    panel.mesh.material.emissiveIntensity = 0.1;
                }
            });

            if (intersects.length > 0) {
                const panel = intersects[0].object;
                panel.scale.set(1.15, 1.15, 1.15);
                if (panel.material.emissive) {
                    panel.material.emissiveIntensity = 0.4;
                }
                if (panel.userData.section) {
                    document.body.style.cursor = 'pointer';
                } else {
                    document.body.style.cursor = 'default';
                }
            } else {
                document.body.style.cursor = 'default';
            }
        });

        document.addEventListener('click', (event) => {
            if (isSectionMode) return;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(videoPanels.map(p => p.mesh));

            if (intersects.length > 0 && intersects[0].object.userData.section) {
                console.log('Panel clicked, navigating to:', intersects[0].object.userData.section);
                animateToSection(intersects[0].object.userData.section);
            }
        });

        if (typeof particlesJS !== 'undefined') {
            particlesJS.load('particles-js', 'particles-config.js', () => {
                console.log('Particles.js config loaded');
            });
        }

        console.log('Event listeners set up');
    } catch (error) {
        console.error('Event listeners error:', error);
    }
}

function animate() {
    try {
        requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        if (isRotating && !isSectionMode) {
            camera.position.x = Math.cos(time * 0.08) * 18 + (mouseX * 10);
            camera.position.y = Math.sin(time * 0.06) * 6 + (mouseY * 6);
            camera.lookAt(0, 0, 0);
        }

        videoPanels.forEach((panel, index) => {
            if (!isSectionMode) {
                panel.mesh.position.x = panel.originalPosition[0] + Math.sin(time * 0.5 + index) * 0.6;
                panel.mesh.position.y = panel.originalPosition[1] + Math.cos(time * 0.4 + index) * 0.4;

                panel.mesh.rotation.x += panel.rotationSpeed.x;
                panel.mesh.rotation.y += panel.rotationSpeed.y;
                panel.mesh.rotation.z += panel.rotationSpeed.z;

                if (panel.mesh.material.emissive && !panel.mesh.userData.section) {
                    const emissiveIntensity = 0.1 + Math.sin(time * 1.5 + index) * 0.05;
                    panel.mesh.material.emissiveIntensity = emissiveIntensity;
                }
            }
        });

        renderer.render(scene, camera);
    } catch (error) {
        console.error('Animation loop error:', error);
    }
}

window.addEventListener('load', () => {
    try {
        console.log('Window loaded, preloading videos');
        videoUrls.forEach(url => {
            const video = document.createElement('video');
            video.src = url;
        });

        init();
    } catch (error) {
        console.error('Window load error:', error);
        showMainContent();
    }
    "use strict";

function initScissorCarousel() {
    try {
        console.log('Initializing scissor carousel');
        gsap.registerPlugin(ScrollTrigger);

        const leftTrack = document.querySelector('.marquee-track.left');
        const rightTrack = document.querySelector('.marquee-track.right');

        if (!leftTrack || !rightTrack) {
            throw new Error('Marquee tracks not found');
        }

        const textItems = ['Digital Art', 'WebGL Design', 'Immersive Tech', 'Creative Code', 'Future UI'];

        const createTextElements = (track, items) => {
            track.innerHTML = ''; 
            const screenWidth = window.innerWidth;
            const minSets = Math.ceil(screenWidth / 300) + 2;

            for (let i = 0; i < minSets * 2; i++) { 
                items.forEach(item => {
                    const span = document.createElement('span');
                    span.className = 'marquee-text';
                    span.textContent = item;
                    track.appendChild(span);
                    track.appendChild(document.createTextNode(' ')); 
                });
            }
        };

        createTextElements(leftTrack, textItems);
        createTextElements(rightTrack, textItems);

        const animateTracks = () => {
            const trackWidth = leftTrack.getBoundingClientRect().width;

            gsap.fromTo(
                '.marquee-track.left',
                { xPercent: 0 },
                {
                    xPercent: -50, 
                    duration: trackWidth / 100,
                    ease: 'none',
                    repeat: -1,
                    modifiers: {
                        xPercent: gsap.utils.wrap(-50, 0) 
                    }
                }
            );

            gsap.fromTo(
                '.marquee-track.right',
                { xPercent: -50 },
                {
                    xPercent: 0,
                    duration: trackWidth / 100, 
                    ease: 'none',
                    repeat: -1,
                    modifiers: {
                        xPercent: gsap.utils.wrap(-50, 0)
                    }
                }
            );
        };

        animateTracks();
        const marqueeContainer = document.querySelector('.marquee-container');
        marqueeContainer.addEventListener('mouseenter', () => {
            gsap.to('.marquee-track', { timeScale: 0.2, overwrite: true });
        });
        marqueeContainer.addEventListener('mouseleave', () => {
            gsap.to('.marquee-track', { timeScale: 1, overwrite: true });
        });
        window.addEventListener('resize', () => {
            createTextElements(leftTrack, textItems);
            createTextElements(rightTrack, textItems);
            gsap.killTweensOf('.marquee-track');
            animateTracks();
        });

        console.log('Scissor carousel initialized');
    } catch (error) {
        console.error('Scissor carousel error:', error);
    }
}
document.addEventListener('DOMContentLoaded', initScissorCarousel);
document.addEventListener('DOMContentLoaded', initScissorCarousel);
});