import { useState, useEffect } from "react";
import CardList from './CardList';
function DeckEditor({ initialDeck = [], initialName = '', onDeckChange, onNameChange, onSubmit }) {
    const [deckName, setDeckName] = useState(initialName);
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [deck, setDeck] = useState(initialDeck);

    useEffect(() => {
        onDeckChange(deck);
    }, [deck, onDeckChange]);

    useEffect(() => {
        onNameChange(deckName);
    }, [deckName, onNameChange]);

    function handleAddCard() {
        if (!front.trim() || !back.trim()) return;
        const newCard = {
            front: front.trim(),
            back: back.trim(),
            card_id: crypto.randomUUID()
        };
        setDeck(prev => [...prev, newCard]);
        setFront('');
        setBack('');
    }

    return (
        <>
            <div className="deck-name-field">
                <span>Name: </span>
                <input
                    className="input"
                    placeholder="Deck Name"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                />
            </div>

            <div className="form">
                <div className="text-fields">
                    <div className="text-field">
                        <span>Front: </span>
                        <textarea
                            className="input-text-area"
                            placeholder="Front of Card"
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                        />
                    </div>
                    <div className="text-field">
                        <span>Back: </span>
                        <textarea
                            className="input-text-area"
                            placeholder="Back of Card"
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                        />
                    </div>
                </div>
                <button className="small-button" type="button" onClick={handleAddCard}>Add Card</button>
            </div>
            <button 
                className='menu-button' 
                onClick={() => {
                    onSubmit();
                }}
            >
                Submit Deck
            </button>
            {deck.length > 0 && <CardList cards={deck} />}
        </>
    );
}

export default DeckEditor;