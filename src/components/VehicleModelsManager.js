'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectOption } from '@/components/ui/select'
import HtmlEditor from '@/components/ui/html-editor'
import { Search, Edit, Trash2, Plus, Image, X, Upload } from 'lucide-react'
import api from '@/lib/api'

export default function VehicleModelsManager() {
  const [vehicleModels, setVehicleModels] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [vehicleMakes, setVehicleMakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [typeFilter, setTypeFilter] = useState('all')
  const [makeFilter, setMakeFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState('basic')
  
  const [formData, setFormData] = useState({
    v_make_id: '',
    v_type_id: '',
    v_model_name: '',
    v_model_display_name: '',
    v_model_slug: '',
    parent_slug: '',
    v_model_description: '',
    v_model_history: '',
    v_model_min_price: '',
    v_model_max_price: '',
    v_model_status: 1,
    body_type: '',
    sub_body_type: '',
    subCategory: 0,
    is_ev: 0,
    is_mini: 0,
    is_auto_expo: 0,
    is_baas: 0,
    is_luxury: 0,
    is_expected_launch: 0,
    is_expected_price: 0,
    electric_range: '',
    charging_time: '',
    v_gears: '',
    v_max_power: '',
    v_max_torque: '',
    v_mileage: '',
    fuel_json: [],
    transmission_json: [],
    launched_date: '',
    discontinued_date: '',
    v_model_rank: 0,
    summary: '',
    should_buy: '',
    atf_content: '',
    v_model_expert_speak: '',
    key_model_feature_json: [],
    key_highlights: '',
    top_variant_id: 0,
    base_variant_id: 0,
    recommended_variant_id: 0,
    recommended_variant_atf: '',
    profile_image_url: '',
    left_image_url: '',
    right_image_url: '',
    dimension_image: '',
    campaign_banner_url: '',
    v_model_brochure_url: '',
    pros: [],
    cons: [],
    colors: [],
    groups: []
  })

  const getStatusDisplay = (status) => {
    const numStatus = parseInt(status)
    if (numStatus === 1) return 'Active'
    if (numStatus === 2) return 'Discontinued'
    if (numStatus === 3) return 'Upcoming'
    return 'Unknown'
  }

  const getStatusColor = (status) => {
    const numStatus = parseInt(status)
    if (numStatus === 1) return 'bg-green-100 text-green-800'
    if (numStatus === 2) return 'bg-red-100 text-red-800'
    if (numStatus === 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  useEffect(() => {
    fetchVehicleModels()
    fetchVehicleTypes()
    fetchVehicleMakes()
  }, [currentPage, searchTerm, statusFilter, typeFilter, makeFilter])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showForm) {
        closeForm()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showForm])

  const fetchVehicleModels = async () => {
    try {
      setLoading(true)
      const result = await api.get('/api/vehicle-models', {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        type_id: typeFilter,
        make_id: makeFilter
      })
      if (result.success) {
        setVehicleModels(result.data)
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages)
          setTotalCount(result.pagination.total)
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle models:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleTypes = async () => {
    try {
      const result = await api.get('/api/vehicle-types/public')
      if (result.success) {
        setVehicleTypes(result.data)
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
    }
  }

  const fetchVehicleMakes = async () => {
    try {
      const result = await api.get('/api/vehicle-makes', { limit: 1000 })
      if (result.success) {
        setVehicleMakes(result.data)
      }
    } catch (error) {
      console.error('Error fetching vehicle makes:', error)
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

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload image in jpg, png, jpeg extension.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Maximum size is 5MB.')
      return
    }

    setUploading(true)
    try {
      const result = await api.upload('/api/upload', file, {
        folder: 'vehicle-models',
        type: field,
        slug: formData.v_model_slug || 'model'
      })

      if (result.success) {
        setFormData({ ...formData, [field]: result.url })
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

  const handleBrochureUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Maximum size is 10MB.')
      return
    }

    setUploading(true)
    try {
      const result = await api.upload('/api/upload', file, {
        folder: 'vehicle-models/brochures',
        type: 'brochure',
        slug: formData.v_model_slug || 'model'
      })

      if (result.success) {
        setFormData({ ...formData, v_model_brochure_url: result.url })
        alert('Brochure uploaded successfully!')
      } else {
        alert(result.error || 'Failed to upload brochure')
      }
    } catch (error) {
      console.error('Error uploading brochure:', error)
      alert('Failed to upload brochure')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let result
      if (editingModel) {
        result = await api.put(`/api/vehicle-models/${editingModel.id}`, formData)
      } else {
        result = await api.post('/api/vehicle-models', formData)
      }

      if (result.success) {
        await fetchVehicleModels()
        closeForm()
        alert(editingModel ? 'Vehicle model updated successfully!' : 'Vehicle model created successfully!')
      } else {
        alert(result.error || 'Failed to save vehicle model')
      }
    } catch (error) {
      console.error('Error saving vehicle model:', error)
      alert('Failed to save vehicle model')
    }
  }

  const handleEdit = async (model) => {
    try {
      const result = await api.get(`/api/vehicle-models/${model.id}`)
      if (result.success) {
        const modelData = result.data
        setFormData({
          v_make_id: modelData.v_make_id || '',
          v_type_id: modelData.v_type_id || '',
          v_model_name: modelData.v_model_name || '',
          v_model_display_name: modelData.v_model_display_name || '',
          v_model_slug: modelData.v_model_slug || '',
          parent_slug: modelData.parent_slug || '',
          v_model_description: modelData.v_model_description || '',
          v_model_history: modelData.v_model_history || '',
          v_model_min_price: modelData.v_model_min_price || '',
          v_model_max_price: modelData.v_model_max_price || '',
          v_model_status: modelData.v_model_status || 1,
          body_type: modelData.body_type || '',
          sub_body_type: modelData.sub_body_type || '',
          subCategory: modelData.subCategory || 0,
          is_ev: modelData.is_ev || 0,
          is_mini: modelData.is_mini || 0,
          is_auto_expo: modelData.is_auto_expo || 0,
          is_baas: modelData.is_baas || 0,
          is_luxury: modelData.is_luxury || 0,
          is_expected_launch: modelData.is_expected_launch || 0,
          is_expected_price: modelData.is_expected_price || 0,
          electric_range: modelData.electric_range || '',
          charging_time: modelData.charging_time || '',
          v_gears: modelData.v_gears || '',
          v_max_power: modelData.v_max_power || '',
          v_max_torque: modelData.v_max_torque || '',
          v_mileage: modelData.v_mileage || '',
          fuel_json: modelData.fuel_json ? JSON.parse(modelData.fuel_json) : [],
          transmission_json: modelData.transmission_json ? JSON.parse(modelData.transmission_json) : [],
          launched_date: modelData.launched_date || '',
          discontinued_date: modelData.discontinued_date || '',
          v_model_rank: modelData.v_model_rank || 0,
          summary: modelData.summary || '',
          should_buy: modelData.should_buy || '',
          atf_content: modelData.atf_content || '',
          v_model_expert_speak: modelData.v_model_expert_speak || '',
          key_model_feature_json: modelData.key_model_feature_json ? JSON.parse(modelData.key_model_feature_json) : [],
          key_highlights: modelData.key_highlights || '',
          top_variant_id: modelData.top_variant_id || 0,
          base_variant_id: modelData.base_variant_id || 0,
          recommended_variant_id: modelData.recommended_variant_id || 0,
          recommended_variant_atf: modelData.recommended_variant_atf || '',
          profile_image_url: modelData.profile_image_url || '',
          left_image_url: modelData.left_image_url || '',
          right_image_url: modelData.right_image_url || '',
          dimension_image: modelData.dimension_image || '',
          campaign_banner_url: modelData.campaign_banner_url || '',
          v_model_brochure_url: modelData.v_model_brochure_url || '',
          pros: modelData.pros || [],
          cons: modelData.cons || [],
          colors: modelData.colors || [],
          groups: modelData.groups || []
        })
        setEditingModel(model)
        setShowForm(true)
      }
    } catch (error) {
      console.error('Error fetching model details:', error)
      alert('Failed to load model details')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle model?')) return

    try {
      const result = await api.delete(`/api/vehicle-models/${id}`)
      if (result.success) {
        await fetchVehicleModels()
        alert('Vehicle model deleted successfully!')
      } else {
        alert(result.error || 'Failed to delete vehicle model')
      }
    } catch (error) {
      console.error('Error deleting vehicle model:', error)
      alert('Failed to delete vehicle model')
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingModel(null)
    setActiveTab('basic')
    setFormData({
      v_make_id: '',
      v_type_id: '',
      v_model_name: '',
      v_model_display_name: '',
      v_model_slug: '',
      parent_slug: '',
      v_model_description: '',
      v_model_history: '',
      v_model_min_price: '',
      v_model_max_price: '',
      v_model_status: 1,
      body_type: '',
      sub_body_type: '',
      subCategory: 0,
      is_ev: 0,
      is_mini: 0,
      is_auto_expo: 0,
      is_baas: 0,
      is_luxury: 0,
      is_expected_launch: 0,
      is_expected_price: 0,
      electric_range: '',
      charging_time: '',
      v_gears: '',
      v_max_power: '',
      v_max_torque: '',
      v_mileage: '',
      fuel_json: [],
      transmission_json: [],
      launched_date: '',
      discontinued_date: '',
      v_model_rank: 0,
      summary: '',
      should_buy: '',
      atf_content: '',
      v_model_expert_speak: '',
      key_model_feature_json: [],
      key_highlights: '',
      top_variant_id: 0,
      base_variant_id: 0,
      recommended_variant_id: 0,
      recommended_variant_atf: '',
      profile_image_url: '',
      left_image_url: '',
      right_image_url: '',
      dimension_image: '',
      campaign_banner_url: '',
      v_model_brochure_url: '',
      pros: [],
      cons: [],
      colors: [],
      groups: []
    })
  }

  const addPro = () => {
    setFormData({ ...formData, pros: [...formData.pros, ''] })
  }

  const removePro = (index) => {
    const newPros = formData.pros.filter((_, i) => i !== index)
    setFormData({ ...formData, pros: newPros })
  }

  const updatePro = (index, value) => {
    const newPros = [...formData.pros]
    newPros[index] = value
    setFormData({ ...formData, pros: newPros })
  }

  const addCon = () => {
    setFormData({ ...formData, cons: [...formData.cons, ''] })
  }

  const removeCon = (index) => {
    const newCons = formData.cons.filter((_, i) => i !== index)
    setFormData({ ...formData, cons: newCons })
  }

  const updateCon = (index, value) => {
    const newCons = [...formData.cons]
    newCons[index] = value
    setFormData({ ...formData, cons: newCons })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Vehicle Models</h1>
            <p className="text-blue-100">Manage vehicle models and specifications</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Model
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="discontinued">Discontinued</option>
            <option value="upcoming">Upcoming</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {vehicleTypes.map(type => (
              <option key={type.id} value={type.id}>{type.display_name}</option>
            ))}
          </select>

          <select
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Makes</option>
            {vehicleMakes.map(make => (
              <option key={make.id} value={make.id}>{make.display_name}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 rounded-lg py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button 
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setTypeFilter('all')
              setMakeFilter('all')
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            × Clear
          </button>
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
            <span className="font-semibold">{totalCount}</span> entries
          </div>
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Make</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price Range</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Loading models...</span>
                  </div>
                </td>
              </tr>
            ) : vehicleModels.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No vehicle models found
                </td>
              </tr>
            ) : (
              vehicleModels.map((model) => (
                <tr key={model.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {model.profile_image_url ? (
                        <img 
                          src={model.profile_image_url} 
                          alt={model.display_name} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{model.display_name}</div>
                        <div className="text-xs text-gray-500">{model.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{model.make_display_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{model.type_display_name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {model.min_price && model.max_price ? 
                      `₹${parseFloat(model.min_price).toFixed(2)}L - ₹${parseFloat(model.max_price).toFixed(2)}L` :
                      <span className="text-gray-400">N/A</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(model.status)}`}>
                      {getStatusDisplay(model.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(model)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingModel ? 'Edit Vehicle Model' : 'Add New Vehicle Model'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {editingModel ? 'Update model information' : 'Fill in the details to create a new model'}
                </p>
              </div>
              <button 
                onClick={closeForm} 
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b bg-white px-6 sticky top-[88px] z-10">
              <div className="flex gap-2 overflow-x-auto">
                {['basic', 'specs', 'images', 'content', 'pros-cons', 'variants'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 font-medium text-sm whitespace-nowrap border-b-3 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' & ')}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 bg-gray-50">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Vehicle Type *</label>
                      <select
                        value={formData.v_type_id}
                        onChange={(e) => setFormData({ ...formData, v_type_id: e.target.value })}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select Type</option>
                        {vehicleTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.display_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Vehicle Make *</label>
                      <select
                        value={formData.v_make_id}
                        onChange={(e) => setFormData({ ...formData, v_make_id: e.target.value })}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select Make</option>
                        {vehicleMakes.map(make => (
                          <option key={make.id} value={make.id}>{make.display_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Model Name *</label>
                      <Input
                        value={formData.v_model_name}
                        onChange={(e) => {
                          const name = e.target.value
                          setFormData({
                            ...formData,
                            v_model_name: name,
                            v_model_display_name: name,
                            v_model_slug: generateSlug(name)
                          })
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Display Name *</label>
                      <Input
                        value={formData.v_model_display_name}
                        onChange={(e) => setFormData({ ...formData, v_model_display_name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Slug *</label>
                      <Input
                        value={formData.v_model_slug}
                        onChange={(e) => setFormData({ ...formData, v_model_slug: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Parent Slug</label>
                      <Input
                        value={formData.parent_slug}
                        onChange={(e) => setFormData({ ...formData, parent_slug: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Min Price (Lakhs)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.v_model_min_price}
                        onChange={(e) => setFormData({ ...formData, v_model_min_price: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Max Price (Lakhs)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.v_model_max_price}
                        onChange={(e) => setFormData({ ...formData, v_model_max_price: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={formData.v_model_status}
                        onChange={(e) => setFormData({ ...formData, v_model_status: parseInt(e.target.value) })}
                        className="w-full border rounded-md px-3 py-2"
                      >
                        <option value="1">Active</option>
                        <option value="2">Discontinued</option>
                        <option value="3">Upcoming</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Rank</label>
                      <Input
                        type="number"
                        value={formData.v_model_rank}
                        onChange={(e) => setFormData({ ...formData, v_model_rank: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Launched Date</label>
                      <Input
                        type="date"
                        value={formData.launched_date}
                        onChange={(e) => setFormData({ ...formData, launched_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Discontinued Date</label>
                      <Input
                        type="date"
                        value={formData.discontinued_date}
                        onChange={(e) => setFormData({ ...formData, discontinued_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_ev === 1}
                        onChange={(e) => setFormData({ ...formData, is_ev: e.target.checked ? 1 : 0 })}
                      />
                      <span className="text-sm">Is EV</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_mini === 1}
                        onChange={(e) => setFormData({ ...formData, is_mini: e.target.checked ? 1 : 0 })}
                      />
                      <span className="text-sm">Is Mini</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_auto_expo === 1}
                        onChange={(e) => setFormData({ ...formData, is_auto_expo: e.target.checked ? 1 : 0 })}
                      />
                      <span className="text-sm">Auto Expo</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_luxury === 1}
                        onChange={(e) => setFormData({ ...formData, is_luxury: e.target.checked ? 1 : 0 })}
                      />
                      <span className="text-sm">Is Luxury</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Specs Tab */}
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Body Type</label>
                      <Input
                        value={formData.body_type}
                        onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Sub Body Type</label>
                      <Input
                        value={formData.sub_body_type}
                        onChange={(e) => setFormData({ ...formData, sub_body_type: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Gears</label>
                      <Input
                        value={formData.v_gears}
                        onChange={(e) => setFormData({ ...formData, v_gears: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Max Power</label>
                      <Input
                        value={formData.v_max_power}
                        onChange={(e) => setFormData({ ...formData, v_max_power: e.target.value })}
                        placeholder="e.g., 120 bhp"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Max Torque</label>
                      <Input
                        value={formData.v_max_torque}
                        onChange={(e) => setFormData({ ...formData, v_max_torque: e.target.value })}
                        placeholder="e.g., 200 Nm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Mileage</label>
                      <Input
                        value={formData.v_mileage}
                        onChange={(e) => setFormData({ ...formData, v_mileage: e.target.value })}
                        placeholder="e.g., 20 kmpl"
                      />
                    </div>

                    {formData.is_ev === 1 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Electric Range (km)</label>
                          <Input
                            value={formData.electric_range}
                            onChange={(e) => setFormData({ ...formData, electric_range: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Charging Time</label>
                          <Input
                            value={formData.charging_time}
                            onChange={(e) => setFormData({ ...formData, charging_time: e.target.value })}
                            placeholder="e.g., 8 hours"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  {[
                    { field: 'profile_image_url', label: 'Profile Image' },
                    { field: 'left_image_url', label: 'Left Side Image' },
                    { field: 'right_image_url', label: 'Right Side Image' },
                    { field: 'dimension_image', label: 'Dimension Image' },
                    { field: 'campaign_banner_url', label: 'Campaign Banner' }
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-2">{label}</label>
                      <div className="flex items-center gap-4">
                        {formData[field] && (
                          <img src={formData[field]} alt={label} className="w-32 h-32 object-cover rounded" />
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, field)}
                            className="hidden"
                            id={`upload-${field}`}
                          />
                          <label htmlFor={`upload-${field}`} className="cursor-pointer">
                            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">Click to upload</p>
                            </div>
                          </label>
                        </div>
                        {formData[field] && (
                          <Button
                            type="button"
                            onClick={() => setFormData({ ...formData, [field]: '' })}
                            variant="outline"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium mb-2">Brochure (PDF)</label>
                    <div className="flex items-center gap-4">
                      {formData.v_model_brochure_url && (
                        <a href={formData.v_model_brochure_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          View Brochure
                        </a>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleBrochureUpload}
                          className="hidden"
                          id="upload-brochure"
                        />
                        <label htmlFor="upload-brochure" className="cursor-pointer">
                          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload PDF</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Summary</label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <HtmlEditor
                      value={formData.v_model_description}
                      onChange={(value) => setFormData({ ...formData, v_model_description: value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">History</label>
                    <HtmlEditor
                      value={formData.v_model_history}
                      onChange={(value) => setFormData({ ...formData, v_model_history: value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Expert Speak</label>
                    <HtmlEditor
                      value={formData.v_model_expert_speak}
                      onChange={(value) => setFormData({ ...formData, v_model_expert_speak: value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Should Buy</label>
                    <HtmlEditor
                      value={formData.should_buy}
                      onChange={(value) => setFormData({ ...formData, should_buy: value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Key Highlights</label>
                    <HtmlEditor
                      value={formData.key_highlights}
                      onChange={(value) => setFormData({ ...formData, key_highlights: value })}
                    />
                  </div>
                </div>
              )}

              {/* Pros & Cons Tab */}
              {activeTab === 'pros-cons' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Pros (Advantages)</h3>
                      <Button type="button" onClick={addPro} size="sm">
                        <Plus className="w-4 h-4 mr-1" /> Add Pro
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.pros.map((pro, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={pro}
                            onChange={(e) => updatePro(index, e.target.value)}
                            placeholder="Enter advantage"
                          />
                          <Button
                            type="button"
                            onClick={() => removePro(index)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Cons (Disadvantages)</h3>
                      <Button type="button" onClick={addCon} size="sm">
                        <Plus className="w-4 h-4 mr-1" /> Add Con
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.cons.map((con, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={con}
                            onChange={(e) => updateCon(index, e.target.value)}
                            placeholder="Enter disadvantage"
                          />
                          <Button
                            type="button"
                            onClick={() => removeCon(index)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Variants Tab */}
              {activeTab === 'variants' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Top Variant ID</label>
                      <Input
                        type="number"
                        value={formData.top_variant_id}
                        onChange={(e) => setFormData({ ...formData, top_variant_id: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Base Variant ID</label>
                      <Input
                        type="number"
                        value={formData.base_variant_id}
                        onChange={(e) => setFormData({ ...formData, base_variant_id: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Recommended Variant ID</label>
                      <Input
                        type="number"
                        value={formData.recommended_variant_id}
                        onChange={(e) => setFormData({ ...formData, recommended_variant_id: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Recommended Variant ATF</label>
                      <Input
                        value={formData.recommended_variant_atf}
                        onChange={(e) => setFormData({ ...formData, recommended_variant_atf: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    uploading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                  }`}
                >
                  {uploading ? 'Uploading...' : editingModel ? 'Update Model' : 'Create Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
