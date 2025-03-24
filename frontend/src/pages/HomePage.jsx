import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './HomePage.css'; // Ensure this CSS file is correctly linked


const HomePage = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null); // For checking if the user is logged in
  const [affectedAreas, setAffectedAreas] = useState([]);


  // Fetching the approved events from the API
  useEffect(() => {
    const fetchApprovedEvents = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/events/approved");
        const data = await res.json();
        if (res.ok) {
          setApprovedEvents(data);
          initMap(data); 
        }
      } catch (error) {
        console.error("Error fetching approved events:", error);
      }
    };

    fetchApprovedEvents();
  }, []);

  const loadGoogleMaps = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBsnZGyHm-yRo3i4ISbsMz-Dmq5kuJy9I8&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };
  
  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const initMap = (events) => {
    // Initialize the Google map
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 6.9271, lng: 79.8612 }, // Default to Sri Lanka center
      zoom: 10,
    });
  
    // Loop through both event types (affected and volunteer) and add markers
    events.forEach((event) => {
      const isAffectedArea = event.title.includes("Flooding") || event.title.includes("Disaster");  // This is just an example condition
  
      // Set a different marker icon based on event type
      const markerIcon = isAffectedArea
        ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"  // Red marker for affected area
        : "http://maps.google.com/mapfiles/ms/icons/green-dot.png"; // Green marker for aid/volunteer
  
      // Create the marker for the event
      const marker = new window.google.maps.Marker({
        position: { lat: event.location.latitude, lng: event.location.longitude },
        map: map,
        title: event.title,
        icon: markerIcon,  // Use the appropriate icon based on the event type
      });
  
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h4>${event.title}</h4>
            <p>${event.description}</p>
            <a href="/event/${event._id}">View Details</a>
          </div>
        `,
      });
  
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });
  };
  

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch user data if token is present
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
    }
  }, []);

  const fetchEvents = async () => {
    try {
      // Fetching both affected areas and aid/volunteer events
      const affectedRes = await fetch("http://localhost:5001/api/affected-areas/events");
      const affectedData = await affectedRes.json();
      const volunteerRes = await fetch("http://localhost:5001/api/events/approved");
      const volunteerData = await volunteerRes.json();
  
      if (affectedRes.ok && volunteerRes.ok) {
        // Combine both sets of events
        const allEvents = [...affectedData, ...volunteerData];
        setApprovedEvents(volunteerData);
        setAffectedAreas(affectedData);
        initMap(allEvents); // Call initMap with all events
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);
  

  // Fetch affected areas (disaster events)
  useEffect(() => {
    fetchAffectedAreas();
  }, []);

  const fetchAffectedAreas = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/affected-areas/events");
      const data = await res.json();
      setAffectedAreas(data);
      initMap(data);
    } catch (error) {
      console.error("Error fetching affected areas:", error);
    }
  };

  const handleAddComment = async (affectedAreaId) => {
    if (!newComment.trim()) {
      setMessage("Comment cannot be empty.");
      return;
    }

    if (!user) {
      setMessage("You must be logged in to comment.");
      return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5001/api/comments/add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ affectedArea: affectedAreaId, text: newComment }),
    });

    if (res.ok) {
      setMessage("Comment added successfully.");
      setNewComment(""); // Clear comment input field
      fetchAffectedAreas(); // Re-fetch to get updated comments
    } else {
      setMessage("Error adding comment.");
    }
  };

  return (
    <div className="home-page">
    

      {/* Natural Disasters Information Section */}
      <section className="disaster-info mt-100 mb-200">
        
        <h2>Welcome to the Disaster Management System</h2>
        <p>Your resource for disaster preparedness, response, and recovery.</p>
        <header className="home-header">
        <div className="auth-link-top">
          <Link to="/login" className="auth-link">Login</Link>
          <Link to="/register" className="auth-link">Register</Link>
          </div>
          </header>
        <h2>Natural Disasters in Sri Lanka</h2>
        <p>Sri Lanka is vulnerable to a variety of natural disasters, which have profound impacts on the economy, infrastructure, and population. Understanding these disasters is crucial for effective disaster management and preparedness.</p>
        
        <div className="disaster-list">
          <div className="disaster-card">
            <h3>Floods</h3>
            <p>Heavy monsoonal rains cause frequent flooding, especially in the southwestern and north-central regions. These floods lead to displacement, property damage, and health risks due to waterborne diseases.</p>
          </div>
          <div className="disaster-card">
            <h3>Cyclones</h3>
            <p>Cyclones bring high winds, heavy rains, and storm surges that damage coastal infrastructure and disrupt livelihoods, especially in coastal and fishing communities.</p>
          </div>
          <div className="disaster-card">
            <h3>Landslides</h3>
            <p>Landslides often occur in the hilly and mountainous areas of Sri Lanka, especially in the central and southern regions. These events cause significant loss of life and property, as well as disrupt transportation networks.</p>
          </div>
          <div className="disaster-card">
            <h3>Droughts</h3>
            <p>Prolonged droughts, especially in the northern, north-central, and eastern regions, lead to severe water shortages, crop failures, and food insecurity.</p>
          </div>
        </div>
      </section>

      {/* Disaster Management Tips Section */}
      <section className="management-tips">
        <h2>Disaster Management Tips</h2>
        <ul>
          <li><strong>Prepare an Emergency Kit:</strong> Keep essentials like water, food, medications, and documents ready for emergencies.</li>
          <li><strong>Stay Informed:</strong> Stay updated with the latest disaster alerts and warnings through official channels.</li>
          <li><strong>Have an Evacuation Plan:</strong> Know multiple routes out of your area and establish a meeting place for family members.</li>
          <li><strong>Learn First Aid:</strong> Be equipped to assist others during a disaster with basic first aid knowledge.</li>
        </ul>
      </section>

      <section className="map-section">
        <div id="map" style={{ width: "100%", height: "400px" }}></div>
      </section>  

      <h2>Affected areas </h2>
      {affectedAreas.map((area) => (
            <div key={area._id} className="event-card">
              <h3>{area.title}</h3>
              <p>{area.description}</p>
              <img src={`http://localhost:5001/${area.image}`} alt={area.title} />
              <p><strong>Location:</strong> {area.location.address}</p>
              <p><strong>Date:</strong> {new Date(area.date).toLocaleDateString()}</p>

              {/* Comments Section */}
              <div>
                <h4>Comments</h4>
                {area.comments && area.comments.map((comment) => (
                  <div key={comment._id}>
                    <strong>{comment.user.name}:</strong> {comment.text}
                  </div>
                ))}
          </div>
        </div>
      ))}

      {/* Display the Approved Events */}
      <section className="approved-events">
        <h2>Approved Aid/Volunteer Events</h2>
        <div className="event-list">
          {approvedEvents.length === 0 ? (
            <p>No approved events available at the moment.</p>
          ) : (
            approvedEvents.map(event => (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                {event.image && <img src={`http://localhost:5001/${event.image}`} alt={event.title} className="event-image" />}
                <p><strong>Location:</strong> {event.location.address}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <a href={`/event/${event._id}`} className="view-details-button">View Details</a>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2025 Disaster Management System | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HomePage;
