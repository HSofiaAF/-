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

    // Interactive mouse / touch state
    let mouseX = width * 0.5;
    let mouseY = height * 0.45;
    let isHovering = false;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovering = true;
      const xNorm = (e.clientX / width) * 2 - 1;
      const yNorm = (e.clientY / height) * 2 - 1;
      targetRotX = yNorm * 0.45;
      targetRotY = xNorm * 0.45;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        isHovering = true;
        const xNorm = (touch.clientX / width) * 2 - 1;
        const yNorm = (touch.clientY / height) * 2 - 1;
        targetRotX = yNorm * 0.35;
        targetRotY = xNorm * 0.35;
      }
    };

    const handleMouseLeave = () => {
      isHovering = false;
      targetRotX = 0;
      targetRotY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // 1. Deep 3D Starfield (Pastel Twinkling Stars)
    const STAR_COUNT = Math.min(Math.floor((width * height) / 3800), 260);
    const starPalette = ['#ffffff', '#fbcfe8', '#fde68a', '#e9d5ff', '#fed7aa'];
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2200,
      y: (Math.random() - 0.5) * 2200,
      z: Math.random() * 1600 + 100,
      baseRadius: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      twinklePhase: Math.random() * Math.PI * 2,
      color: starPalette[Math.floor(Math.random() * starPalette.length)]
    }));

    // 2. 3D Cosmic Particle Swarm (usta.agency style with baby elegant palette)
    // Rose Quartz, Champagne Gold, Dreamy Lilac, Pearl White
    const SWARM_COUNT = Math.min(Math.floor((width * height) / 1800), 620);
    const babyPalette = [
      'rgba(244, 114, 182, ',  // Rose Quartz Pink
      'rgba(251, 207, 232, ',  // Soft Blush Pink
      'rgba(253, 230, 138, ',  // Champagne Gold
      'rgba(251, 191, 36, ',   // Warm Honey Gold
      'rgba(192, 132, 252, ',  // Dreamy Lavender
      'rgba(233, 213, 255, ',  // Lilac Mist
      'rgba(255, 255, 255, '   // Pearl Diamond
    ];

    const swarmParticles = Array.from({ length: SWARM_COUNT }, (_, i) => {
      // Spherical distribution with spiral harmonics
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 360 + 50;

      const baseX = r * Math.sin(phi) * Math.cos(theta);
      const baseY = r * Math.sin(phi) * Math.sin(theta) * 0.65;
      const baseZ = r * Math.cos(phi);

      const colorBase = babyPalette[i % babyPalette.length];

      return {
        origX: baseX,
        origY: baseY,
        origZ: baseZ,
        // Current position with elastic physics
        currX: baseX,
        currY: baseY,
        currZ: baseZ,
        vx: 0,
        vy: 0,
        vz: 0,
        size: Math.random() * 2.4 + 0.8,
        colorBase,
        baseAlpha: Math.random() * 0.6 + 0.35,
        pulseSpeed: Math.random() * 0.035 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() * 0.003 + 0.001) * (i % 2 === 0 ? 1 : -1),
        orbitAngle: theta
      };
    });

    // 3. Elegant Shooting Stars / Fairy Streaks
    const shootingStars = [];
    let nextShootingStarTime = Date.now() + 2000;

    const createShootingStar = () => {
      const startX = Math.random() * width * 0.85;
      const startY = Math.random() * height * 0.35;
      const length = Math.random() * 140 + 90;
      const speed = Math.random() * 10 + 9;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25;

      const isRose = Math.random() > 0.4;
      const headColor = isRose ? 'rgba(251, 207, 232, 1)' : 'rgba(253, 230, 138, 1)';
      const tailColor = isRose ? 'rgba(244, 114, 182, ' : 'rgba(251, 191, 36, ';

      shootingStars.push({
        x: startX,
        y: startY,
        length,
        speed,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        opacity: 1,
        fadeSpeed: Math.random() * 0.018 + 0.012,
        thickness: Math.random() * 1.6 + 1,
        headColor,
        tailColor
      });
    };

    // Render loop parameters
    const FOV = 480;
    let autoRotation = 0;
    let lastTime = performance.now();

    const render = (time) => {
      const deltaTime = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Auto gentle cosmic spin
      autoRotation += 0.002;

      // Smooth camera interpolation
      currentRotX += (targetRotX - currentRotX) * 0.04;
      currentRotY += (targetRotY - currentRotY) * 0.04;

      const totalRotY = currentRotY + autoRotation;
      const totalRotX = currentRotX;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.44;

      // Dreamy Baby Space Velvety Atmosphere (Midnight Indigo + Rose + Lavender Glow)
      const nebulaGlow = ctx.createRadialGradient(cx, cy, 40, cx, cy, width * 0.75);
      nebulaGlow.addColorStop(0, 'rgba(30, 27, 75, 0.45)');     // Soft violet depth
      nebulaGlow.addColorStop(0.35, 'rgba(88, 28, 135, 0.15)'); // Subtle lilac nebula
      nebulaGlow.addColorStop(0.65, 'rgba(159, 18, 57, 0.08)'); // Baby rose blush
      nebulaGlow.addColorStop(0.9, 'rgba(9, 11, 22, 0.85)');    // Midnight velvet
      nebulaGlow.addColorStop(1, 'rgba(6, 8, 16, 0.98)');
      ctx.fillStyle = nebulaGlow;
      ctx.fillRect(0, 0, width, height);

      // --- Draw 1: Deep Twinkling Stars ---
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // 3D rotation
        let x = star.x * cosY - star.z * sinY;
        let z = star.z * cosY + star.x * sinY;
        let y = star.y * cosX - z * sinX;
        z = z * cosX + star.y * sinX + 650;

        if (z > 50) {
          const scale = FOV / z;
          const projX = cx + x * scale;
          const projY = cy + y * scale;

          if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
            star.twinklePhase += star.twinkleSpeed;
            const twinkle = Math.sin(star.twinklePhase) * 0.4 + 0.6;
            const alpha = star.alpha * twinkle * Math.min(scale * 1.3, 1);
            const radius = Math.max(star.baseRadius * scale * 1.2, 0.5);

            ctx.beginPath();
            ctx.arc(projX, projY, radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = Math.max(0, Math.min(alpha, 1));
            ctx.fill();

            if (radius > 1.1) {
              ctx.beginPath();
              ctx.arc(projX, projY, radius * 2.5, 0, Math.PI * 2);
              ctx.fillStyle = star.color;
              ctx.globalAlpha = Math.max(0, Math.min(alpha * 0.25, 0.4));
              ctx.fill();
            }
          }
        }
      }

      // --- Draw 2: 3D Swarm Particles (usta.agency particle dynamics) ---
      for (let i = 0; i < swarmParticles.length; i++) {
        const p = swarmParticles[i];

        // Harmonic orbital drift
        p.orbitAngle += p.orbitSpeed;
        const orbitRadius = Math.sqrt(p.origX * p.origX + p.origZ * p.origZ);
        const targetX = Math.cos(p.orbitAngle) * orbitRadius;
        const targetZ = Math.sin(p.orbitAngle) * orbitRadius;
        const targetY = p.origY + Math.sin(p.orbitAngle * 2) * 20;

        // Elastic recovery toward target orbit
        p.vx += (targetX - p.currX) * 0.02;
        p.vy += (targetY - p.currY) * 0.02;
        p.vz += (targetZ - p.currZ) * 0.02;

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.vz *= 0.92;

        p.currX += p.vx;
        p.currY += p.vy;
        p.currZ += p.vz;

        // 3D rotation projection
        let x = p.currX * cosY - p.currZ * sinY;
        let z = p.currZ * cosY + p.currX * sinY;
        let y = p.currY * cosX - z * sinX;
        z = z * cosX + p.currY * sinX + 520;

        if (z > 40) {
          const scale = FOV / z;
          const projX = cx + x * scale;
          const projY = cy + y * scale;

          // Interactive mouse force (usta.agency repulsion/spring effect)
          if (isHovering) {
            const distMouseX = projX - mouseX;
            const distMouseY = projY - mouseY;
            const distMouse = Math.sqrt(distMouseX * distMouseX + distMouseY * distMouseY);

            if (distMouse < 140 && distMouse > 1) {
              const force = (1 - distMouse / 140) * 18;
              p.vx += (distMouseX / distMouse) * force;
              p.vy += (distMouseY / distMouse) * force;
              p.vz += (Math.random() - 0.5) * force;
            }
          }

          if (projX >= -20 && projX <= width + 20 && projY >= -20 && projY <= height + 20) {
            p.pulsePhase += p.pulseSpeed;
            const pulse = Math.sin(p.pulsePhase) * 0.35 + 0.65;
            const alpha = p.baseAlpha * pulse * Math.min(scale * 1.5, 1);
            const radius = Math.max(p.size * scale * 1.4, 0.6);

            // Stardust particle dot
            ctx.beginPath();
            ctx.arc(projX, projY, radius, 0, Math.PI * 2);
            ctx.fillStyle = `${p.colorBase}${alpha})`;
            ctx.globalAlpha = 1;
            ctx.fill();

            // Soft stardust halo glow
            if (radius > 0.9) {
              ctx.beginPath();
              ctx.arc(projX, projY, radius * 2.8, 0, Math.PI * 2);
              ctx.fillStyle = `${p.colorBase}${alpha * 0.3})`;
              ctx.fill();
            }
          }
        }
      }

      // --- Draw 3: Shooting Stars ---
      const now = Date.now();
      if (now > nextShootingStarTime) {
        createShootingStar();
        nextShootingStarTime = now + Math.random() * 4500 + 3000;
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
        grad.addColorStop(0.6, `${s.tailColor}${s.opacity * 0.7})`);
        grad.addColorStop(1, s.headColor);

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
        ctx.arc(s.x, s.y, s.thickness * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = s.headColor;
        ctx.globalAlpha = s.opacity;
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
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{
        background: 'radial-gradient(ellipse at top, #111427 0%, #090b16 55%, #05060e 100%)'
      }}
      aria-hidden="true"
    />
  );
};
