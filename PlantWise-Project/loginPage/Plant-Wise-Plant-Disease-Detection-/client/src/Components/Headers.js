import React, { useEffect, useState, useRef } from 'react';
import './header.css';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { FaLeaf, FaBars, FaTimes } from 'react-icons/fa';
import { FiSearch, FiBell, FiGrid, FiUser } from 'react-icons/fi';

const Headers = () => {
    const [userdata, setUserdata] = useState({});
    const [imgError, setImgError] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    // Profile state for conditional notifications
    const [userProfile, setUserProfile] = useState(null);
    const [readNotifIds, setReadNotifIds] = useState([]);

    const notifRef = useRef(null);

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

    // Load Profile and handle storage changes
    useEffect(() => {
        getUser();

        const loadProfile = () => {
            const saved = localStorage.getItem('plantwise_user_profile');
            if (saved) {
                try {
                    setUserProfile(JSON.parse(saved));
                } catch (e) {}
            } else {
                setUserProfile(null);
            }
        };

        loadProfile();
        window.addEventListener('storage', loadProfile);
        return () => window.removeEventListener('storage', loadProfile);
    }, []);

    // Requirement 1: Click Outside to Close Logic (useRef + mousedown listener)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        };

        if (notifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notifOpen]);

    const isProfileComplete = !!(userProfile && userProfile.isProfileComplete);
    const userCity = (userProfile && userProfile.city) ? userProfile.city : 'Khairpur';

    // Requirement 2: Conditional Notifications (Never show weather warning to unregistered profile)
    const baseNotifications = isProfileComplete
        ? [
            {
                id: 2,
                icon: '🌦️',
                title: `Weather Warning (${userCity})`,
                message: 'High wind speed detected (24.4 km/h). Spraying postponed.',
                link: '/dashboard'
            },
            {
                id: 3,
                icon: '🌾',
                title: 'Alibaba Qwen LLM Update',
                message: 'Regional advisory engine now active in 6 languages.',
                link: '/dashboard'
            }
        ]
        : [
            {
                id: 1,
                icon: '⚠️',
                title: 'Complete Farmer Profile',
                message: 'Fill WhatsApp number & crop details for real-time spray alerts.',
                link: '/complete-profile'
            },
            {
                id: 3,
                icon: '🌾',
                title: 'Alibaba Qwen LLM Update',
                message: 'Regional advisory engine now active in 6 languages.',
                link: '/dashboard'
            }
        ];

    const activeNotifications = baseNotifications.map(n => ({
        ...n,
        unread: !readNotifIds.includes(n.id) && (n.id === 1 || n.id === 2)
    }));

    const unreadCount = activeNotifications.filter(n => n.unread).length;

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleNotif = () => {
        setNotifOpen(!notifOpen);
    };

    const markAllRead = () => {
        setReadNotifIds(baseNotifications.map(n => n.id));
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
                    
                    {/* NOTIFICATION BUTTON + DROPDOWN WRAPPER WITH REF */}
                    <div ref={notifRef} style={{ position: 'relative', display: 'inline-block' }}>
                        <button 
                            className={`icon-btn ${unreadCount > 0 ? 'bell-ringing-btn' : ''}`} 
                            title="Notifications"
                            onClick={toggleNotif}
                            style={{ position: 'relative' }}
                        >
                            <FiBell className={unreadCount > 0 ? 'bell-ringing-icon' : ''} />
                            {unreadCount > 0 && (
                                <span className="notif-badge-count">{unreadCount}</span>
                            )}
                        </button>

                        {/* NOTIFICATION POPOVER DROPDOWN */}
                        {notifOpen && (
                            <div className="notif-dropdown">
                                <div className="notif-header">
                                    <h4>Notifications {unreadCount > 0 && `(${unreadCount})`}</h4>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="notif-mark-btn">Mark all read</button>
                                    )}
                                </div>

                                <div className="notif-list">
                                    {activeNotifications.map(n => (
                                        <div 
                                            key={n.id} 
                                            className={`notif-item ${n.unread ? 'unread' : ''}`}
                                            onClick={() => {
                                                setReadNotifIds([...readNotifIds, n.id]);
                                                setNotifOpen(false);
                                                window.location.href = n.link;
                                            }}
                                        >
                                            <span className="notif-icon">{n.icon}</span>
                                            <div className="notif-content">
                                                <strong>{n.title}</strong>
                                                <p>{n.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

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
