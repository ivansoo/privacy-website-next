"use client"
import React, { useState, useEffect } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) document.body.classList.add('mobile-menu-open')
    else document.body.classList.remove('mobile-menu-open')
    return () => document.body.classList.remove('mobile-menu-open')
  }, [open])

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <div className="header__logo">
            <a href="#hero" aria-label="QR Consult - Наверх страницы">
              <img src="/assets/images/logo.svg" alt="QR Consult" className="logo" loading="eager" />
              <span className="header__logo-text">QR Consult</span>
            </a>
          </div>

          <nav className={`header__nav ${open ? 'mobile-open' : ''}`} aria-label="Основная навигация" id="main-navigation">
            <ul className="nav-list">
              <li><a href="#hero" className="nav-link">Главная</a></li>
              <li className="nav-dropdown">
                <a href="#services" className="nav-link" aria-haspopup="true" aria-expanded={open ? 'true' : 'false'}>Услуги</a>
                <ul className="dropdown-menu" role="menu">
                  <li role="none"><a role="menuitem" href="podacha-uvedomleniya-v-roskomnadzor.html" className="dropdown-link">Подача уведомления</a></li>
                </ul>
              </li>
              <li><a href="resources.html" className="nav-link">Материалы</a></li>
              <li><a href="#process" className="nav-link">Как работаем</a></li>
              <li><a href="#contact" className="nav-link">Контакты</a></li>
            </ul>
          </nav>

          <div className="header__contact">
            <div className="header__social">
              <a href="mailto:info@qrconsult.ru" className="header__email-link" aria-label="Email">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
              </a>
              <a href="https://wa.me/79646225522" target="_blank" rel="noopener noreferrer" className="header__social-link header__social-link--whatsapp" aria-label="WhatsApp">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"></path></svg>
              </a>
              <a href="https://t.me/QRconsult" target="_blank" rel="noopener noreferrer" className="header__social-link header__social-link--telegram" aria-label="Telegram">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path></svg>
              </a>
            </div>
            <button className={`mobile-menu-toggle ${open ? 'active' : ''}`} aria-label="Открыть меню" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
