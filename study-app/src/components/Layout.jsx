import './Layout.css';
import homeIcon from '../home.svg';

import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link, useLocation } from 'react-router-dom';

function Layout({ children }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    function HomeButton() {
        const location = useLocation();
        const isHome = location.pathname === "/menu";

        const content = (
            <>
                <img className="header-image" src={homeIcon} alt="home icon" />
                <h1 className="header-title">Study Center</h1>
            </>
        );

        return isHome ? content : <Link to="/menu" className="home-link">{content}</Link>
    }

    return (
        <div>
            {user && (
                <header className="header">
                    <div className="header-left">
                        <HomeButton />
                    </div>
                    <div className="header-right">
                        <span className="user-info">Logged in as <br/> {user.email}</span>
                        <button onClick={handleLogout} className="header-button">
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