// Esperar a que el DOM cargue completamente
document.addEventListener('DOMContentLoaded', function() {
    
    // === MÚSICA DE FONDO ===
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicControl = document.getElementById('musicControl');
    let musicPlaying = false;
    
    // Configurar volumen moderado (0.5 es un buen punto medio)
    backgroundMusic.volume = 0.5;
    
    // Verificar si el usuario silenció la música anteriormente (persistencia con localStorage)
    const musicMuted = localStorage.getItem('aniversario_music_muted') === 'true';
    
    // Función para intentar reproducir música
    function playMusic() {
        if (musicPlaying) return;
        if (musicMuted) return; // No reproducir si el usuario la silenció
        
        const promise = backgroundMusic.play();
        if (promise !== undefined) {
            promise.then(() => {
                musicPlaying = true;
                if (musicControl) {
                    musicControl.innerHTML = '🔊';
                    musicControl.classList.add('playing');
                    musicControl.style.animation = '';
                }
            }).catch((e) => {
                console.log('Autoplay bloqueado, esperando interacción:', e);
                if (musicControl) {
                    musicControl.innerHTML = '🔇';
                    musicControl.classList.remove('playing');
                    musicControl.style.animation = 'pulse 1.5s infinite';
                }
            });
        }
    }
    
    // Si la música no está silenciada, intentar reproducir inmediatamente
    if (!musicMuted) {
        playMusic();
        // También intentar cuando la ventana termine de cargar
        window.addEventListener('load', playMusic);
    } else {
        // Si está silenciada, mostrar el ícono de muteado
        if (musicControl) {
            musicControl.innerHTML = '🔇';
            musicControl.classList.remove('playing');
        }
    }
    
    // Reproducir música en cuanto el usuario interactúe (para saltar restricciones de autoplay)
    function handleUserInteraction() {
        if (!musicPlaying && !musicMuted) {
            backgroundMusic.play().then(() => {
                musicPlaying = true;
                if (musicControl) {
                    musicControl.innerHTML = '🔊';
                    musicControl.classList.add('playing');
                    musicControl.style.animation = '';
                }
            }).catch((e) => {
                console.log('Error al reproducir:', e);
            });
        }
    }
    
    // Agregar listeners para detectar cualquier interacción (solo si no está silenciada)
    if (!musicMuted) {
        const events = ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'];
        events.forEach(event => {
            document.addEventListener(event, handleUserInteraction, { once: false });
        });
        
        // Después de que la música empiece, remover los listeners innecesarios
        backgroundMusic.addEventListener('play', function() {
            events.forEach(event => {
                document.removeEventListener(event, handleUserInteraction);
            });
        });
    }
    
    // Reanudar música cuando el usuario vuelve a la pestaña
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && musicPlaying && !musicMuted) {
            backgroundMusic.play().catch(e => console.log('Error al reanudar:', e));
        }
    });
    
    // Control de música (si existe el botón)
    if (musicControl) {
        musicControl.addEventListener('click', function(e) {
            e.stopPropagation();
            if (musicPlaying) {
                // Pausar música y guardar estado
                backgroundMusic.pause();
                musicPlaying = false;
                musicControl.innerHTML = '🔇';
                musicControl.classList.remove('playing');
                localStorage.setItem('aniversario_music_muted', 'true');
            } else {
                // Reanudar música y guardar estado
                backgroundMusic.play().then(() => {
                    musicPlaying = true;
                    musicControl.innerHTML = '🔊';
                    musicControl.classList.add('playing');
                    localStorage.setItem('aniversario_music_muted', 'false');
                }).catch((e) => {
                    console.log('Error al reproducir:', e);
                });
            }
        });
    }
    
    // Asegurar que la música se repita
    backgroundMusic.addEventListener('ended', function() {
        backgroundMusic.play();
    });
    
    // === HERO CAROUSEL (Fade automático) ===
    const heroSlides = document.querySelectorAll('.hero-slide');
    let heroCurrent = 0;
    const heroInterval = 5000; // 5 segundos

    function showHeroSlide() {
        heroSlides.forEach(slide => slide.classList.remove('active'));
        heroSlides[heroCurrent].classList.add('active');
        heroCurrent = (heroCurrent + 1) % heroSlides.length;
    }

    // Iniciar carrusel de hero
    let heroTimer = setInterval(showHeroSlide, heroInterval);

    // === CARRUSEL DE RAZONES (Horizontal) ===
    const razonesTrack = document.getElementById('razonesCarousel');
    const razonesItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const razonesDots = document.getElementById('razonesDots');
    let razonesCurrent = 0;
    let itemsPerView = 1;
    let razonesMaxIndex = 0;
    let razonesTimer;

    function getItemsPerView() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    function updateRazonesCarousel() {
        itemsPerView = getItemsPerView();
        razonesMaxIndex = Math.max(0, razonesItems.length - itemsPerView);
        
        if (razonesCurrent > razonesMaxIndex) {
            razonesCurrent = razonesMaxIndex;
        }
        
        const translateX = -(razonesCurrent * (100 / itemsPerView));
        razonesTrack.style.transform = `translateX(${translateX}%)`;
        
        updateDots();
    }

    function updateDots() {
        razonesDots.innerHTML = '';
        const totalDots = razonesMaxIndex + 1;
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.setAttribute('data-index', i);
            if (i === razonesCurrent) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                razonesCurrent = i;
                updateRazonesCarousel();
                resetRazonesAutoPlay();
            });
            
            razonesDots.appendChild(dot);
        }
    }

    function resetRazonesAutoPlay() {
        clearInterval(razonesTimer);
        razonesTimer = setInterval(() => {
            razonesCurrent = (razonesCurrent + 1) > razonesMaxIndex ? 0 : razonesCurrent + 1;
            updateRazonesCarousel();
        }, 3000);
    }

    prevBtn.addEventListener('click', () => {
        razonesCurrent = razonesCurrent <= 0 ? razonesMaxIndex : razonesCurrent - 1;
        updateRazonesCarousel();
        resetRazonesAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        razonesCurrent = razonesCurrent >= razonesMaxIndex ? 0 : razonesCurrent + 1;
        updateRazonesCarousel();
        resetRazonesAutoPlay();
    });

    updateRazonesCarousel();
    resetRazonesAutoPlay();

    window.addEventListener('resize', () => {
        updateRazonesCarousel();
    });

    // === MOSAIC CAROUSEL ===
    const mosaicItems = document.querySelectorAll('.mosaic-item');
    const mosaicPrevBtn = document.querySelector('.mosaic-btn.prev');
    const mosaicNextBtn = document.querySelector('.mosaic-btn.next');
    const mosaicDots = document.getElementById('mosaicDots');
    let mosaicCurrent = 0;
    const mosaicInterval = 4000;

    function updateMosaicDots() {
        if (!mosaicDots) return;
        mosaicDots.innerHTML = '';
        
        mosaicItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (index === mosaicCurrent) dot.classList.add('active');
            dot.setAttribute('aria-label', `Ir a imagen ${index + 1}`);
            
            dot.addEventListener('click', () => {
                clearInterval(mosaicTimer);
                mosaicCurrent = index;
                showMosaicSlide();
                mosaicTimer = setInterval(showMosaicSlide, mosaicInterval);
            });
            
            mosaicDots.appendChild(dot);
        });
    }

    function showMosaicSlide() {
        mosaicItems.forEach(item => item.classList.remove('active'));
        mosaicItems[mosaicCurrent].classList.add('active');
        updateMosaicDots();
    }

    mosaicItems[0].classList.add('active');
    updateMosaicDots();
    let mosaicTimer = setInterval(() => {
        mosaicCurrent = (mosaicCurrent + 1) % mosaicItems.length;
        showMosaicSlide();
    }, mosaicInterval);

    mosaicPrevBtn.addEventListener('click', () => {
        clearInterval(mosaicTimer);
        mosaicCurrent = mosaicCurrent <= 0 ? mosaicItems.length - 1 : mosaicCurrent - 1;
        showMosaicSlide();
        mosaicTimer = setInterval(() => {
            mosaicCurrent = (mosaicCurrent + 1) % mosaicItems.length;
            showMosaicSlide();
        }, mosaicInterval);
    });

    mosaicNextBtn.addEventListener('click', () => {
        clearInterval(mosaicTimer);
        mosaicCurrent = (mosaicCurrent + 1) % mosaicItems.length;
        showMosaicSlide();
        mosaicTimer = setInterval(() => {
            mosaicCurrent = (mosaicCurrent + 1) % mosaicItems.length;
            showMosaicSlide();
        }, mosaicInterval);
    });

    // === LIGHTBOX PARA GALERÍA ===
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItems = document.querySelectorAll('.gallery-item img');
    
    galleryItems.forEach(img => {
        img.addEventListener('click', function() {
            lightboxImage.src = this.src;
            lightboxImage.alt = this.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    lightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });
    
    lightbox.addEventListener('click', closeLightbox);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // === ANIMACIONES DE SCROLL (Fade-in) ===
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

    // === NAVEGACIÓN MÓVIL ===
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // === SMOOTH SCROLLING ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Botón scroll down en hero
    const scrollDownBtn = document.querySelector('.scroll-down');
    scrollDownBtn.addEventListener('click', () => {
        document.getElementById('razones').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // === NAVBAR CAMBIA AL HACER SCROLL ===
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

});
