import '../styles/global-styles.css';
import './EditDeck.css'

import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useDeck } from '../hooks/useDeck';
import DeckEditor from './DeckEditor';
import { db } from '../firebase';
import { doc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';

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
        if (!user || !deckId) return;
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

    async function handleDeleteDeck() {
        if (!user || !deckId) return;
        // console.log('Deleting deck with id: ', deckId);
        // delete flashcard_sets entry and owned_decks entry
        try {
            await deleteDoc(doc(db, 'flashcard_sets', deckId));
            await deleteDoc(doc(db, 'owned_decks', deckId));

            setStatusMessage('Deck deleted');
            setTimeout(() => {
                navigate('/menu');
            }, 1500);
        } catch (error) {
            console.log('Error deleting deck: ', error);
            setStatusMessage('Failed to delete deck or ownership entry');
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
    if (loading) {
        return (
            <div className='menu'>
                <img src="/teabee512.png" alt="TeaBee Logo" width={128} height={128} />
                <p className='loading'>Loading...</p>;
            </div>
        )
    }
    if (error) return <p>{error}</p>;

    return (
        <div className='main'>
            <div className='top-row'>
                <button
                    className='small-button' 
                    onClick={() => {
                        const confirmDelete = window.confirm('Are you sure you want to delete this deck?');
                        if (confirmDelete) {
                            handleDeleteDeck();
                        }
                    }}
                    disabled={statusMessage ? true : false}
                >
                    Delete Deck
                </button>
                <div className='title-edit-deck'>Edit Deck ({currentDeck.length} cards)</div>
            </div>
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