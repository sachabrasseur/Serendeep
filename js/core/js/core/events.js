/**
 * SERENDEEP - EVENT BUS
 * Système d'événements pour communication inter-modules
 */

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Écoute un événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction callback
   * @returns {Function} Fonction pour unsubscribe
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Retourne une fonction pour unsubscribe
    return () => this.off(event, callback);
  }

  /**
   * Arrête d'écouter un événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction callback à retirer
   */
  off(event, callback) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Émet un événement
   * @param {string} event - Nom de l'événement
   * @param {*} data - Données à passer aux listeners
   */
  emit(event, data) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erreur dans listener de l'événement "${event}":`, error);
      }
    });
  }

  /**
   * Écoute un événement une seule fois
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction callback
   */
  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
   * Supprime tous les listeners
   */
  clear() {
    this.events = {};
  }

  /**
   * Liste tous les événements enregistrés
   * @returns {string[]}
   */
  getEvents() {
    return Object.keys(this.events);
  }
}

// Instance singleton
export const eventBus = new EventBus();

// Export de la classe pour tests
export { EventBus };

/**
 * ÉVÉNEMENTS STANDARDS DE L'APPLICATION
 */
export const EVENTS = {
  // Projets
  PROJECT_CREATED: 'project:created',
  PROJECT_LOADED: 'project:loaded',
  PROJECT_SWITCHED: 'project:switched',
  PROJECT_DELETED: 'project:deleted',
  PROJECT_UPDATED: 'project:updated',
  
  // Nuages
  CLOUD_CREATED: 'cloud:created',
  CLOUD_UPDATED: 'cloud:updated',
  CLOUD_DELETED: 'cloud:deleted',
  CLOUD_STATE_CHANGED: 'cloud:stateChanged',
  
  // Combinaisons
  COMBO_SELECTED: 'combo:selected',
  COMBO_SAVED: 'combo:saved',
  COMBO_LOADED: 'combo:loaded',
  COMBO_DELETED: 'combo:deleted',
  
  // Dialogues
  DIALOGUE_OPENED: 'dialogue:opened',
  DIALOGUE_CLOSED: 'dialogue:closed',
  DIALOGUE_MESSAGE_SENT: 'dialogue:messageSent',
  DIALOGUE_MESSAGE_RECEIVED: 'dialogue:messageReceived',
  
  // UI
  TAB_CHANGED: 'ui:tabChanged',
  PHASE_CHANGED: 'ui:phaseChanged',
  NOTIFICATION_SHOWN: 'ui:notificationShown',
  
  // État
  STATE_CHANGED: 'state:changed',
  STATE_SAVED: 'state:saved',
  STATE_LOADED: 'state:loaded'
};
