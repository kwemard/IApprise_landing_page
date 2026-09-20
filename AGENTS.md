# IApprise — Landing page

## Stack imposée
- HTML5 / CSS3 / JavaScript vanilla. AUCUN framework, AUCUN build, AUCUNE dépendance npm.
- 3 fichiers : index.html, styles.css, main.js. Rien d'autre.
- Polices via Google Fonts (Inter ou Space Grotesk), préchargées.
- Langue du site : français. Attribut lang="fr".

## Design tokens (à définir en variables CSS sur :root, jamais en dur)
--blue-primary: #1877F2;
--blue-secondary: #4B97F7;
--anthracite: #3B4450;
--grey-light: #E5E5E5;
--white: #FFFFFF;
--dark-bg: #101720;

Direction artistique : premium, technologique, institutionnel, international.
Beaucoup d'espace blanc, typographie large, hiérarchie nette.
INTERDIT : style scolaire, illustrations enfantines, dégradés arc-en-ciel,
emojis, animations spectaculaires, look "bootcamp bon marché".
Le bleu #1877F2 est réservé aux boutons, liens, accents et chiffres clés.

## Règles de contenu — NON NÉGOCIABLES
- N'invente JAMAIS : noms de partenaires, logos de partenaires, noms d'entreprises,
  témoignages, statistiques de placement, chiffres de salaire, dates de résultats
  ou de démarrage de la formation.
- Ne promets JAMAIS un emploi. Formulation autorisée : "renforcer la préparation
  aux opportunités professionnelles".
- Deadline : 10 octobre 2026. Toujours avec l'année dans le code.
- Utilise le logo fourni dans assets/ tel quel. Ne le recolore pas, ne le déforme pas,
  ne le régénère pas en SVG inline.
- Tout élément manquant (e-mail, LinkedIn) = placeholder en MAJUSCULES + ligne ajoutée
  dans TODO.md. Jamais de valeur inventée.

## Qualité
- Contraste WCAG AA minimum sur tous les textes.
- HTML sémantique (section, nav, main, footer), aria-label sur les contrôles.
- Responsive : 360px, 768px, 1280px, 1440px+.
- Animations au scroll via IntersectionObserver uniquement. Pas de librairie.
- Respect de prefers-reduced-motion.
