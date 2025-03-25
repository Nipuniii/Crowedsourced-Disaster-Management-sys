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
  const [eventRadius, setEventRadius] = useState("");
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
    formData.append("eventRadius", eventRadius); 
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
      setEventRadius("");
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
          const res = await fetch('http://localhost:5001/api/auth/me', {
            headers: { "Authorization": `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            console.log("User Data:", data); 
            setUser(data);
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

      // Fetch comments for each affected area
    const affectedAreasWithComments = await Promise.all(data.map(async (area) => {
      const commentsRes = await fetch(`http://localhost:5001/api/comments/${area._id}`);
      const commentsData = await commentsRes.json();
      area.comments = commentsData;
      return area;
    }));

    setAffectedAreas(affectedAreasWithComments);
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
              <option value="disaster">Disaster</option>
            </select>
            <input type="number" placeholder="Event Radius (in meters)" value={eventRadius} onChange={(e) => setEventRadius(e.target.value)} required />
            <label>Upload Evidences (Images)</label>
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
        
        {/* Comment Input */}
        {user && (
          <div className="comment-input">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
            />
            <button onClick={() => handleAddComment(area._id)}>Add Comment</button>
          </div>
        )}
        {!user && <p>Please log in to add comments.</p>}
      </div>
    </div>
  ))}
</div>



        <div className="approved-events-container">
          <h2>Approved Aid/Volunteer/Disaster Events</h2>
          <div className="event-list">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p><strong>Location:</strong> {event.location.address}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                {event.image && <img src={`http://localhost:5001/${event.image}`} alt={event.title} className="event-image" />}
                <button>View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="logout-button">Logout</button>

      <div className="alert-message">
  If you are gathering volunteers to help in need, make sure to coordinate with the local administration.
</div>

<footer className="home-footer">

  <div className="footer-contact-info">
    <p><strong>Call Center:</strong> 117</p>
    <p><strong>General:</strong> +94 112 136 136</p>
    <p><strong>Emergency Operation Center:</strong> +94 112 136 222 / +94 112 670 002</p>
    <p><strong>Fax:</strong> +94 11 2670079</p>
  </div>

  
  <div className="footer-links">
    <p><a href="https://meteo.gov.lk/index.php?option=com_content&view=article&id=9&Itemid=289&lang=en" target="_blank" rel="noopener noreferrer">Weather Forecast Department</a></p>
    <p><a href="https://www.dmc.gov.lk/index.php?lang=en" target="_blank" rel="noopener noreferrer">Disaster Management Centre</a></p>
  </div>
  <p>&copy; 2025 Disaster Management System | All Rights Reserved</p>
</footer>
    </div>
  );
};

export default Dashboard;
