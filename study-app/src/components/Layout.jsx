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
                <header style={{ padding: "1rem", borderBottom: "1px solid #ccc", textAlign: "center"}}>
                    <span>Logged in as {user.email}</span>
                    <button onClick={handleLogout} style={{ marginLeft: "1rem"}}>
                        Logout
                    </button>
                </header>
            )}
            <main>{children}</main>
        </div>
    );
}

export default Layout;