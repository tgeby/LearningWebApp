import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

function StartPage() {
    const navigate = useNavigate();
    const googleProvider = new GoogleAuthProvider();
    const [loginError, setLoginError] = useState('');

    const HandleSignUp = () => {
        navigate('/signup');
    }

    const HandleLogIn = () => {
        navigate('/login');
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
            <button onClick={HandleGoogleLogin} className="menu-button">Continue with Google</button>
            <button onClick={HandleLogIn} className="menu-button">Log In</button>
            <button onClick={HandleSignUp} className="menu-button">Sign Up</button>
        </div>
    );
}

export default StartPage;