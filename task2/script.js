document.addEventListener('DOMContentLoaded', () => {
  // Get all elements that need parallax effects
  const parallaxBg = document.querySelectorAll('.parallax-bg');
  const parallaxObjects = document.querySelectorAll('.parallax-object');
  const contentSections = document.querySelectorAll('.content-section');
  const restartBtn = document.getElementById('restart-btn');
  const finalSection = document.querySelector('.section-4');
  const endStars = document.querySelector('.end-stars');
  
  // Create stars for the final section
  createEndStars();
  
  // Audio context for sound effects
  let audioCtx;
  
  // Set up click events for objects
  parallaxObjects.forEach(obj => {
    obj.addEventListener('click', handleObjectClick);
  });
  
  // Set up restart button
  restartBtn.addEventListener('click', () => {
    playSound(700);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Make title interactive
  const title = document.querySelector('h1');
  title.addEventListener('click', () => {
    // Play special sound
    playSound(1000, 0.4);
    setTimeout(() => playSound(1200, 0.3), 100);
    
    // Intensity flash animation
    title.style.animation = 'none';
    title.offsetHeight; // Trigger reflow
    title.style.animation = 'titleIntenseFlash 1s';
    
    // Add the intense flash animation if it doesn't exist
    if (!document.querySelector('#intense-flash-animation')) {
      const style = document.createElement('style');
      style.id = 'intense-flash-animation';
      style.textContent = `
        @keyframes titleIntenseFlash {
          0% { 
            color: white;
            text-shadow: 0 0 20px white, 0 0 30px white, 0 0 40px white;
            transform: scale(1.1);
          }
          50% { 
            color: #ffcc00;
            text-shadow: 0 0 40px #ffcc00, 0 0 60px #ffcc00, 0 0 80px #ffcc00;
            transform: scale(1.2);
          }
          100% { 
            color: white;
            text-shadow: 4px 4px 0 #ff00ff, -4px -4px 0 #00ffff;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Reset after animation
    setTimeout(() => {
      title.style.animation = 'titleFlash 3s infinite';
    }, 1000);
  });
  
  // Initial call to set positions
  updateParallax();
  
  // Update parallax effect on scroll
  window.addEventListener('scroll', updateParallax);
  
  // Main function to update all parallax effects
  function updateParallax() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    
    // Update background layers with different speeds
    parallaxBg.forEach((layer, index) => {
      // Skip first layer (static background)
      if (index === 0) return;
      
      // Different speeds for each layer
      const speed = (index * 0.2); // Higher index = faster movement
      const yPos = scrollY * speed;
      
      // Apply transform with translate3d for better performance
      layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
    
    // Update parallax objects with individual speeds
    parallaxObjects.forEach(obj => {
      const speed = parseFloat(obj.getAttribute('data-speed')) || 0.5;
      const yPos = scrollY * speed;
      
      // Add random horizontal drift for more dynamic effect
      const drift = Math.sin(scrollY * 0.001) * 20 * speed;
      
      // Calculate scale based on scroll position for additional depth effect
      const scrollProgress = scrollY / (documentHeight - windowHeight);
      const scale = 1 + (scrollProgress * 0.2 * speed);
      
      // Apply multiple transformations for rich parallax effect
      obj.style.transform = `translate3d(${drift}px, ${yPos}px, 0) scale(${scale})`;
      
      // Adjust opacity for fade effect
      obj.style.opacity = 1 - (scrollProgress * speed * 0.5);
      
      // Rotate some objects for additional visual interest
      if (obj.classList.contains('diamond-yellow') || 
          obj.classList.contains('star-cyan') || 
          obj.classList.contains('hex-orange')) {
        const rotation = scrollY * speed * 0.05;
        obj.style.transform += ` rotate(${rotation}deg)`;
      }
    });
    
    // Update content sections for subtle parallax effect
    contentSections.forEach(section => {
      const speed = parseFloat(section.getAttribute('data-speed')) || 0.1;
      const rect = section.getBoundingClientRect();
      const centerPoint = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      
      // Calculate distance from viewport center
      const distanceFromCenter = centerPoint - viewportCenter;
      
      // Parallax effect stronger when section is near viewport center
      const parallaxY = distanceFromCenter * speed;
      
      // Apply transform
      section.style.transform = `translate3d(0, ${-parallaxY}px, 0)`;
      
      // Add subtle scale effect when section is in view
      if (rect.top < windowHeight && rect.bottom > 0) {
        const visibilityPercent = 1 - (Math.abs(distanceFromCenter) / windowHeight);
        const scale = 0.98 + (visibilityPercent * 0.04);
        section.style.transform += ` scale(${scale})`;
        
        // Add glow effect when section is centered
        const glowIntensity = Math.max(0, 10 * visibilityPercent - 5);
        if (glowIntensity > 0) {
          section.style.boxShadow = section.style.boxShadow.replace(/rgba\([^,]+, [^,]+, [^,]+, [^)]+\)/, 
                                    match => match.replace(/[^,]+\)/, `${glowIntensity * 0.4})`));
        }
      }
    });
  }
  
  // Function to handle object clicks
  function handleObjectClick(e) {
    const obj = e.currentTarget;
    
    // Remove any existing animation classes
    obj.classList.remove('animate-pulse', 'animate-spin', 'animate-bounce', 'animate-shake', 'animate-flip');
    
    // Get a random animation
    const animations = ['animate-pulse', 'animate-spin', 'animate-bounce', 'animate-shake', 'animate-flip'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    
    // Add the animation class
    obj.classList.add(randomAnimation);
    
    // Play sound
    playSound();
    
    // Remove animation class after animation completes
    setTimeout(() => {
      obj.classList.remove(randomAnimation);
    }, 800);
  }
  
  // Function to play a sound
  function playSound(frequency, duration = 0.2, volume = 0.1) {
    try {
      // Initialize audio context on first user interaction
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Create oscillator
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Random frequency if not specified
      oscillator.frequency.value = frequency || 200 + Math.random() * 500;
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Set volume
      gainNode.gain.value = volume;
      
      // Start and stop
      oscillator.start();
      
      // Add some frequency modulation for more interesting sound
      oscillator.frequency.exponentialRampToValueAtTime(
        oscillator.frequency.value * 0.5,
        audioCtx.currentTime + duration
      );
      
      // Smooth fade out
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      setTimeout(() => {
        oscillator.stop();
      }, duration * 1000);
    } catch (e) {
      console.log('Web Audio API not supported or user interaction required first');
    }
  }
  
  // Add extra visual effects
  addVisualEffects();
  
  // Create stars for the final section
  function createEndStars() {
    if (!endStars) return;
    
    // Create 50 stars
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      
      // Random size
      const size = Math.random() * 10 + 2;
      
      // Random position
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      
      // Random color
      const colors = ['#ffcc00', '#ff00ff', '#00ffff', '#00ff66', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Random animation duration
      const duration = Math.random() * 3 + 1;
      
      // Set styles
      star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        top: ${posY}%;
        left: ${posX}%;
        opacity: ${Math.random() * 0.7 + 0.3};
        box-shadow: 0 0 ${size * 2}px ${color};
        animation: star-twinkle ${duration}s infinite alternate ease-in-out;
        z-index: 1;
      `;
      
      endStars.appendChild(star);
    }
    
    // Add star animation
    const starStyle = document.createElement('style');
    starStyle.textContent = `
      @keyframes star-twinkle {
        0% { opacity: 0.3; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(starStyle);
  }
  
  function addVisualEffects() {
    // Create a subtle scanline effect
    const scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    scanlines.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.15),
        rgba(0, 0, 0, 0.15) 1px,
        transparent 1px,
        transparent 2px
      );
      pointer-events: none;
      z-index: 999;
      opacity: 0.5;
    `;
    document.body.appendChild(scanlines);
    
    // Create occasional "glitch" effect
    setInterval(() => {
      if (Math.random() > 0.97) {
        document.body.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
        setTimeout(() => {
          document.body.style.filter = '';
        }, 100);
      }
    }, 2000);
    
    // Special event when reaching the final section
    window.addEventListener('scroll', () => {
      const finalSectionTop = finalSection.getBoundingClientRect().top;
      
      // When the final section comes into view
      if (finalSectionTop < window.innerHeight * 0.5 && finalSectionTop > 0) {
        // Add celebration effect
        if (!document.body.classList.contains('celebration')) {
          document.body.classList.add('celebration');
          
          // Play a victory sound
          playSound(800, 0.5);
          setTimeout(() => playSound(1000, 0.3), 200);
          setTimeout(() => playSound(1200, 0.7), 400);
        }
      } else {
        document.body.classList.remove('celebration');
      }
    });
  }
});