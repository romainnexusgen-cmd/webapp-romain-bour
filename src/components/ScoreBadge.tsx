'use client'

interface ScoreBadgeProps {
  score: number
  maxScore: number
  className?: string
}

export default function ScoreBadge({ score, maxScore, className = '' }: ScoreBadgeProps) {
  // Assurer que les valeurs sont bien numériques
  const safeScore = score || 0
  const safeMaxScore = maxScore || 0
  const percentage = safeMaxScore > 0 ? (safeScore / safeMaxScore) * 100 : 0
  
  const getBadgeStyle = () => {
    if (percentage < 30) {
      return 'bg-red-100 text-red-600 border-red-200'
    } else if (percentage < 75) {
      return 'bg-yellow-100 text-yellow-600 border-yellow-200'
    } else {
      return 'bg-green-100 text-green-600 border-green-200'
    }
  }

  return (
    <span className={`inline-flex items-center px-6 py-3 rounded-md text-base font-bold border w-full justify-center ${getBadgeStyle()} ${className}`}>
      {safeScore}/{safeMaxScore}
    </span>
  )
}
