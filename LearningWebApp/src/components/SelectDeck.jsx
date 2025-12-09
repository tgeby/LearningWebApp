import '../styles/global-styles.css';

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { useState, useEffect } from 'react';
import { getDoc, getDocs, query, collection, where, doc } from 'firebase/firestore';


function SelectDeck() {

    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const mode = location.state?.mode;
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getDecks() {
            try {
                const ownedDecksSnapshot = await getDocs(
                    query(collection(db, 'owned_decks'), where('user_id', '==', user.uid))
                );

                if (ownedDecksSnapshot.empty) {
                    console.log('You have no decks');
                    setDecks([]);
                    setError("No decks found. Have you created any yet?");
                    return;
                }
                const deckIds = ownedDecksSnapshot.docs.map(doc => doc.id);

                if (deckIds.length <= 10) {
                    const flashcardSetsQuery = query(
                        collection(db, 'flashcard_sets'),
                        where('__name__', 'in', deckIds)
                    );
                    const querySnapshot = await getDocs(flashcardSetsQuery);
                    const foundDecks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setDecks(foundDecks);
                } else {
                    // where('__name__', 'in', deckIds) only works for first ten elements
                    const flashcardSetPromises = deckIds.map(deckId =>
                        getDoc(doc(db, 'flashcard_sets', deckId))
                    );
                    const flashcardSetDocs = await Promise.all(flashcardSetPromises);
                    const foundDecks = flashcardSetDocs
                        .filter(doc => doc.exists())
                        .map(doc => ({ id: doc.id, ...doc.data() }));
                    setDecks(foundDecks);
                }
            } catch(error) {
                console.log(error);
                setError("Failed to load list of decks");
            } finally {
                setLoading(false);
            }
        }
        if (user) {
            getDecks();
        }
    }, [user]);

    const handleDeckSelect = (deckId) => {
        navigate(`/${mode}`, { state: { deckId } });
    }

    if (error) return <p>{error}</p>;
    if (loading) {
        return (
            <div className='menu'>
                <img src="/teabee512.png" alt="TeaBee Logo" width={128} height={128} />
                <p className='loading'>Loading...</p>;
            </div>
        )
    }
    if (!mode) return <div>Error: No study mode selected.</div>;

    const listDecks = decks.map((deck, index) => {
        // console.log(deck);
        return (
            <li key={deck.id} className='listed-deck'>
                <button onClick={() => handleDeckSelect(deck.id)} type="button">{index + 1}: {deck.name}</button>
            </li>
        );
    });

    return (
        <div className="main">
            <span className='title'>Select a Deck</span>
            <ol className='deck-list'>
                {listDecks}
            </ol>
        </div>
    );
}

export default SelectDeck;