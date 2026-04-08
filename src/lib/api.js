// API utility for making requests to the Express backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.userEmail = null;
  }

  setUserEmail(email) {
    this.userEmail = email;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('url:----', url);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add user email for OAuth authentication
    if (this.userEmail) {
      headers['x-user-email'] = this.userEmail;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include', // Important for cookies
    };

    // Add body if present
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      console.log('config:----', config);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    console.log('QueryString:----', queryString);
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        console.log('url:----', url);

    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
    });
  }

  // PUT request
  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload file
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const api = new ApiClient();

export default api;
