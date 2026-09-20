# Guide de connexion Google Sheets — IApprise

Ce guide vous explique comment connecter le formulaire de candidature de la landing page directement à un tableau **Google Sheets** en 3 minutes, 100% gratuitement.

---

## Étape 1 : Créer votre Google Sheet

1. Rendez-vous sur [Google Sheets](https://sheets.new) et créez une nouvelle feuille de calcul.
2. Nommez-la par exemple : `IApprise — Candidatures Cohorte 2026`.
3. Sur la première ligne (Ligne 1), créez les colonnes suivantes :

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Date & Heure** | **Nom complet** | **Email** | **Téléphone** | **Pays** | **Ville** | **École / Université** | **Domaine** | **Niveau d'études** | **Niveau Python** | **Expérience ML** | **Motivation** | **Métier visé** | **Problème IA à résoudre** | **Disponibilité** | **Accès PC** | **Connexion Internet** |

---

## Étape 2 : Ajouter le script Google Apps Script

1. Dans votre Google Sheet, cliquez sur le menu **Extensions** > **Apps Script**.
2. Supprimez le code existant dans l'éditeur et collez le script ci-dessous :

```javascript
/**
 * IApprise — Réception des candidatures vers Google Sheets
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();

    var data = e.parameter;
    
    // Si envoyé en JSON
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // format urlencoded par défaut
      }
    }

    var timestamp = new Date();

    // Ajout d'une nouvelle ligne avec toutes les réponses
    sheet.appendRow([
      timestamp,
      data.fullname || '',
      data.email || '',
      data.phone || '',
      data.country || '',
      data.city || '',
      data.school || '',
      data.domain || '',
      data.level || '',
      data.python_level || '',
      data.datascience_experience || '',
      data.motivation || '',
      data.future_goals || '',
      data.problem_to_solve || '',
      data.weekly_availability || '',
      data.pc_access || '',
      data.internet_access || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ "status": "success", "message": "Candidature enregistrée" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
```

---

## Étape 3 : Déployer le Web App

1. En haut à droite de l'éditeur Apps Script, cliquez sur le bouton bleu **Déployer** > **Nouveau déploiement**.
2. Cliquez sur l'icône d'engrenage ⚙️ à côté de *Sélectionner le type*, puis choisissez **Application Web**.
3. Renseignez les options suivantes :
   - **Description** : `Réception candidatures IApprise`
   - **Exécuter en tant que** : `Moi (votre adresse e-mail)`
   - **Qui a accès** : **`Tous` (Anyone)** *(indispensable pour que le formulaire web puisse envoyer les données sans demander de connexion Google)*.
4. Cliquez sur **Déployer**.
5. Acceptez les autorisations Google si demandé.
6. **Copiez l'URL de l'application Web** fournie (qui ressemble à : `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## Étape 4 : Activer l'URL dans votre site

Ouvrez [index.html](file:///Users/marius/Desktop/IApprise/LandingPage/index.html) et remplacez `FORM_ENDPOINT_URL` par l'URL obtenue à l'étape 3 :

```html
<form class="application-form" id="application-form" action="https://script.google.com/macros/s/AKfycbx.../exec" method="POST" novalidate data-reveal>
```

Dès qu'un candidat soumet le formulaire, sa candidature s'affiche instantanément sur une nouvelle ligne dans votre Google Sheet !
