import React, { useEffect, useState } from 'react';
import './header.css';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { FaLeaf, FaBars, FaTimes } from 'react-icons/fa';
import { FiSearch, FiBell, FiGrid, FiUser } from 'react-icons/fi';

const Headers = () => {
    const [userdata, setUserdata] = useState({});
    const [imgError, setImgError] = useState(false);
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
                    <div className="logo-icon-wrapper">
                        <FaLeaf className="logo-icon" />
                    </div>
                    <span className="logo-text">PlantWise</span>
                </NavLink>

                <div className="menu-icon" onClick={toggleMenu}>
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </div>

                <ul className={menuOpen ? 'nav-links open' : 'nav-links'}>
                    <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink></li>
                    <li><NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>AI Scanner</NavLink></li>
                    <li><NavLink to="/outbreak-radar" onClick={() => setMenuOpen(false)}>Outbreak Radar</NavLink></li>
                    <li><NavLink to="/saved-plants" onClick={() => setMenuOpen(false)}>Saved Plants</NavLink></li>
                    <li><NavLink to="/social-media" onClick={() => setMenuOpen(false)}>Community</NavLink></li>
                    <li><NavLink to="/badge-progress" onClick={() => setMenuOpen(false)}>Badges</NavLink></li>
                    <li><NavLink to="/ar" onClick={() => setMenuOpen(false)}>3D Gallery</NavLink></li>
                </ul>

                <div className="nav-actions">
                    <button className="icon-btn" title="Search"><FiSearch /></button>
                    <button className="icon-btn" title="Notifications"><FiBell /></button>
                    <button className="icon-btn accent-icon" title="Quick Tools"><FiGrid /></button>

                    {Object.keys(userdata).length > 0 ? (
                        <div className="user-profile-wrapper">
                            {userdata?.image && !imgError ? (
                                <img 
                                    src={userdata.image} 
                                    className="user-avatar-btn" 
                                    alt={userdata.displayName || "User Profile"} 
                                    referrerPolicy="no-referrer"
                                    onError={() => setImgError(true)}
                                    title={userdata.displayName || "User Profile"}
                                />
                            ) : (
                                <div className="user-avatar-fallback" title={userdata.displayName || "User Profile"}>
                                    <FiUser />
                                </div>
                            )}
                            <button onClick={logout} className="action-btn logout-btn">Logout</button>
                        </div>
                    ) : (
                        <NavLink to="/login" className="action-btn cta-btn">Login / Sign Up</NavLink>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Headers;
