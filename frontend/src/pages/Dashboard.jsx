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
  const [eventMessage, setEventMessage] = useState("");
  const [affectedAreas, setAffectedAreas] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null); 
  
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
    navigate("/");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");  // Assuming your token is saved in localStorage
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location[address]", location.address);
    formData.append("location[latitude]", location.latitude);
    formData.append("location[longitude]", location.longitude);
    formData.append("date", date);
    formData.append("eventType", eventType);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5001/api/events/create", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Event creation failed");
      }

      const data = await response.json();
      setEventMessage("Your event has been successfully submitted. Admin will review and approve it soon.");
      setTimeout(() => {
        setEventMessage(""); // Hide message after 5 seconds
      }, 5000);
      setTitle(""); // Clear form fields
      setDescription("");
      setLocation({ address: "", latitude: "", longitude: "" });
      setDate("");
      setEventType("volunteer");
      setImage(null);
    } catch (error) {
      setEventMessage("Failed to create event.");
    }
  };

   useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchUser = async () => {
        try {
          const res = await fetch("http://localhost:5001/api/auth/me", {
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      };
      fetchUser();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchAffectedAreas();
  }, []);

  const fetchAffectedAreas = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/affected-areas/events");
      const data = await res.json();
      setAffectedAreas(data);
    } catch (error) {
      console.error("Error fetching affected areas:", error);
    }
  };

  const handleAddComment = async (affectedAreaId) => {
    if (!newComment.trim()) {
      setMessage("Comment cannot be empty.");
      return;
    }

    const token = localStorage.getItem("token");
    const commentData = {
      text: newComment,
      affectedArea: affectedAreaId,
      event: null
    };
    const res = await fetch("http://localhost:5001/api/comments/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    });

    if (res.ok) {
      setMessage("Comment added successfully.");
      setNewComment(""); // Clear comment input field
      fetchAffectedAreas();
      fetchApprovedEvents();
      console.log('Comment Data:', commentData);
    } else {
      setMessage("Error adding comment.");
    }
  };

  return (
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

          {eventMessage && (
            <div className="popup-message">
              <p>{eventMessage}</p>
            </div>
          )}
        </div>

        
        <div className="event-list">
        <h2>Affected areas near you</h2>
        {affectedAreas.map((area) => (
          
  <div key={area._id} className="event-card">
  
    <h3>{area.title}</h3>
    <p>{area.description}</p>
    <img src={`http://localhost:5001/${area.image}`} alt={area.title} className="event-image" />
    <p><strong>Location:</strong> {area.location.address}</p>
    <p><strong>Date:</strong> {new Date(area.date).toLocaleDateString()}</p>

    {/* Comments Section */}
    {/* Display Comments for each affected area */}
{/* Comments Section */}
<div className="comments-section">
  <h4>Comments</h4>
  {area.comments && area.comments.length > 0 ? (
    area.comments.map((comment) => (
      <div key={comment._id}>
        <strong>{comment.user.name}:</strong> {comment.text}
      </div>
    ))
  ) : (
    <p>No comments yet.</p>
  )}

  {/* Display comment input field if logged in */}
  {user ? (
    <div className="comment-input">
      <textarea 
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment"
      />
      <button onClick={() => handleAddComment(area._id)}>Add Comment</button>
    </div>
  ) : (
    <p>Please log in to add comments.</p>
  )}
</div>


  </div>
))}

        </div>

        <div className="approved-events-container">
          <h2>Approved Aid/Volunteer Events</h2>
          <div className="event-list">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p><strong>Location:</strong> {event.location.address}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <button>View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default Dashboard;
