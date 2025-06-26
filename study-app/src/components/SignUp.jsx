import './Login.css';

import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function SignUp() {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const HandleSignUp = async(e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("SignUp Done");
            navigate('menu');
        } catch(error) {
            if (error.message.includes('email')) {
                setLoginError('Invalid email');
            } else if (error.message.includes('password')) {
                setLoginError('Password must be at least 6 characters long');
            }
            console.log(error);
        }
    }

    return (
        <div className="menu">
            <h2 className='title'>Welcome</h2>
            <form className="login-form" onSubmit={HandleSignUp}>
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
                <button type="submit" className="menu-button">Sign Up</button>
                {loginError && <p className='login-error'>{loginError}</p>}
            </form>
        </div>
    );
}

export default SignUp;