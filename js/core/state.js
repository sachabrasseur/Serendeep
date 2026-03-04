/**
 * SERENDEEP - STATE MANAGEMENT
 * Gestion centralisée de l'état de l'application
 */

import { eventBus, EVENTS } from './events.js';
import { storage } from './storage.js';
import { generateId } from './utils.js';

/**
 * Structure d'un projet vide
 */
function createEmptyProject(name = 'Nouveau Projet', author = 'Auteur') {
  return {
    id: `p${generateId()}`,
    name,
    author,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    
    // Phase 1: Saturation
    clouds: [],
    combo: [],
    savedCombos: [],
    teaserText: '',
    teaserFrom: null,
    teaserAnalysis: null,
    teaserValidated: false,
    
    // Dialogues & états temporaires
    dlgH: {},  // Dialogues par nuage
    gblH: [],  // Dialogue global
    tdlgH: [], // Dialogue teaser
    focId: null,
    filter: 'all',
    comboMode: 'dev',
    dlgMode: 'exp',
    
    // Compteurs
    nid: 1,
    
    // Journal
    journal: [],
    
    // Stockage temporaire
    comboDialogueTemp: {},
    comboExtractedTemp: {},
    comboModesTemp: {},
    
    // Phase 2: Structuration
    phase2: {
      active: false,
      activatedAt: null,
      brief: {
        format: '',
        duration: 0,
        target: '',
        tone: '',
        references: '',
        validated: false
      },
      teaser: {
        v1: '',
        v2: null,
        v2_history: [],
        analysis_v1: null,
        validated: false
      },
      logline: {
        proposals: [],
        final: '',
        validated: false
      },
      selected_narrative_clouds: [],
      structure: {
        type: '',
        based_on: [],
        name: '',
        schema: null,
        validated: false
      },
      characters: [],
      synopsis: {
        acte1: { text: '', validated: false },
        acte2: { text: '', validated: false },
        acte3: { text: '', validated: false }
      },
      noteIntention: {
        text: '',
        validated: false
      },
      reports: [],
      current_report_id: null
    }
  };
}

class State {
  constructor() {
    // Configuration globale
    this.config = {
      apiKey: '',
      model: 'claude-sonnet-4-20250514'
    };
    
    // Projets
    this.projects = {};
    this.activeProjectId = null;
    
    // Initialisation
    this.loadFromStorage();
  }

  /**
   * Charge l'état depuis localStorage
   */
  loadFromStorage() {
    // Charger config
    const savedConfig = storage.loadConfig();
    if (savedConfig) {
      this.config = { ...this.config, ...savedConfig };
    }
    
    // Charger projets
    const savedData = storage.load();
    if (savedData) {
      this.projects = savedData.projects || {};
      this.activeProjectId = savedData.activeProjectId || null;
    }
    
    eventBus.emit(EVENTS.STATE_LOADED);
  }

  /**
   * Sauvegarde l'état dans localStorage
   * @returns {boolean}
   */
  save() {
    const data = {
      projects: this.projects,
      activeProjectId: this.activeProjectId,
      version: '1.0',
      savedAt: Date.now()
    };
    
    const success = storage.save(data);
    if (success) {
      eventBus.emit(EVENTS.STATE_SAVED, data);
    }
    return success;
  }

  /**
   * Sauvegarde la configuration
   * @returns {boolean}
   */
  saveConfig() {
    return storage.saveConfig(this.config);
  }

  /**
   * Récupère le projet actif
   * @returns {Object}
   */
  getCurrentProject() {
    if (!this.activeProjectId || !this.projects[this.activeProjectId]) {
      return createEmptyProject();
    }
    return this.projects[this.activeProjectId];
  }

  /**
   * Crée un nouveau projet
   * @param {string} name - Nom du projet
   * @param {string} author - Auteur
   * @returns {Object}
   */
  createProject(name, author) {
    const project = createEmptyProject(name, author);
    this.projects[project.id] = project;
    this.activeProjectId = project.id;
    
    this.save();
    eventBus.emit(EVENTS.PROJECT_CREATED, project);
    
    return project;
  }

  /**
   * Bascule vers un projet
   * @param {string} projectId - ID du projet
   * @returns {boolean}
   */
  switchProject(projectId) {
    if (!this.projects[projectId]) {
      console.error('Projet introuvable:', projectId);
      return false;
    }
    
    this.activeProjectId = projectId;
    this.save();
    
    eventBus.emit(EVENTS.PROJECT_SWITCHED, this.getCurrentProject());
    return true;
  }

  /**
   * Supprime un projet
   * @param {string} projectId - ID du projet
   * @returns {boolean}
   */
  deleteProject(projectId) {
    if (!this.projects[projectId]) {
      return false;
    }
    
    const wasActive = this.activeProjectId === projectId;
    delete this.projects[projectId];
    
    if (wasActive) {
      // Sélectionner un autre projet ou null
      const projectIds = Object.keys(this.projects);
      this.activeProjectId = projectIds.length > 0 ? projectIds[0] : null;
    }
    
    this.save();
    eventBus.emit(EVENTS.PROJECT_DELETED, projectId);
    
    return true;
  }

  /**
   * Met à jour le projet actif
   * @param {Object} updates - Propriétés à mettre à jour
   */
  updateCurrentProject(updates) {
    if (!this.activeProjectId) return;
    
    const project = this.getCurrentProject();
    Object.assign(project, updates);
    project.updatedAt = Date.now();
    
    this.save();
    eventBus.emit(EVENTS.PROJECT_UPDATED, project);
  }

  /**
   * Liste tous les projets
   * @returns {Array}
   */
  listProjects() {
    return Object.values(this.projects);
  }

  /**
   * Export des données
   * @returns {string}
   */
  exportJSON() {
    return storage.exportJSON();
  }

  /**
   * Import de données
   * @param {string} json - Données JSON
   * @returns {boolean}
   */
  importJSON(json) {
    const success = storage.importJSON(json);
    if (success) {
      this.loadFromStorage();
    }
    return success;
  }

  /**
   * Réinitialise tout
   */
  reset() {
    this.projects = {};
    this.activeProjectId = null;
    storage.clear();
    eventBus.emit(EVENTS.STATE_CHANGED);
  }
}

// Instance singleton
export const state = new State();

// Export de la classe et fonction pour tests
export { State, createEmptyProject };
