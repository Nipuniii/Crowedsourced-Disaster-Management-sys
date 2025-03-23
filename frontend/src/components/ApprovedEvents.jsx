import { useState, useEffect } from "react";
import './ApprovedEvents.css';

const ApprovedEvents = () => {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");

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

  return (
    <div className="approved-events-container">
      <h2>Approved Events</h2>
      {message && <p>{message}</p>}
      <ul className="event-list">
        {events.map(event => (
          <li key={event._id} className="event-item">
            {event.title} - {event.location.address} on {new Date(event.date).toLocaleDateString()} ({event.eventType})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApprovedEvents;
