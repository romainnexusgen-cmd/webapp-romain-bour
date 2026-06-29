// Titres de critères LinkedIn en dur
export const LINKEDIN_CRITERIA = {
  "Bannière": [
    "Présence et qualité visuelle",
    "Présence d'une promesse claire", 
    "Présence d'un appel à l'action (CTA)",
    "Présence d'une preuve sociale ou d'un élément de crédibilité"
  ],
  "Photo de profil": [
    "Présence et qualité",
    "Lisibilité et rendu",
    "Impression générale et cohérence"
  ],
  "Titre du profil": [
    "Présence et clarté du positionnement",
    "Présence d'une promesse ou d'un objectif identifiable",
    "Présence d'un élément de crédibilité (preuve sociale)",
    "Ton et structure"
  ],
  "Section À propos": [
    "Présence et longueur adéquate",
    "Structure narrative efficace", 
    "Orientation vers la cible",
    "Ton et cohérence globale"
  ],
  "Présence de contenu public": [
    "Présence d'activité récente",
    "Nature du contenu publié",
    "Cohérence et clarté"
  ],
  "Expériences professionnelles": [
    "Présence et complétude",
    "Description claire et utile",
    "Cohérence avec le positionnement actuel", 
    "Présence de preuves ou de réalisations"
  ],
  "Crédibilité & Confiance": [
    "Compétences",
    "Recommandations",
    "Services"
  ],
  "Espace Sélection": [
    "Présence et call to action",
    "Diversité et pertinence des ressources",
    "Structuration et mise en avant"
  ]
}

