import React, { useEffect, useState, useRef } from 'react';
import './header.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaLeaf, FaBars, FaTimes } from 'react-icons/fa';
import { FiSearch, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { fetchSession, logout as logoutService } from '../Services/authService';
import { AUTH_CHANGE_EVENT, getCachedProfile } from '../Services/authStorage';
import { useWeather } from './WeatherContext';

const SEARCH_ITEMS = [
    { id: 1, name: 'AI Disease Scanner', desc: 'Scan plant leaves for instant diagnosis', path: '/dashboard', category: 'Tool', icon: '🔍' },
    { id: 2, name: 'Outbreak Radar', desc: 'Sindh microclimate & pest tracking feed', path: '/outbreak-radar', category: 'Radar', icon: '📡' },
    { id: 3, name: 'Community Hub', desc: 'Farmer Q&A, feeds & discussions', path: '/social-media', category: 'Social', icon: '💬' },
    { id: 4, name: 'Saved Plants', desc: 'View past diagnosis history', path: '/saved-plants', category: 'Records', icon: '🌱' },
    { id: 5, name: 'Fall Armyworm Advisory', desc: 'Caterpillar treatment & spray advice', path: '/outbreak-radar', category: 'Advisory', icon: '🐛' },
    { id: 6, name: 'Aphids & Sucking Pests', desc: 'Imidacloprid chemical spray guide', path: '/outbreak-radar', category: 'Advisory', icon: '🌾' },
    { id: 7, name: 'Bacterial Blight Advisory', desc: 'Copper Oxychloride spray recommendations', path: '/outbreak-radar', category: 'Advisory', icon: '🦠' },
    { id: 8, name: 'Farmer Profile & Settings', desc: 'Update location & WhatsApp alerts', path: '/complete-profile', category: 'Account', icon: '⚙️' },
];

const Headers = () => {
    const navigate = useNavigate();
    const { liveWeather, activeCity, selectedCityName } = useWeather();
    const [userdata, setUserdata] = useState({});
    const [imgError, setImgError] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Profile state for conditional notifications
    const [userProfile, setUserProfile] = useState(null);
    const [notificationsCleared, setNotificationsCleared] = useState(() => {
        return localStorage.getItem('notificationsCleared') === 'true';
    });
    const [readNotifIds, setReadNotifIds] = useState(() => {
        try {
            const saved = localStorage.getItem('readNotifIds');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const searchRef = useRef(null);
    const notifRef = useRef(null);
    const userMenuRef = useRef(null);
    const probingRef = useRef(false);
    const requeueRef = useRef(false);

    // Resolves EITHER a bearer JWT (register/login) or a Google OAuth cookie.
    // Sign-in fires several auth events in a row (token + profile cache), so
    // overlapping requests are coalesced into one probe plus at most one retry.
    const getUser = async () => {
        if (probingRef.current) {
            requeueRef.current = true;
            return;
        }
        probingRef.current = true;
        do {
            requeueRef.current = false;
            const { isAuthenticated, user } = await fetchSession();
            setImgError(false);
            setUserdata(isAuthenticated && user ? user : {});
        } while (requeueRef.current);
        probingRef.current = false;
    };

    const logout = async () => {
        setMenuOpen(false);
        setUserMenuOpen(false);
        await logoutService();
        navigate('/');
    };

    // Load Profile and handle storage changes
    useEffect(() => {
        getUser();

        const loadProfile = () => {
            const saved = getCachedProfile();
            setUserProfile(saved || null);
        };

        loadProfile();

        // `storage` covers other tabs; AUTH_CHANGE_EVENT covers this one.
        window.addEventListener('storage', loadProfile);
        window.addEventListener(AUTH_CHANGE_EVENT, getUser);
        return () => {
            window.removeEventListener('storage', loadProfile);
            window.removeEventListener(AUTH_CHANGE_EVENT, getUser);
        };
    }, []);

    // Click Outside to Close Search, Notif & User Menu Popovers
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        if (isSearchOpen || notifOpen || userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, notifOpen, userMenuOpen]);

    const isProfileComplete = !!(userProfile && userProfile.isProfileComplete);
    const userCity = (userProfile && userProfile.city) ? userProfile.city : (activeCity?.city || selectedCityName || 'Khairpur');

    const currentWeather = liveWeather || { windSpeed: parseFloat(activeCity?.wind || '11.2') };
    const windSpeedThreshold = 15;

    const isCleared = notificationsCleared || localStorage.getItem('notificationsCleared') === 'true';
    const baseNotifications = [];

    if (!isCleared) {
        if (!isProfileComplete) {
            baseNotifications.push({
                id: 1,
                icon: '⚠️',
                title: 'Complete Farmer Profile',
                message: 'Fill WhatsApp number & crop details for real-time spray alerts.',
                link: '/complete-profile'
            });
        }

        // Dynamic weather warning push wrapped in condition checking notificationsCleared !== 'true'
        if (currentWeather.windSpeed > windSpeedThreshold) {
            baseNotifications.push({
                id: 2,
                icon: '🌦️',
                title: `Weather Warning (${activeCity?.city || userCity})`,
                message: `High wind speed detected (${currentWeather.windSpeed} km/h). Spraying not advised.`,
                link: '/outbreak-radar'
            });
        }

        baseNotifications.push({
            id: 3,
            icon: '🌾',
            title: 'Alibaba Qwen LLM Update',
            message: 'Regional advisory engine now active in 6 languages.',
            link: '/dashboard'
        });
    }

    const activeNotifications = baseNotifications.map(n => ({
        ...n,
        unread: !readNotifIds.includes(n.id) && (n.id === 1 || n.id === 2)
    }));

    const unreadCount = activeNotifications.filter(n => n.unread).length;

    const filteredSearchItems = searchQuery.trim() === ''
        ? SEARCH_ITEMS.slice(0, 4)
        : SEARCH_ITEMS.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 4);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleNotif = () => {
        setNotifOpen(!notifOpen);
    };

    const markAllRead = () => {
        const allIds = baseNotifications.map(n => n.id);
        setReadNotifIds(allIds);
        setNotificationsCleared(true);
        localStorage.setItem('notificationsCleared', 'true');
        localStorage.setItem('readNotifIds', JSON.stringify(allIds));
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
                    {/* <li><NavLink to="/badge-progress" onClick={() => setMenuOpen(false)}>Badges</NavLink></li>
                    <li><NavLink to="/ar" onClick={() => setMenuOpen(false)}>3D Gallery</NavLink></li> */}
                </ul>

                <div className="nav-actions">
                    {/* SEARCH BUTTON + DROPDOWN WRAPPER WITH REF */}
                    <div ref={searchRef} style={{ position: 'relative', display: 'inline-block' }}>
                        <button 
                            className="icon-btn" 
                            title="Search"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <FiSearch />
                        </button>

                        {/* SEARCH DROPDOWN POPOVER */}
                        {isSearchOpen && (
                            <div 
                                className="absolute top-16 right-0 w-80 bg-white shadow-lg rounded-xl border border-gray-100 p-3 z-50 animate-fadeIn"
                                style={{
                                    position: 'absolute',
                                    top: '56px',
                                    right: 0,
                                    width: '320px',
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                                    border: '1px solid #f1f5f9',
                                    padding: '12px',
                                    zIndex: 1100,
                                }}
                            >
                                <div style={{ position: 'relative', marginBottom: '8px' }}>
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Search diseases, tools, or farmers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                                        style={{
                                            width: '100%',
                                            background: '#f8fafc',
                                            border: '1.5px solid #e2e8f0',
                                            borderRadius: '10px',
                                            padding: '8px 12px',
                                            fontSize: '0.85rem',
                                            color: '#0f172a',
                                            outline: 'none',
                                            fontFamily: "'DM Sans', sans-serif"
                                        }}
                                    />
                                </div>

                                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', padding: '4px 6px', marginBottom: '4px', textAlign: 'left' }}>
                                    {searchQuery.trim() ? 'Search Results' : 'Quick Access'}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '250px', overflowY: 'auto' }}>
                                    {filteredSearchItems.length > 0 ? (
                                        filteredSearchItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    setIsSearchOpen(false);
                                                    setSearchQuery('');
                                                    navigate(item.path);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '8px 10px',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    background: 'transparent'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#f0fdf4';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                                                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                                        {item.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'DM Sans', sans-serif" }}>
                                                        {item.desc}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#e2e8f0', color: '#475569', textTransform: 'uppercase' }}>
                                                    {item.category}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>
                                            No results found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
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
                                    {activeNotifications.length > 0 ? (
                                        activeNotifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                className={`notif-item ${n.unread ? 'unread' : ''}`}
                                                onClick={() => {
                                                    const updated = [...readNotifIds, n.id];
                                                    setReadNotifIds(updated);
                                                    localStorage.setItem('readNotifIds', JSON.stringify(updated));
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
                                        ))
                                    ) : (
                                        <div style={{ padding: '16px 12px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif" }}>
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* <button className="icon-btn accent-icon" title="Quick Tools"><FiGrid /></button> */}

                    {/* USER PROFILE AVATAR WITH CLICKABLE DROPDOWN MENU */}
                    {Object.keys(userdata).length > 0 ? (
                        <div ref={userMenuRef} style={{ position: 'relative', display: 'inline-block' }}>
                            <div
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                title={userdata.displayName || "Manage Profile"}
                            >
                                {userdata?.image && !imgError ? (
                                    <img 
                                        src={userdata.image} 
                                        className="user-avatar-btn" 
                                        alt={userdata.displayName || "User Profile"} 
                                        referrerPolicy="no-referrer"
                                        onError={() => setImgError(true)}
                                        style={{ border: '2px solid #059669', transition: 'all 0.2s ease' }}
                                    />
                                ) : (
                                    <div className="user-avatar-fallback">
                                        <FiUser />
                                    </div>
                                )}
                            </div>

                            {/* DROPDOWN MENU */}
                            {userMenuOpen && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 12px)',
                                        right: 0,
                                        width: '240px',
                                        background: '#ffffff',
                                        borderRadius: '20px',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                                        border: '1px solid #e2e8f0',
                                        padding: '12px',
                                        zIndex: 1000,
                                    }}
                                >
                                    {/* User Info Header */}
                                    <div style={{ padding: '8px 12px 12px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {userdata.displayName || 'Registered Farmer'}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {userdata.email || 'Verified Account'}
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <NavLink
                                            to="/complete-profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                borderRadius: '12px',
                                                color: '#1e293b',
                                                textDecoration: 'none',
                                                fontSize: '0.88rem',
                                                fontWeight: 700,
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#f0fdf4';
                                                e.currentTarget.style.color = '#059669';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#1e293b';
                                            }}
                                        >
                                            <FiSettings style={{ color: '#059669', fontSize: '1.1rem' }} />
                                            <span>Manage Profile</span>
                                        </NavLink>

                                        <NavLink
                                            to="/saved-plants"
                                            onClick={() => setUserMenuOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                borderRadius: '12px',
                                                color: '#1e293b',
                                                textDecoration: 'none',
                                                fontSize: '0.88rem',
                                                fontWeight: 700,
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#f0fdf4';
                                                e.currentTarget.style.color = '#059669';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#1e293b';
                                            }}
                                        >
                                            <FaLeaf style={{ color: '#059669', fontSize: '1rem' }} />
                                            <span>Saved Plants</span>
                                        </NavLink>

                                        <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }}></div>

                                        <button
                                            onClick={logout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                borderRadius: '12px',
                                                color: '#dc2626',
                                                background: 'transparent',
                                                border: 'none',
                                                width: '100%',
                                                textAlign: 'left',
                                                fontSize: '0.88rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <FiLogOut style={{ fontSize: '1.1rem' }} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
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
