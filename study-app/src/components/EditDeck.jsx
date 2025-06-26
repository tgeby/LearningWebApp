import '../styles/global-styles.css';
import CardList from './CardList';

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useDeck } from '../hooks/useDeck';

function EditDeck() {

    const { user } = useAuth();
    const location = useLocation();
    const deckId = location.state?.deckId;
    const { deckData, loading, error } = useDeck(deckId, user);
    const [currentName, setCurrentName] = useState('');
    const [currentDeck, setCurrentDeck] = useState([]);

    async function handlePublishDeck() {
        console.log('update deck');
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

            {currentDeck.length > 0 && (
                <>
                    <button type="button" className='menu-button' onClick={handlePublishDeck}>Publish Deck</button>
                    <p className='deck-title'>{currentName}</p>
                    <CardList cards={currentDeck} />
                </>
            )}
        </div>
    );
}

export default EditDeck;