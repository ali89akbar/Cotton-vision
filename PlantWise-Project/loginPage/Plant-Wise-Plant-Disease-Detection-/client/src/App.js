import './App.css';
import Home from './Components/Home';
import Headers from './Components/Headers';
import Login from './Components/Login';
import CompleteProfile from './Components/CompleteProfile';
import Dashboard from './Components/Dashboard';
import SavedPlants from './Components/SavedPlants';
import OutbreakRadar from './Components/OutbreakRadar';
import Error from './Components/Error';
import Lenis from '@studio-freight/lenis';
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SocialMedia from './Components/SocialMedia';
import Footer from './Components/Footer';
import Chatbot from './Components/Chatbot';
import { NotificationProvider } from './Components/NotificationContext';
import { WeatherProvider } from './Components/WeatherContext';

const LenisSmoothScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable global Lenis on fixed-viewport pages like /social-media
    if (pathname === '/social-media') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.scrollTo(0, { immediate: false });

    return () => {
      lenis.destroy();
    };
  }, [pathname]);

  return null;
};

function AppContent() {
  const location = useLocation();

  // Array of route paths where the global footer should be hidden
  const hideFooterRoutes = [
    '/login',
    '/signup',
    '/register',
    '/complete-profile',
    '/social-media'
  ];

  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <LenisSmoothScroll />
      <Headers />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CompleteProfile />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/outbreak-radar" element={<OutbreakRadar />} />
        <Route path="/social-media" element={<SocialMedia />} /> 
        <Route path="/saved-plants" element={<SavedPlants />} />
        <Route path="*" element={<Error />} />
      </Routes>
      {!shouldHideFooter && <Footer />}
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <WeatherProvider>
        <AppContent />
      </WeatherProvider>
    </NotificationProvider>
  );
}

export default App;
