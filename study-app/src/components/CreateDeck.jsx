import '../styles/global-styles.css';
import './CreateDeck.css';
import { useState } from "react";

function CreateDeck() {
    const [deck, setDeck] = useState({
        id: null, // deck identifier
        name: "", // deck title
        cards: [] // array of deck arrays: [[frontText, backText, ID], ...]
    }); 

    const [currentName, setCurrentName] = useState('');
    const [currentFront, setCurrentFront] = useState('');
    const [currentBack, setCurrentBack] = useState('');
    const [currentDeck, setCurrentDeck] = useState([]);
    
    function handleAddCard() {
        if (currentName === '' || currentFront === '' || currentBack === '') return;
        const id = crypto.randomUUID();
        const nextDeck = [...currentDeck, [currentFront, currentBack, id]];
        setCurrentDeck(nextDeck);
        setCurrentFront('');
        setCurrentBack('');
    }

    const listCards = currentDeck.map((card, index) => {
        return (
            <li key={card[2]} className="listed-card">
                <p className='card-text'>Card {index+1}: </p>
                <div>
                    <div className='card-text'>
                        <p>Front:</p>
                        {card[0]}
                    </div>
                </div>
                <div>
                    <div className='card-text'>
                        <p>Back:</p>
                        {card[1]}
                    </div>
                </div>
            </li>
        );
    });

    return (
        <div className="main">
            <div className="title">
                <span className="title-text">Create</span>
            </div>

            <div className="deck-name-field">
                <span>Name: </span>
                <input 
                    className="input"
                    placeholder='Deck Name'
                    value={currentName}
                    onChange= {(e) => setCurrentName(e.target.value)}
                />
            </div>

            {/* Card input */}
            <div className="form">
                <div className="text-fields">
                    <div className="text-field">
                        <span>Front: </span>
                        <textarea 
                            className="input-text-area"
                            placeholder='Front of Card'
                            value={currentFront}
                            onChange= {(e) => setCurrentFront(e.target.value)}
                        />
                    </div>
                    <div className='text-field'>
                        <span>Back: </span>
                        <textarea
                            className="input-text-area"
                            placeholder='Back of Card'
                            value={currentBack}
                            onChange= {(e) => setCurrentBack(e.target.value)}
                        />
                    </div>
                </div>
                <button className="small-button" onClick={handleAddCard} type="button">Add Card</button>
            </div>
            {currentDeck.length > 0 && (
                <>
                    <p className='deck-title'>{currentName}</p>
                    <ol className='card-list'>
                        {listCards}
                    </ol>
                </>
            )}
        </div>
    );
}

export default CreateDeck;