// Descriptions attendues pour chaque critère
export const CRITERIA_EXPECTATIONS = {
  "Bannière": {
    "Présence et qualité visuelle": "Détection de la présence d'une bannière, qualité de l'image (résolution correcte, pas floue, pas déformée), lisibilité globale (texte lisible, visuel non surchargé).",
    "Présence d'une promesse claire": "Compréhension de ce que la personne fait ou apporte, message principal visible sans scroller, promesse exprimant une utilité ou objectif identifiable.",
    "Présence d'un appel à l'action (CTA)": "Moyen clair d'aller plus loin (ex: 'Découvre le programme', 'Contacte-moi'), CTA visible mais pas envahissant.",
    "Présence d'une preuve sociale ou d'un élément de crédibilité": "Mentions, chiffres, logos, labels, distinctions, certifications ou mise en avant visuelle d'expertise, rôle, accomplissement ou entreprise connue."
  },
  "Photo de profil": {
    "Présence et qualité": "Photo présente (pas de silhouette grise), image nette et bien éclairée, cadrage correct avec visage centré et épaules visibles.",
    "Lisibilité et rendu": "Fond propre et non distrayant (neutre, uni, ou légèrement flouté), couleurs équilibrées, bonne lisibilité sur mobile.",
    "Impression générale et cohérence": "Expression ouverte et naturelle, regard vers l'objectif, tenue adaptée au contexte professionnel, style cohérent avec le positionnement."
  },
  "Titre du profil": {
    "Présence et clarté du positionnement": "Métier ou rôle compréhensible sans effort, pas de jargon ni d'empilement de mots-clés, phrase se lisant naturellement.",
    "Présence d'une promesse ou d'un objectif identifiable": "Pour indépendant: promesse client claire. Pour salarié: valeur ou mission liée au rôle. Pour demandeur d'emploi: objectif professionnel.",
    "Présence d'un élément de crédibilité (preuve sociale)": "Mentions d'expérience, résultats, distinctions ou chiffres concrets, preuve placée naturellement sans effet CV.",
    "Ton et structure": "Structure fluide avec séparateurs cohérents, équilibre entre promesse, rôle et preuve sociale, aucun remplissage inutile."
  },
  "Section À propos": {
    "Présence et longueur adéquate": "Texte présent et complet mais fluide (entre 500 et 1500 caractères), lecture agréable avec paragraphes aérés.",
    "Structure narrative efficace": "Backstory personnelle ou pro expliquant la mission, valeur apportée, preuve sociale (réalisations, chiffres, témoignages), CTA clair.",
    "Orientation vers la cible": "Texte s'adressant au lecteur, accent sur les bénéfices pour l'autre, compréhension rapide de la pertinence du profil.",
    "Ton et cohérence globale": "Langage naturel sans jargon, alignement avec le reste du profil, énergie cohérente avec la posture."
  },
  "Présence de contenu public": {
    "Présence d'activité récente": "Publication de contenu dans les 30 derniers jours, différenciation entre créations originales et repartages/likes.",
    "Nature du contenu publié": "Créations personnelles (valeur, opinion, storytelling, expertise), pas de repartage sans commentaire, contenu renforçant le positionnement.",
    "Cohérence et clarté": "Thèmes alignés avec le profil, ton global en phase avec le rôle (expert, dirigeant, créatif)."
  },
  "Expériences professionnelles": {
    "Présence et complétude": "Au moins une expérience renseignée, dates et intitulé visibles, logos d'entreprises si disponibles.",
    "Description claire et utile": "Descriptif présent, phrases compréhensibles centrées sur missions ou résultats, éviter les descriptions RH sans intérêt.",
    "Cohérence avec le positionnement actuel": "Expériences soutenant le rôle actuel, alignement entre parcours et offre, pas de contradiction majeure.",
    "Présence de preuves ou de réalisations": "Résultats, chiffres, projets, clients ou faits concrets, mention d'évolutions ou d'impacts tangibles."
  },
  "Crédibilité & Confiance": {
    "Compétences": "Au moins 50 compétences renseignées, cohérence avec le positionnement, compétences stratégiques dans les 3 premières, validations par d'autres utilisateurs.",
    "Recommandations": "Au moins une recommandation reçue, diversité des sources, contenu complet et aligné avec le profil.",
    "Services": "Section Services présente pour entrepreneurs, clarté des offres, alignement entre services et profil, langage professionnel."
  },
  "Espace Sélection": {
    "Présence et call to action": "Présence d'un lien ou call to action dans la section sélection, invitation claire à l'action (réserver, télécharger, s'inscrire), alignement avec le positionnement global.",
    "Diversité et pertinence des ressources": "Variété des contenus sélectionnés (articles, posts, médias), pertinence avec l'expertise affichée, mise à jour régulière de la sélection.",
    "Structuration et mise en avant": "Organisation claire et logique des éléments, titres et descriptions engageants, valorisation des meilleurs contenus en priorité."
  }
}

// Mapping des anciens noms vers les nouveaux noms de sections
export const SECTION_MAPPING = {
  'banner': 'Bannière',
  'photo': 'Photo de profil', 
  'headline': 'Titre du profil',
  'about': 'Section À propos',
  'contenu': 'Présence de contenu public',
  'experiences': 'Expériences professionnelles',
  'cred': 'Crédibilité & Confiance',
  'selection': 'Espace Sélection'
}

// Fonction pour obtenir l'explication attendue d'un critère
export function getCriteriaExpectation(section: string, criteria: string): string {
  if (!criteria) return "Critère non défini"
  
  const mappedSection = SECTION_MAPPING[section as keyof typeof SECTION_MAPPING] || section
  const sectionExpectations = CRITERIA_EXPECTATIONS[mappedSection as keyof typeof CRITERIA_EXPECTATIONS]
  
  // Nettoyer le titre du critère en retirant le score entre parenthèses (ex: "Compétences (4)" → "Compétences")
  const cleanCriteria = criteria.replace(/ \(\d+\)$/, '')
  
  if (sectionExpectations && typeof sectionExpectations === 'object') {
    const criteriaExpectations = sectionExpectations as Record<string, string>
    return criteriaExpectations[cleanCriteria] || "Critère non défini"
  }
  
  return "Critère non défini"
}

// Fonction pour obtenir le titre d'un critère sans le score
export function getCriteriaTitle(criteria: string): string {
  if (!criteria) return ""
  return criteria.replace(/ \(\d+\)$/, ':')
}
