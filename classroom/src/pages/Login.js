
import React,{useState} from 'react'
import {useAuth} from '../context/AuthContext';
import {useNavigate , Link} from 'react-router-dom';
import './Login.css';
import {toast} from 'react-toastify';


const Login = () => {
    const[email,setEmail] = useState('');
    const[password,setPassword] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();
    const [loading , setLoading] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Email and Password are required!");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Include cookies (for auth token)
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Logged in successfully');
                login(data.data); // Log in the user (store tokens, etc.)
                navigate('/');
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            toast.error('An error occurred during login');
        } finally {
            setLoading(false);
        }

    }
  return (
    <div className = "login-page">
        <h1>login</h1>
        <form onSubmit={handleSubmit}>
            <input type = "email" value ={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} required/>
            <input type = "password" value = {password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
            <button type = "submit">Login</button>
        </form>
        <div className="signup-link">
            <p>Don't have an account? <Link to ="/signup">Sign Up</Link></p>
        </div>
    </div>
  )
}

export default Login