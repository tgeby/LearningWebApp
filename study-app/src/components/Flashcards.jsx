import '../styles/global-styles.css';
import './Flashcards.css';
import InfoToolTip from './InfoToolTip';

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDeck } from '../hooks/useDeck';

function Flashcards() {

    const { user } = useAuth();

    // Used to get the deckId from the deck selection page
    const location = useLocation();
    const deckId = location.state?.deckId;

    // Card deck
    const [deck, setDeck] = useState(null);

    // Gets the deck object from the database
    const {deckData, loading, error} = useDeck(deckId, user);

    // Flashcard state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFront, setIsFront] = useState(true);
    const [isFlipping, setIsFlipping] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [ready, setReady] = useState(false);
    const [shuffle, setShuffle] = useState(false); // new
    const [shuffledCards, setShuffledCards] = useState([]); // new
 
    // Prevents annoying accidental double clicks on the shuffle toggle
    const [shuffleInputDisabled, setShuffleInputDisabled] = useState(false);

    // Used to indicate that a previous session was restored
    const [showToast, setShowToast] = useState(false);

    // Used to store the flashcard state in localStorage
    const currentIndexRef = useRef(currentIndex);
    const isFrontRef = useRef(isFront);
    const shuffledCardsRef = useRef(shuffledCards);
    const isShuffleRef = useRef(shuffle);

    // Used to reset the scroll each time the card changes
    const frontRef = useRef(null);
    const backRef = useRef(null);
    
    // Update the flashcard state in a ref whenever it changes so that the state can be stored in localStorage if the user accidentally refreshes
    // or closes the page.
    useEffect(() => {
        currentIndexRef.current = currentIndex;
        isFrontRef.current = isFront;
        shuffledCardsRef.current = shuffledCards;
        isShuffleRef.current = shuffle;
    }, [currentIndex, isFront, shuffle, shuffledCards]);

    const getShuffledDeck = useCallback(() => {
        if (!deck?.cards) return [];
        let newShuffledCards = [...deck.cards];
        // Fisher-Yates Shuffle
        for (let i = newShuffledCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
            [newShuffledCards[i], newShuffledCards[j]] = [newShuffledCards[j], newShuffledCards[i]]; // Swap
        }
        return newShuffledCards;
    }, [deck?.cards]);

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
                setShuffle(parsed['isShuffle']);
                if (parsed['isShuffle']) {
                    if (Array.isArray(parsed['shuffledCards'])) {
                        setShuffledCards(parsed['shuffledCards']);
                    } else {
                        setShuffledCards(getShuffledDeck());
                    }
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
    }, [deckData, deckId, getShuffledDeck]);

    // This useEffect allows the app to store the flashcard study session state when the page is closed or refreshed.
    useEffect(() => {
        const handleBeforeUnload = (() => {
            const flashcardState = {
                timestamp: new Date().toISOString(), // Used to prevent restoring the state if enough time has passed since the previous session.
                'index': currentIndexRef.current,
                'isFront': isFrontRef.current,
                'isShuffle': isShuffleRef.current,
                'shuffledCards': shuffledCardsRef.current,
                'deckId': deckId // Used to prevent restoring the state erroneously if the user switches to another deck quickly.
            };                   // Otherwise, closing deck A on index 4 and switching to deck B will result in loading deck B showing the card at index 4.
            localStorage.setItem('flashcard-state', JSON.stringify(flashcardState));
        });
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [deckId]);

    // This prevents a user from manually typing in the url to the flashcard study page without going through the menu and selecting a deck.
    if (!deckId) return <Navigate to="/menu" />;

    // This shows a loading screen while waiting for the database query to complete.
    if (loading || !ready) return <p className='loading'>Loading deck...</p>;
    
    // Show an error message if fetching the deck failed.
    if (error) return <p>{error}</p>;
    if (!deck || !deck.cards) return <p>Deck data is invalid.</p>;
    
    function handleReset() {
        setCurrentIndex(0);
        setIsFront(true);
        if (shuffle) {
            setShuffledCards(getShuffledDeck());
        }
        localStorage.removeItem('flashcard-state');
    }

    // Protect against a seemingly impossible case where the next button is clicked at the end of the deck
    // Prevent reading beyond the end of the deck
    if (currentIndex >= (shuffle ? shuffledCards.length : deck.cards.length)) {
        return (
            <div className="main">
                <p>Complete</p>
                <button onClick={handleReset} className='reset-button'>Reset</button>
            </div>
        );
    }


    // Each render this gets the current card. 
    let currentCard = null;
    if (shuffle) { // new
        currentCard = shuffledCards[currentIndex];
    } else {
        currentCard = deck?.cards?.[currentIndex];
    }

    // This constant is used in the flip animation and in the nextCard and previousCard functions if they require a flip.
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
        }, FLIP_DURATION_MS); 
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
                <div className='input-div'>
                    <label>
                        <input // new
                            type='checkbox'
                            checked = {shuffle}
                            onChange={() => {
                                if (shuffleInputDisabled) {
                                    return;
                                }
                                setShuffleInputDisabled(true);
                                setTimeout(() => setShuffleInputDisabled(false), 1000);
                                const newShuffle = !shuffle;
                                if (newShuffle) {
                                    setShuffledCards(getShuffledDeck());
                                } else {
                                    setShuffledCards([]);
                                }
                                setShuffle(newShuffle);
                                setCurrentIndex(0);
                                setIsFront(true);
                            }}
                        />
                        Shuffle
                    </label>
                    <InfoToolTip className="tooltip" text="This will scrap your current study session's progress." />
                </div>
            </div>
        </div>
    )
}

export default Flashcards;