'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase, AdminUser } from '@/lib/supabase'
import Overview from '@/components/admin/Overview'
import Database from '@/components/admin/Database'
import Documentation from '@/components/admin/Documentation'
import Profile from '@/components/admin/Profile'

type TabType = 'overview' | 'database' | 'documentation' | 'profile'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'admin est connecté
    const user = sessionStorage.getItem('adminUser')
    if (!user) {
      router.push('/admin-panel')
      return
    }
    setAdminUser(JSON.parse(user))
  }, [router])

  const handleLogout = () => {
    // Déconnecter de Supabase
    supabase.auth.signOut()
    // Nettoyer la session
    sessionStorage.removeItem('adminUser')
    router.push('/admin-panel')
  }

  if (!adminUser) {
    return <div>Loading...</div>
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />
      case 'database':
        return <Database />
      case 'documentation':
        return <Documentation />
      case 'profile':
        return <Profile adminUser={adminUser} />
      default:
        return <Overview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <Image
              src="/mimprep-logo.png"
              alt="MiMPrep Logo"
              width={150}
              height={45}
              className="filter brightness-0 invert"
            />
          </div>
          
          <div className="mb-6">
            <p className="text-blue-100 text-sm">Welcome back,</p>
            <p className="text-xl font-semibold">Hi {adminUser.full_name}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'database' 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              Database
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'documentation' 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              Documentation
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              My Profile
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="w-full mt-8 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
