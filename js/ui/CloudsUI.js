/**
 * SERENDEEP - CLOUDS UI
 * Interface utilisateur pour le tab Nuages
 */

import { CloudService } from '../services/CloudService.js';
import { CLOUD_LEVELS } from '../models/Cloud.js';
import { eventBus, EVENTS } from '../core/events.js';
import { notifications } from './Notifications.js';
import { id, esc, compressImage } from '../core/utils.js';

export class CloudsUI {
  constructor(cloudService, state) {
    this.cloudService = cloudService;
    this.state = state;
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.tempImage = null;
    
    this.init();
  }

  /**
   * Initialise l'interface
   */
  init() {
    this.setupEventListeners();
    this.subscribeToEvents();
    this.render();
  }

  /**
   * Configure les event listeners DOM
   */
  setupEventListeners() {
    // Bouton ajouter nuage
    const addBtn = id('add-cloud-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.toggleAddForm());
    }

    // Formulaire ajout
    const form = id('add-cloud-form');
    if (form) {
      const submitBtn = form.querySelector('.submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.handleAddCloud());
      }

      const cancelBtn = form.querySelector('.cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.toggleAddForm());
      }
    }

    // Recherche avec debounce
    const searchInput = id('cloud-search');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.currentSearch = e.target.value;
          this.render();
        }, 300);
      });
    }

    // Filtres
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Upload image
    const imgInput = id('cloud-image-input');
    if (imgInput) {
      imgInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    // Drag & drop image
    const dropZone = id('cloud-image-drop');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        this.handleImageDrop(e);
      });
    }
  }

  /**
   * S'abonne aux événements du système
   */
  subscribeToEvents() {
    eventBus.on(EVENTS.CLOUD_CREATED, () => {
      this.render();
      this.updateHeader();
    });

    eventBus.on(EVENTS.CLOUD_UPDATED, () => {
      this.render();
    });

    eventBus.on(EVENTS.CLOUD_DELETED, () => {
      this.render();
      this.updateHeader();
    });

    eventBus.on(EVENTS.PROJECT_SWITCHED, () => {
      this.render();
      this.updateHeader();
    });
  }

  /**
   * Affiche/cache le formulaire d'ajout
   */
  toggleAddForm() {
    const form = id('add-cloud-form');
    if (!form) return;

    const isVisible = form.classList.contains('visible');
    
    if (isVisible) {
      form.classList.remove('visible');
      this.clearForm();
    } else {
      form.classList.add('visible');
      const textarea = form.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  }

  /**
   * Gère l'ajout d'un nuage
   */
  async handleAddCloud() {
    const textarea = id('add-cloud-text');
    const levelSelect = id('add-cloud-level');
    
    if (!textarea) return;

    const text = textarea.value.trim();
    if (!text) {
      notifications.error('Le texte du nuage est requis');
      return;
    }

    const level = levelSelect ? parseInt(levelSelect.value) : CLOUD_LEVELS.N1;

    // Créer le nuage
    const result = await this.cloudService.createCloud(text, level, this.tempImage);

    if (result.success) {
      notifications.success('Nuage créé');
      this.clearForm();
      this.toggleAddForm();
    } else {
      notifications.error(result.error || 'Erreur lors de la création');
    }
  }

  /**
   * Nettoie le formulaire
   */
  clearForm() {
    const textarea = id('add-cloud-text');
    if (textarea) textarea.value = '';

    const preview = id('cloud-image-preview');
    if (preview) preview.style.display = 'none';

    this.tempImage = null;
  }

  /**
   * Gère l'upload d'image
   */
  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifications.error('Le fichier doit être une image');
      return;
    }

    this.processImage(file);
  }

  /**
   * Gère le drop d'image
   */
  handleImageDrop(event) {
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifications.error('Le fichier doit être une image');
      return;
    }

    this.processImage(file);
  }

  /**
   * Traite et compresse une image
   */
  processImage(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      compressImage(e.target.result, (compressed) => {
        this.tempImage = compressed;
        this.showImagePreview(compressed);
      });
    };

    reader.readAsDataURL(file);
  }

  /**
   * Affiche la prévisualisation de l'image
   */
  showImagePreview(dataUrl) {
    const preview = id('cloud-image-preview');
    if (!preview) return;

    const img = preview.querySelector('img');
    if (img) {
      img.src = dataUrl;
      preview.style.display = 'block';
    }
  }

  /**
   * Supprime l'image temporaire
   */
  clearImage() {
    this.tempImage = null;
    const preview = id('cloud-image-preview');
    if (preview) preview.style.display = 'none';
  }

  /**
   * Change le filtre actif
   */
  setFilter(filter) {
    this.currentFilter = filter;
    
    // Mettre à jour l'UI des boutons filtres
    document.querySelectorAll('[data-filter]').forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.render();
  }

  /**
   * Rend la liste des nuages
   */
  render() {
    const grid = id('clouds-grid');
    if (!grid) return;

    // Récupérer les nuages filtrés
    let clouds = this.cloudService.filterClouds(this.currentFilter);

    // Appliquer la recherche
    if (this.currentSearch) {
      clouds = this.cloudService.searchClouds(this.currentSearch);
    }

    // Vider la grille
    grid.innerHTML = '';

    // Message si vide
    if (clouds.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">◌</div>
          <div class="empty-text">Aucun nuage${this.currentSearch ? ' correspondant' : ''}</div>
        </div>
      `;
      return;
    }

    // Afficher les nuages
    clouds.forEach(cloud => {
      const cloudEl = this.createCloudElement(cloud);
      grid.appendChild(cloudEl);
    });
  }

  /**
   * Crée l'élément DOM d'un nuage
   */
  createCloudElement(cloud) {
    const div = document.createElement('div');
    div.className = 'cloud-card';
    div.dataset.cloudId = cloud.id;

    // Classes d'état
    if (cloud.state === 'important') div.classList.add('cloud-important');
    if (cloud.state === 'explored') div.classList.add('cloud-explored');
    if (cloud.meaning) div.classList.add('cloud-with-meaning');

    // Niveau
    div.classList.add(`cloud-level-${cloud.level}`);

    // Image
    let imageHTML = '';
    if (cloud.img) {
      imageHTML = `
        <div class="cloud-image">
          <img src="${cloud.img}" alt="">
          <button class="cloud-remove-image" data-cloud-id="${cloud.id}">✕</button>
        </div>
      `;
    }

    // Sens validé
    let meaningHTML = '';
    if (cloud.meaning) {
      meaningHTML = `
        <div class="cloud-meaning">${esc(cloud.meaning)}</div>
      `;
    }

    // Badge niveau
    const levelLabels = { 1: 'N1', 2: 'N2', 3: 'N3' };
    const levelLabel = levelLabels[cloud.level] || 'N1';

    div.innerHTML = `
      ${imageHTML}
      <div class="cloud-level-badge">${levelLabel}</div>
      <div class="cloud-text">${esc(cloud.text)}</div>
      ${meaningHTML}
      <div class="cloud-footer">
        <button class="cloud-btn cloud-btn-important ${cloud.state === 'important' ? 'active' : ''}" 
                data-cloud-id="${cloud.id}" 
                data-action="toggle-important">
          ${cloud.state === 'important' ? '★' : '☆'} Important
        </button>
        <button class="cloud-btn cloud-btn-explored ${cloud.state === 'explored' ? 'active' : ''}" 
                data-cloud-id="${cloud.id}" 
                data-action="toggle-explored">
          ${cloud.state === 'explored' ? '✓' : ''} Exploré
        </button>
        <button class="cloud-btn cloud-btn-dialogue" 
                data-cloud-id="${cloud.id}" 
                data-action="open-dialogue">
          💬 Dialoguer
        </button>
        <button class="cloud-btn-delete" 
                data-cloud-id="${cloud.id}" 
                data-action="delete">
          ✕
        </button>
      </div>
    `;

    // Event listeners
    this.attachCloudEventListeners(div, cloud.id);

    return div;
  }

  /**
   * Attache les event listeners à un nuage
   */
  attachCloudEventListeners(element, cloudId) {
    // Toggle important
    const importantBtn = element.querySelector('[data-action="toggle-important"]');
    if (importantBtn) {
      importantBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleState(cloudId, 'important');
      });
    }

    // Toggle explored
    const exploredBtn = element.querySelector('[data-action="toggle-explored"]');
    if (exploredBtn) {
      exploredBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleState(cloudId, 'explored');
      });
    }

    // Open dialogue
    const dialogueBtn = element.querySelector('[data-action="open-dialogue"]');
    if (dialogueBtn) {
      dialogueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDialogue(cloudId);
      });
    }

    // Delete
    const deleteBtn = element.querySelector('[data-action="delete"]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteCloud(cloudId);
      });
    }

    // Remove image
    const removeImgBtn = element.querySelector('.cloud-remove-image');
    if (removeImgBtn) {
      removeImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeImage(cloudId);
      });
    }
  }

  /**
   * Toggle l'état d'un nuage
   */
  async toggleState(cloudId, state) {
    const result = await this.cloudService.toggleState(cloudId, state);
    if (!result.success) {
      notifications.error(result.error || 'Erreur lors du changement d\'état');
    }
  }

  /**
   * Ouvre le dialogue d'un nuage
   */
  openDialogue(cloudId) {
    // TODO: Implémenter le dialogue
    notifications.info(`Dialogue nuage ${cloudId} (à implémenter)`);
    eventBus.emit(EVENTS.DIALOGUE_OPENED, { cloudId });
  }

  /**
   * Supprime un nuage
   */
  async deleteCloud(cloudId) {
    if (!confirm('Supprimer ce nuage ?')) return;

    const result = await this.cloudService.deleteCloud(cloudId);
    if (result.success) {
      notifications.success('Nuage supprimé');
    } else {
      notifications.error(result.error || 'Erreur lors de la suppression');
    }
  }

  /**
   * Supprime l'image d'un nuage
   */
  async removeImage(cloudId) {
    const result = await this.cloudService.removeImage(cloudId);
    if (result.success) {
      notifications.success('Image supprimée');
    } else {
      notifications.error(result.error || 'Erreur');
    }
  }

  /**
   * Met à jour le header (compteur nuages)
   */
  updateHeader() {
    const counter = id('ctr');
    if (!counter) return;

    const stats = this.cloudService.getStats();
    counter.textContent = `${stats.total} nuage${stats.total > 1 ? 's' : ''}`;
  }

  /**
   * Affiche les statistiques
   */
  showStats() {
    const stats = this.cloudService.getStats();
    console.log('📊 Statistiques nuages:', stats);
    
    const message = `${stats.total} nuages | ${stats.important} importants | ${stats.explored} explorés`;
    notifications.info(message);
  }
}
