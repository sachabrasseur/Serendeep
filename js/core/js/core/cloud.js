/**
 * SERENDEEP - CLOUD MODEL
 * Modèle de données pour un nuage
 */

import { generateCloudId } from '../core/utils.js';

/**
 * États possibles d'un nuage
 */
export const CLOUD_STATES = {
  NORMAL: 'normal',
  EXPLORED: 'explored',
  IMPORTANT: 'important'
};

/**
 * Niveaux narratifs
 */
export const CLOUD_LEVELS = {
  N1: 1,  // Récit maître
  N2: 2,  // Sous-intrigue
  N3: 3   // Texture
};

/**
 * Classe Cloud
 */
export class Cloud {
  constructor(text, level = CLOUD_LEVELS.N1, image = null) {
    this.id = null;  // Sera défini par le service
    this.text = text;
    this.level = level;
    this.img = image;
    this.state = CLOUD_STATES.NORMAL;
    this.meaning = '';
    this.ts = Date.now();
    
    // Dialogue et éléments extraits
    this.dialogue = [];
    this.extractedElements = [];
  }

  /**
   * Valide les données du nuage
   * @throws {Error} Si validation échoue
   */
  validate() {
    if (!this.text || this.text.trim().length === 0) {
      throw new Error('Le texte du nuage est requis');
    }
    
    if (this.text.length > 5000) {
      throw new Error('Le texte est trop long (max 5000 caractères)');
    }
    
    if (!Object.values(CLOUD_LEVELS).includes(this.level)) {
      throw new Error('Niveau invalide (doit être 1, 2 ou 3)');
    }
  }

  /**
   * Convertit le nuage en objet simple
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      text: this.text,
      level: this.level,
      img: this.img,
      state: this.state,
      meaning: this.meaning,
      ts: this.ts,
      dialogue: this.dialogue,
      extractedElements: this.extractedElements
    };
  }

  /**
   * Crée un Cloud depuis un objet
   * @param {Object} data - Données du nuage
   * @returns {Cloud}
   */
  static fromJSON(data) {
    const cloud = new Cloud(data.text, data.level, data.img);
    cloud.id = data.id;
    cloud.state = data.state || CLOUD_STATES.NORMAL;
    cloud.meaning = data.meaning || '';
    cloud.ts = data.ts;
    cloud.dialogue = data.dialogue || [];
    cloud.extractedElements = data.extractedElements || [];
    return cloud;
  }

  /**
   * Change l'état du nuage
   * @param {string} newState - Nouvel état
   */
  setState(newState) {
    if (!Object.values(CLOUD_STATES).includes(newState)) {
      throw new Error('État invalide');
    }
    this.state = newState;
  }

  /**
   * Définit le sens validé
   * @param {string} meaning - Sens du nuage
   */
  setMeaning(meaning) {
    this.meaning = meaning || '';
  }

  /**
   * Ajoute un message au dialogue
   * @param {Object} message - Message {role, content}
   */
  addDialogueMessage(message) {
    this.dialogue.push({
      ...message,
      timestamp: Date.now()
    });
  }

  /**
   * Ajoute un élément extrait
   * @param {Object} element - Élément {text, label}
   */
  addExtractedElement(element) {
    this.extractedElements.push({
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: element.text,
      label: element.label || '',
      extractedAt: Date.now()
    });
  }

  /**
   * Supprime un élément extrait
   * @param {string} elementId - ID de l'élément
   */
  removeExtractedElement(elementId) {
    this.extractedElements = this.extractedElements.filter(el => el.id !== elementId);
  }

  /**
   * Vérifie si le nuage a été exploré (a du dialogue)
   * @returns {boolean}
   */
  isExplored() {
    return this.dialogue.length > 0 || this.state === CLOUD_STATES.EXPLORED;
  }

  /**
   * Vérifie si le nuage est important
   * @returns {boolean}
   */
  isImportant() {
    return this.state === CLOUD_STATES.IMPORTANT;
  }

  /**
   * Obtient un résumé court du texte
   * @param {number} maxLength - Longueur max
   * @returns {string}
   */
  getShortText(maxLength = 100) {
    if (this.text.length <= maxLength) {
      return this.text;
    }
    return this.text.substring(0, maxLength) + '…';
  }
}
