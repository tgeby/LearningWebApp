import './CardList.css'

function CardList({ cards, onDelete=null, onEdit=null }) {

    return (
        <ol className='card-list'>
            {cards.map((card, index) => (
            <li key={card.card_id} className="listed-card">
                <p className='card-header'>Card {index+1}: </p>
                <div className='card-info-wrapper'>
                    <p className='front-label'>Front:</p> 
                    <div className='text-scroll front-text'>{card.front}</div>
                    <p className='back-label'>Back:</p> 
                    <div className='text-scroll back-text'>{card.back}</div>
                </div>
                <div className='button-wrapper'>
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