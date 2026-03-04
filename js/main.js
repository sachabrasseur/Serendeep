/**
 * SERENDEEP - MAIN
 * Point d'entrée de l'application
 */

import { state } from './core/state.js';
import { eventBus, EVENTS } from './core/events.js';
import { notifications } from './ui/Notifications.js';
import { CloudService } from './services/CloudService.js';
import { CloudsUI } from './ui/CloudsUI.js';
import { id } from './core/utils.js';

/**
 * Classe principale de l'application
 */
class SerendeepApp {
  constructor() {
    this.initialized = false;
    this.cloudService = null;
    this.cloudsUI = null;
  }

  /**
   * Initialise l'application
   */
  async init() {
    console.log('🌊 Serendeep - Initialisation...');
    
    try {
      // Vérifier la configuration
      if (!state.config.apiKey) {
        this.showSetup();
        return;
      }
      
      // Charger le projet actif ou créer un nouveau
      if (!state.activeProjectId) {
        const project = state.createProject('Mon Premier Projet', 'Auteur');
        console.log('✓ Projet créé:', project.name);
      }
      
      // Initialiser l'interface
      this.initUI();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.initialized = true;
      console.log('✓ Serendeep initialisé');
      
      // Notification de bienvenue
      notifications.success('Serendeep chargé avec succès');
      
    } catch (error) {
      console.error('Erreur initialisation:', error);
      notifications.error('Erreur lors du chargement');
    }
  }

  /**
   * Affiche le modal de configuration
   */
  showSetup() {
    const modal = id('sm');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * Initialise l'interface utilisateur
   */
  initUI() {
    const project = state.getCurrentProject();
    
    // Initialiser les services
    this.cloudService = new CloudService(state);
    this.cloudsUI = new CloudsUI(this.cloudService, state);
    
    // Mettre à jour le header
    const projLabel = id('proj-lbl');
    if (projLabel) {
      projLabel.textContent = project.name;
    }
    
    // Mettre à jour le compteur
    const counter = id('ctr');
    if (counter) {
      counter.textContent = `${project.clouds.length} nuages`;
    }
    
    // Afficher les tabs et le tab nuages par défaut
    this.showTabs();
    this.showTab('clouds');
  }

  /**
   * Affiche la page d'accueil
   */
  showHome() {
    const home = id('home');
    if (home) {
      home.style.display = 'flex';
    }
    
    // Cacher les tabs et sections
    const tabs = id('tabs');
    if (tabs) tabs.style.display = 'none';
    
    document.querySelectorAll('.sec').forEach(sec => {
      sec.classList.remove('active');
    });
  }

  /**
   * Affiche les tabs
   */
  showTabs() {
    const home = id('home');
    if (home) home.style.display = 'none';

    const tabs = id('tabs');
    if (tabs) tabs.style.display = 'flex';
  }

  /**
   * Affiche un tab spécifique
   */
  showTab(tabName) {
    // Mettre à jour les boutons tabs
    document.querySelectorAll('.tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Afficher la section correspondante
    document.querySelectorAll('.sec').forEach(sec => {
      if (sec.id === `sec-${tabName}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    eventBus.emit(EVENTS.TAB_CHANGED, tabName);
  }

  /**
   * Configure les event listeners globaux
   */
  setupEventListeners() {
    // Écouter les changements de projet
    eventBus.on(EVENTS.PROJECT_CREATED, (project) => {
      console.log('Projet créé:', project.name);
      this.initUI();
    });
    
    eventBus.on(EVENTS.PROJECT_SWITCHED, (project) => {
      console.log('Projet chargé:', project.name);
      this.initUI();
    });
    
    eventBus.on(EVENTS.STATE_SAVED, () => {
      console.log('État sauvegardé');
    });
    
    // Listener pour le bouton setup
    const setupBtn = id('s-done');
    if (setupBtn) {
      setupBtn.addEventListener('click', () => this.handleSetupDone());
    }
    
    // Listener pour le label projet (modal projets)
    const projLabel = id('proj-lbl');
    if (projLabel) {
      projLabel.addEventListener('click', () => this.showProjectSelector());
    }
    
    // Listener pour les boutons de phase
    document.querySelectorAll('.phase-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phase = parseInt(e.currentTarget.dataset.phase);
        this.switchPhase(phase);
      });
    });

    // Listener pour les tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.showTab(tabName);
      });
    });
  }

  /**
   * Gère la validation du setup
   */
  handleSetupDone() {
    const keyInput = id('s-key');
    const apiKey = keyInput ? keyInput.value.trim() : '';
    
    if (!apiKey) {
      notifications.error('Clé API requise');
      return;
    }
    
    if (!apiKey.startsWith('sk-ant-')) {
      notifications.warning('Format de clé API invalide');
      return;
    }
    
    // Sauvegarder la config
    state.config.apiKey = apiKey;
    state.saveConfig();
    
    // Fermer le modal
    const modal = id('sm');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Initialiser l'app
    this.init();
    
    notifications.success('Configuration enregistrée');
  }

  /**
   * Affiche le sélecteur de projets
   */
  showProjectSelector() {
    notifications.info('Sélecteur de projets (à implémenter)');
  }

  /**
   * Bascule entre les phases
   * @param {number} phase - Numéro de phase (1 ou 2)
   */
  switchPhase(phase) {
    console.log('Switch vers phase', phase);
    
    // Mettre à jour les boutons
    document.querySelectorAll('.phase-btn').forEach(btn => {
      if (parseInt(btn.dataset.phase) === phase) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    eventBus.emit(EVENTS.PHASE_CHANGED, phase);
    notifications.info(`Phase ${phase} activée`);
  }

  /**
   * Test du système
   */
  runTests() {
    console.log('🧪 Tests du système...');
    
    // Test 1: État
    console.log('State:', state);
    console.log('Projet actif:', state.getCurrentProject());
    
    // Test 2: Événements
    const unsubscribe = eventBus.on('test:event', (data) => {
      console.log('✓ Événement reçu:', data);
    });
    eventBus.emit('test:event', { message: 'Hello' });
    unsubscribe();
    
    // Test 3: Notifications
    notifications.success('Test réussi !');
    
    console.log('✓ Tous les tests passés');
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SerendeepApp();
  window.app.init();
  
  // Exposer pour debug
  window.serendeep = {
    state,
    eventBus,
    notifications,
    app: window.app,
    cloudService: window.app.cloudService,
    cloudsUI: window.app.cloudsUI
  };
  
  console.log('💡 Debug disponible via: window.serendeep');
});

// Export pour tests
export { SerendeepApp };
