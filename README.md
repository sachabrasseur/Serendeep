# SERENDEEP v2.0 - REFACTOR

## 🎯 Objectif

Refactoring de Serendeep vers une architecture JavaScript modulaire, testable et maintenable, **sans aucun changement visuel ou fonctionnel**.

---

## 📁 Structure du Projet

```
serendeep-refactor/
├── index.html              # Structure HTML minimale
├── styles.css              # CSS complet (identique à v1)
│
├── js/
│   ├── main.js            # Point d'entrée application
│   │
│   ├── core/              # Systèmes fondamentaux
│   │   ├── state.js       # ✅ Gestion état centralisé
│   │   ├── storage.js     # ✅ Abstraction localStorage
│   │   ├── events.js      # ✅ Event bus
│   │   └── utils.js       # ✅ Fonctions utilitaires
│   │
│   ├── api/               # Communication Claude
│   │   ├── claude.js      # ⏳ Wrapper API
│   │   └── prompts.js     # ⏳ Templates prompts
│   │
│   ├── services/          # Logique métier
│   │   ├── ProjectService.js  # ⏳ CRUD projets
│   │   ├── CloudService.js    # ⏳ Logique nuages
│   │   ├── ComboService.js    # ⏳ Logique combinaisons
│   │   └── DialogService.js   # ⏳ Gestion dialogues
│   │
│   └── ui/                # Rendu interface
│       ├── Notifications.js   # ✅ Système notifications
│       ├── HeaderUI.js        # ⏳ Rendu header
│       ├── CloudsUI.js        # ⏳ Tab Nuages
│       ├── CombosUI.js        # ⏳ Tab Combinaisons
│       └── TeaserUI.js        # ⏳ Tab Teaser
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # Architecture détaillée
│   ├── TESTING.md         # Guide tests
│   └── MIGRATION.md       # Plan migration
│
└── README.md              # Ce fichier
```

**Légende** :
- ✅ = Implémenté et fonctionnel
- ⏳ = À implémenter

---

## 🚀 Démarrage Rapide

### 1. Tester localement

```bash
# Ouvrir simplement index.html dans un navigateur
open index.html

# OU serveur local (recommandé pour éviter CORS)
python3 -m http.server 8000
# Puis ouvrir: http://localhost:8000
```

### 2. Première utilisation

1. **Modal setup s'affiche**
2. **Entrer clé API** Anthropic (stockée localement)
3. **Choisir modèle** (Sonnet 4 par défaut)
4. **Cliquer "Commencer"**

### 3. Tester le système

Une fois dans l'application :

1. **Ouvrir la console développeur** (F12)
2. **Cliquer sur "🧪 Tester le système"**
3. **Vérifier la console** : tu devrais voir :
   ```
   🌊 Serendeep - Initialisation...
   ✓ Projet créé: Mon Premier Projet
   ✓ Serendeep initialisé
   🧪 Tests du système...
   State: {...}
   ✓ Événement reçu: {message: "Hello"}
   ✓ Tous les tests passés
   ```
4. **Une notification verte** apparaît : "Test réussi !"

---

## 🧪 Tests Manuels

### Test 1 : État centralisé

```javascript
// Dans la console
window.serendeep.state.getCurrentProject()
// Devrait afficher: {id, name, clouds: [], ...}

window.serendeep.state.listProjects()
// Devrait afficher: [{...}]
```

### Test 2 : Événements

```javascript
// Écouter un événement
window.serendeep.eventBus.on('test', (data) => {
  console.log('Reçu:', data);
});

// Émettre
window.serendeep.eventBus.emit('test', { hello: 'world' });
```

### Test 3 : Notifications

```javascript
// Tester les 4 types
window.serendeep.notifications.success('Succès !');
window.serendeep.notifications.error('Erreur !');
window.serendeep.notifications.warning('Attention !');
window.serendeep.notifications.info('Info...');
```

### Test 4 : LocalStorage

