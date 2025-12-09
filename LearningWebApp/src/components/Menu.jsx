import '../styles/global-styles.css';

import { useNavigate } from 'react-router-dom';

function Menu() {

    const navigate = useNavigate();

    const handleTimer = async () => {
        window.open('./timer', '_blank', 'noopener,noreferrer');
    };
    
    function handleCreate () {
        navigate("/create");
    }

    function handleStudy() {
        navigate("/study-menu");
    }

    function handleManage() {
        navigate('/select-deck', { state: {mode: "edit"} });
    }

    return (
        <div className="menu">
            <div className="title">
                Menu
            </div>
            <button className="menu-button" onClick={handleStudy}>Study</button>
            <button className="menu-button" onClick={handleCreate}>Create</button>
            <button className="menu-button" onClick={handleManage}>Edit Decks</button>
            <button className="menu-button" onClick={handleTimer}>Interval Timer</button>
        </div>
    );
}

export default Menu;