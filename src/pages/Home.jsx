import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../assets/styles/Home.css'

const Home = () => {
    // State to hold events, ready for future API integration
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Replace this simulated fetch with an actual API call later
        // e.g. fetch('/api/events/featured').then(res => res.json()).then(data => setFeaturedEvents(data))

        const fetchEvents = async () => {
            // Simulated fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Placeholder data for featured events (max 5)
            const mockData = [
                { id: 1, name: "Summer Networking Mixer", date: "Aug 15", category: "Networking", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80" },
                { id: 2, name: "Community Basketball Tournament", date: "Sep 02", category: "Sports", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&q=80" },
                { id: 3, name: "Annual Wedding Expo", date: "Sep 20", category: "Wedding", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80" },
                { id: 4, name: "Local Artists Showcase", date: "Oct 05", category: "Arts", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80" },
                { id: 5, name: "Tech Startup Pitch Night", date: "Oct 12", category: "Business", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500&q=80" },
            ];

            setFeaturedEvents(mockData);
            setIsLoading(false);
        };

        fetchEvents();
    }, []);

    return (
        <div className="home-container">
            {/* Section 1: Hero Introductory Section */}
            <section className="hero">
                <div className="hero-glow"></div>
                <span className="eyebrow">Bookit Community</span>
                <h1>Discover local events & connect.</h1>
                <p>The ultimate community ticketing management system to explore, host, and manage events happening near you.</p>
                <div className="hero-actions">
                    <Link to="/Browse" className="btn btn-primary btn-lg">Explore Events</Link>
                    <Link to="/Organizer" className="btn btn-secondary btn-lg">Host an Event</Link>
                </div>
            </section>

            {/* Section 2: Types of Events */}
            <div className="wrap">
                <section className="section-sm text-center">
                    <div className="section-header">
                        <h6>Categories</h6>
                        <h2>Event Types We Host</h2>
                        <p>From celebrations to professional gatherings.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {/* Reusing badge styles from the main system if they exist, or standard Tailwind */}
                        <span className="badge badge-violet text-base px-4 py-2">💍 Wedding</span>
                        <span className="badge badge-amber text-base px-4 py-2">🎂 Birthday</span>
                        <span className="badge badge-green text-base px-4 py-2">🤝 Networking</span>
                        <span className="badge badge-red text-base px-4 py-2">🏀 Basketball Tournament</span>
                        <span className="badge badge-stone text-base px-4 py-2">🎨 Arts & Craft</span>
                    </div>
                </section>

                {/* Section 3: Featured Events (Max 5) */}
                <section className="section">
                    <div className="section-header">
                        <h6>Featured</h6>
                        <h2>Upcoming Events</h2>
                        <p>Secure your spot or grab a ticket before they run out.</p>
                    </div>

                    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                        {isLoading ? (
                            <div className="text-center py-10 text-stone-500">Loading events...</div>
                        ) : featuredEvents.length === 0 ? (
                            <div className="text-center py-10 text-stone-500">No events found.</div>
                        ) : (
                            featuredEvents.map((evt) => (
                                <div key={evt.id} className="card card-warm flex flex-col sm:flex-row overflow-hidden group">
                                    <div className="sm:w-1/3 h-48 sm:h-auto relative overflow-hidden">
                                        <img src={evt.image} alt={evt.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        {/* Overlay register button on hover */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button className="btn btn-primary">Register Now</button>
                                        </div>
                                    </div>
                                    <div className="card-body sm:w-2/3 flex flex-col justify-center">
                                        <span className="badge badge-violet self-start mb-2">{evt.category}</span>
                                        <h3 className="ticket-title">{evt.name}</h3>
                                        <p className="ticket-meta mt-2">🗓 {evt.date}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Section 4: Promo Boxes */}
                <section className="section">
                    <div className="promo-grid">

                        {/* Box 1: Sign up as User */}
                        <div className="promo-box promo-box-light relative overflow-hidden group cursor-pointer">
                            <div className="absolute inset-0 z-0">
                                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80" alt="Join" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Join the Community</h3>
                                    <p className="text-sm">Sign up as a member to easily track your tickets and favorite events.</p>
                                </div>
                                <button className="btn btn-secondary self-start mt-4">Sign Up</button>
                            </div>
                        </div>

                        {/* Box 2: Browse More Events */}
                        <Link to="/Browse" className="promo-box promo-box-warm relative overflow-hidden group text-inherit no-underline block">
                            <div className="absolute inset-0 z-0">
                                <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80" alt="Browse" className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Want to see more?</h3>
                                    <p className="text-sm">Explore our full catalog of upcoming local activities.</p>
                                </div>
                                <div className="mt-4 font-bold text-amber-700">Browse Events →</div>
                            </div>
                        </Link>

                        {/* Box 3: Sign up as Organizer */}
                        <Link to="/Organizer" className="promo-box promo-box-dark relative overflow-hidden group text-inherit no-underline block">
                            <div className="absolute inset-0 z-0 bg-black/50">
                                <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80" alt="Organize" className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity mix-blend-overlay" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">Become an Organizer</h3>
                                    <p className="text-sm text-stone-300">Host your own events, manage tickets, and grow your audience.</p>
                                </div>
                                <button className="btn btn-primary self-start mt-4">Access Dashboard</button>
                            </div>
                        </Link>

                    </div>
                </section>
            </div>
        </div>
    )
}

export default Home