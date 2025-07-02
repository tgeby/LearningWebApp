import '../styles/global-styles.css';
import './Flashcards.css';

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import {useDeck} from '../hooks/useDeck';

function Flashcards() {

    const { user } = useAuth();

    const location = useLocation();
    const deckId = location.state?.deckId;

    // Deck
    const [deck, setDeck] = useState(null);
    const {deckData, loading, error} = useDeck(deckId, user);

    // Flashcard state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFront, setIsFront] = useState(true);
    const [isFlipping, setIsFlipping] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const frontRef = useRef(null);
    const backRef = useRef(null);

    useEffect(() => {
        if (deckData) {
            setDeck(deckData);
        }
    }, [deckData]);

    function handleReset() {
        setCurrentIndex(0);
        setIsFront(0);
    }

    if (!deckId) return <Navigate to="/menu" />;
    if (loading) return <p className='loading'>Loading deck...</p>;
    if (error) return <p>{error}</p>;
    if (!deck || !deck.cards) return <p>Deck data is invalid.</p>;

    const currentCard = deck?.cards?.[currentIndex];
    const FLIP_DURATION_MS = 300;

    const resetScroll = () => {
        if (frontRef.current) frontRef.current.scrollTop = 0;
        if (backRef.current) backRef.current.scrollTop = 0;
    }

    const handleFlip = () => {
        if (isFlipping) return;

        setIsFlipping(true);
        setIsFront(prev => !prev);

        setTimeout(() => {
            resetScroll();
            setIsFlipping(false);
        }, FLIP_DURATION_MS); // 200ms lockout period before you can flip again
    };

    const handleNext = () => {
        if (isChanging) return;
        
        const delay = isFront ? 100 : FLIP_DURATION_MS;

        setIsChanging(true);
        setIsFront(true);
        resetScroll();

        setTimeout(() => {
            setCurrentIndex(prev => prev+1);
            setIsChanging(false);
        }, delay);
    };

    const handleBack = () => {
        if (isChanging || currentIndex === 0) return;

        const delay = isFront ? 100 : FLIP_DURATION_MS;

        setIsChanging(true);
        setIsFront(true);
        resetScroll();
        

        setTimeout(() => {
            setCurrentIndex(prev => prev-1);
            setIsChanging(false);
        }, delay);  
    };

    return (
        <div className="main">
            <div className='flashcard-area'>
                {deck !== null && (
                    <div>
                        <h1>{deck.name}</h1>
                        {currentCard ? (
                            <div className='flip-card'>
                                <div className={`flip-card-inner ${isFront ? '' : 'flipped'}`}>
                                    <div className='flip-card-front'>
                                        <div className='card-header'>
                                            Card: {currentIndex + 1} of {deck.cards.length}
                                        </div>
                                        <div className='card-front' ref={frontRef}>
                                            <div className='card-body'>
                                                {!isChanging &&
                                                    <p className={isChanging ? 'hidden' : ''}>{currentCard.front}</p>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flip-card-back'>
                                        <div className='card-header'>
                                            Card: {currentIndex + 1} of {deck.cards.length}
                                        </div>
                                        <div className='card-back' ref={backRef}>
                                            <div className='card-body'>
                                                {!isChanging &&
                                                    <p className={isChanging ? 'hidden' : ''}>{currentCard.back}</p>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                            <p>Complete</p>
                            <button onClick={handleReset} className='reset-button'>Reset</button>
                            </>
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
                    disabled={!deck?.cards || currentIndex >= deck.cards.length}
                    onClick={handleNext}
                >
                    Next
                </button>
                <button 
                    type='button' 
                    onClick={handleFlip}
                    disabled={!deck?.cards || currentIndex >= deck.cards.length}
                >
                    Flip Card
                </button>
            </div>
        </div>
    )
}

export default Flashcards;