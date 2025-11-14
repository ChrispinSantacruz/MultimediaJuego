// src/Utils/ModalManager.js
export default class ModalManager {
  constructor({ container = document.body } = {}) {
    this.container = container
    this._createModal()
  }

  _createModal() {
    // Overlay
    this.overlay = document.createElement('div')
    Object.assign(this.overlay.style, {
      position: 'fixed',
      inset: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.6)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      transition: 'opacity 260ms ease'
    })
    this.container.appendChild(this.overlay)

    // Modal box
    this.box = document.createElement('div')
    Object.assign(this.box.style, {
      background: 'linear-gradient(135deg, #1f1f2e 0%, #0f1720 100%)',
      color: '#fff',
      padding: '28px',
      borderRadius: '14px',
      maxWidth: '440px',
      width: 'min(92%, 520px)',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 12px 30px rgba(2,6,23,0.7)',
      transform: 'scale(0.96)',
      transition: 'transform 260ms cubic-bezier(.2,.9,.2,1)'
    })
    this.overlay.appendChild(this.box)

    // Icon
    this.icon = document.createElement('div')
    Object.assign(this.icon.style, {
      width: '72px',
      height: '72px',
      margin: '0 auto 14px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '34px',
      background: 'linear-gradient(135deg,#00f5a0,#00c2ff)',
      boxShadow: '0 6px 20px rgba(0,194,255,0.18)'
    })
    this.box.appendChild(this.icon)

    // Message text
    this.text = document.createElement('div')
    Object.assign(this.text.style, {
      fontSize: '18px',
      marginBottom: '18px',
      whiteSpace: 'pre-line',
      lineHeight: '1.3',
      color: '#eef'
    })
    this.box.appendChild(this.text)

    // Dynamic buttons container
    this.buttonsContainer = document.createElement('div')
    Object.assign(this.buttonsContainer.style, {
      display: 'flex',
      flexDirection: 'row',
      gap: '12px',
      justifyContent: 'center',
      marginBottom: '12px'
    })
    this.box.appendChild(this.buttonsContainer)

    // Close button
    this.closeBtn = document.createElement('button')
    this.closeBtn.innerText = 'Cerrar'
    Object.assign(this.closeBtn.style, {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      background: 'transparent',
      color: 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      fontSize: '13px',
      position: 'absolute',
      top: '10px',
      right: '10px'
    })
    this.closeBtn.onclick = () => this.hide()
    this.box.appendChild(this.closeBtn)
  }

  show({ icon = 'ℹ️', message = '', buttons = [] } = {}) {
    this.icon.innerText = icon
    this.text.innerText = message
    this.overlay.style.display = 'flex'
    // small delay to allow transition
    requestAnimationFrame(() => {
      this.overlay.style.opacity = '1'
      this.box.style.transform = 'scale(1)'
    })

    // Limpiar botones anteriores
    this.buttonsContainer.innerHTML = ''

    // Agregar botones personalizados si se proporcionan
    if (Array.isArray(buttons) && buttons.length > 0) {
      buttons.forEach(btn => {
        const button = document.createElement('button')
        button.innerText = btn.text || 'Aceptar'
        button.onclick = () => {
          btn.onClick?.()
          this.hide()
        }
        Object.assign(button.style, {
          padding: '12px 20px',
          background: 'linear-gradient(90deg,#00c2ff,#00f5a0)',
          color: '#022',
          fontWeight: '700',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '16px',
          boxShadow: '0 8px 20px rgba(2,194,255,0.18)'
        })
        // hover effect
        button.onmouseenter = () => {
          button.style.transform = 'translateY(-3px)'
          button.style.boxShadow = '0 14px 30px rgba(2,194,255,0.25)'
        }
        button.onmouseleave = () => {
          button.style.transform = 'translateY(0)'
          button.style.boxShadow = '0 8px 20px rgba(2,194,255,0.18)'
        }
        this.buttonsContainer.appendChild(button)
      })
      this.closeBtn.style.display = 'none'
    } else {
      this.closeBtn.style.display = 'inline-block'
    }
  }

  hide() {
    // animate out
    this.overlay.style.opacity = '0'
    this.box.style.transform = 'scale(0.96)'
    setTimeout(() => {
      this.overlay.style.display = 'none'
    }, 260)
  }
}
