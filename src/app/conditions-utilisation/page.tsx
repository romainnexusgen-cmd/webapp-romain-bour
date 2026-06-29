import Link from 'next/link'

const formatDate = () => {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ConditionsUtilisation() {
  const lastUpdate = formatDate()

  return (
    <main className="min-h-screen bg-[#f6f7f9] py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white border-2 border-[#074482]/20 rounded-3xl shadow-xl p-8 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#191919] mb-6" style={{ fontFamily: 'var(--font-poppins)' }}>
          Conditions d’utilisation et politique de confidentialité
        </h1>
        <p className="text-sm text-[#4B5563] mb-10" style={{ fontFamily: 'var(--font-poppins)' }}>
          Dernière mise à jour : {lastUpdate}
        </p>

        <div className="space-y-8 text-[#1F2937]" style={{ fontFamily: 'var(--font-poppins)' }}>
          <section className="space-y-2 text-sm text-[#4B5563]">
            <p>
              Éditeur : BOUR ROMAIN (NEXUSGEN) – Entrepreneur individuel, SIREN 819 156 613, SIRET 819 156 613 00039.
            </p>
            <p>Adresse : 42 allée de la Libération, 57100 Thionville – Numéro de TVA : FR71819156613.</p>
          </section>
          <section className="space-y-4">
            <p>
              Bienvenue sur l’outil d’analyse LinkedIn proposé par Romain Bour. En utilisant ce site ou en soumettant votre profil LinkedIn, vous acceptez les présentes
              conditions d’utilisation ainsi que la politique de confidentialité détaillée ci-dessous.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">1. Objet du service</h2>
            <p>
              Cet outil d’analyse automatique de profil LinkedIn s’appuie sur l’intelligence artificielle pour produire un retour personnalisé sur la qualité de votre
              profil (positionnement, clarté, attractivité, cohérence du contenu, etc.).
            </p>
            <p>
              Les résultats générés sont indicatifs et non contractuels. Ils ne garantissent pas une augmentation de visibilité, d’opportunités professionnelles ou de revenus.
              Il s’agit d’un outil d’aide à la réflexion qui ne remplace pas un accompagnement personnalisé.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">2. Fonctionnement de l’outil</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vous soumettez le lien de votre profil LinkedIn ou certaines informations qui y sont liées ;</li>
              <li>L’outil analyse automatiquement les éléments publics de votre profil ;</li>
              <li>Vous recevez un retour personnalisé, éventuellement accompagné de recommandations ou d’offres complémentaires.</li>
            </ul>
            <p>
              Le traitement repose sur des modèles d’intelligence artificielle et des algorithmes internes, ainsi que sur des solutions partenaires telles que OpenAI.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">3. Données collectées</h2>
            <p>Lors de votre utilisation, nous collectons uniquement :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Votre adresse e-mail, si vous la renseignez ;</li>
              <li>Le lien ou le contenu de votre profil LinkedIn ;</li>
              <li>Certaines données techniques anonymes (performances, navigateur, etc.) afin d’améliorer l’expérience.</li>
            </ul>
            <p>Ces données servent à :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vous envoyer votre analyse ou vos résultats ;</li>
              <li>Vous transmettre, ponctuellement, des e-mails d’information ou des offres commerciales liées à nos services ;</li>
              <li>Améliorer la qualité de nos analyses et de nos campagnes marketing.</li>
            </ul>
            <p>Vos données ne sont jamais revendues ni cédées à des tiers à des fins commerciales.</p>
            <p>La conservation des données est limitée à une durée maximale de 5 ans à compter de leur collecte.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">4. Stockage et sécurité</h2>
            <p>
              Vos informations sont hébergées sur Supabase (hébergement sécurisé conforme RGPD). Les workflows automatisés sont orchestrés via n8n et déployés sur Vercel.
              Pour certaines fonctionnalités d’analyse, nous faisons appel aux API d’OpenAI. Nous mettons en œuvre des mesures de sécurité adaptées (chiffrement, contrôle
              d’accès, audit régulier) pour protéger vos données.
            </p>
            <p>
              Vous pouvez demander la suppression ou la rectification de vos données à tout moment en écrivant à :
              <br />
              📩 <Link href="mailto:hadrien@studiogeben.com" className="text-[#074482] underline">hadrien@studiogeben.com</Link>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">5. Tracking et cookies</h2>
            <p>
              Nous utilisons PostHog pour collecter des statistiques d’usage (pages vues, clics, durée de session) afin d’améliorer l’expérience utilisateur. Ces données
              sont anonymisées et ne permettent pas de vous identifier directement. Vous pouvez vous opposer au tracking en activant la fonction “Do Not Track” de votre
              navigateur ou en nous contactant pour exercer votre droit d’opposition.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">6. Droits des utilisateurs</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants : accès, rectification, effacement, limitation du traitement, opposition et portabilité. Vous pouvez
              également retirer votre consentement à tout moment. Pour exercer ces droits, contactez-nous à l’adresse :{' '}
              <Link href="mailto:hadrien@studiogeben.com" className="text-[#074482] underline">hadrien@studiogeben.com</Link>.
            </p>
            <p>
              Chaque e-mail d’information ou commercial inclut un lien de désinscription immédiat. Vous pouvez également demander votre désinscription en nous écrivant.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">7. Limites de responsabilité</h2>
            <p>
              L’outil, déposé par Romain Bour, fournit des analyses indicatives qui peuvent comporter des inexactitudes. Ni Romain Bour ni NexusGen ne sauraient être tenus
              responsables des décisions prises sur la base des résultats, ni des conséquences directes ou indirectes qui en découleraient. En cas de faute lourde ou dolosive
              avérée de notre part, la responsabilité pourra toutefois être engagée conformément au droit applicable.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">8. Propriété intellectuelle</h2>
            <p>
              L’ensemble des contenus liés à l’outil (textes, codes, designs, analyses, etc.) est protégé par le droit de la propriété intellectuelle. Toute reproduction
              ou diffusion non autorisée est interdite.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">9. Contact</h2>
            <p>
              Pour toute question au sujet de ces conditions ou de la gestion de vos données :
              <br />📧 <Link href="mailto:hadrien@studiogeben.com" className="text-[#074482] underline">hadrien@studiogeben.com</Link>
            </p>
            <p>
              Rendez-vous également sur le site officiel :{' '}
              <Link href="https://studiogeben.com" target="_blank" rel="noopener noreferrer" className="text-[#074482] underline">
                https://studiogeben.com
              </Link>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">8. Propriété intellectuelle</h2>
            <p>
              L’ensemble des contenus liés à l’outil (textes, codes, designs, analyses, etc.) est protégé par le droit de la propriété intellectuelle. Toute reproduction
              ou diffusion non autorisée est interdite.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#074482]">9. Contact</h2>
            <p>
              Pour toute question au sujet de ces conditions ou de la gestion de vos données :
              <br />📧 <Link href="mailto:hadrien@studiogeben.com" className="text-[#074482] underline">hadrien@studiogeben.com</Link>
            </p>
            <p>
              Rendez-vous également sur le site officiel :{' '}
              <Link href="https://studiogeben.com" target="_blank" rel="noopener noreferrer" className="text-[#074482] underline">
                https://studiogeben.com
              </Link>
            </p>
          </section>

          <section className="space-y-4">
            <p>
              En utilisant cet outil d’analyse LinkedIn, vous reconnaissez avoir pris connaissance et accepter l’intégralité de ces conditions d’utilisation ainsi que
              notre politique de confidentialité.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

