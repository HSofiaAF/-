import { useEffect, useRef } from 'react';

export const CosmicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive DPR
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    // Interactive mouse / touch parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e) => {
      const xNorm = (e.clientX / width) * 2 - 1;
      const yNorm = (e.clientY / height) * 2 - 1;
      targetRotX = yNorm * 0.35;
      targetRotY = xNorm * 0.35;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const xNorm = (touch.clientX / width) * 2 - 1;
        const yNorm = (touch.clientY / height) * 2 - 1;
        targetRotX = yNorm * 0.3;
        targetRotY = xNorm * 0.3;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 1. Deep 3D Starfield
    const STAR_COUNT = Math.min(Math.floor((width * height) / 3500), 300);
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 1500 + 100,
      baseRadius: Math.random() * 1.3 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      color: ['#ffffff', '#fef08a', '#93c5fd', '#fbcfe8'][Math.floor(Math.random() * 4)]
    }));

    // 2. Cosmic Stardust Nebula Particle Cloud (Golden & Cyan/Sapphire)
    const DUST_COUNT = Math.min(Math.floor((width * height) / 2800), 400);
    const dustColors = [
      'rgba(251, 191, 36, ',  // Golden amber
      'rgba(245, 158, 11, ',  // Deep gold
      'rgba(56, 189, 248, ',  // Cyan
      'rgba(96, 165, 250, ',  // Soft sapphire
      'rgba(253, 230, 138, ', // Light stardust
      'rgba(147, 197, 253, '  // Celestial blue
    ];

    const dustParticles = Array.from({ length: DUST_COUNT }, (_, i) => {
      // Create an organic swirling spiral/ellipse cluster
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.7) * 480 + 40;
      const heightSpread = (Math.random() - 0.5) * 350;
      const colorBase = dustColors[i % dustColors.length];

      return {
        origX: Math.cos(angle) * radius,
        origY: Math.sin(angle) * (radius * 0.55) + heightSpread,
        origZ: (Math.random() - 0.5) * 600,
        x: 0,
        y: 0,
        z: 0,
        size: Math.random() * 2.2 + 0.8,
        colorBase,
        baseAlpha: Math.random() * 0.65 + 0.25,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        currentAngle: angle,
        orbitRadius: radius
      };
    });

    // 3. Shooting Stars (Meteors)
    const shootingStars = [];
    let nextShootingStarTime = Date.now() + 2500;

    const createShootingStar = () => {
      const startX = Math.random() * width * 0.8;
      const startY = Math.random() * height * 0.4;
      const length = Math.random() * 120 + 80;
      const speed = Math.random() * 12 + 10;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3; // ~45 degrees

      shootingStars.push({
        x: startX,
        y: startY,
        length,
        speed,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        opacity: 1,
        fadeSpeed: Math.random() * 0.02 + 0.015,
        thickness: Math.random() * 1.5 + 1
      });
    };

    // Render loop
    const FOV = 450;
    let lastTime = performance.now();

    const render = (time) => {
      const deltaTime = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth camera rotation
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);
      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);

      // Clear with deep space atmospheric gradient
      ctx.clearRect(0, 0, width, height);

      // Background ambient cosmic nebula glow
      const cx = width * 0.5;
      const cy = height * 0.45;

      const nebulaGlow = ctx.createRadialGradient(cx, cy, 50, cx, cy, width * 0.7);
      nebulaGlow.addColorStop(0, 'rgba(15, 23, 42, 0.5)');
      nebulaGlow.addColorStop(0.4, 'rgba(30, 27, 75, 0.25)');
      nebulaGlow.addColorStop(0.8, 'rgba(11, 15, 23, 0.8)');
      nebulaGlow.addColorStop(1, 'rgba(5, 7, 13, 0.95)');
      ctx.fillStyle = nebulaGlow;
      ctx.fillRect(0, 0, width, height);

      // --- Draw 1: Deep Stars ---
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // 3D rotation
        let x = star.x * cosY - star.z * sinY;
        let z = star.z * cosY + star.x * sinY;
        let y = star.y * cosX - z * sinX;
        z = z * cosX + star.y * sinX + 600; // Camera distance offset

        if (z > 50) {
          const scale = FOV / z;
          const projX = cx + x * scale;
          const projY = cy + y * scale;

          if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
            star.twinklePhase += star.twinkleSpeed;
            const twinkle = Math.sin(star.twinklePhase) * 0.35 + 0.65;
            const alpha = star.alpha * twinkle * Math.min(scale * 1.2, 1);
            const radius = Math.max(star.baseRadius * scale * 1.2, 0.5);

            ctx.beginPath();
            ctx.arc(projX, projY, radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = Math.max(0, Math.min(alpha, 1));
            ctx.fill();

            // Subtle glow on brighter stars
            if (radius > 1.2) {
              ctx.beginPath();
              ctx.arc(projX, projY, radius * 2.2, 0, Math.PI * 2);
              ctx.fillStyle = star.color;
              ctx.globalAlpha = Math.max(0, Math.min(alpha * 0.3, 0.5));
              ctx.fill();
            }
          }
        }
      }

      // --- Draw 2: 3D Cosmic Stardust Swarm ---
      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];

        // Gentle orbital motion
        p.currentAngle += p.orbitSpeed;
        const baseCurX = Math.cos(p.currentAngle) * p.orbitRadius;
        const baseCurY = Math.sin(p.currentAngle) * (p.orbitRadius * 0.55) + (p.origY - Math.sin(p.currentAngle) * (p.orbitRadius * 0.55));
        const baseCurZ = p.origZ;

        // 3D rotation
        let x = baseCurX * cosY - baseCurZ * sinY;
        let z = baseCurZ * cosY + baseCurX * sinY;
        let y = baseCurY * cosX - z * sinX;
        z = z * cosX + baseCurY * sinX + 500;

        if (z > 40) {
          const scale = FOV / z;
          const projX = cx + x * scale;
          const projY = cy + y * scale;

          if (projX >= -20 && projX <= width + 20 && projY >= -20 && projY <= height + 20) {
            p.pulsePhase += p.pulseSpeed;
            const pulse = Math.sin(p.pulsePhase) * 0.3 + 0.7;
            const alpha = p.baseAlpha * pulse * Math.min(scale * 1.5, 1);
            const radius = Math.max(p.size * scale * 1.4, 0.6);

            // Stardust particle dot
            ctx.beginPath();
            ctx.arc(projX, projY, radius, 0, Math.PI * 2);
            ctx.fillStyle = `${p.colorBase}${alpha})`;
            ctx.globalAlpha = 1;
            ctx.fill();

            // Stardust halo glow
            if (radius > 1.0) {
              ctx.beginPath();
              ctx.arc(projX, projY, radius * 2.8, 0, Math.PI * 2);
              ctx.fillStyle = `${p.colorBase}${alpha * 0.25})`;
              ctx.fill();
            }
          }
        }
      }

      // --- Draw 3: Shooting Stars ---
      const now = Date.now();
      if (now > nextShootingStarTime) {
        createShootingStar();
        nextShootingStarTime = now + Math.random() * 5000 + 3500;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.dx;
        s.y += s.dy;
        s.opacity -= s.fadeSpeed;

        if (s.opacity <= 0 || s.x > width + 100 || s.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - (s.dx / s.speed) * s.length;
        const tailY = s.y - (s.dy / s.speed) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, `rgba(253, 230, 138, ${s.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.thickness;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 1;
        ctx.stroke();

        // Sparkle head
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.thickness * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fill();
      }

      // Reset alpha
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    // Auto pause when tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{
        background: 'radial-gradient(ellipse at top, #090e1a 0%, #05070d 60%, #020306 100%)'
      }}
      aria-hidden="true"
    />
  );
};

