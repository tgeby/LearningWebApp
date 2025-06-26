import '../styles/global-styles.css';

import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useDeck } from '../hooks/useDeck';
import DeckEditor from './DeckEditor';

function EditDeck() {

    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const deckId = location.state?.deckId;
    const { deckData, loading, error } = useDeck(deckId, user);
    const [currentName, setCurrentName] = useState('');
    const [currentDeck, setCurrentDeck] = useState([]);

    async function handlePublishDeck() {
        console.log('update deck');
        navigate('/menu');
    }

    useEffect(() => {
        if (deckData) {
            setCurrentDeck(deckData.cards || []);
            setCurrentName(deckData.name || 'Untitled');
        }
    }, [deckData]);

    if (!deckId) {
        return <Navigate to="/menu" />;
    }
    if (loading) return <p className='loading'>Loading deck...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='main'>
            <div className='title'>Edit Deck</div>

            {currentDeck.length > 0 && 
                <DeckEditor
                initialDeck={currentDeck}
                initialName={currentName}
                onDeckChange={setCurrentDeck}
                onNameChange={setCurrentName}
                onSubmit={handlePublishDeck}
            />
            }
        </div>
    );
}

export default EditDeck;