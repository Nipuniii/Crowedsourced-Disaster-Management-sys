import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    const response = await fetch("http://localhost:5001/api/events/pending");
    const data = await response.json();
    console.log(data);  
    //setPendingEvents(data.filter(event => event.status === "pending"));
    setPendingEvents(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleApproveEvent = async (eventId) => {
    const token = localStorage.getItem("token");
    console.log("Sending Token:", token); 

    if (!token) {
      console.error("Token not found");
      return;
    }

    await fetch(`http://localhost:5001/api/events/approve/${eventId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,  // Make sure this is included
        "Content-Type": "application/json",  // Optional
      },
    })
    .then(response => {
      if (response.ok) {
        console.log("Event approved!");
        fetchPendingEvents();
      } else {
        console.error("Failed to approve event");
      }
    })
    .catch(error => console.error("Error:", error));

    fetchPendingEvents();
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <h2>Pending Events</h2>
      {pendingEvents.length === 0 ? (
      <p>No pending events</p>
    ) : (
      <ul className="event-list">
        {pendingEvents.map(event => (
          <li key={event._id} className="event-item">
            {event.title} - {event.location.address}
            <button className="approve-button" onClick={() => handleApproveEvent(event._id)}>Approve</button>
          </li>
        ))}
      </ul>
    )}
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default AdminDashboard;
