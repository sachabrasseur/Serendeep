# SERENDEEP v2.0 - QUICKSTART

## 🚀 Tester MAINTENANT (5 minutes)

### 1. Ouvrir le fichier

```bash
# Ouvrir directement dans le navigateur
open index.html

# OU avec un serveur local (recommandé)
python3 -m http.server 8000
# Puis: http://localhost:8000
```

### 2. Premier écran : Setup

Tu verras le modal de configuration.

**Entre** :
- Clé API Anthropic : `sk-ant-...`
- Modèle : Sonnet 4 (déjà sélectionné)
- Clic "Commencer →"

### 3. Page d'accueil

Tu arrives sur la page d'accueil avec :
- Logo "Serendeep"
- Bouton "🧪 Tester le système"

**Ouvre la console développeur** (F12)

### 4. Tester le système

**Clic sur "🧪 Tester le système"**

Tu devrais voir dans la console :
```
🌊 Serendeep - Initialisation...
✓ Projet créé: Mon Premier Projet
✓ Serendeep initialisé
🧪 Tests du système...
State: Object {...}
Projet actif: Object {...}
✓ Événement reçu: {message: "Hello"}
✓ Tous les tests passés
```

**ET** une notification verte en bas à droite : "Test réussi !"

---

## ✅ Ce qui fonctionne MAINTENANT

### Core System (100%)

1. **État centralisé**
   ```javascript
   window.serendeep.state.getCurrentProject()
   ```

2. **Sauvegarde localStorage**
   ```javascript
   window.serendeep.state.save()
   // Recharge la page → données persistent
   ```

3. **Event Bus**
   ```javascript
   window.serendeep.eventBus.on('test', console.log)
   window.serendeep.eventBus.emit('test', {msg: 'Hello'})
   ```

4. **Notifications**
   ```javascript
   window.serendeep.notifications.success('Ça marche !')
   window.serendeep.notifications.error('Erreur test')
   window.serendeep.notifications.warning('Attention')
   window.serendeep.notifications.info('Info')
   ```

---

## 🧪 Tests Rapides Console

### Test 1 : État

```javascript
const project = window.serendeep.state.getCurrentProject()
console.log('Projet:', project.name)
console.log('Nuages:', project.clouds.length)
```

### Test 2 : Créer un projet

```javascript
window.serendeep.state.createProject('Test Project', 'Sacha')
window.serendeep.state.listProjects()
```

### Test 3 : Events

```javascript
window.serendeep.eventBus.on('my:event', (data) => {
  console.log('Reçu:', data)
  window.serendeep.notifications.info(data.message)
})

window.serendeep.eventBus.emit('my:event', {
  message: 'Hello from event bus !'
})
```

### Test 4 : Persistence

```javascript
// Modifier le projet
const p = window.serendeep.state.getCurrentProject()
p.name = 'Nouveau nom'
window.serendeep.state.save()

// Recharger la page (Cmd+R)
// Vérifier :
window.serendeep.state.getCurrentProject().name
// → Doit afficher "Nouveau nom"
```

---

## 📊 Comprendre l'Architecture

### Fichiers Clés

```
index.html          → Structure HTML minimale
styles.css          → CSS complet (1928 lignes)

js/main.js          → Point d'entrée
js/core/state.js    → Gestion projets/données
js/core/storage.js  → LocalStorage
js/core/events.js   → Communication inter-modules
js/ui/Notifications.js → Toast notifications
```

### Flux de Données

```
1. USER ACTION
   ↓
2. UI Component (émet événement)
   ↓
3. Event Bus (propage)
   ↓
4. Service (logique métier)
   ↓
5. State (met à jour)
   ↓
6. Storage (sauvegarde)
   ↓
7. UI re-render
```

---

## 🐛 Debug

### Tout est accessible via window.serendeep

```javascript
// Voir tout ce qui est disponible
console.dir(window.serendeep)

// Shortcuts
const s = window.serendeep
s.state.getCurrentProject()
s.notifications.success('Test')
s.eventBus.emit('custom', {data: 123})
```

### Voir tous les événements

```javascript
window.serendeep.eventBus.getEvents()
```

### Taille localStorage

```javascript
window.serendeep.storage.getFormattedSize()
```

---

## ⏭️ Prochaines Étapes

### Ce soir (optionnel si tu veux continuer)

On pourrait migrer :
1. **CloudService** - Logique CRUD nuages
2. **CloudsUI** - Rendu tab Nuages
3. Tester que ça marche E2E

### Plus tard

- Migrer Combinaisons
- Migrer Teaser
- Migrer Phase 2
- Tests automatisés

---

## 📚 Documentation Complète

- `README.md` - Vue d'ensemble
- `TESTING.md` - Guide tests complet
- `STRATEGY.md` - Stratégie refactoring
- `ARCHITECTURE_ANALYSIS.md` - Analyse détaillée

---

## 💬 Questions Fréquentes

**Q: Pourquoi la page est vide ?**  
R: C'est normal ! On a migré seulement le core system (30%). Les tabs Nuages/Combinaisons/Teaser arrivent progressivement.

**Q: Mes anciennes données ?**  
R: Elles sont dans l'ancienne version. On peut les importer une fois la migration terminée.

**Q: Je veux revenir à l'ancienne version ?**  
R: Ouvre ton `index.html` original. Cette version refactor est sur une branche séparée.

**Q: Comment contribuer à la migration ?**  
R: Lis `STRATEGY.md` et `TESTING.md`. Chaque feature suit le même pattern.

---

## ✨ C'est Parti !

```bash
# 1. Ouvre index.html
# 2. Entre ta clé API
# 3. Clic "🧪 Tester le système"
# 4. Ouvre la console
# 5. Enjoy ! 🌊
```

**Tout marche ? Bravo, le core system est solide ! 🎉**

**Des bugs ? Note-les et on les corrige ensemble.**
