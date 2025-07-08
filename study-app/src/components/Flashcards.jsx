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
    const [ready, setReady] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const frontRef = useRef(null);
    const backRef = useRef(null);
    const currentIndexRef = useRef(currentIndex);
    const isFrontRef = useRef(isFront);
    
    useEffect(() => {
        currentIndexRef.current = currentIndex;
        isFrontRef.current = isFront;
    }, [currentIndex, isFront]);

    useEffect(() => {
        if (!deckData) {
            return;
        }
        setDeck(deckData);

        const stored = localStorage.getItem('flashcard-state');
        const tryRestoreState = () => {
            if (!stored) return;
            try {
                const parsed = JSON.parse(stored);
                if (!parsed) return;

                const storedTime = parsed['timestamp'] ? new Date(parsed['timestamp']) : null;
                if ((storedTime && ((Date.now() - storedTime.getTime()) > 30000)) || (deckId !== parsed['deckId'])) {
                    localStorage.removeItem('flashcard-state');
                    return;
                }

                setCurrentIndex(parsed['index']);
                setIsFront(parsed['isFront']);
                if (parsed['index'] === 0 && parsed['isFront'])
                    return;
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 1000);
            } catch (error) {
                console.log("Failed to parse stored flashcard usage state: ", error);
            }
        };

        tryRestoreState();

        // Ready to render
        setReady(true);
    }, [deckData, deckId]);

    useEffect(() => {
        const handleBeforeUnload = (() => {
            const flashcardState = {
                timestamp: new Date().toISOString(),
                'index': currentIndexRef.current,
                'isFront': isFrontRef.current,
                'deckId': deckId
            };
            localStorage.setItem('flashcard-state', JSON.stringify(flashcardState));
        });
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [deckId]);

    function handleReset() {
        setCurrentIndex(0);
        setIsFront(true);
        localStorage.removeItem('flashcard-state');
    }

    if (!deckId) return <Navigate to="/menu" />;
    if (loading || !ready) return <p className='loading'>Loading deck...</p>;
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

    const toastStyle = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        backgroundColor: '#28a745',
        color: 'white',
        borderRadius: '4px',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

        // ease in and out
        opacity: 0,
        transform: 'translateY(-10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
    };

    const toastVisibleStyle = {
        opacity: 1,
        transform: 'translateY(0)',
    };

    return (
        <div className="main">
            <div style={{ 
                ...toastStyle, 
                ...(showToast ? toastVisibleStyle : {}) 
                }}>
                Session restored
            </div>
            <div className='flashcard-area'>
                {deck !== null && (
                    <div>
                        <h1>{deck.name}</h1>
                        {currentCard ? (
                            <div className='flip-card'>
                                <div className={`flip-card-inner ${isFront ? '' : 'flipped'}`}>
                                    <div className='flip-card-front'>
                                        <div className='flashcard-header'>
                                            Card Front: {currentIndex + 1} of {deck.cards.length}
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
                                        <div className='flashcard-header'>
                                            Card Back: {currentIndex + 1} of {deck.cards.length}
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
                    onClick={handleReset}
                    disabled={!deck?.cards || currentIndex === 0}
                    className='lower-reset-button'
                >
                    Reset
                </button>
                <button 
                    type='button' 
                    disabled={currentIndex === 0}
                    onClick={handleBack}
                    className='back-button'
                >
                    Back
                </button>
                <button 
                    type='button' 
                    disabled={!deck?.cards || currentIndex >= deck.cards.length}
                    onClick={handleNext}
                    className='next-button'
                >
                    Next
                </button>
                <button 
                    type='button' 
                    onClick={handleFlip}
                    disabled={!deck?.cards || currentIndex >= deck.cards.length}
                    className='flip-button'
                >
                    Flip Card
                </button>
            </div>
        </div>
    )
}

export default Flashcards;