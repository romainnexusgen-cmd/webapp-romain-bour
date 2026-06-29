# MiMPrep CV Analyser

Une webapp Next.js pour analyser les CV avec des animations fluides et un design professionnel.

## 🚀 Fonctionnalités

- **Upload de CV** : Drag & drop de fichiers PDF avec validation
- **Analyse asynchrone** : Traitement via n8n et stockage Supabase
- **Consultation par code** : Accès aux résultats via un code unique
- **Animations fluides** : Compteurs animés, barres de progression, transitions
- **Design responsive** : Interface moderne avec Tailwind CSS
- **Scores détaillés** : Analyse sur 3 piliers (Structure, Expérience, Détails)

## 🎨 Design System

### Couleurs
- **Bleus (pro + accent)** : `#1140a4`, `#1378d1`, `#457cf0`
- **Neutres (fond + texte)** : `#0f141c`, `#202b38`, `#686b6d`, `#9b9b9b`, `#f5f7fb`
- **Scores** : Rouge `#F04438`, Jaune `#F59E0B`, Vert `#10B981`

### Animations
- Compteurs animés avec interpolation linéaire (600-1200ms)
- Barres de progression synchronisées
- Transitions de couleurs fluides (HSL)
- Micro-pulse à la fin des animations
- Stagger entre les sections (120ms)

## 🛠️ Technologies

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS
- **Animations** : Framer Motion
- **Base de données** : Supabase
- **Icons** : Lucide React
- **Font** : Inter (Google Fonts)

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd webapp_cv_analyser
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
Créez un fichier `.env.local` avec vos clés Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
src/
├── app/
│   ├── page.tsx                 # Page d'accueil
│   ├── resultats/[code]/
│   │   └── page.tsx            # Page de résultats
│   ├── layout.tsx              # Layout principal
│   └── globals.css             # Styles globaux
├── components/
│   ├── AnimatedCounter.tsx     # Compteur animé
│   ├── ScoreBar.tsx           # Barre de progression
│   ├── ScoreBadge.tsx         # Badge de score
│   ├── GlobalScore.tsx        # Score global
│   ├── SectionScores.tsx      # Scores par section
│   ├── DetailSection.tsx      # Section détaillée
│   ├── CTASection.tsx         # Call-to-action
│   ├── BonusSection.tsx       # Section bonus
│   ├── FileUpload.tsx         # Upload de fichier
│   ├── CodeInput.tsx          # Saisie de code
│   └── LoadingBar.tsx         # Barre de chargement
└── lib/
    └── supabase.ts            # Configuration Supabase
```

## 🎯 Parcours utilisateur

### 1. Page d'accueil (`/`)
- Logo MiMPrep centré
- Titre et description
- Barre de chargement décorative
- Zone d'actions : Upload CV ou saisie de code
- Feedback et conseils

### 2. Upload de CV
- Drag & drop de PDF
- Saisie d'email
- Confirmation d'upload
- Message de suivi

### 3. Consultation par code
- Saisie du code reçu par email
- Vérification Supabase
- Redirection vers les résultats

### 4. Page de résultats (`/resultats/[code]`)
- Introduction personnalisée
- Score global animé
- Scores par section (stagger)
- CTA dynamique selon le score
- Détails par critère
- Section bonus "bullet points"

## 🎨 Composants d'animation

### AnimatedCounter
- Compteur numérique animé
- Interpolation linéaire
- Callback onComplete

### ScoreBar
- Barre de progression animée
- Couleurs interpolées (rouge → jaune → vert)
- Synchronisation avec le compteur

### Animations séquentielles
- Global score → Section scores → CTA → Détails → Bonus
- Stagger entre les éléments
- Micro-pulse à la fin

## 🔧 Configuration Supabase

Le projet utilise Supabase pour stocker les analyses de CV. La table `cv_analyses` contient :

- **Identité** : `candidate_first_name`, `candidate_last_name`, etc.
- **Scores agrégés** : `grand_total_awarded`, `structure_visuals_awarded_sum`, etc.
- **Critères détaillés** : `no_photo_*`, `english_cv_*`, etc.
- **Bonus** : `pass4_bullet_*`

## 🚀 Déploiement

### Vercel (recommandé)
```bash
npm run build
vercel --prod
```

### Variables d'environnement
Assurez-vous de configurer les variables Supabase dans votre plateforme de déploiement.

## 📝 Notes de développement

- Les animations sont optimisées pour la performance
- Le design est responsive (mobile-first)
- Les couleurs respectent les standards d'accessibilité
- Le code est typé avec TypeScript
- Les composants sont réutilisables et modulaires

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request
