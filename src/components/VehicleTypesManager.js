'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectOption } from '@/components/ui/select'
import HtmlEditor from '@/components/ui/html-editor'
import { Plus, Edit, Trash2, Search, Car, Image } from 'lucide-react'
import api from '@/lib/api'

export default function VehicleTypesManager() {
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, discontinued, upcoming
  const [showForm, setShowForm] = useState(false)
  const [editingVehicleType, setEditingVehicleType] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    slug: '',
    image: '',
    description: '',
    status: 1,
    sort_order: 20
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
    fetchVehicleTypes()
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showForm) {
        setShowForm(false)
        setEditingVehicleType(null)
        setFormData({
          name: '',
          display_name: '',
          slug: '',
          image: '',
          description: '',
          status: 1,
          sort_order: 20
        })
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showForm])

  const fetchVehicleTypes = async () => {
    try {
      const result = await api.get('/api/vehicle-types')
      if (result.success) {
        setVehicleTypes(result.data)
      } else {
        console.error('Error fetching vehicle types:', result.error)
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
    } finally {
      setLoading(false)
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
        folder: 'vehicle-types',
        type: 'vehicle-types',
        slug: formData.slug || 'vehicle'
      })

      if (result.success) {
        setFormData({ ...formData, image: result.url })
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
      if (editingVehicleType) {
        result = await api.put(`/api/vehicle-types/${editingVehicleType.id}`, formData)
      } else {
        result = await api.post('/api/vehicle-types', formData)
      }
      
      if (result.success) {
        await fetchVehicleTypes()
        setShowForm(false)
        setEditingVehicleType(null)
        setFormData({
          name: '',
          display_name: '',
          slug: '',
          image: '',
          description: '',
          status: 1,
          sort_order: 20
        })
      } else {
        alert(result.error || 'Failed to save vehicle type')
      }
    } catch (error) {
      console.error('Error saving vehicle type:', error)
      alert('Failed to save vehicle type')
    }
  }

  const handleEdit = (vehicleType) => {
    console.log('Vehicle Type Status:', vehicleType.status, 'Type:', typeof vehicleType.status)
    setEditingVehicleType(vehicleType)
    const statusValue = vehicleType.status === 0 || vehicleType.status === '0' ? 0 : 1
    console.log('Converted Status:', statusValue)
    const editData = {
      name: vehicleType.name || '',
      display_name: vehicleType.display_name || '',
      slug: vehicleType.slug || '',
      image: vehicleType.image || '',
      description: vehicleType.description || '',
      status: statusValue,
      sort_order: vehicleType.sort_order || 20
    }
    console.log('Form Data Status:', editData.status)
    setFormData(editData)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle type?')) return
    
    try {
      const result = await api.delete(`/api/vehicle-types/${id}`)
      
      if (result.success) {
        await fetchVehicleTypes()
      } else {
        alert(result.error || 'Failed to delete vehicle type')
      }
    } catch (error) {
      console.error('Error deleting vehicle type:', error)
      alert('Failed to delete vehicle type')
    }
  }

  const filteredVehicleTypes = vehicleTypes.filter(vehicleType => {
    // First filter by search term
    const matchesSearch = vehicleType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleType.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleType.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    // Then filter by status
    if (statusFilter === 'all') {
      return true
    } else if (statusFilter === 'active') {
      return parseInt(vehicleType.status) === 1
    } else if (statusFilter === 'discontinued') {
      return parseInt(vehicleType.status) === 0
    } else if (statusFilter === 'upcoming') {
      return parseInt(vehicleType.status) === 2
    }
    
    return true
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
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
            <h2 className="text-3xl font-bold text-white mb-2">Vehicle Types</h2>
            <p className="text-orange-100">Manage all vehicle categories and types</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-white text-blue-600 hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Type
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

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search vehicle types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setStatusFilter('all')
              setSearchTerm('')
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            ✕ Clear
          </button>

          {/* Results Count */}
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Showing {filteredVehicleTypes.length} of {vehicleTypes.length} entries
          </span>
        </div>
      </div>

      {/* Vehicle Type Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowForm(false)
            setEditingVehicleType(null)
            setFormData({
              name: '',
              display_name: '',
              slug: '',
              image: '',
              description: '',
              status: 'Active',
              sort_order: 20
            })
          }}
        >
          <div 
            className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {editingVehicleType ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingVehicleType ? 'Update the vehicle type information' : 'Create a new vehicle type category'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingVehicleType(null)
                  setFormData({
                    name: '',
                    display_name: '',
                    slug: '',
                    image: '',
                    description: '',
                    status: 'Active',
                    sort_order: 20
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
                    Vehicle Type Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: generateSlug(name),
                        display_name: formData.display_name || name
                      })
                    }}
                    required
                  />
                </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type Image
                </label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
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
                      {uploading ? 'Uploading...' : 'Upload Image'}
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
                      Or enter image URL manually
                    </label>
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type Description
                </label>
                <HtmlEditor
                  value={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Enter vehicle type description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingVehicleType(null)
                    setFormData({
                      name: '',
                      display_name: '',
                      slug: '',
                      image: '',
                      description: '',
                      status: 'Active',
                      sort_order: 20
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVehicleType ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Types Table */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-200/50">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Vehicle Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sort Order
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredVehicleTypes.map((vehicleType) => (
              <tr key={vehicleType.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {vehicleType.image ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={vehicleType.image} 
                          alt={vehicleType.name}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ${vehicleType.image ? 'hidden' : 'flex'}`}>
                        <Car className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{vehicleType.display_name}</div>
                      <div className="text-sm text-gray-500">{vehicleType.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicleType.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicleType.status)}`}>
                    {getStatusDisplay(vehicleType.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicleType.sort_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vehicleType)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(vehicleType.id)}
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
        
        {filteredVehicleTypes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No vehicle types found
          </div>
        )}
      </div>
    </div>
  )
}
