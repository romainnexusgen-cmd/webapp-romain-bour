'use client'

import { useState } from 'react'

// Données factices mais réalistes et visibles
const generateRealisticChartData = (days: number, baseValue: number, variance: number, trend: number = 0) => {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Créer des données réalistes avec tendance et variance
    const trendValue = (days - i) * trend
    const randomValue = baseValue + (Math.random() - 0.5) * variance + trendValue
    
    data.push({
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: Math.max(0, Math.round(randomValue))
    })
  }
  
  return data
}

export default function Overview() {
  const [cvChartData] = useState(generateRealisticChartData(30, 25, 15, 0.3))
  const [leadsChartData] = useState(generateRealisticChartData(30, 15, 8, 0.2))
  const [targetLeadsChartData] = useState(generateRealisticChartData(30, 8, 5, 0.1))

  // Trouver les valeurs max pour l'échelle des graphiques
  const getMaxValue = (data: { value: number; date: string }[]) => {
    return Math.max(...data.map(item => item.value))
  }

  // Composant de graphique en ligne avec vraies données
  const LineChart = ({ data, title, color, maxValue }: { 
    data: { value: number; date: string }[], 
    title: string, 
    color: string,
    maxValue: number
  }) => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        
        {/* Graphique en ligne avec vraies données */}
        <div className="h-48 mb-4 relative">
          {/* Axe Y avec vraies valeurs - vertical à gauche */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 z-10">
            <span className="font-medium">{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span className="font-medium">0</span>
          </div>
          
          <svg className="w-full h-full ml-8" viewBox={`0 0 ${data.length * 20} 120`}>
            {/* Ligne de connexion entre les points */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data.map((item, index) => {
                const x = index * 20 + 10
                const y = 120 - ((item.value / maxValue) * 100)
                return `${x},${y}`
              }).join(' ')}
            />
            
            {/* Points de données */}
            {data.map((item, index) => {
              const x = index * 20 + 10
              const y = 120 - ((item.value / maxValue) * 100)
              
              return (
                <g key={index}>
                  {/* Point principal */}
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  
                  {/* Tooltip au survol */}
                  <title>{`${item.date}: ${item.value}`}</title>
                </g>
              )
            })}
          </svg>
        </div>
        
        {/* Axe X avec dates - une seule ligne */}
        <div className="flex justify-between text-xs text-gray-500 ml-8">
          {data.map((item, index) => (
            <span key={index} className="text-center" style={{ width: `${100 / data.length}%` }}>
              {index % 5 === 0 ? item.date : ''}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Overview</h1>

      {/* Charts Section - Graphiques en ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart 
          data={cvChartData} 
          title="CV analysed" 
          color="#3B82F6"
          maxValue={getMaxValue(cvChartData)}
        />
        <LineChart 
          data={leadsChartData} 
          title="Qualified leads" 
          color="#10B981"
          maxValue={getMaxValue(leadsChartData)}
        />
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total CVs Analyzed */}
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {cvChartData.reduce((sum, item) => sum + item.value, 0)}
          </div>
          <div className="text-gray-600">Total CVs (30 jours)</div>
        </div>

        {/* Unique Profiles */}
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {leadsChartData.reduce((sum, item) => sum + item.value, 0)}
          </div>
          <div className="text-gray-600">Total Leads (30 jours)</div>
        </div>

        {/* Target Leads */}
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {targetLeadsChartData.reduce((sum, item) => sum + item.value, 0)}
          </div>
          <div className="text-gray-600">Total Target (30 jours)</div>
        </div>
      </div>

      {/* Dernières données */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dernières données (7 derniers jours)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-900">Date</th>
                <th className="px-3 py-2 text-center font-medium text-gray-900">CVs Analysés</th>
                <th className="px-3 py-2 text-center font-medium text-gray-900">Nouveaux Leads</th>
                <th className="px-3 py-2 text-center font-medium text-gray-900">Target Leads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cvChartData.slice(-7).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-900 font-medium">{item.date}</td>
                  <td className="px-3 py-2 text-center text-blue-600 font-semibold">{item.value}</td>
                  <td className="px-3 py-2 text-center text-green-600 font-semibold">
                    {leadsChartData[leadsChartData.length - 7 + index]?.value || 0}
                  </td>
                  <td className="px-3 py-2 text-center text-purple-600 font-semibold">
                    {targetLeadsChartData[targetLeadsChartData.length - 7 + index]?.value || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
