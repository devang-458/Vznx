import axios from 'axios'
const BASE_URL = process.env.BASE_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,

    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    }
});


axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;

        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
)


axiosInstance.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        if (error.response.status === 401) {
            // redirect to login page
            window.location.href = "/login"
        } else if (error.response.status === 500) {
            console.error("Server error.Please try again later.")
        }
    } else if (error.code === "ENCONNABORTED") {
        console.error("Request timeout. Please try again.")
    }
    return Promise.reject(error);
})

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Only redirect if we're not already on login/signup
                const currentPath = window.location.pathname;
                if (!['/login', '/signup'].includes(currentPath)) {
                    console.error(" Unauthorized. Redirecting to login...");
                    localStorage.removeItem('token'); // Clear invalid token
                    window.location.href = "/login";
                }
            } else if (error.response.status === 500) {
                console.error("Server error. Please try again later.");
            }
        } else if (error.code === "ECONNABORTED") {
            console.error("Request timeout. Please try again.");
        }
        return Promise.reject(error);
    }
);


export default axiosInstance; 