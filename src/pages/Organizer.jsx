import React, { useState } from 'react';
import '../assets/styles/Dashboard.css';

const Organizer = () => {
    // Dummy KPI data
    const kpiStats = [
        { label: 'Total Revenue', value: '$12,450' },
        { label: 'Tickets Sold', value: '342' },
        { label: 'Active Events', value: '4' },
        { label: 'Total Views', value: '1.2k' }
    ];

    // Dummy events data
    const [events, setEvents] = useState([
        { id: 1, name: 'Tech Innovators Summit', date: 'Oct 15, 2026', status: 'Published', sold: 120, total: 200 },
        { id: 2, name: 'Local Art Exhibition', date: 'Nov 02, 2026', status: 'Draft', sold: 0, total: 50 },
        { id: 3, name: 'Winter Music Festival', date: 'Dec 20, 2026', status: 'Published', sold: 215, total: 500 },
        { id: 4, name: 'Charity Marathon', date: 'Jan 10, 2027', status: 'Published', sold: 7, total: 100 }
    ]);

    const getStatusStyle = (status) => {
        if (status === 'Published') {
            return { color: 'green', fontWeight: 'bold' };
        }
        return { color: 'gray', fontStyle: 'italic' };
    };

    return (
        <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display, sans-serif)', marginBottom: '0.5rem' }}>Organizer Dashboard</h1>
                <p style={{ color: 'var(--color-text-muted, #666)' }}>Welcome back! Here's an overview of your events.</p>
            </div>

            {/* KPI Stat Strip */}
            <section style={{ marginBottom: '3rem' }}>
                <div className="stat-strip">
                    {kpiStats.map((stat, idx) => (
                        <div className="stat" key={idx}>
                            <p className="stat-value">{stat.value}</p>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Event Management Table */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-display, sans-serif)' }}>Manage Events</h2>
                    <button style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--color-primary, #000)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}>
                        + Create Event
                    </button>
                </div>

                <div style={{ overflowX: 'auto', background: 'white', borderRadius: 'var(--radius-lg, 8px)', border: '1px solid var(--color-border, #eaeaea)' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Sales</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td style={{ fontWeight: '500' }}>{event.name}</td>
                                    <td>{event.date}</td>
                                    <td style={getStatusStyle(event.status)}>{event.status}</td>
                                    <td>{event.sold} / {event.total}</td>
                                    <td>
                                        <div className="action-row">
                                            <button style={{ background: 'transparent', border: '1px solid #ccc', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                                            {event.status === 'Draft' && (
                                                <button style={{ background: '#e0f7fa', color: '#006064', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Publish</button>
                                            )}
                                            <button style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                        No events found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Organizer;