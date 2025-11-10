import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { updateUser } = useContext(UserContext);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Handle Login Form sumbit
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.")
            return;
        }

        if (!password) {
            setError("Please enter the password");
            return;
        }

        setError("")

        setLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });

            const { token, role } = response.data;

            console.log("role", role)

            if (token) {
                localStorage.setItem("token", token);
                updateUser(response.data)

                // redirected based on the role
                if (role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    console.log("hi")
                    navigate("/user/dashboard");
                }
            }
        }
        catch (error) {
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again")
            }
        } finally {
            setLoading(false);
        }

    }

    return <AuthLayout>
        <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
            <h3 className='text-4xl font-stack text-black'>
                Welcome Back
            </h3>
            <p className='text-sm text-slate-700 font-stack mt-[3px] mb-6'>
                Please enter your details to log in
            </p>

            <form onSubmit={handleLogin} >
                <Input
                    value={email}
                    onChange={({ target }) => setEmail(target.value)}
                    label="Email Address"
                    placeholder="deekay@gmail.com"
                    type="text"
                />

                <Input
                    value={password}
                    onChange={({ target }) => setPassword(target.value)}
                    label="Password"
                    placeholder="nsihgke@koe"
                    type="password"
                />

                {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

                <button
                    className='btn-primary'
                    type='submit'
                    disabled={loading} 
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            LOGGING IN...
                        </div>
                    ) : (
                        "LOGIN"
                    )}
                </button>

                <p className='text-[13px] text-slate-800 mt-3 font-stack'>
                    Don't have an account?{" "}
                    <Link className='font-medium text-blue-600 text-sm underline font-stack' to='/signup'>
                        Signup
                    </Link>
                </p>

            </form>

        </div>
    </AuthLayout>

}

export default Login