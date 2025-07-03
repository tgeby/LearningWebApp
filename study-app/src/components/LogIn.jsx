import './Login.css';

import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function LogIn() {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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

    return (
        <>
            <div className="menu">
                <button className='login-button' onClick={() => navigate("/")}>Back</button>
                <h2 className='title login-title'>Welcome</h2>
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
            </div>
        </>
    );
}

export default LogIn;