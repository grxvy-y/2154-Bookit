import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/Dashboard.css';

const Organizer = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Dynamic stats pulled from DB
    const [stats, setStats] = useState({ revenue: 0, sold: 0, views: '1.2k' });

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        capacity: 0,
        eventType: 'free',
        price: '',
        endDate: '',
        recurringDays: []
    });

    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);

    const fetchEvents = async () => {
        setLoading(true);
        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*, ticket_types(*)')
            .eq('organizer_id', user.id)
            .order('created_at', { ascending: false });

        if (!eventsError && eventsData) {
            setEvents(eventsData);
            
            // Calculate dynamic KPI stats
            let totalRevenue = 0;
            let ticketsSold = 0;
            
            const eventIds = eventsData.map(e => e.id);
            if (eventIds.length > 0) {
                // Fetch confirmed orders logic from DB
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .in('event_id', eventIds)
                    .eq('status', 'confirmed');
                
                if (ordersData) {
                    totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total_amount), 0);
                }

                // Fetch physical ticket count securely created
                const ticketTypeIds = eventsData.flatMap(e => e.ticket_types?.map(t => t.id) || []);
                if (ticketTypeIds.length > 0) {
                    const { count: ticketsCount, error } = await supabase
                        .from('tickets')
                        .select('id', { count: 'exact', head: true })
                        .in('ticket_type_id', ticketTypeIds);
                    
                    if (ticketsCount !== null) {
                        ticketsSold = ticketsCount;
                    }
                }
            }

            setStats({
                revenue: totalRevenue,
                sold: ticketsSold,
                views: '1.2k' // Static placeholder as views table doesn't exist
            });
        } else if (eventsError) {
            console.error('Error fetching events:', eventsError);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ title: '', date: '', time: '', location: '', description: '', capacity: 0, eventType: 'free', price: '', endDate: '', recurringDays: [] });
        setEditingEvent(null);
        setShowForm(false);
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        
        const eventPayload = {
            title: formData.title,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            description: formData.description,
            capacity: formData.capacity,
            organizer_id: user.id,
            end_date: formData.eventType === 'recurring' && formData.endDate ? formData.endDate : null,
            recurring_days: formData.eventType === 'recurring' && formData.recurringDays.length > 0 ? formData.recurringDays.join(', ') : null
        };

        const price = formData.eventType === 'paid' ? Number(formData.price) : 0;
        const ticketTypeName = formData.eventType === 'paid' ? 'General Admission' : 
                               formData.eventType === 'recurring' ? 'Recurring Event' : 'RSVP';

        if (editingEvent) {
            const { error } = await supabase
                .from('events')
                .update(eventPayload)
                .eq('id', editingEvent.id);

            if (error) {
                console.error('Error updating event:', error);
                alert('Failed to update event.');
            } else {
                // Upsert ticket type payload
                const existingTicketType = editingEvent.ticket_types?.[0];
                if (existingTicketType) {
                    await supabase.from('ticket_types').update({
                        price: price, 
                        quantity: formData.capacity, 
                        name: ticketTypeName
                    }).eq('id', existingTicketType.id);
                } else {
                    await supabase.from('ticket_types').insert([{
                        event_id: editingEvent.id,
                        price: price,
                        quantity: formData.capacity,
                        name: ticketTypeName
                    }]);
                }

                fetchEvents();
                resetForm();
            }
        } else {
            // handle event creation
            const { data: newEvent, error } = await supabase
                .from('events')
                .insert([eventPayload])
                .select()
                .single();

            if (error) {
                console.error('Error creating event:', error);
                alert('Failed to create event.');
            } else if (newEvent) {
                // Instantly generate corresponding ticket tracking db records automatically
                await supabase.from('ticket_types').insert([{
                    event_id: newEvent.id,
                    price: price,
                    quantity: formData.capacity,
                    name: ticketTypeName
                }]);

                fetchEvents();
                resetForm();
            }
        }
    };

    const handleEdit = (event) => {
        const primaryTicket = event.ticket_types?.[0];
        const isPaid = primaryTicket && Number(primaryTicket.price) > 0;
        const isRecurring = primaryTicket && primaryTicket.name === 'Recurring Event';

        setFormData({
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            description: event.description || '',
            capacity: event.capacity || 0,
            eventType: isPaid ? 'paid' : isRecurring ? 'recurring' : 'free',
            price: isPaid ? primaryTicket.price : '',
            endDate: event.end_date || '',
            recurringDays: event.recurring_days ? event.recurring_days.split(', ') : []
        });
        setEditingEvent(event);
        setShowForm(true);
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event? This will also archive related tickets.')) return;

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);
        
        if (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event.');
        } else {
            // Because our event/ticket_type relationship is cascading in schema.sql, 
            // tickets automatically dissolve seamlessly.
            setEvents(events.filter(e => e.id !== eventId));
            // Trigger stats re-calc efficiently
            fetchEvents();
        }
    };

    const handlePublish = async (eventId) => {
        const { error } = await supabase
            .from('events')
            .update({ status: 'published' })
            .eq('id', eventId);

        if (error) {
            console.error('Error publishing event:', error);
            alert('Failed to publish event.');
        } else {
            fetchEvents();
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'published') {
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
                    <div className="stat">
                        <p className="stat-value">${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="stat-label">Total Revenue</p>
                    </div>
                    <div className="stat">
                        <p className="stat-value">{stats.sold}</p>
                        <p className="stat-label">Tickets Sold</p>
                    </div>
                    <div className="stat">
                        <p className="stat-value">{events.filter(e => e.status === 'published').length}</p>
                        <p className="stat-label">Active Events</p>
                    </div>
                    <div className="stat">
                        <p className="stat-value">{stats.views}</p>
                        <p className="stat-label">Total Views</p>
                    </div>
                </div>
            </section>

            {/* Event Management Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-display, sans-serif)' }}>Manage Events</h2>
                    <button 
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        {showForm ? 'Cancel' : '+ Create Event'}
                    </button>
                </div>

                {showForm && (
                    <div style={{ background: 'var(--color-surface-card)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ color: 'var(--color-text)' }}>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                        <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem', alignItems: 'start' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Title</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="input" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Location</label>
                                    <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="input" style={{ width: '100%' }} />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Time</label>
                                    <input required type="time" name="time" value={formData.time} onChange={handleInputChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="input" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Event Type</label>
                                    <select name="eventType" value={formData.eventType} onChange={handleInputChange} className="input" style={{ width: '100%' }}>
                                        <option value="free">Free / RSVP</option>
                                        <option value="paid">Paid Ticket</option>
                                        <option value="recurring">Recurring Event</option>
                                    </select>
                                </div>
                                
                                {/* Dynamic Date vs Recurring Date Fields */}
                                {formData.eventType === 'recurring' ? (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Start Date</label>
                                            <input required type="date" name="date" value={formData.date} onChange={handleInputChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="input" style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.25rem' }}>End Date</label>
                                            <input required type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="input" style={{ width: '100%' }} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Repeats On (Days)</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-surface-alt)', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.recurringDays.includes(day)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormData(prev => ({ ...prev, recurringDays: [...prev.recurringDays, day] }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, recurringDays: prev.recurringDays.filter(d => d !== day) }));
                                                                }
                                                            }}
                                                        />
                                                        {day.substring(0,3)}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Date</label>
                                        <input required type="date" name="date" value={formData.date} onChange={handleInputChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="input" style={{ width: '100%' }} />
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Capacity (per event)</label>
                                    <input required type="number" min="1" name="capacity" value={formData.capacity} onChange={handleInputChange} className="input" style={{ width: '100%' }} />
                                </div>
                                {formData.eventType === 'paid' && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Ticket Price ($)</label>
                                        <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g. 15.00" className="input" style={{ width: '100%' }} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="input" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                                {editingEvent ? 'Update Event' : 'Save Event'}
                            </button>
                        </form>
                    </div>
                )}

                <div style={{ overflowX: 'auto', background: 'var(--color-surface-card)', borderRadius: 'var(--radius-lg, 8px)', border: '1px solid var(--color-border)' }}>
                    {loading ? (
                        <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading dynamic events matrix...</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event Title</th>
                                    <th>Schedule/Date</th>
                                    <th>Pricing Formats</th>
                                    <th>Status</th>
                                    <th>Capacity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => {
                                    const tType = event.ticket_types?.[0];
                                    const isRecu = tType && tType.name === 'Recurring Event';
                                    const priceInfo = isRecu ? 'Recurring (Free)' : tType && Number(tType.price) > 0 ? `$${Number(tType.price).toFixed(2)}` : 'RSVP (Free)';

                                    return (
                                        <tr key={event.id}>
                                            <td style={{ fontWeight: '500' }}>{event.title}</td>
                                            <td>
                                                {isRecu && event.recurring_days 
                                                    ? `Every ${event.recurring_days} (from ${event.date} until ${event.end_date})` 
                                                    : event.date}
                                            </td>
                                            <td>{priceInfo}</td>
                                            <td style={getStatusStyle(event.status)}>{event.status}</td>
                                            <td>{event.capacity}</td>
                                            <td>
                                                <div className="action-row" style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEdit(event)} style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text)' }}>Edit</button>
                                                    {event.status === 'draft' && (
                                                        <button onClick={() => handlePublish(event.id)} style={{ background: 'color-mix(in oklch, var(--color-amber-500), transparent 85%)', color: 'var(--color-amber-400)', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Publish</button>
                                                    )}
                                                    <button onClick={() => handleDelete(event.id)} style={{ background: 'color-mix(in oklch, #ef4444, transparent 85%)', color: '#ef4444', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {events.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                            No events found. Create one to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Organizer;