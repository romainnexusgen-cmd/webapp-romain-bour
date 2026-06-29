import { NextRequest, NextResponse } from 'next/server'

const APIFY_TOKEN = process.env.APIFY_TOKEN

interface LinkedInProfile {
  id: string
  name: string
  position?: string
  photo?: string
  location?: {
    linkedinText?: string
  }
  linkedinUrl: string
  publicIdentifier: string
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName } = await request.json()

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'firstName et lastName sont requis' },
        { status: 400 }
      )
    }

    if (!APIFY_TOKEN) {
      console.error('APIFY_API_TOKEN non configuré')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Lancer le run Apify
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/harvestapi~linkedin-profile-search-by-name/runs?token=${APIFY_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          maxPages: 1,
          profileScraperMode: 'Short',
        }),
      }
    )

    if (!runResponse.ok) {
      throw new Error('Erreur lors du lancement de la recherche Apify')
    }

    const runData = await runResponse.json()
    const runId = runData.data.id
    const datasetId = runData.data.defaultDatasetId

    // Attendre que le run se termine (polling)
    let status = 'RUNNING'
    let attempts = 0
    const maxAttempts = 30 // 30 secondes max

    while (status !== 'SUCCEEDED' && status !== 'FAILED' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
      )
      const statusData = await statusResponse.json()
      status = statusData.data.status
      attempts++
    }

    if (status === 'FAILED') {
      throw new Error('La recherche Apify a échoué')
    }

    if (attempts >= maxAttempts) {
      throw new Error('La recherche a pris trop de temps')
    }

    // Récupérer les résultats
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
    )

    if (!resultsResponse.ok) {
      throw new Error('Erreur lors de la récupération des résultats')
    }

    const results: LinkedInProfile[] = await resultsResponse.json()

    return NextResponse.json({ profiles: results })
  } catch (error) {
    console.error('LinkedIn search error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
