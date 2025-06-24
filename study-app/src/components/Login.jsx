import './Login.css';

import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const googleProvider = new GoogleAuthProvider();

    const HandleSignUp = async(e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("SignUp Done");
        } catch(error) {
            setLoginError("Sign up failed");
            console.log(error);
        }
    }

    const HandleLogin = async(e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged In");
            navigate('/menu');
        } catch(error) {
            const message = error.code === 'auth/invalid-credential'
                ? 'Invalid email or password.'
                : error.code === 'auth/invalid-email'
                ? 'Invalid email'
                : 'Login failed';
            setLoginError(message);
            console.log(error.code);
        }
    }

    const HandleGoogleLogin = async() => {
        try {
            await signInWithPopup(auth, googleProvider);
            console.log("Logged In with Google");
            navigate('/menu');
        } catch(error) {
            setLoginError("Login with Google failed")
            console.log(error);
        }
    }

    return (
        <div className="menu">
            <h2 className='title'>Welcome</h2>
            <form className="login-form" onSubmit={HandleLogin}>
                <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="textField"
                />
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="textField"
                />
                <button type="submit" className="menu-button">Log In</button>
                {loginError && <p>{loginError}</p>}
            </form>
            <button onClick={HandleSignUp} className="menu-button">Sign Up</button>
            <button onClick={HandleGoogleLogin} className="menu-button">Continue with Google</button>
        </div>
    );
}

export default Login;