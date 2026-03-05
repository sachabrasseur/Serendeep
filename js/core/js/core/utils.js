/**
 * SERENDEEP - CORE UTILITIES
 * Fonctions utilitaires globales
 */

/**
 * Raccourci pour document.getElementById
 * @param {string} x - ID de l'élément
 * @returns {HTMLElement|null}
 */
export const id = (x) => document.getElementById(x);

/**
 * Échappe les caractères HTML pour prévenir XSS
 * @param {string} s - Chaîne à échapper
 * @returns {string}
 */
export const esc = (s) => 
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Génère un ID unique
 * @returns {string}
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Génère un UID pour les nuages
 * @param {number} counter - Compteur de nuages
 * @returns {string}
 */
export const generateCloudId = (counter) => {
  return `c${counter}_${Date.now().toString(36)}`;
};

/**
 * Debounce function
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en ms
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Formate une date en format lisible
 * @param {number} timestamp - Timestamp
 * @returns {string}
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Compresse une image en base64
 * @param {string} dataUrl - URL de l'image
 * @param {Function} callback - Callback avec l'image compressée
 * @param {number} maxWidth - Largeur max (défaut: 800)
 * @param {number} quality - Qualité (défaut: 0.8)
 */
export const compressImage = (dataUrl, callback, maxWidth = 800, quality = 0.8) => {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    callback(canvas.toDataURL('image/jpeg', quality));
  };
  img.src = dataUrl;
};

/**
 * Copie du texte dans le presse-papiers
 * @param {string} text - Texte à copier
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erreur copie presse-papiers:', err);
    return false;
  }
};

/**
 * Télécharge du contenu en tant que fichier
 * @param {string} content - Contenu du fichier
 * @param {string} filename - Nom du fichier
 * @param {string} mimeType - Type MIME
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
