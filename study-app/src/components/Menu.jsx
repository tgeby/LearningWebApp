import React from "react";
import { useAuth } from '../context/AuthContext';

function Menu() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Welcome to the Menu {user?.email}</h2>
        </div>
    );
}

export default Menu;