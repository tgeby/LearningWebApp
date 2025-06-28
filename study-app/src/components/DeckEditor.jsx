import { useState, useRef, useEffect, useCallback } from "react";
import CardList from './CardList';
import './CreateDeck.css';


function DeckEditor({ initialDeck = [], initialName = '', onDeckChange, onNameChange, onSubmit }) {
    const [deckName, setDeckName] = useState(initialName);
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [deck, setDeck] = useState(initialDeck);
    const [modifyID, setModifyID] = useState(null);
    const editorRef = useRef(null);

    useEffect(() => {
        onDeckChange(deck);
    }, [deck, onDeckChange]);

    useEffect(() => {
        onNameChange(deckName);
    }, [deckName, onNameChange]);

    const onDelete = useCallback((deleteID) => {
        setDeck(prev => prev.filter((card, index) => card.card_id !== deleteID));
    }, []);

    const onEdit = useCallback((editID) => {
        setModifyID(editID);
        const cardToEdit = deck.find(card => card.card_id === editID);
        if (cardToEdit) {
            setFront(cardToEdit.front);
            setBack(cardToEdit.back);
            editorRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [deck]);

    function handleAddCard() {
        if (!front.trim() || !back.trim()) return;
        
        if (modifyID !== null) {
            const updatedCard = {
                front: front.trim(),
                back: back.trim(),
                card_id: modifyID
            };

            setDeck(prev => prev.map((card) => 
                card.card_id === modifyID ? updatedCard : card
            ));
            setModifyID(null);
        } else {
            const newCard = {
                front: front.trim(),
                back: back.trim(),
                card_id: crypto.randomUUID()
            };
            setDeck(prev => [...prev, newCard]);
        }
        setFront('');
        setBack('');
    }

    return (
        <>
            <div className="deck-name-field" ref={editorRef}>
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
                {modifyID !== null &&
                    <button
                        className="small-button"
                        onClick={() => {
                            setModifyID(null);
                            setFront('');
                            setBack('');
                        }}
                    >
                        Cancel Edit
                    </button>
                }
                <button className="small-button" type="button" onClick={handleAddCard}>{modifyID === null ? 'Add Card' : 'Update Card'}</button>
            </div>
            <button 
                className='menu-button' 
                onClick={() => {
                    onSubmit();
                }}
            >
                Submit Deck
            </button>
            {deck.length > 0 && <CardList cards={deck} onDelete={onDelete} onEdit={onEdit}/>}
        </>
    );
}

export default DeckEditor;