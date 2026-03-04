/**
 * SERENDEEP - NOTIFICATIONS
 * Système de notifications toast
 */

import { eventBus, EVENTS } from '../core/events.js';

class Notifications {
  constructor() {
    this.container = null;
    this.init();
  }

  /**
   * Initialise le conteneur de notifications
   */
  init() {
    // Créer le conteneur s'il n'existe pas
    this.container = document.getElementById('notif-container');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notif-container';
      this.container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Affiche une notification
   * @param {string} message - Message à afficher
   * @param {string} type - Type: success, error, info, warning
   * @param {number} duration - Durée en ms (défaut: 3000)
   */
  show(message, type = 'info', duration = 3000) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    
    // Styles selon le type
    const colors = {
      success: { bg: '#3a6b49', icon: '✓' },
      error: { bg: '#bf3c18', icon: '✕' },
      warning: { bg: '#c47a1a', icon: '⚠' },
      info: { bg: '#2a5a8a', icon: 'ℹ' }
    };
    
    const color = colors[type] || colors.info;
    
    notif.style.cssText = `
      background: ${color.bg};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-family: 'Crimson Pro', serif;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      pointer-events: auto;
      cursor: pointer;
      animation: slideInRight 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 400px;
    `;
    
    notif.innerHTML = `
      <span style="font-size: 1.2rem;">${color.icon}</span>
      <span>${message}</span>
    `;
    
    this.container.appendChild(notif);
    
    // Clic pour fermer
    notif.addEventListener('click', () => {
      this.remove(notif);
    });
    
    // Auto-fermeture
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notif);
      }, duration);
    }
    
    // Émettre événement
    eventBus.emit(EVENTS.NOTIFICATION_SHOWN, { message, type });
    
    return notif;
  }

  /**
   * Retire une notification
   * @param {HTMLElement} notif - Élément notification
   */
  remove(notif) {
    notif.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (notif.parentNode) {
        notif.parentNode.removeChild(notif);
      }
    }, 300);
  }

  /**
   * Notifications spécialisées
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  /**
   * Supprime toutes les notifications
   */
  clearAll() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Ajout des animations CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .notification:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
`;
document.head.appendChild(style);

// Instance singleton
export const notifications = new Notifications();

// Export de la classe pour tests
export { Notifications };
