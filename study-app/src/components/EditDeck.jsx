import '../styles/global-styles.css';

import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useDeck } from '../hooks/useDeck';
import DeckEditor from './DeckEditor';
import { db } from '../firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

function EditDeck() {

    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const deckId = location.state?.deckId;
    const { deckData, loading, error } = useDeck(deckId, user);
    const [currentName, setCurrentName] = useState('');
    const [currentDeck, setCurrentDeck] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');

    async function handlePublishDeck() {
        console.log('update deck');
        if (!deckId) {
            console.log('tried to upload a deck with no deckID');
        }
        try {
            await setDoc(doc(db, 'flashcard_sets', deckId), {
                name: currentName.trim(),
                cards: currentDeck,
                updated_at: serverTimestamp()
            }, {merge: true});

            setStatusMessage('Successfully updated deck');

            setTimeout(() => {
                navigate('/menu');
            }, 1500);
        } catch (error) {
            setStatusMessage('Update deck failed');
            console.log(error);
        } 
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
            {statusMessage && <p className="status-message">{statusMessage}</p>}

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