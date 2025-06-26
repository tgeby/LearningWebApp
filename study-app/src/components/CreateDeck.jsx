import '../styles/global-styles.css';
import './CreateDeck.css';

import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import DeckEditor from './DeckEditor';

function CreateDeck() {

    const { user } = useAuth();

    const [currentName, setCurrentName] = useState('');
    const [currentDeck, setCurrentDeck] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [editorKey, setEditorKey] = useState(0);
    
    useEffect(() => {
        if (statusMessage) {
            const timeout = setTimeout(() => {
                setStatusMessage('');
            }, 3000); // disappears after 3 seconds

            return () => clearTimeout(timeout); // clean up on unmount or if message changes
        }
    }, [statusMessage]);

    // Auth guard
    if (!user) {
        return <div>Loading...</div>;
    }

    async function handlePublishDeck() {

        if (!currentName.trim() || currentDeck.length === 0 || isSubmitting) {
            console.log('Tried to publish an empty deck');
            return;
        }
        setIsSubmitting(true);

        const batch = writeBatch(db);
        const deck_id = crypto.randomUUID();
        const deckDocRef = doc(db, "flashcard_sets", deck_id);
        const ownedDeckRef = doc(db, "owned_decks", deck_id);

        const deck = {
            owner_id: user.uid,
            name: currentName.trim(),
            cards: currentDeck,
            created_at: serverTimestamp()
        };

        batch.set(deckDocRef, deck);
        batch.set(ownedDeckRef, { user_id: user.uid });

        try {
            await batch.commit();
            setStatusMessage("Deck published successfully!");
            setCurrentDeck([]);
            setCurrentName('');
            setEditorKey(prev => prev + 1);
            console.log('Deck and Ownership written atomically');
        }  catch (error) {
            console.log('Atomic write failed: ', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="main">
            <div className="title">
                <span className="title-text">Create</span>
            </div>
            {statusMessage && <p className="status-message">{statusMessage}</p>}
            <DeckEditor
                key={editorKey}
                initialDeck={[]}
                initialName=''
                onDeckChange={setCurrentDeck}
                onNameChange={setCurrentName}
                onSubmit={handlePublishDeck}
            />
        </div>
    );
}

export default CreateDeck;