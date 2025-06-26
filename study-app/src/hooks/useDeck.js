import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export function useDeck(deckId, user) {
    const [deckData, setDeckData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDeck() {
            try {
            const flashcardDeck = await getDoc(doc(db, 'flashcard_sets', deckId));

            if (!flashcardDeck.exists()) {
                setError("Deck not found");
            } else {
                setDeckData(flashcardDeck.data())
            }
            } catch (error) {
                console.log(error);
                setError("Failed to load deck");
            } finally {
                setLoading(false);
            }
        }
        if (user && deckId) {
            fetchDeck();
        }
    }, [user, deckId]);

    return { deckData, loading, error};
}