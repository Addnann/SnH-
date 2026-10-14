document.addEventListener('DOMContentLoaded', () => {
  const TITLE_TEXT = "Software & Hardware Club";
  const LOGO_DISPLAY_TIME = 2600;
  
  const NORMAL_DURATION = 2000; // 2 seconds for member slides
  const EVENT_DURATION = 6500;  // Increased to 6.5 seconds for previous event slides
  
  const PARTICLE_COUNT = Math.min(Math.floor(window.innerWidth / 12), 100);

  let currentSlideIndex = 0;
  let autoPlayTimer = null;
  let progressInterval = null;

  const bgCanvas = document.getElementById('bg');
  const ctx = bgCanvas.getContext('2d');
  const introStage = document.getElementById('intro-stage');
  const logosContainer = document.getElementById('logos');
  const welcomeContainer = document.getElementById('welcome');
  const titleElement = document.getElementById('title');
  const teamSlider = document.getElementById('team-slider');
  const replayBtn = document.getElementById('replay');
  const bgAudio = document.getElementById('bg-audio');
  const musicToggle = document.getElementById('music-toggle');
  const musicText = document.getElementById('music-text');

  let particles = [];
  let isMusicPlaying = false;

  // Function to toggle music
  function toggleMusic() {
    if (isMusicPlaying) {
      bgAudio.pause();
      isMusicPlaying = false;
      musicText.textContent = "Music Off";
      musicToggle.style.borderColor = "rgba(0, 242, 254, 0.4)";
    } else {
      bgAudio.play().then(() => {
        isMusicPlaying = true;
        musicText.textContent = "Music On";
        musicToggle.style.borderColor = "var(--teal-accent)";
      }).catch(e => {
        console.log("Audio playback error:", e);
      });
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  // Auto-play music on first user interaction
  function handleFirstInteraction() {
    if (!isMusicPlaying) {
      bgAudio.play().then(() => {
        isMusicPlaying = true;
        musicText.textContent = "Music On";
        musicToggle.style.borderColor = "var(--teal-accent)";
      }).catch(e => {
        console.log("Autoplay blocked:", e);
      });
    }
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  }

  window.addEventListener('click', handleFirstInteraction);
  window.addEventListener('keydown', handleFirstInteraction);

  function getSlides() {
    return document.querySelectorAll('.member-slide');
  }

  function getCurrentSlideDuration() {
    const slides = getSlides();
    if (!slides[currentSlideIndex]) return NORMAL_DURATION;
    // Check if current slide is an event slide
    if (slides[currentSlideIndex].classList.contains('event-slide')) {
      return EVENT_DURATION;
    }
    return NORMAL_DURATION;
  }

  function updateIndicator() {
    const slides = getSlides();
    const slideIndicator = document.getElementById('slide-indicator');
    if (slideIndicator && slides.length > 0) {
      slideIndicator.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    }
  }

  function resetProgressBar() {
    const progressBarFill = document.getElementById('progress-bar-fill');
    if (!progressBarFill) return;

    clearInterval(progressInterval);
    progressBarFill.style.width = '0%';

    let currentDuration = getCurrentSlideDuration();
    let startTime = Date.now();
    
    progressInterval = setInterval(() => {
      let elapsedTime = Date.now() - startTime;
      let progressPercent = Math.min((elapsedTime / currentDuration) * 100, 100);
      progressBarFill.style.width = `${progressPercent}%`;

      if (elapsedTime >= currentDuration) {
        clearInterval(progressInterval);
      }
    }, 30);
  }

  function goToSlide(index) {
    const slides = getSlides();
    if (!slides.length) return;

    if (index >= slides.length) {
      stopAutoPlay();
      currentSlideIndex = slides.length - 1;
      slides.forEach(s => s.classList.remove('current'));
      slides[currentSlideIndex].classList.add('current');
      updateIndicator();
      const progressBarFill = document.getElementById('progress-bar-fill');
      if (progressBarFill) {
        progressBarFill.style.width = '100%';
      }
      return;
    }

    slides.forEach(s => s.classList.remove('current'));
    currentSlideIndex = (index + slides.length) % slides.length;
    slides[currentSlideIndex].classList.add('current');

    updateIndicator();
    scheduleNextSlide();
  }

  function scheduleNextSlide() {
    stopAutoPlay();
    resetProgressBar();
    let currentDuration = getCurrentSlideDuration();

    autoPlayTimer = setTimeout(() => {
      const slides = getSlides();
      if (currentSlideIndex >= slides.length - 1) {
        stopAutoPlay();
      } else {
        goToSlide(currentSlideIndex + 1);
      }
    }, currentDuration);
  }

  function startAutoPlay() {
    goToSlide(currentSlideIndex);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearTimeout(autoPlayTimer);
    if (progressInterval) clearInterval(progressInterval);
  }

  // Interactive Canvas Background
  class Particle {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * bgCanvas.width;
      this.y = Math.random() * bgCanvas.height;
      this.size = Math.random() * 2 + 1;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.color = Math.random() > 0.4 ? '#00f2fe' : '#4facfe';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > bgCanvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > bgCanvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function setupCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateCanvas);
  }

  function prepareTitleText() {
    titleElement.innerHTML = '';
    TITLE_TEXT.split(' ').forEach((word) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.marginRight = '0.3em';
      [...word].forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });
      titleElement.appendChild(wordSpan);
    });
  }

  function playSequence() {
    stopAutoPlay();
    introStage.classList.remove('hide-intro');
    logosContainer.classList.remove('go', 'out');
    welcomeContainer.classList.remove('show');
    teamSlider.classList.remove('active');
    currentSlideIndex = 0;

    const letterSpans = titleElement.querySelectorAll('h1 span span');
    letterSpans.forEach(span => {
      span.style.opacity = '0';
      span.style.transform = 'translateY(35px) scale(0.85)';
      span.style.filter = 'blur(12px)';
    });

    requestAnimationFrame(() => logosContainer.classList.add('go'));

    setTimeout(() => {
      logosContainer.classList.add('out');
      setTimeout(() => {
        welcomeContainer.classList.add('show');
        letterSpans.forEach((span, i) => {
          setTimeout(() => {
            span.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            span.style.opacity = '1';
            span.style.transform = 'translateY(0) scale(1)';
            span.style.filter = 'blur(0)';
          }, i * 40);
        });

        setTimeout(() => {
          introStage.classList.add('hide-intro');
          teamSlider.classList.add('active');
          goToSlide(0);
          startAutoPlay();
        }, 2200);
      }, 600);
    }, LOGO_DISPLAY_TIME);
  }

  prepareTitleText();
  setupCanvas();
  animateCanvas();
  playSequence();

  replayBtn.addEventListener('click', () => {
    playSequence();
    if (!isMusicPlaying) {
      toggleMusic();
    }
  });

  window.addEventListener('resize', setupCanvas);
});