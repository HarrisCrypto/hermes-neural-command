/* Shared chrome: nav drawer + sticky solid nav on interior pages */
export function initNav() {
  const nav = document.getElementById('nav')
  const toggle = document.getElementById('navToggle')
  const drawer = document.getElementById('navDrawer')

  function onScroll() {
    if (!nav) return
    if (nav.classList.contains('page-nav')) return
    nav.classList.toggle('is-solid', (window.scrollY || 0) > 40)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true'
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true')
      if (open) drawer.setAttribute('hidden', '')
      else drawer.removeAttribute('hidden')
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNav)
} else {
  initNav()
}
