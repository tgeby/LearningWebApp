import './Layout.css';
import logo from '../logo.svg';

import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Layout({ children }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <div>
            {user && (
                <header className="header">
                    <div className="header-left">
                        <img className="header-image" src={logo} alt="react logo" />
                        <h1 className="header-title">Study Center</h1>
                    </div>
                    <div className="header-right">
                        <span className="user-info">Logged in as {user.email}</span>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </header>
            )}
            <main>{children}</main>
        </div>
    );
}

export default Layout;