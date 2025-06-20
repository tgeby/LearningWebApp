import '../styles/global-styles.css';
import './CreateDeck.css';
import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';

function CreateDeck() {

    const { user } = useAuth();

    const [currentName, setCurrentName] = useState('');
    const [currentFront, setCurrentFront] = useState('');
    const [currentBack, setCurrentBack] = useState('');
    const [currentDeck, setCurrentDeck] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
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

    function handleAddCard() {
        if (!currentFront.trim() || !currentBack.trim()) return;

        const nextCard = {
            front: currentFront.trim(), 
            back: currentBack.trim(), 
            card_id: crypto.randomUUID()
        };

        setCurrentDeck(prev => [...prev, nextCard]);
        setCurrentFront('');
        setCurrentBack('');
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
            console.log('Deck and Ownership written atomically');
        }  catch (error) {
            console.log('Atomic write failed: ', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const listCards = currentDeck.map((card, index) => {
        return (
            <li key={card.card_id} className="listed-card">
                <p className='card-text'>Card {index+1}: </p>
                <div>
                    <div className='card-text'>
                        <p>Front:</p> {card.front}
                    </div>
                </div>
                <div>
                    <div className='card-text'>
                        <p>Back:</p> {card.back}
                    </div>
                </div>
            </li>
        );
    });

    return (
        <div className="main">
            <div className="title">
                <span className="title-text">Create</span>
            </div>

            <div className="deck-name-field">
                <span>Name: </span>
                <input 
                    className="input"
                    placeholder='Deck Name'
                    value={currentName}
                    onChange= {(e) => setCurrentName(e.target.value)}
                />
            </div>

            {/* Card input */}
            <div className="form">
                <div className="text-fields">
                    <div className="text-field">
                        <span>Front: </span>
                        <textarea 
                            className="input-text-area"
                            placeholder='Front of Card'
                            value={currentFront}
                            onChange= {(e) => setCurrentFront(e.target.value)}
                        />
                    </div>
                    <div className='text-field'>
                        <span>Back: </span>
                        <textarea
                            className="input-text-area"
                            placeholder='Back of Card'
                            value={currentBack}
                            onChange= {(e) => setCurrentBack(e.target.value)}
                        />
                    </div>
                </div>
                <button className="small-button" onClick={handleAddCard} type="button">Add Card</button>
            </div>
            {statusMessage && <p className="status-message">{statusMessage}</p>}
            {currentDeck.length > 0 && (
                <>
                    <button type="button" className='wide-button' onClick={handlePublishDeck}>Publish Deck</button>
                    <p className='deck-title'>{currentName}</p>
                    <ol className='card-list'>
                        {listCards}
                    </ol>
                </>
            )}
        </div>
    );
}

export default CreateDeck;