'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectOption } from '@/components/ui/select'
import HtmlEditor from '@/components/ui/html-editor'
import { Search, Edit, Trash2, Plus, Image } from 'lucide-react'
import api from '@/lib/api'

export default function VehicleMakesManager() {
  const [vehicleMakes, setVehicleMakes] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active') // Default to active
  const [typeFilter, setTypeFilter] = useState('all') // Will be set to Car type ID after loading
  const [showForm, setShowForm] = useState(false)
  const [editingVehicleMake, setEditingVehicleMake] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    type_id: '',
    name: '',
    display_name: '',
    slug: '',
    logo_url: '',
    description: '',
    status: 1
  })

  // Helper function to get status display text
  const getStatusDisplay = (status) => {
    const numStatus = parseInt(status)
    if (numStatus === 1) return 'Active'
    if (numStatus === 0) return 'Discontinued'
    if (numStatus === 2) return 'Upcoming'
    return 'Unknown'
  }

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    const numStatus = parseInt(status)
    if (numStatus === 1) return 'bg-green-100 text-green-800'
    if (numStatus === 0) return 'bg-red-100 text-red-800'
    if (numStatus === 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  useEffect(() => {
    fetchVehicleMakes()
    fetchVehicleTypes()
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showForm) {
        setShowForm(false)
        setEditingVehicleMake(null)
        setFormData({
          type_id: '',
          name: '',
          display_name: '',
          slug: '',
          logo_url: '',
          description: '',
          status: 1
        })
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showForm])

  const fetchVehicleMakes = async () => {
    try {
      setLoading(true)
      const result = await api.get('/api/vehicle-makes', {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        type_id: typeFilter
      })
      if (result.success) {
        setVehicleMakes(result.data)
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages)
          setTotalCount(result.pagination.total)
        }
      } else {
        console.error('Error fetching vehicle makes:', result.error)
      }
    } catch (error) {
      console.error('Error fetching vehicle makes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleTypes = async () => {
    try {
      console.log('Fetching vehicle types from /api/vehicle-types/public')
      const result = await api.get('/api/vehicle-types/public')
      console.log('API Response:', result)
      if (result.success) {
        console.log('Vehicle types loaded:', result.data.length, 'types')
        console.log('Vehicle types data:', result.data)
        setVehicleTypes(result.data)
        
        // Set default filter to Car type
        const carType = result.data.find(type => 
          type.name?.toLowerCase() === 'car' || 
          type.name?.toLowerCase() === 'cars' ||
          type.display_name?.toLowerCase() === 'car' ||
          type.display_name?.toLowerCase() === 'cars'
        )
        if (carType) {
          setTypeFilter(carType.id.toString())
        }
      } else {
        // If public endpoint fails, allow viewing makes without type filter
        console.warn('Could not load vehicle types, type filter disabled', result.error)
        setVehicleTypes([])
        setTypeFilter('all')
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
      // On error, still allow viewing makes
      setVehicleTypes([])
      setTypeFilter('all')
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload image in jpg, png, jpeg extension.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Maximum size is 5MB.')
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      const result = await api.upload('/api/upload', file, {
        folder: 'vehicle-makes',
        type: 'vehicle-makes',
        slug: formData.slug || 'make'
      })

      if (result.success) {
        setFormData({ ...formData, logo_url: result.url })
        alert('Image uploaded successfully!')
      } else {
        alert(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let result
      if (editingVehicleMake) {
        result = await api.put(`/api/vehicle-makes/${editingVehicleMake.id}`, formData)
      } else {
        result = await api.post('/api/vehicle-makes', formData)
      }

      if (result.success) {
        await fetchVehicleMakes()
        setShowForm(false)
        setEditingVehicleMake(null)
        setFormData({
          type_id: '',
          name: '',
          display_name: '',
          slug: '',
          logo_url: '',
          description: '',
          status: 1
        })
      } else {
        alert(result.error || 'Failed to save vehicle make')
      }
    } catch (error) {
      console.error('Error saving vehicle make:', error)
      alert('Failed to save vehicle make')
    }
  }

  const handleEdit = (vehicleMake) => {
    setEditingVehicleMake(vehicleMake)
    const editData = {
      type_id: vehicleMake.type_id || '',
      name: vehicleMake.name || '',
      display_name: vehicleMake.display_name || '',
      slug: vehicleMake.slug || '',
      logo_url: vehicleMake.logo_url || '',
      description: vehicleMake.description || '',
      status: parseInt(vehicleMake.status) || 1
    }
    setFormData(editData)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle make?')) return
    
    try {
      const result = await api.delete(`/api/vehicle-makes/${id}`)

      if (result.success) {
        await fetchVehicleMakes()
      } else {
        alert(result.error || 'Failed to delete vehicle make')
      }
    } catch (error) {
      console.error('Error deleting vehicle make:', error)
      alert('Failed to delete vehicle make')
    }
  }

  // Server-side filtering and pagination - no client-side filtering needed
  const currentItems = vehicleMakes
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch data when filters or page changes
  useEffect(() => {
    fetchVehicleMakes()
  }, [currentPage, searchTerm, statusFilter, typeFilter])

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm, statusFilter, typeFilter])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getVehicleTypeName = (typeId) => {
    if (!typeId) {
      console.log('No typeId provided')
      return 'N/A'
    }
    console.log('Looking for typeId:', typeId, 'Type:', typeof typeId)
    console.log('Available vehicle types:', vehicleTypes.map(t => ({ id: t.id, name: t.display_name, type: typeof t.id })))
    const type = vehicleTypes.find(t => parseInt(t.id) === parseInt(typeId))
    console.log('Found type:', type)
    return type ? type.display_name : 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle makes...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header Section */}
      <div className="bg-blue-700 rounded-2xl p-8 mb-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Vehicle Makes</h2>
            <p className="text-blue-100">Manage all vehicle brands and manufacturers</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Make
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
          
          {/* Status Filter Dropdown */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[180px]"
          >
            <SelectOption value="all">All Status</SelectOption>
            <SelectOption value="active">Active</SelectOption>
            <SelectOption value="discontinued">Discontinued</SelectOption>
            <SelectOption value="upcoming">Upcoming</SelectOption>
          </Select>

          {/* Vehicle Type Filter Dropdown */}
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-w-[200px]"
          >
            <SelectOption value="all">-- Select Vehicle Type --</SelectOption>
            {vehicleTypes.map((type) => (
              <SelectOption key={type.id} value={type.id}>
                {type.display_name}
              </SelectOption>
            ))}
          </Select>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search vehicle makes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setStatusFilter('all')
              setTypeFilter('all')
              setSearchTerm('')
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            ✕ Clear
          </button>

          {/* Results Count */}
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Showing {vehicleMakes.length} of {totalCount} entries
          </span>
        </div>
      </div>

      {/* Vehicle Make Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowForm(false)
            setEditingVehicleMake(null)
            setFormData({
              type_id: '',
              name: '',
              display_name: '',
              slug: '',
              logo_url: '',
              description: '',
              status: 1
            })
          }}
        >
          <div 
            className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {editingVehicleMake ? 'Edit Vehicle Make' : 'Add New Vehicle Make'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingVehicleMake ? 'Update the vehicle make information' : 'Create a new vehicle brand/manufacturer'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingVehicleMake(null)
                  setFormData({
                    type_id: '',
                    name: '',
                    display_name: '',
                    slug: '',
                    logo_url: '',
                    description: '',
                    status: 1
                  })
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <Select
                    value={formData.type_id}
                    onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                  >
                    <SelectOption value="">Select Type</SelectOption>
                    {vehicleTypes.map((type) => (
                      <SelectOption key={type.id} value={type.id}>
                        {type.display_name}
                      </SelectOption>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData({ 
                        ...formData, 
                        name: value,
                        slug: generateSlug(value)
                      })
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name *
                  </label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make Logo
                </label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {formData.logo_url && (
                    <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={formData.logo_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logo_url: '' })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg">
                      <Image className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</span>
                  </div>

                  {/* Manual URL Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Or enter logo URL manually
                    </label>
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.jpg"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make Description
                </label>
                <HtmlEditor
                  value={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Enter vehicle make description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                >
                  <SelectOption value="1">Active</SelectOption>
                  <SelectOption value="0">Discontinued</SelectOption>
                  <SelectOption value="2">Upcoming</SelectOption>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingVehicleMake(null)
                    setFormData({
                      type_id: '',
                      name: '',
                      display_name: '',
                      slug: '',
                      logo_url: '',
                      description: '',
                      status: 1
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVehicleMake ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Makes Table */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-200/50">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Vehicle Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Brand Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentItems.map((vehicleMake) => (
              <tr key={vehicleMake.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getVehicleTypeName(vehicleMake.type_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {vehicleMake.logo_url ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={vehicleMake.logo_url} 
                          alt={vehicleMake.name}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold ${vehicleMake.logo_url ? 'hidden' : 'flex'}`}>
                        {vehicleMake.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{vehicleMake.display_name}</div>
                      <div className="text-sm text-gray-500">{vehicleMake.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicleMake.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicleMake.status)}`}>
                    {getStatusDisplay(vehicleMake.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vehicleMake)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(vehicleMake.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> entries
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNumber
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="px-2 py-2 text-gray-500">...</span>
                }
                return null
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
