/* Motion: Lenis + GSAP ScrollTrigger. Off under prefers-reduced-motion. */
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.8/+esm'
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm'
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger/+esm'

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initMotion() {
  if (reduced) {
    document.documentElement.classList.add('reduced-motion')
    return
  }

  gsap.registerPlugin(ScrollTrigger)

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  gsap.to('.hero-shade', {
    opacity: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  })

  gsap.utils
    .toArray(
      '.section-head, .lede, .factsheet, .steps li, .work-card, .marque-grid a, .pull, .faq-list details, .contact-grid > *, .compare'
    )
    .forEach((el, i) => {
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out',
        delay: (i % 4) * 0.07,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      })
    })

  gsap.utils.toArray('.work-photo img').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -5 },
      {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.work-card') || img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      }
    )
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion)
} else {
  initMotion()
}
