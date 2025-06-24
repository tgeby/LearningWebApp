import '../styles/global-styles.css';

import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';

function Flashcards() {

    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const deckId = location.state?.deckId;
    const [deck, setDeck] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFront, setIsFront] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getDeck() {
            try {
            const flashcardDeck = await getDoc(doc(db, 'flashcard_sets', deckId));

            if (!flashcardDeck.exists) {
                setError("Deck not found");
            } else {
                setDeck(flashcardDeck.data());
            }
            } catch (error) {
                console.log(error);
                setError("Failed to load deck");
            } finally {
                setLoading(false);
            }
        }
        if (user && deckId) {
            getDeck();
        }
    }, [user]);


    if (!deckId) {
        return <Navigate to="/menu" />;
    }
    if (loading) return <p>Loading deck...</p>;
    if (error) return <p>{error}</p>;

    const currentCard = deck?.cards?.[currentIndex];


    return (
        <div className="main">
            <div className='title'>
                Flashcards
            </div>
            {deck !== null && (
                <div>
                    <p>Found deck {deck.name}</p>
                    {currentCard ? (
                        <div>
                            <p>Card: {currentIndex + 1}</p>
                            <p>{isFront ? currentCard.front : currentCard.back}</p>
                        </div>
                    ) : (
                        <p>Complete</p>
                    )}
                </div>)
            }
            <div className='flashcardArea'>
                
            </div>
            <button 
                type='button' 
                disabled={currentIndex >= deck.cards.length}
                onClick={() => setCurrentIndex(prev => prev+1)}
            >
                Next Card
            </button>
            <button type='button' onClick={() => setIsFront(prev => !prev)}>Flip Card</button>
        </div>
    )
}

export default Flashcards;