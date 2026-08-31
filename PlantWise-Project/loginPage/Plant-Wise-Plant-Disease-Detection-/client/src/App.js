import './App.css';
import Home from './Components/Home';
import Headers from './Components/Headers';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import SavedPlants from './Components/SavedPlants'; // Import the new component
import Error from './Components/Error';
import { Routes, Route } from 'react-router-dom';
import SocialMedia from './Components/SocialMedia';
import BadgeProgressPage from './Components/BadgeProgressPage';
import ARViewer from './Components/ARViewer';
import PlantGallery from './Components/PlantGallery';
import { NotificationProvider } from './Components/NotificationContext';


function App() {
    return (
        <NotificationProvider>
            <Headers />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/social-media" element={<SocialMedia />} /> 
                <Route path="/saved-plants" element={<SavedPlants />} /> {/* Add this route */}
                <Route path="/badge-progress" element={<BadgeProgressPage />} />
                <Route path='/ar' element={<PlantGallery />}/>
                <Route path='/ar-viewer' element={<ARViewer />}/>
                <Route path="*" element={<Error />} />
            </Routes>
        </NotificationProvider>
    );
}

export default App;
