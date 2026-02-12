class ApiService {
    constructor(baseUrl = '/api/v1') {
        this.baseUrl = baseUrl;
    }

    getHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                // Token expired or invalid
                console.warn('Unauthorized access. Redirecting to login.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = 'login.html';
                return null;
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'API Request Failed');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

const api = new ApiService();
