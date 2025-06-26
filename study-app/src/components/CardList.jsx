import './CardList.css'

function CardList({ cards }) {
    return (
        <ol className='card-list'>
            {cards.map((card, index) => (
            <li key={card.card_id} className="listed-card">
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
            </li>
            ))}
        </ol>
    );
}

export default CardList;