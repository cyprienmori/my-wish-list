# My Wish List : guide simple

## Les fichiers du projet (ces noms ne changeront plus)

| Fichier | À quoi il sert | Faut-il y toucher ? |
|---|---|---|
| `index.html` | La page du site | Non |
| `css/style.css` | Le design (couleurs, polices, mise en page) | Seulement pour changer le design. Les couleurs sont tout en haut. |
| `js/app.js` | L'affichage des 3 pages et les boutons | Non |
| `js/data.js` | L'enregistrement dans la base de données | Non |
| `js/firebase-sdk.js` | Le chargement de Firebase | Non |
| `js/firebase-config.js` | **La configuration de VOTRE projet Firebase** | Oui, une seule fois |
| `firestore.rules` | Les règles de sécurité de la base | À copier dans la console Firebase |
| `firebase.json`, `robots.txt` | Réglages de l'hébergement et protection contre Google | Non |

## Mettre en place Firebase (une seule fois, gratuit, sans carte bancaire)

1. Allez sur https://console.firebase.google.com avec votre compte Google, puis cliquez sur **Créer un projet** (Google Analytics n'est pas nécessaire).
2. **Authentication** → Commencer → **E-mail/Mot de passe** → Activer → Enregistrer.
   (Aucun e-mail n'est envoyé : c'est ce qui permet les « codes personnels ».)
3. **Firestore Database** → Créer une base de données → emplacement `eur3 (Europe)` → mode production.
4. Onglet **Règles** de Firestore : remplacez tout le contenu par celui du fichier `firestore.rules`, puis cliquez sur **Publier**.
5. ⚙️ **Paramètres du projet** → « Vos applications » → icône **</>** (Web) → donnez un nom → copiez les valeurs affichées dans `js/firebase-config.js`.

## Modifier le site plus tard

- Après une modification, remettez les fichiers en ligne de la même façon qu'à la première mise en ligne.
- Pour être sûr que tout le monde voie la nouvelle version, augmentez le numéro `?v=1` en `?v=2` dans `index.html` (sur les deux lignes `style.css?v=` et `app.js?v=`).
- Si vous modifiez `firestore.rules`, recopiez son contenu dans la console Firebase (Firestore → Règles → Publier).

## Comment ça marche (pour les utilisateurs)

- **Profil** : chacun crée un profil avec son prénom et reçoit un **code personnel** (ex. `K7P2Q9-SAPIN-ETOILE-4827`). Ce code permet de retrouver son profil sur un autre appareil (menu du profil en haut à droite → « J'ai un code »).
- **Plusieurs profils sur un appareil** : menu du profil → « Nouveau profil ». On passe de l'un à l'autre sans rien perdre.
- **Groupes** : chaque groupe (famille, amis) a son propre lien. Une personne peut être dans plusieurs groupes avec **une seule liste**. On peut masquer un cadeau dans un groupe en le modifiant.
- **Réserver / Acheté** : un cadeau acheté disparaît de la liste des autres et apparaît « déjà offert » dans tous les groupes, sans dire qui l'a acheté ni où. La personne qui a fait la liste ne voit jamais rien.

## Limites de la formule gratuite Firebase (Spark)

- 50 000 lectures et 20 000 écritures par jour, 1 Go de données : largement suffisant pour plusieurs familles.
- Pas d'envoi de photos (stockage de fichiers payant) : on peut indiquer l'adresse d'une image.
- Si le quota d'une journée était dépassé (très improbable), le site se remettrait à fonctionner le lendemain, sans aucun frais.
