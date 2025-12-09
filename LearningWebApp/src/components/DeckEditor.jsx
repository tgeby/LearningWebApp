import { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

import CardList from './CardList';
import './CreateDeck.css';
import './DeckEditor.css';

function DeckEditor({ initialDeck = [], initialName = '', onDeckChange, onNameChange, onSubmit }) {
    const [deckName, setDeckName] = useState(initialName);
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [deck, setDeck] = useState(initialDeck);
    const [modifyID, setModifyID] = useState(null);
    const [useMassUpload, setUseMassUpload] = useState(false);
    const [massUploadText, setMassUploadText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        onDeckChange(deck);
    }, [deck, onDeckChange]);

    useEffect(() => {
        onNameChange(deckName);
    }, [deckName, onNameChange]);

    const onDelete = useCallback((deleteID) => {
        setDeck(prev => prev.filter((card, index) => card.card_id !== deleteID));
    }, []);

    const onEdit = useCallback((editID, newFront, newBack) => {
        const updatedDeck = deck.map(card =>
            card.card_id === editID
                ? { ...card, front: newFront, back: newBack }
                : card
        );
        setDeck(updatedDeck);
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

    function handleMassUpload() {
        console.log("Mass uploading");
        try {
            const parsed = JSON.parse(massUploadText);
            const validCards = parsed.filter(card =>
            card.front && card.back
            ).map(card => ({
            front: card.front.trim(),
            back: card.back.trim(),
            card_id: crypto.randomUUID()
            }));
            
            setDeck(prev => [...prev, ...validCards]);
            setMassUploadText('');
            setUseMassUpload(false);
        } catch (err) {
            alert('Invalid JSON. Please check the format.');
        }
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

            <button 
                className='menu-button' 
                onClick={() => {
                    navigate("/menu");
                }}
            >
                Cancel
            </button>

            {!useMassUpload && 
                <button
                    onClick={() => {setUseMassUpload(true);}}
                    className='menu-button'
                >
                    Use Mass Upload
                </button>    
            }
            {useMassUpload && 
            <>
                <pre className='mass-upload-instructions'>
                {`Below you can mass upload decks in the form:
[
{
    "front": "put card front text here",
    "back": "put card back text here"
},
{
    "front": "put card front text here",
    "back": "put card back text here"
}
...
]`
            }
            </pre>

            <pre className='mass-upload-instructions'>
            {`You can have ChatGPT or another LLM generate the cards in this format using a query like this:
            
Could you give me flashcards for the first unit of calc 1 in the following format
[
{
    "front": "put card front text here",
    "back": "put card back text here"
},
{
    "front": "put card front text here",
    "back": "put card back text here"
}
...
]`
                }
                </pre>
                <div className="mass-upload-text-field">
                        <p>Input area: </p>
                        <br/>
                        <textarea
                            className="mass-input-text-area"
                            placeholder="Formatted cards"
                            value={massUploadText}
                            onChange={(e) => setMassUploadText(e.target.value)}
                        />
                    </div>
                <div className='mass-upload-controls'>
                    <button
                        onClick={() => {
                            if (massUploadText.length === 0) {
                                setUseMassUpload(false);
                            } else {
                                const confirmExit = window.confirm('Are you sure you want to exit? Your work will be lost.');
                            
                                if (confirmExit) {
                                    setUseMassUpload(false);
                                    setMassUploadText('');
                                }
                            }
                        }}
                        className='small-button'
                    >
                        Cancel Mass Upload
                    </button>    
                    
                    <button
                        className='small-button'
                        onClick={() => handleMassUpload()}
                    >
                        Submit Mass Upload
                    </button>  
                </div>
            </>
            }
            {deckName.length > 0 && <p className='deck-title'>{deckName}</p>}
            {deck.length > 0 && <CardList cards={deck} onDelete={onDelete} onEdit={onEdit}/>}
        </>
    );
}

export default DeckEditor;