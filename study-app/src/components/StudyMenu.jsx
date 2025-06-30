import '../styles/global-styles.css';
import './StudyMenu.css';

import { useNavigate } from 'react-router-dom';

function StudyMenu() {
    
    const navigate = useNavigate();
    
    const handleModeSelect = (mode) => {
        console.log(mode);
        navigate('/select-deck', { state: { mode } });
    }

    return (
        <div className="menu">
            <div className="title">
                Study Mode
            </div>
            <button type="button" className="menu-button" onClick={() => handleModeSelect('flashcards')}>Flashcards</button>
            <button type="button" className="menu-button disabled" onClick={() => handleModeSelect('memory-game')} disabled='true'>
                Memory Game
                <p style={{ fontSize: '1rem', opacity: 0.7 }}>Coming soon...</p>
            </button>
            <button type="button" className="menu-button disabled" onClick={() => handleModeSelect('test')} disabled='true'>
                Test
                <p style={{ fontSize: '1rem', opacity: 0.7 }}>Coming soon...</p>
            </button>
        </div>
    );
}

export default StudyMenu;