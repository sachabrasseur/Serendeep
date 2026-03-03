# SERENDEEP - GUIDE DE TESTS

## 🎯 Objectif

Ce document liste tous les tests à effectuer pour vérifier que le refactoring n'a introduit aucune régression.

---

## ✅ Checklist Tests - Phase Actuelle

### CORE SYSTEM

#### État (State)

- [ ] Création projet automatique au premier lancement
- [ ] `window.serendeep.state.getCurrentProject()` retourne un objet valide
- [ ] `window.serendeep.state.listProjects()` retourne un array
- [ ] État persiste après rechargement page
- [ ] `state.config.apiKey` stocké correctement

**Console tests** :
```javascript
// Test 1: Projet actif
const project = window.serendeep.state.getCurrentProject();
console.assert(project.id, 'Projet doit avoir un ID');
console.assert(project.name, 'Projet doit avoir un nom');
console.assert(Array.isArray(project.clouds), 'clouds doit être un array');

// Test 2: Liste projets
const projects = window.serendeep.state.listProjects();
console.assert(projects.length > 0, 'Doit avoir au moins 1 projet');

// Test 3: Sauvegarde
window.serendeep.state.save();
localStorage.getItem('serendeep_data'); // Ne doit pas être null
```

#### Storage

- [ ] `storage.isAvailable()` retourne `true`
- [ ] `storage.save()` retourne `true`
- [ ] `storage.load()` retourne les données sauvegardées
- [ ] `storage.getSize()` retourne un nombre > 0
- [ ] Export JSON fonctionne
- [ ] Import JSON fonctionne

**Console tests** :
```javascript
// Test storage
const storage = window.serendeep.storage;
console.assert(storage.isAvailable(), 'localStorage doit être disponible');

const data = { test: 'value' };
console.assert(storage.save(data), 'Save doit réussir');

const loaded = storage.load();
console.assert(loaded !== null, 'Load doit retourner des données');

console.log('Taille:', storage.getFormattedSize());
```

#### Events

- [ ] Peut écouter un événement
- [ ] Peut émettre un événement
- [ ] Peut se désabonner
- [ ] `once()` fonctionne (1 seule fois)
- [ ] Erreur dans listener n'arrête pas propagation

**Console tests** :
```javascript
const events = window.serendeep.eventBus;

// Test on/emit
let received = false;
events.on('test:event', (data) => {
  received = true;
  console.log('Reçu:', data);
});
events.emit('test:event', { msg: 'hello' });
console.assert(received, 'Événement doit être reçu');

// Test unsubscribe
const unsub = events.on('test:unsub', () => console.log('Should not appear'));
unsub();
events.emit('test:unsub'); // Ne doit rien logger

// Test once
let count = 0;
events.once('test:once', () => count++);
events.emit('test:once');
events.emit('test:once');
console.assert(count === 1, 'Once doit trigger 1 seule fois');
```

#### Notifications

- [ ] Notification success s'affiche (vert)
- [ ] Notification error s'affiche (rouge)
- [ ] Notification warning s'affiche (orange)
- [ ] Notification info s'affiche (bleu)
- [ ] Notification disparaît après 3s
- [ ] Clic sur notification la ferme
- [ ] Plusieurs notifications empilées

**Console tests** :
```javascript
const notifs = window.serendeep.notifications;

// Tester les 4 types
notifs.success('Test succès');
setTimeout(() => notifs.error('Test erreur'), 500);
setTimeout(() => notifs.warning('Test warning'), 1000);
setTimeout(() => notifs.info('Test info'), 1500);

// Test clearAll
setTimeout(() => notifs.clearAll(), 3000);
```

---

## ⏳ Checklist Tests - À Venir

### TAB NUAGES

#### Affichage

- [ ] Liste des nuages s'affiche
- [ ] Filtres fonctionnent (Tous, Importants, Explorés...)
- [ ] Recherche textuelle fonctionne
- [ ] Compteur nuages correct
- [ ] Images affichées correctement
- [ ] Niveaux N1/N2/N3 visibles

#### Création nuage

- [ ] Bouton "+ Déposer un nuage" ouvre formulaire
- [ ] Champ texte requis
- [ ] Upload image fonctionne
- [ ] Compression image OK
- [ ] Sélection niveau N1/N2/N3
- [ ] Bouton "Déposer" crée le nuage
- [ ] Nuage apparaît dans la liste
- [ ] Journal enregistre l'action

#### Actions nuage

- [ ] Clic nuage ouvre dialogue
- [ ] Bouton "Important" toggle état
- [ ] Bouton supprimer fonctionne
- [ ] Confirmation suppression
- [ ] Supprimer image fonctionne

#### Dialogue nuage

