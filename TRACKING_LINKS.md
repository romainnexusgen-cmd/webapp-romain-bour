# 🔗 Liens de Tracking - MiMPrep CV Analyser

Ce fichier contient les liens de tracking pour chaque plateforme afin de mesurer l'origine du trafic.

## 📱 Plateformes Sociales

### LinkedIn
```
https://cv.mimprep.com?origin=linkedin
```

### Instagram
```
https://cv.mimprep.com?origin=instagram
```

### YouTube
```
https://cv.mimprep.com?origin=youtube
```

### TikTok
```
https://cv.mimprep.com?origin=tiktok
```

### Twitter/X
```
https://cv.mimprep.com?origin=twitter
```

## 📧 Marketing Email

### Newsletter
```
https://cv.mimprep.com?origin=newsletter
```

### Email Marketing
```
https://cv.mimprep.com?origin=email
```

## 🔍 Moteurs de Recherche

### Google
```
https://cv.mimprep.com?origin=google
```

### Bing
```
https://cv.mimprep.com?origin=bing
```

## 🤝 Partenaires & Références

### Partenaire A
```
https://cv.mimprep.com?origin=partner_a
```

### Partenaire B
```
https://cv.mimprep.com?origin=partner_b
```

### Référence
```
https://cv.mimprep.com?origin=referral
```

## 📊 Autres Sources

### Direct (accès direct)
```
https://cv.mimprep.com?origin=direct
```

### Reddit
```
https://cv.mimprep.com?origin=reddit
```

### Discord
```
https://cv.mimprep.com?origin=discord
```

### WhatsApp
```
https://cv.mimprep.com?origin=whatsapp
```

## 🎯 Utilisation

1. **Remplacez** `cv.mimprep.com` par votre domaine de production
2. **Utilisez** ces liens dans vos posts, emails, et campagnes
3. **Analysez** les données dans votre webhook n8n pour voir d'où vient le trafic
4. **Créez** de nouveaux paramètres `origin` selon vos besoins

## 📈 Exemples de Données Reçues

Quand un utilisateur clique sur `https://cv.mimprep.com?origin=linkedin`, le webhook recevra :

```json
{
  "Email": "user@example.com",
  "CV": "[File object]",
  "submittedAt": "2024-01-15T14:30:00.000Z",
  "formMode": "test",
  "origin": "linkedin",
  "feedback_goal": "Get into consulting"
}
```

## 🔧 Personnalisation

Vous pouvez créer des paramètres plus spécifiques :

### LinkedIn avec campagne
```
https://cv.mimprep.com?origin=linkedin_campaign_2024
```

### Instagram avec post spécifique
```
https://cv.mimprep.com?origin=instagram_post_jan2024
```

### YouTube avec vidéo
```
https://cv.mimprep.com?origin=youtube_video_cv_tips
```
