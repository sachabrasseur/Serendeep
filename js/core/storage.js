/**
 * SERENDEEP - STORAGE
 * Abstraction de localStorage avec gestion d'erreurs
 */

import { eventBus, EVENTS } from './events.js';

class Storage {
  constructor() {
    this.storageKey = 'serendeep_data';
    this.configKey = 'serendeep_config';
  }

  /**
   * Vérifie si localStorage est disponible
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('localStorage non disponible:', e);
      return false;
    }
  }

  /**
   * Sauvegarde les données complètes
   * @param {Object} data - Données à sauvegarder
   * @returns {boolean} Succès
   */
  save(data) {
    if (!this.isAvailable()) {
      console.error('localStorage non disponible');
      return false;
    }

    try {
      const json = JSON.stringify(data);
      localStorage.setItem(this.storageKey, json);
      eventBus.emit(EVENTS.STATE_SAVED, data);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error);
      
      // Si quota dépassé, essayer de compresser
      if (error.name === 'QuotaExceededError') {
        console.warn('Quota localStorage dépassé');
      }
      
      return false;
    }
  }

  /**
   * Charge les données
   * @returns {Object|null}
   */
  load() {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const json = localStorage.getItem(this.storageKey);
      if (!json) return null;
      
      const data = JSON.parse(json);
      eventBus.emit(EVENTS.STATE_LOADED, data);
      return data;
    } catch (error) {
      console.error('Erreur chargement localStorage:', error);
      return null;
    }
  }

  /**
   * Sauvegarde la configuration
   * @param {Object} config - Configuration
   * @returns {boolean}
   */
  saveConfig(config) {
    if (!this.isAvailable()) return false;

    try {
      localStorage.setItem(this.configKey, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
      return false;
    }
  }

  /**
   * Charge la configuration
   * @returns {Object|null}
   */
  loadConfig() {
    if (!this.isAvailable()) return null;

    try {
      const json = localStorage.getItem(this.configKey);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Erreur chargement config:', error);
      return null;
    }
  }

  /**
   * Supprime les données
   * @returns {boolean}
   */
  clear() {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Erreur suppression données:', error);
      return false;
    }
  }

  /**
   * Supprime toutes les données Serendeep
   * @returns {boolean}
   */
  clearAll() {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.configKey);
      return true;
    } catch (error) {
      console.error('Erreur suppression complète:', error);
      return false;
    }
  }

  /**
   * Exporte les données en JSON
   * @returns {string|null}
   */
  exportJSON() {
    const data = this.load();
    if (!data) return null;

    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Erreur export JSON:', error);
      return null;
    }
  }

  /**
   * Importe des données depuis JSON
   * @param {string} json - Données JSON
   * @returns {boolean}
   */
  importJSON(json) {
    try {
      const data = JSON.parse(json);
      return this.save(data);
    } catch (error) {
      console.error('Erreur import JSON:', error);
      return false;
    }
  }

  /**
   * Récupère la taille utilisée en localStorage
   * @returns {number} Taille en octets
   */
  getSize() {
    if (!this.isAvailable()) return 0;

    try {
      const json = localStorage.getItem(this.storageKey);
      return json ? new Blob([json]).size : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Récupère la taille formatée
   * @returns {string}
   */
  getFormattedSize() {
    const bytes = this.getSize();
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Instance singleton
export const storage = new Storage();

// Export de la classe pour tests
export { Storage };
