import React from 'react'
import EventCard from '../components/events/EventCard'
import '../assets/styles/Event.css'

export function Browse() {
    const Event1 = { name: "Networking Event", date: "2026-03-05", time: "12:00 PM", location: "Location 1", description: "Connect and network with many professionals in the Developer field.", image: "https://via.placeholder.com/150" }
    const Event2 = { name: "Debo/Birthday Event", date: "2026-03-19", time: "5:00 PM", location: "Location 5", description: "John Doe, Debutant!", image: "https://via.placeholder.com/150" }
    const Event3 = { name: "Wedding Reception", date: "2026-05-27", time: "5:00 PM", location: "Location 2", description: "John and Jane Doe, Wedding!", image: "https://via.placeholder.com/150" }

    const events = [Event1, Event2, Event3];

    return (
        <>
            {events.map((event) => (
                <EventCard key={event.name} event={event} />
            ))}
        </>
    )
}

export default Browse 