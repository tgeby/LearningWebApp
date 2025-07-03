import './CardList.css'
import { useState } from 'react';

function CardList({ cards, onDelete=null, onEdit=null }) {
    const [editingCardId, setEditingCardId] = useState(null);
    const [editingFront, setEditingFront] = useState('');
    const [editingBack, setEditingBack] = useState('');

    const handleEditStart = (card) => {
        setEditingCardId(card.card_id);
        setEditingFront(card.front);
        setEditingBack(card.back);
    }

    const handleEditCancel = () => {
        setEditingCardId(null);
        setEditingFront('');
        setEditingBack('');
    };

    const handleEditSave = () => {
        if (onEdit && editingCardId) {
            onEdit(editingCardId, editingFront, editingBack);
            setEditingCardId(null);
            setEditingFront('');
            setEditingBack('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleEditCancel();
        }
    };

    return (
        <ol className='card-list'>
            {cards.map((card, index) => (
            <li key={card.card_id} className="listed-card">
                <p className='card-header'>Card {index+1}: </p>
                <div className='card-info-wrapper'>
                    <p className='front-label'>Front:</p> 
                    {editingCardId === card.card_id ? (
                        <textarea
                            className='edit-textarea'
                            value={editingFront}
                            onChange={(e) => setEditingFront(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    ) : (
                        <div className='text-scroll front-text'>{card.front}</div>
                    )}


                    <p className='back-label'>Back:</p> 
                    {editingCardId === card.card_id ? (
                        <textarea
                            className='edit-textarea'
                            value={editingBack}
                            onChange={(e) => setEditingBack(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                        <div className='text-scroll back-text'>{card.back}</div>
                    )}
                </div>
                <div className='button-wrapper'>
                    {editingCardId === card.card_id ? (
                        <>
                            <button
                                onClick={handleEditCancel}
                                className='edit-button cancel'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                className='edit-button accept'
                            >
                                Update
                            </button>
                        </>
                    ) : (
                        <>
                            {onDelete && 
                                <button
                                    onClick={() => onDelete(card.card_id)}
                                    className='delete-button'
                                >
                                    🗑️
                                </button>
                            }
                            {onEdit &&
                                <button
                                    className='edit-button'
                                    onClick={() => handleEditStart(card)}
                                >
                                    Edit
                                </button>
                            }
                        </>
                    )}
                </div>
            </li>
            ))}
        </ol>
    );
}

export default CardList;