- [ ] Modal dialogue s'ouvre
- [ ] 2 modes : Explorer / Approfondir
- [ ] Mode Explorer actif par défaut
- [ ] Historique messages affiché
- [ ] Envoi message fonctionne
- [ ] Réponse Claude s'affiche
- [ ] Sélection texte → Bouton "Extraire"
- [ ] Extraction élément fonctionne
- [ ] Liste éléments affichée
- [ ] Suppression élément OK
- [ ] Zone "Sens validé" éditable
- [ ] Validation sens sauvegardée

### TAB COMBINAISONS

#### Sélection nuages

- [ ] Cases à cocher fonctionnent
- [ ] Min 2, max 5 nuages
- [ ] Chips nuages sélectionnés
- [ ] Bouton "Qu'est-ce que ça raconte ?" actif
- [ ] Bouton "Effacer sélection" fonctionne

#### Analyse

- [ ] 3 modes : Développer / Approfondir / Résister
- [ ] Analyse générée par Claude
- [ ] Analyse affichée correctement
- [ ] Bouton "Dialoguer" apparaît

#### Dialogue combinaison

- [ ] Modal slide-in s'ouvre
- [ ] Analyse affichée en premier message
- [ ] Tabs modes : Développer / Approfondir / Résister
- [ ] Mode Développer actif par défaut
- [ ] Envoi message fonctionne
- [ ] Extraction éléments fonctionne
- [ ] Panel droite : éléments par mode
- [ ] Bouton "Synthétiser et valider"
- [ ] Modal synthèse éditable
- [ ] Validation → passage mode suivant
- [ ] Mode Résister : tous éléments visibles
- [ ] Bouton "Recommencer"
- [ ] Sauvegarde combinaison

#### Combinaisons sauvegardées

- [ ] Liste combinaisons affichée
- [ ] Nom combinaison éditable
- [ ] Charger combinaison fonctionne
- [ ] Supprimer combinaison OK
- [ ] Comparer 2 combinaisons

### TAB TEASER

#### Génération

- [ ] Sélection combinaison (dropdown)
- [ ] Bouton "Proposer un teaser"
- [ ] Teaser généré (4 sections)
- [ ] Édition libre textarea
- [ ] Sauvegarde auto

#### Analyse

- [ ] Bouton "Analyser structure"
- [ ] Vérification 4 sections
- [ ] Feedback si structure incorrecte

#### Validation

- [ ] Bouton "Valider teaser → Phase 2"
- [ ] Confirmation
- [ ] Passage Phase 2
- [ ] Phase 1 désactivée

### PHASE 2

- [ ] Brief formulaire
- [ ] Synopsis génération
- [ ] Actes timeline
- [ ] (Tests détaillés à définir)

---

## 🐛 Tests de Non-Régression

### Compatibilité navigateurs

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### LocalStorage

- [ ] Quota non dépassé
- [ ] Données correctement formatées
- [ ] Export/Import sans perte

### Performance

- [ ] Chargement < 2s
- [ ] Pas de freeze interface
- [ ] Scroll fluide

### Erreurs

- [ ] Pas d'erreur console au chargement
- [ ] Gestion erreurs API
- [ ] Feedback utilisateur en cas d'erreur

---

## 🧪 Tests Automatisés (Future)

### Unit Tests

```javascript
// Exemple tests à écrire
describe('State', () => {
  it('should create empty project', () => {
    const project = createEmptyProject();
    expect(project).toHaveProperty('id');
    expect(project.clouds).toEqual([]);
  });
  
  it('should save and load state', () => {
    const state = new State();
    state.createProject('Test', 'Author');
    state.save();
    
    const newState = new State();
    expect(newState.listProjects().length).toBe(1);
  });
});
```

### Integration Tests

```javascript
// Exemple workflow complet
describe('Cloud creation workflow', () => {
  it('should create cloud and save', () => {
    // 1. Ouvrir formulaire
    // 2. Remplir texte
    // 3. Sélectionner niveau
    // 4. Soumettre
    // 5. Vérifier nuage dans liste
    // 6. Vérifier sauvegarde localStorage
  });
});
```

---

## 📋 Template Rapport Bug

```markdown
**Bug** : [Description courte]

**Étapes pour reproduire** :
1. 
2. 
3. 

**Résultat attendu** :


**Résultat obtenu** :


**Console errors** :


**Environnement** :
- Navigateur : 
- OS : 
- Version Serendeep : v2.0-refactor
```

---

## ✅ Tests Passés

_À remplir au fur et à mesure_

**Date** : 03/03/2026  
**Testeur** : Sacha  
**Version** : v2.0-refactor (30% migration)

- [x] Core System : État
- [x] Core System : Storage
- [x] Core System : Events
- [x] Core System : Notifications
- [ ] Tab Nuages
- [ ] Tab Combinaisons
- [ ] Tab Teaser
- [ ] Phase 2

---

**Note** : Cette checklist sera mise à jour au fur et à mesure de la migration des features.
