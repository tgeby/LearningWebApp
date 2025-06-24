import '../styles/global-styles.css';
import './Flashcards.css';

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
    const [isFlipping, setIsFlipping] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

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

    const handleFlip = () => {
        if (isFlipping) return;

        setIsFlipping(true);
        setIsFront(prev => !prev);

        setTimeout(() => {
            setIsFlipping(false);
        }, 200); // 200ms lockout period before you can flip again
    };

    const handleNext = () => {
        if (isChanging) return;
        
        setCurrentIndex(prev => prev+1);
        setIsChanging(true);
        setIsFront(true);

        setTimeout(() => {
            setIsChanging(false);
        }, 200);
    };

    const handleBack = () => {
        if (isChanging || currentIndex === 0) return;

        setCurrentIndex(prev => prev-1);
        setIsChanging(true);
        setIsFront(true);
        
        setTimeout(() => {
            setIsChanging(false);
        }, 200);
    };

    return (
        <div className="main">
            <div className='flashcard-area'>
                {deck !== null && (
                    <div>
                        <h1>{deck.name}</h1>
                        {currentCard ? (
                            <div className='card'>
                                <div className='card-header'>
                                    Card: {currentIndex + 1} of {deck.cards.length}
                                </div>
                                <div className='card-content'>
                                    <p>{isFront ? currentCard.front : currentCard.back}</p>
                                </div>
                            </div>
                        ) : (
                            <p>Complete</p>
                        )}
                    </div>)
                }
            </div>
            <div className='controls'>
                <button 
                    type='button' 
                    disabled={currentIndex === 0}
                    onClick={handleBack}
                >
                    Back
                </button>
                <button 
                    type='button' 
                    disabled={currentIndex >= deck.cards.length}
                    onClick={handleNext}
                >
                    Next
                </button>
                <button 
                    type='button' 
                    onClick={handleFlip}
                    disabled={currentIndex >= deck.cards.length}
                >
                    Flip Card
                </button>
            </div>
        </div>
    )
}

export default Flashcards;