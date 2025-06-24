import '../styles/global-styles.css';

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
            <button type="button" className="menu-button" onClick={() => handleModeSelect('memory-game')}>Memory Game</button>
            <button type="button" className="menu-button" onClick={() => handleModeSelect('test')}>Test</button>
        </div>
    );
}

export default StudyMenu;