/**
 * SERENDEEP - CLOUD SERVICE
 * Logique métier pour la gestion des nuages
 */

import { Cloud, CLOUD_STATES, CLOUD_LEVELS } from '../models/Cloud.js';
import { eventBus, EVENTS } from '../core/events.js';
import { generateCloudId } from '../core/utils.js';

export class CloudService {
  constructor(state) {
    this.state = state;
  }

  /**
   * Crée un nouveau nuage
   * @param {string} text - Texte du nuage
   * @param {number} level - Niveau (1, 2 ou 3)
   * @param {string} image - Image en base64 (optionnel)
   * @returns {Object} {success, cloud?, error?}
   */
  async createCloud(text, level = CLOUD_LEVELS.N1, image = null) {
    try {
      // Créer le nuage
      const cloud = new Cloud(text, level, image);
      cloud.validate();
      
      // Générer l'ID
      const project = this.state.getCurrentProject();
      cloud.id = generateCloudId(project.nid);
      project.nid++;
      
      // Ajouter au projet (en début de liste)
      project.clouds.unshift(cloud.toJSON());
      
      // Sauvegarder
      this.state.save();
      
      // Logger dans le journal
      this.logAction('nuage', cloud.getShortText(60));
      
      // Émettre événement
      eventBus.emit(EVENTS.CLOUD_CREATED, cloud.toJSON());
      
      return { success: true, cloud: cloud.toJSON() };
      
    } catch (error) {
      console.error('Erreur création nuage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupère un nuage par son ID
   * @param {string} cloudId - ID du nuage
   * @returns {Object|null}
   */
  getCloud(cloudId) {
    const project = this.state.getCurrentProject();
    return project.clouds.find(c => c.id === cloudId) || null;
  }

  /**
   * Récupère tous les nuages
   * @returns {Array}
   */
  getAllClouds() {
    const project = this.state.getCurrentProject();
    return project.clouds;
  }

  /**
   * Met à jour un nuage
   * @param {string} cloudId - ID du nuage
   * @param {Object} updates - Propriétés à mettre à jour
   * @returns {Object} {success, cloud?, error?}
   */
  updateCloud(cloudId, updates) {
    try {
      const project = this.state.getCurrentProject();
      const index = project.clouds.findIndex(c => c.id === cloudId);
      
      if (index === -1) {
        return { success: false, error: 'Nuage introuvable' };
      }
      
      // Mettre à jour
      project.clouds[index] = {
        ...project.clouds[index],
        ...updates
      };
      
      // Sauvegarder
      this.state.save();
      
      // Émettre événement
      eventBus.emit(EVENTS.CLOUD_UPDATED, project.clouds[index]);
      
      return { success: true, cloud: project.clouds[index] };
      
    } catch (error) {
      console.error('Erreur mise à jour nuage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprime un nuage
   * @param {string} cloudId - ID du nuage
   * @returns {Object} {success, error?}
   */
  deleteCloud(cloudId) {
    try {
      const project = this.state.getCurrentProject();
      
      // Vérifier que le nuage existe
      const cloud = project.clouds.find(c => c.id === cloudId);
      if (!cloud) {
        return { success: false, error: 'Nuage introuvable' };
      }
      
      // Supprimer des nuages
      project.clouds = project.clouds.filter(c => c.id !== cloudId);
      
      // Supprimer des combinaisons si présent
      project.combo = project.combo.filter(id => id !== cloudId);
      
      // Sauvegarder
      this.state.save();
      
      // Logger
      this.logAction('suppression', `Nuage supprimé: ${cloud.text.substring(0, 40)}...`);
      
      // Émettre événement
      eventBus.emit(EVENTS.CLOUD_DELETED, cloudId);
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur suppression nuage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Change l'état d'un nuage
   * @param {string} cloudId - ID du nuage
   * @param {string} newState - Nouvel état
   * @returns {Object} {success, cloud?, error?}
   */
  toggleState(cloudId, newState) {
    const cloud = this.getCloud(cloudId);
    if (!cloud) {
      return { success: false, error: 'Nuage introuvable' };
    }
    
    // Si déjà dans cet état, revenir à normal
    const targetState = cloud.state === newState ? CLOUD_STATES.NORMAL : newState;
    
    const result = this.updateCloud(cloudId, { state: targetState });
    
    if (result.success) {
      eventBus.emit(EVENTS.CLOUD_STATE_CHANGED, { cloudId, state: targetState });
    }
    
    return result;
  }

  /**
   * Définit le sens validé d'un nuage
   * @param {string} cloudId - ID du nuage
   * @param {string} meaning - Sens validé
   * @returns {Object} {success, error?}
   */
  setMeaning(cloudId, meaning) {
    return this.updateCloud(cloudId, { meaning });
  }

  /**
   * Filtre les nuages selon des critères
   * @param {string} filter - Type de filtre
   * @returns {Array}
   */
  filterClouds(filter) {
    const clouds = this.getAllClouds();
    
    switch (filter) {
      case 'important':
        return clouds.filter(c => c.state === CLOUD_STATES.IMPORTANT);
      
      case 'explored':
        return clouds.filter(c => 
          c.state === CLOUD_STATES.EXPLORED || 
          (c.dialogue && c.dialogue.length > 0)
        );
      
      case 'unused':
        const project = this.state.getCurrentProject();
        const usedIds = new Set(project.combo);
        return clouds.filter(c => !usedIds.has(c.id));
      
      case 'withimg':
        return clouds.filter(c => c.img);
      
      case 'n1':
        return clouds.filter(c => c.level === CLOUD_LEVELS.N1);
      
      case 'n2':
        return clouds.filter(c => c.level === CLOUD_LEVELS.N2);
      
      case 'n3':
        return clouds.filter(c => c.level === CLOUD_LEVELS.N3);
      
      case 'all':
      default:
        return clouds;
    }
  }

  /**
   * Recherche des nuages par texte
   * @param {string} query - Recherche
   * @returns {Array}
   */
  searchClouds(query) {
    if (!query || query.trim().length === 0) {
      return this.getAllClouds();
    }
    
    const searchTerm = query.toLowerCase().trim();
    const clouds = this.getAllClouds();
    
    return clouds.filter(cloud => 
      cloud.text.toLowerCase().includes(searchTerm) ||
      (cloud.meaning && cloud.meaning.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Ajoute un message au dialogue d'un nuage
   * @param {string} cloudId - ID du nuage
   * @param {Object} message - Message {role, content}
   * @returns {Object} {success, error?}
   */
  addDialogueMessage(cloudId, message) {
    const cloud = this.getCloud(cloudId);
    if (!cloud) {
      return { success: false, error: 'Nuage introuvable' };
    }
    
    const dialogue = cloud.dialogue || [];
    dialogue.push({
      ...message,
      timestamp: Date.now()
    });
    
    return this.updateCloud(cloudId, { dialogue });
  }

  /**
   * Ajoute un élément extrait à un nuage
   * @param {string} cloudId - ID du nuage
   * @param {Object} element - Élément {text, label}
   * @returns {Object} {success, element?, error?}
   */
  addExtractedElement(cloudId, element) {
    const cloud = this.getCloud(cloudId);
    if (!cloud) {
      return { success: false, error: 'Nuage introuvable' };
    }
    
    const extractedElements = cloud.extractedElements || [];
    const newElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: element.text,
      label: element.label || '',
      extractedAt: Date.now()
    };
    
    extractedElements.push(newElement);
    
    const result = this.updateCloud(cloudId, { extractedElements });
    
    if (result.success) {
      return { success: true, element: newElement };
    }
    
    return result;
  }

  /**
   * Supprime un élément extrait
   * @param {string} cloudId - ID du nuage
   * @param {string} elementId - ID de l'élément
   * @returns {Object} {success, error?}
   */
  removeExtractedElement(cloudId, elementId) {
    const cloud = this.getCloud(cloudId);
    if (!cloud) {
      return { success: false, error: 'Nuage introuvable' };
    }
    
    const extractedElements = (cloud.extractedElements || [])
      .filter(el => el.id !== elementId);
    
    return this.updateCloud(cloudId, { extractedElements });
  }

  /**
   * Supprime l'image d'un nuage
   * @param {string} cloudId - ID du nuage
   * @returns {Object} {success, error?}
   */
  removeImage(cloudId) {
    return this.updateCloud(cloudId, { img: null });
  }

  /**
   * Statistiques sur les nuages
   * @returns {Object}
   */
  getStats() {
    const clouds = this.getAllClouds();
    
    return {
      total: clouds.length,
      important: clouds.filter(c => c.state === CLOUD_STATES.IMPORTANT).length,
      explored: clouds.filter(c => 
        c.state === CLOUD_STATES.EXPLORED || 
        (c.dialogue && c.dialogue.length > 0)
      ).length,
      withImage: clouds.filter(c => c.img).length,
      withMeaning: clouds.filter(c => c.meaning).length,
      byLevel: {
        n1: clouds.filter(c => c.level === CLOUD_LEVELS.N1).length,
        n2: clouds.filter(c => c.level === CLOUD_LEVELS.N2).length,
        n3: clouds.filter(c => c.level === CLOUD_LEVELS.N3).length
      }
    };
  }

  /**
   * Log une action dans le journal
   * @param {string} type - Type d'action
   * @param {string} text - Texte de l'action
   */
  logAction(type, text) {
    const project = this.state.getCurrentProject();
    
    project.journal.unshift({
      ts: Date.now(),
      type: `jt-${type}`,
      txt: text
    });
    
    // Limiter à 200 entrées
    if (project.journal.length > 200) {
      project.journal.pop();
    }
  }
}
