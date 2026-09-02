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
import BadgeProgressPage from './Components/BadgeProgressPage';
import ARViewer from './Components/ARViewer';
import PlantGallery from './Components/PlantGallery';
import Footer from './Components/Footer';
import { NotificationProvider } from './Components/NotificationContext';

const LenisSmoothScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
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

function App() {
    return (
        <NotificationProvider>
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
                <Route path="/badge-progress" element={<BadgeProgressPage />} />
                <Route path='/ar' element={<PlantGallery />}/>
                <Route path='/ar-viewer' element={<ARViewer />}/>
                <Route path="*" element={<Error />} />
            </Routes>
            <Footer />
        </NotificationProvider>
    );
}

export default App;
