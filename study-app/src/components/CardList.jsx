import './CardList.css'

function CardList({ cards, onDelete=null, onEdit=null }) {

    return (
        <ol className='card-list'>
            {cards.map((card, index) => (
            <li key={card.card_id} className="listed-card">
                <div className='card-wrapper'>
                    <p className='card-text'>Card {index+1}: </p>
                    <div>
                        <div className='card-text'>
                            <p>Front:</p> {card.front}
                        </div>
                    </div>
                    <div>
                        <div className='card-text'>
                            <p>Back:</p> {card.back}
                        </div>
                    </div>
                </div>
                <div className='button-area'>
                    {onDelete && 
                        <button
                            onClick={() => onDelete(card.card_id)}
                            className='delete-button'
                        >
                            X
                        </button>
                    }
                    {onEdit &&
                        <button
                            className='edit-button'
                            onClick={() => onEdit(card.card_id)}
                        >
                            Edit
                        </button>
                    }
                </div>
            </li>
            ))}
        </ol>
    );
}

export default CardList;