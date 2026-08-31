import axios from 'axios';
import React, { useEffect } from 'react';
import { ImageUpload } from './ImageDrop';

const Dashboard = () => {
  const getUser = async () => {
    try {
      await axios.get("http://localhost:6005/login/sucess", { withCredentials: true });
    } catch (error) {
      console.log("Demo mode: running local scanner without OAuth login session");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <ImageUpload />
    </div>
  );
};

export default Dashboard;