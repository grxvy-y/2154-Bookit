import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getEventCategoryAndImage } from '../utils/eventHelpers'
import '../assets/styles/Home.css'

const Home = () => {
    // State to hold events
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*, ticket_types(*)')
                    .eq('status', 'published')
                    .order('date', { ascending: true })
                    .limit(5);

                if (error) {
                    console.error('Error fetching events:', error);
                    setFeaturedEvents([]);
                } else {
                    const eventsWithImages = (data || []).map(evt => {
                        const { category, defaultImage } = getEventCategoryAndImage(evt.title, evt.description);
                        return {
                            ...evt,
                            name: evt.title,
                            category,
                            image: evt.image_url || defaultImage
                        };
                    });
                    setFeaturedEvents(eventsWithImages);
                }
            } catch (err) {
                console.error('Unexpected error fetching events:', err);
            } finally {
                setIsLoading(false);
            }
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {isLoading ? (
                            <div className="col-span-full text-center py-10 text-stone-500">Loading events...</div>
                        ) : featuredEvents.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-stone-500">No events found.</div>
                        ) : (
                            featuredEvents.map((evt, index) => (
                                <div 
                                    key={evt.id} 
                                    className={`card card-warm flex flex-col overflow-hidden group ${index === 0 ? 'md:col-span-2 row-span-2' : ''}`}
                                >
                                    <div className={`relative overflow-hidden w-full ${index === 0 ? 'h-64 md:h-full min-h-64' : 'h-48'}`}>
                                        <img src={evt.image} alt={evt.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        {/* Overlay register button on hover */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                            <Link to="/Browse" className="btn btn-primary">Register Now</Link>
                                        </div>
                                    </div>
                                    <div className="card-body flex flex-col justify-start grow">
                                        <span className="badge badge-violet self-start mb-2">{evt.category}</span>
                                        <h3 className="ticket-title line-clamp-2" style={index === 0 ? { fontSize: '1.75rem', lineHeight: '2rem', marginBottom: '0.5rem' } : {}}>{evt.name}</h3>
                                        <p className="ticket-meta mt-auto pt-4">🗓 {evt.date}</p>
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
                        <Link to="/register" className="promo-box promo-box-light relative overflow-hidden group text-inherit no-underline block">
                            <div className="absolute inset-0 z-0">
                                <img src="https://images.unsplash.com/photo-1593311902504-4031410a99c6?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dG9yb250byUyMGNvbW11bml0eXxlbnwwfHx8fDE3NzQwNTc4MjZ8MA&ixlib=rb-4.1.0&w=800&q=80" alt="Join" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Join the Community</h3>
                                    <p className="text-sm">Sign up as a member to easily track your tickets and favorite events.</p>
                                </div>
                                <div className="mt-4 font-bold text-black" style={{ display: 'inline-block', background: 'white', padding: '0.6rem 1.25rem', borderRadius: '999px', fontSize: '0.875rem' }}>Sign Up</div>
                            </div>
                        </Link>

                        {/* Box 2: Browse More Events */}
                        <Link to="/Browse" className="promo-box promo-box-warm relative overflow-hidden group text-inherit no-underline block">
                            <div className="absolute inset-0 z-0">
                                <img src="https://images.unsplash.com/photo-1720585534181-360e966ec790?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8Y24rdG93ZXIrdG9yb250b3xlbnwwfHx8fDE3NzQwNTc4MjZ8MA&ixlib=rb-4.1.0&w=800&q=80" alt="Browse" className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" />
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
                                <img src="https://images.unsplash.com/photo-1441226119864-4f31075ed6c5?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8dG9yb250byUyMG9yZ2FuaXplcnxlbnwwfHx8fDE3NzQwNTc4MjZ8MA&ixlib=rb-4.1.0&w=800&q=80" alt="Organize" className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity mix-blend-overlay" />
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