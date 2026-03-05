export function EventCard({ event }) {
    return (
        <div>
            <h2>{event.name}</h2>
            <p>{event.description}</p>
            <p>{event.date}</p>
            <p>{event.time}</p>
            <p>{event.location}</p>
            <img src={event.image} alt={event.name} />
            <button>Register for Event</button>
            
        </div>
    );
}

export default EventCard
