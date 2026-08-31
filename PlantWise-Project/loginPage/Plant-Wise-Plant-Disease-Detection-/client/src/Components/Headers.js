import React, { useEffect, useState } from 'react';
import './header.css';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { FaLeaf, FaBars, FaTimes } from 'react-icons/fa';

const Headers = () => {
    const [userdata, setUserdata] = useState({});
    const [menuOpen, setMenuOpen] = useState(false);

    const getUser = async () => {
        try {
            const response = await axios.get('http://localhost:6005/login/sucess', { withCredentials: true });
            setUserdata(response.data.user || {});
        } catch (error) {
            console.log('error', error);
        }
    };

    const logout = () => {
        window.open('http://localhost:6005/logout', '_self');
    };

    useEffect(() => {
        getUser();
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header className="header">
            <nav className="navbar">
                <NavLink to="/" className="logo-container">
                    <div className="logo-badge">
                        <FaLeaf />
                    </div>
                    <span className="logo-text">Plant<span>Wise</span></span>
                </NavLink>

                <div className="menu-icon" onClick={toggleMenu}>
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </div>

                <ul className={menuOpen ? 'nav-links open' : 'nav-links'}>
                    <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink></li>
                    <li><NavLink to="/dashboard" className="model-pill" onClick={() => setMenuOpen(false)}>AI Disease Scanner</NavLink></li>
                    <li><NavLink to="/outbreak-radar" onClick={() => setMenuOpen(false)}>🗺️ Outbreak Radar</NavLink></li>

                    {Object.keys(userdata).length > 0 ? (
                        <>
                            <li><NavLink to="/saved-plants" onClick={() => setMenuOpen(false)}>Saved Plants</NavLink></li>
                            <li><NavLink to="/badge-progress" onClick={() => setMenuOpen(false)}>Badge Progress</NavLink></li>
                            <li><NavLink to="/social-media" onClick={() => setMenuOpen(false)}>Community</NavLink></li>
                            <li className="user-name">{userdata?.displayName}</li>
                            {userdata?.image && <li><img src={userdata?.image} className="user-img" alt="user" /></li>}
                            <li onClick={logout} className="logout-btn">Logout</li>
                        </>
                    ) : (
                        <li><NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink></li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Headers;
