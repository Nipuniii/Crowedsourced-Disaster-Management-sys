import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import './Dashboard.css';
import { Link } from "react-router-dom";


const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ address: "", latitude: "", longitude: "" });
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState("volunteer");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); 

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  const fetchApprovedEvents = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/events/approved");
      if (!response.ok) {
        throw new Error("Failed to fetch approved events.");
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setMessage("Failed to load approved events.");
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");  // Assuming your token is saved in localStorage
    console.log("Sending Token:", token); 
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location[address]", location.address);
    formData.append("location[latitude]", location.latitude);
    formData.append("location[longitude]", location.longitude);
    formData.append("date", date);
    formData.append("eventType", eventType);
    if (image) formData.append("image", image);

    formData.forEach((value, key) => {
      console.log(key, value);
    });
    
    
  
    try {
      const response = await fetch("http://localhost:5001/api/events/create", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating event:", errorData);
        throw new Error("Event creation failed");
      }
  
      const data = await response.json();
      console.log(data);
      setMessage(data.message);
    } catch (error) {
      console.error("Error creating event:", error);
      setMessage("Failed to create event.");
    }
  };
  

  return (
    <>
    <div className="dashboard-container">
      <h1>User Dashboard</h1>

      <Link to="/profile" className="profile-link-card">
      <div className="profile-card">
        <h3>View Profile</h3>
       
      </div>
      </Link>



      <div className="form-and-events">
        <div className="event-form-container">
          <h2>Create an Event</h2>
          <form onSubmit={handleCreateEvent} className="event-form" encType="multipart/form-data">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <input type="text" placeholder="Address" value={location.address} onChange={(e) => setLocation({ ...location, address: e.target.value })} required />
            <input type="number" placeholder="Latitude" value={location.latitude} onChange={(e) => setLocation({ ...location, latitude: e.target.value })} required />
            <input type="number" placeholder="Longitude" value={location.longitude} onChange={(e) => setLocation({ ...location, longitude: e.target.value })} required />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option value="volunteer">Volunteer</option>
              <option value="aid">Aid</option>
            </select>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <button type="submit">Submit Event</button>
          </form>
          {message && <p>{message}</p>}
        </div>

        <div className="approved-events-container">
          <h2>Approved Events</h2>
          <div className="event-list">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p><strong>Location:</strong> {event.location.address}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Event Type:</strong> {event.eventType}</p>
                <button>View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  </>
  );
};

export default Dashboard;