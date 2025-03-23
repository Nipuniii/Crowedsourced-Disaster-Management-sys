import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/auth/profile', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setUserData(data);
        } else {
          setMessage(data.error);
        }
      } catch (err) {
        setMessage("Error fetching user data");
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <div className="profile-info">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Role:</strong> {userData.role}</p>
      </div>
      <button onClick={handleLogout} className="logout-button">Logout</button>
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default ProfilePage;
