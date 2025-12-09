import '../styles/global-styles.css';

import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';


function MemoryGame() {

    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const deck = location.state?.deckId;

    return (
        <div className="main">
            Memory Game
        </div>
    )
}

export default MemoryGame;