/* Before/after comparison slider for restoration photography */
export function initCompare(root = document) {
  root.querySelectorAll('[data-compare]').forEach((el) => {
    const after = el.querySelector('.compare-after')
    const range = el.querySelector('input[type="range"]')
    if (!after || !range) return

    const set = (v) => {
      after.style.clipPath = `inset(0 0 0 ${v}%)`
      el.style.setProperty('--pos', `${v}%`)
    }
    set(Number(range.value) || 50)
    range.addEventListener('input', () => set(Number(range.value)))
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initCompare())
} else {
  initCompare()
}
