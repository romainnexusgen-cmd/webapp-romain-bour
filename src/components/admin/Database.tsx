'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface User {
  candidate_email: string
  candidate_first_name: string
  candidate_last_name: string
  candidate_phone: string
  candidate_address: string
  candidate_profile_url: string
  candidate_institution: string
  candidate_current_stage: string
  candidate_intl_experience_summary: string
  candidate_work_experience_summary: string
  candidate_notable_point: string
  candidate_target_flag: number
  candidate_target_reason: string
  nb_of_sumbit: number
  timestamp_last_attempt: string
  lead_status: string
  timestamp_last_contact: string
  next_follow_up: string
  note: string
  last_cv_id: string
  last_cv_link: string
}

type SortField = keyof User
type SortDirection = 'asc' | 'desc'

export default function Database() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sortField, setSortField] = useState<SortField>('candidate_email')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('unique_users')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' })

      if (error) {
        console.error('Error fetching users:', error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [sortField, sortDirection])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === null) return 1
    if (bValue === null) return -1
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(users.length / itemsPerPage)

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return '-'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Database</h1>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('candidate_first_name')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>First name</span>
                    {sortField === 'candidate_first_name' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('candidate_last_name')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Last name</span>
                    {sortField === 'candidate_last_name' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('candidate_email')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Email</span>
                    {sortField === 'candidate_email' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('candidate_phone')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Phone</span>
                    {sortField === 'candidate_phone' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('candidate_address')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Address</span>
                    {sortField === 'candidate_address' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('candidate_institution')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>School</span>
                    {sortField === 'candidate_institution' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('candidate_current_stage')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Year</span>
                    {sortField === 'candidate_current_stage' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('candidate_target_flag')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Target score</span>
                    {sortField === 'candidate_target_flag' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[250px]">
                  <button 
                    onClick={() => handleSort('candidate_work_experience_summary')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Work exp.</span>
                    {sortField === 'candidate_work_experience_summary' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[250px]">
                  <button 
                    onClick={() => handleSort('candidate_intl_experience_summary')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Intl exp.</span>
                    {sortField === 'candidate_intl_experience_summary' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[250px]">
                  <button 
                    onClick={() => handleSort('candidate_notable_point')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Important</span>
                    {sortField === 'candidate_notable_point' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('nb_of_sumbit')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>CV submit</span>
                    {sortField === 'nb_of_sumbit' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('timestamp_last_attempt')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Last submit</span>
                    {sortField === 'timestamp_last_attempt' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[250px]">
                  <button 
                    onClick={() => handleSort('lead_status')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Lead status</span>
                    {sortField === 'lead_status' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('timestamp_last_contact')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Last contact</span>
                    {sortField === 'timestamp_last_contact' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-medium text-white w-[150px]">
                  <button 
                    onClick={() => handleSort('next_follow_up')}
                    className="flex items-center space-x-1 hover:text-blue-100"
                  >
                    <span>Next follow-up</span>
                    {sortField === 'next_follow_up' && (
                      sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr 
                  key={user.candidate_email}
                  onClick={() => setSelectedUser(user)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_first_name)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_first_name || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_last_name)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_last_name || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_email)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_phone)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_phone || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_address)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_address || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_institution)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_institution || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_current_stage)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_current_stage || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{user.candidate_target_flag || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[250px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_work_experience_summary)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_work_experience_summary || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[250px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_intl_experience_summary)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_intl_experience_summary || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[250px]">
                    <div className="group relative">
                      <span>{truncateText(user.candidate_notable_point)}</span>
                      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[300px] max-w-xs">
                        <div className="text-sm whitespace-pre-wrap">{user.candidate_notable_point || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{user.nb_of_sumbit || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{formatDate(user.timestamp_last_attempt)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[250px]">
                    <div className="group relative">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.lead_status === 'No action taken' ? 'bg-gray-100 text-gray-800' :
                        user.lead_status === 'Called' ? 'bg-blue-100 text-blue-800' :
                        user.lead_status === 'Texted' ? 'bg-green-100 text-green-800' :
                        user.lead_status === 'Not interested' ? 'bg-red-100 text-red-800' :
                        user.lead_status === 'Not targeted' ? 'bg-yellow-100 text-yellow-800' :
                        user.lead_status === 'Call booked' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.lead_status || 'No action taken'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{formatDate(user.timestamp_last_contact)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-900 w-[150px]">
                    <div className="group relative">
                      <span>{formatDate(user.next_follow_up)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, users.length)} of {users.length} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-5xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="bg-blue-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Unique User: {selectedUser.candidate_first_name} {selectedUser.candidate_last_name}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white hover:text-blue-100 text-xl p-1 rounded-full hover:bg-blue-700 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Lead Information */}
              <div>
                <h3 className="text-base font-bold text-center mb-3 text-gray-800">Lead Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={selectedUser.candidate_first_name || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Family name</label>
                    <input
                      type="text"
                      value={selectedUser.candidate_last_name || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tel</label>
                    <input
                      type="text"
                      value={selectedUser.candidate_phone || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={selectedUser.candidate_address || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={selectedUser.candidate_profile_url || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Profile Background */}
              <div>
                <h3 className="text-base font-bold text-center mb-3 text-gray-800">Profile Background</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">School</label>
                    <input
                      type="text"
                      value={selectedUser.candidate_institution || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="text"
                      value={selectedUser.candidate_current_stage || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Professional experience</label>
                    <textarea
                      value={selectedUser.candidate_work_experience_summary || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      rows={2}
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">International experience</label>
                    <textarea
                      value={selectedUser.candidate_intl_experience_summary || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      rows={2}
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Target reason</label>
                    <textarea
                      value={selectedUser.candidate_target_reason || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      rows={2}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Activity and CV */}
              <div>
                <h3 className="text-base font-bold text-center mb-3 text-gray-800">Activity and CV</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Number of submits</label>
                    <input
                      type="number"
                      value={selectedUser.nb_of_sumbit || 0}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last CV submission</label>
                    <input
                      type="text"
                      value={formatDate(selectedUser.timestamp_last_attempt)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">CV</label>
                    {selectedUser.last_cv_link ? (
                      <a
                        href={selectedUser.last_cv_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs text-center block hover:bg-blue-700 transition-colors"
                      >
                        View CV
                      </a>
                    ) : (
                      <span className="w-full px-2 py-1.5 bg-gray-300 text-gray-600 rounded-md text-xs text-center block">
                        No CV
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Lead Status */}
              <div>
                <h3 className="text-base font-bold text-center mb-3 text-gray-800">Lead Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lead status</label>
                    <select
                      value={selectedUser.lead_status || 'No action taken'}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="No action taken">No action taken</option>
                      <option value="Called">Called</option>
                      <option value="Texted">Texted</option>
                      <option value="Not interested">Not interested</option>
                      <option value="Not targeted">Not targeted</option>
                      <option value="Call booked">Call booked</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last contact</label>
                    <input
                      type="date"
                      value={selectedUser.timestamp_last_contact ? selectedUser.timestamp_last_contact.split('T')[0] : ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Next follow-up</label>
                    <input
                      type="date"
                      value={selectedUser.next_follow_up || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
                    <textarea
                      value={selectedUser.note || ''}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                      rows={2}
                      placeholder="Add a note..."
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center pt-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
