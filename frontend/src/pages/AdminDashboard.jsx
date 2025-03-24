import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: {
      address: "",
      latitude: "",
      longitude: ""
    },
    date: "",
    image: null
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEvent, setUpdatedEvent] = useState({});
  const [message, setMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility
  const [modalMessage, setModalMessage] = useState(""); // To store the message for the modal

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

  // Handle new event creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log("Sending Token:", token); 

    const formData = new FormData();
    formData.append("title", newEvent.title);
    formData.append("description", newEvent.description);
    formData.append("location[address]", newEvent.location.address);
    formData.append("location[latitude]", newEvent.location.latitude);
    formData.append("location[longitude]", newEvent.location.longitude);
    formData.append("date", newEvent.date);
    if (newEvent.image) formData.append("image", newEvent.image);

    formData.forEach((value, key) => {
      console.log(key, value);
    });
    

    try {
      const response = await fetch("http://localhost:5001/api/affected-areas/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage("Error: Event creation failed.");
        console.error("Error data: ", errorData);
        return;
      }

      const data = await response.json();
      setModalMessage("Event created successfully!");
      setIsModalVisible(true);
      fetchPendingEvents(); // Refresh the list of pending events
      setNewEvent({ title: "", description: "", location: { address: "", latitude: "", longitude: "" }, date: "", image: null }); // Reset form
    } catch (error) {
      console.error("Error:", error);
      setModalMessage("Failed to create event.");
    setIsModalVisible(true);
    }
  };

  const Modal = ({ message, onClose }) => {
    return (
      <div className="modal">
        <div className="modal-content">
          <p>{message}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
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

  // View Event (show event details in a modal or popup)
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
  };

  // Edit Event
  const handleEditEvent = (event) => {
    setIsEditing(true);
    setUpdatedEvent(event); // Set event details in the form
  };

  // Save changes to the event after editing
  const handleSaveEvent = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You need to be logged in to edit.");
      return;
    }

    await fetch(`http://localhost:5001/api/events/${updatedEvent._id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedEvent),
    })
    .then((response) => {
      if (response.ok) {
        fetchPendingEvents();  // Refresh the list after saving changes
        setIsEditing(false);    // Close the edit form
        setMessage("Event updated successfully");
      } else {
        setMessage("Failed to save changes");
      }
    })
    .catch((error) => {
      setMessage("Error saving event");
    });
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      {/* Create a new event form */}
      <div className="create-event-container">
        <h2>Create New Affected Area (Event)</h2>
        <form onSubmit={handleCreateEvent}>
          <input
            type="text"
            placeholder="Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Location Address"
            value={newEvent.location.address}
            onChange={(e) => setNewEvent({ ...newEvent, location: { ...newEvent.location, address: e.target.value } })}
            required
          />
          <input
            type="number"
            placeholder="Latitude"
            value={newEvent.location.latitude}
            onChange={(e) => setNewEvent({ ...newEvent, location: { ...newEvent.location, latitude: e.target.value } })}
            required
          />
          <input
            type="number"
            placeholder="Longitude"
            value={newEvent.location.longitude}
            onChange={(e) => setNewEvent({ ...newEvent, location: { ...newEvent.location, longitude: e.target.value } })}
            required
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            required
          />
          <input type="file" accept="image/*" onChange={(e) => setNewEvent({ ...newEvent, image: e.target.files[0] })} />
          <button type="submit">Submit Event</button>
        </form>
      </div>

      {/* Show Modal Popup */}
    {isModalVisible && (
      <Modal message={modalMessage} onClose={() => setIsModalVisible(false)} />
    )}


      {/* Display Pending Events */}
      <h2>Pending Aid/Volunteer Events</h2>
      {pendingEvents.length === 0 ? (
        <p>No pending events</p>
      ) : (
        <ul className="event-list">
          {pendingEvents.map((event) => (
            <li key={event._id} className="event-item">
              <div className="event-card">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <button onClick={() => handleViewEvent(event)}>View</button>
                <button onClick={() => handleEditEvent(event)}>Edit</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Event Details Modal/Popup for Viewing */}
      {selectedEvent && !isEditing && (
        <div className="event-details-popup">
          <h2>Event Details: {selectedEvent.title}</h2>
          <p>{selectedEvent.description}</p>
          <p><strong>Location:</strong> {selectedEvent.location.address}</p>
          <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
          <img src={`http://localhost:5001/${selectedEvent.image}`} alt={selectedEvent.title} className="event-image" />
          <div id="map" style={{ width: "100%", height: "300px" }}></div> {/* Google Map Placeholder */}
          <button onClick={() => setSelectedEvent(null)}>Close</button>
        </div>
      )}

      {/* Event Edit Form (Admin can edit the event details here) */}
      {isEditing && (
        <div className="edit-event-form">
          <h2>Edit Event: {updatedEvent.title}</h2>
          <input
            type="text"
            value={updatedEvent.title}
            onChange={(e) => setUpdatedEvent({ ...updatedEvent, title: e.target.value })}
            placeholder="Title"
          />
          <textarea
            value={updatedEvent.description}
            onChange={(e) => setUpdatedEvent({ ...updatedEvent, description: e.target.value })}
            placeholder="Description"
          />
          <input
            type="text"
            value={updatedEvent.location.address}
            onChange={(e) => setUpdatedEvent({ ...updatedEvent, location: { ...updatedEvent.location, address: e.target.value } })}
            placeholder="Address"
          />
          <input
            type="date"
            value={updatedEvent.date}
            onChange={(e) => setUpdatedEvent({ ...updatedEvent, date: e.target.value })}
          />
          <button onClick={handleSaveEvent}>Save Changes</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>

          {/* Approve Button */}
          <button onClick={() => handleApproveEvent(updatedEvent._id)} className="approve-button">
            Approve Event
          </button>
        </div>
      )}

      {/* Display Messages */}
      {message && <p className="message">{message}</p>}
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default AdminDashboard;
