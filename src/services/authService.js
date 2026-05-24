export const authService = {
    async handleResponse(response) {
        if (!response.ok) {
            let errorMessage = 'Network error occurred.';
            try {
                const errorData = await response.json();
                // Match the ApiResponse format from GlobalExceptionHandler
                // { errorCode: "...", message: "...", details: "..." }
                if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // Fallback if parsing fails
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        return response.json();
    },

    async loginTeacher(username, password) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await fetch('/api/auth/teacher/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        const data = await this.handleResponse(response);
        
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        
        return data;
    },

    async registerTeacher(username, password) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await fetch('/api/auth/teacher/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        const data = await this.handleResponse(response);
        
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        
        return data;
    },

    logout() {
        localStorage.removeItem('token');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};
