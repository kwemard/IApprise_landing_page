# TODO — Configuration & Éléments manquants

Ce fichier répertorie tous les éléments en attente de configuration définitive pour le déploiement en production d'IApprise.

| Élément | État actuel | Section concernée | Note |
| :--- | :--- | :--- | :--- |
| **E-mail de notification & contact** | ✅ Configuré sur `kwemard@gmail.com` | Formulaire & Footer | Chaque candidature est transmise directement par e-mail et enregistrée dans le tableau |
| **Tableau des candidatures (Excel/CSV)** | ✅ Configuré en temps réel (`candidatures.csv`) | Dashboard Admin / API | Accessible sur `http://localhost:8080/admin.html` |
| **Profil LinkedIn** | `LINKEDIN_URL` (ex: `https://www.linkedin.com/company/LINKEDIN_URL`) | Footer | Renseigner l'URL de la page LinkedIn officielle d'IApprise si disponible |
| **Numéro d'immatriculation** | `REGISTRATION_NUMBER` | Footer (Mentions légales) | Renseigner le numéro officiel d'enregistrement / SIRET / accréditation si applicable |
| **Fichier Logo officiel** | `assets/logo.svg` | Navigation / Footer | Fichier logo vectoriel en place dans `assets/` |
| **Lien Politique de confidentialité** | `PRIVACY_POLICY_URL` | Footer | Définir l'URL vers la page de politique de confidentialité |
| **Lien Mentions légales** | `LEGAL_NOTICE_URL` | Footer | Définir l'URL vers la page des mentions légales |
