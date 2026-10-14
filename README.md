# ToDoListApp — Angular 22 + Firebase Firestore

Application de gestion de tâches : créer, lister, cocher terminée, modifier, supprimer.
Temps réel via Firestore, collection `tasks`.

## Prérequis

- Node 22, npm 10
- Projet Firebase `to-do-list-app-751f8` avec Firestore `(default)` en `europe-west1`

## Configuration Firebase (local, non commité)

1. Copie le template :
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.example.ts src/environments/environment.development.ts
   ```
2. Colle ton `firebaseConfig` de `console.firebase.google.com > Paramètres projet > Vos applications` dans les 2 fichiers.
3. Ne committe jamais les vraies clés : `environment.ts` et `environment.development.ts` sont dans `.gitignore`.

## Lancer en local

```bash
npm install
npm start
```

Ouvre `http://localhost:4200/` :
- Écris un titre + `Ajouter`
- Coche la case pour basculer Terminée / À faire
- `Modifier` puis `Enregistrer` ou `Annuler`
- `Supprimer` pour effacer
- Compteur `X / Y terminées` en haut

## Règles Firestore production

Fichier : `firestore.rules`

Déploiement console (sans CLI) :
1. Ouvre `Firestore Database > Règles`
2. Colle le contenu de `firestore.rules`
3. Clique `Publier`

Déploiement CLI :
```bash
npm i -g firebase-tools
firebase login
firebase use to-do-list-app-751f8
firebase deploy --only firestore:rules
```

Règles : lecture publique démo, écriture validée `title 1-120 + completed bool`, pas de champ extra.
Version stricte avec Auth disponible en commentaire dans le fichier.

## Structure du code

- `src/main.ts` : bootstrap `App`
- `src/app/app.ts` : état local avec `signal`, actions `add/toggle/startEdit/saveEdit/remove`
- `src/app/app.html` : formulaire + liste temps réel + états chargement / vide / erreur
- `src/app/app.css` : carte blanche simple
- `src/app/models/task.model.ts` : `Task { id?, title, completed, createdAt? }`
- `src/app/services/task.service.ts` : `initializeApp`, `getFirestore`, `onSnapshot`, `addDoc`, `updateDoc`, `deleteDoc`
- `src/environments/` : `environment.ts`, `environment.development.ts` (ignorés), `environment.example.ts` (template)
- `firestore.rules` : règles production validées

## Tests et build

```bash
npm run build
npx ng test --watch=false
```

Attendu : build vert dans `dist/to-do-list-app`, 3 tests verts.
Note : warning budget `500 kB` dépassé à cause de `firebase`, normal et non bloquant.

## Dépannage

- `Firebase non configuré` : vérifie les 2 fichiers `environment.*.ts`
- `PERMISSION_DENIED` : règles non publiées ou trop strictes, republie `firestore.rules`
- Liste vide après ajout : vérifie `Firestore > Données > tasks` et la région `europe-west1`