```javascript
// Vérifier la sauvegarde
window.serendeep.state.save();
// Recharger la page → données persistent

// Voir la taille
window.serendeep.storage.getFormattedSize();
```

---

## 🏗️ Architecture

### Principes

1. **Séparation des responsabilités**
   - **Core** : Systèmes fondamentaux (state, storage, events)
   - **Services** : Logique métier pure
   - **UI** : Rendu et interactions DOM
   - **API** : Communication externe

2. **Event-driven**
   - Les modules communiquent via l'event bus
   - Pas de couplage direct
   - Facile à tester

3. **État centralisé**
   - Une seule source de vérité
   - Pas d'état éparpillé
   - Sauvegarde atomique

### Flux de données

```
USER ACTION
    ↓
UI Component (émet événement)
    ↓
Event Bus (propage)
    ↓
Service (logique métier)
    ↓
State (met à jour)
    ↓
Storage (sauvegarde)
    ↓
Event Bus (notifie changement)
    ↓
UI Component (re-render)
```

---

## 📊 État Actuel (v2.0-refactor)

### ✅ Ce qui fonctionne

- Infrastructure de base
- État centralisé (state)
- Sauvegarde localStorage (storage)
- Event bus
- Système notifications
- Utilitaires
- Setup API key

### ⏳ En cours de migration

- Tab Nuages (clouds)
- Tab Combinaisons (combos)
- Tab Teaser
- Dialogues
- Phase 2

### 📈 Progression

**Core System** : 100% ✅  
**Services** : 0%  
**UI Components** : 20% (Notifications seulement)  
**Total** : ~30%

---

## 🛠️ Développement

### Ajouter une nouvelle feature

1. **Service** (logique métier)
   ```javascript
   // js/services/MyService.js
   export class MyService {
     constructor(state, events) {
       this.state = state;
       this.events = events;
     }
     
     async doSomething() {
       // Logique ici
       this.events.emit('my:event', data);
     }
   }
   ```

2. **UI Component** (rendu)
   ```javascript
   // js/ui/MyComponent.js
   export class MyComponent {
     constructor(service, events) {
       this.service = service;
       this.events = events;
       this.init();
     }
     
     init() {
       this.events.on('my:event', (data) => {
         this.render(data);
       });
     }
     
     render(data) {
       // Manipulation DOM
     }
   }
   ```

3. **Intégrer dans main.js**
   ```javascript
   import { MyService } from './services/MyService.js';
   import { MyComponent } from './ui/MyComponent.js';
   
   // Dans init()
   this.myService = new MyService(state, eventBus);
   this.myComponent = new MyComponent(this.myService, eventBus);
   ```

---

## 🐛 Debug

### Console

Tout est exposé via `window.serendeep` :

```javascript
window.serendeep.state      // État global
window.serendeep.eventBus   // Event bus
window.serendeep.storage    // Storage
window.serendeep.notifications  // Notifications
window.serendeep.app        // Instance app
```

### Logs

Activer les logs verbeux :

```javascript
window.serendeep.eventBus.on('*', (event, data) => {
  console.log('EVENT:', event, data);
});
```

---

## 📚 Ressources

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architecture détaillée
- [TESTING.md](docs/TESTING.md) - Guide tests complet
- [MIGRATION.md](docs/MIGRATION.md) - Plan migration features

---

## 🎯 Prochaines Étapes

1. **Migrer CloudService** (CRUD nuages)
2. **Migrer CloudsUI** (rendu tab Nuages)
3. **Migrer DialogService** (dialogues focalisés)
4. **Tests E2E** tab Nuages complet

---

## 💡 Philosophie

> "Le code doit être comme un bon pitch : clair, structuré, et permettre l'expérimentation sans tout casser."

- **Modularité** : Chaque module fait une chose
- **Testabilité** : Chaque module testable isolément
- **Lisibilité** : Code auto-documenté
- **Réversibilité** : Possibilité de revenir en arrière

---

**Questions ? Bugs ? → Ouvre la console et regarde les logs.**

**Enjoy ! 🌊**
