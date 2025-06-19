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
        navigate("/manage");
    }

    return (
        <div className="menu">
            <div className="title">Menu</div>
            <button className="menu-button" onClick={handleStudy}>Study</button>
            <button className="menu-button" onClick={handleCreate}>Create</button>
            <button className="menu-button" onClick={handleManage}>Manage</button>
            <button className="menu-button" onClick={handleTimer}>Interval Timer</button>
        </div>
    );
}

export default Menu;