// Organizer — dashboard for event organizers (create, edit, publish, delete events)
// Only accessible to users with profile.role = 'organizer' (see ProtectedRoute in App.jsx)
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/Dashboard.css';

const Organizer = () => {
    const { user } = useAuth();

    // ── State ──────────────────────────────────────────────────────────────────
    const [events, setEvents]           = useState([]);   // All events for this organizer
    const [loading, setLoading]         = useState(true);
    const [showForm, setShowForm]       = useState(false); // Toggles the create/edit form
    // null = create mode, event object = edit mode
    const [editingEvent, setEditingEvent] = useState(null);

    const [attendeesModalEvent, setAttendeesModalEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [attendeeFetchError, setAttendeeFetchError] = useState(null);

    // KPI stats: revenue and tickets sold are fetched live; views is a static placeholder
    const [stats, setStats] = useState({ revenue: 0, sold: 0, views: '1.2k' });

    // Form fields for the create/edit event form
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        capacity: 0,
        eventType: 'free',  // 'free' | 'paid' | 'recurring'
        price: '',           // paid or recurring events only
        endDate: '',         // recurring events only
        recurringDays: [],   // recurring events only, e.g. ['Monday', 'Wednesday']
        rsvpCode: ''         // free events only
    });

    // Fetch events whenever the logged-in user changes (or on initial mount)
    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);

    // Fetches all events for this organizer and calculates KPI stats
    const fetchEvents = async () => {
        setLoading(true);
        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*, ticket_types(*)')
            .eq('organizer_id', user.id)
            .order('created_at', { ascending: false });

        if (!eventsError && eventsData) {
            setEvents(eventsData);

            // Calculate KPI stats
            let totalRevenue = 0;
            let ticketsSold = 0;

            const eventIds = eventsData.map(e => e.id);
            if (eventIds.length > 0) {
                // Sum revenue from confirmed orders
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .in('event_id', eventIds)
                    .eq('status', 'confirmed');

                if (ordersData) {
                    totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total_amount), 0);
                }

                // Count physical ticket rows
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
                views: '1.2k' // Static placeholder as views table doesn't exist yet
            });
        } else if (eventsError) {
            console.error('Error fetching events:', eventsError);
        }
        setLoading(false);
    };

    // ── handleInputChange ──────────────────────────────────────────────────────
    // Generic handler for all text/select/number inputs in the form.
    // Checkbox inputs for recurringDays are handled separately with their own onChange.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── resetForm ─────────────────────────────────────────────────────────────
    // Clears all form fields, exits edit mode, and hides the form panel.
    const resetForm = () => {
        setFormData({ title: '', date: '', time: '', location: '', description: '', capacity: 0, eventType: 'free', price: '', endDate: '', recurringDays: [], rsvpCode: '' });
        setEditingEvent(null);
        setShowForm(false);
    };

    // ── fetchAttendees ─────────────────────────────────────────────────────────
    // Two-step fetch: orders first, then profiles by user ID.
    // This avoids relying on the nested join which breaks if `profiles.email`
    // column doesn't exist yet on the live DB.

    const fetchAttendees = async (event) => {
        setAttendeesModalEvent(event);
        setLoadingAttendees(true);
        setAttendees([]);
        setAttendeeFetchError(null);

        // Step 1: get orders for this event
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('id, user_id, status')
            .eq('event_id', event.id)
            .in('status', ['confirmed', 'pending']);

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            setAttendeeFetchError(`Error fetching orders: [${ordersError.code}] ${ordersError.message}`);
            setLoadingAttendees(false);
            return;
        }

        if (!ordersData || ordersData.length === 0) {
            setLoadingAttendees(false);
            return;
        }

        // Step 2: get profiles for all user IDs found in those orders
        const userIds = [...new Set(ordersData.map(o => o.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            setAttendeeFetchError(`Error fetching profiles: [${profilesError.code}] ${profilesError.message}. ${profilesError.code === '42703' ? 'The email column may not exist in your live database.' : 'Check RLS policies in Supabase.'}`);
            setLoadingAttendees(false);
            return;
        }

        // Map profiles by user ID for fast lookup
        const profileMap = {};
        (profilesData || []).forEach(p => { profileMap[p.id] = p; });

        const formattedAttendees = ordersData.map(order => ({
            orderId: order.id,
            userId: order.user_id,
            name: profileMap[order.user_id]?.full_name || 'Unknown',
            email: profileMap[order.user_id]?.email || 'N/A',
            status: order.status
        }));
        setAttendees(formattedAttendees);
        setLoadingAttendees(false);
    };

    const closeAttendeesModal = () => {
        setAttendeesModalEvent(null);
        setAttendees([]);
    };

    // ── handleDeleteAttendance ──────────────────────────────────────────────────
    const handleDeleteAttendance = async (orderId) => {
        if (!window.confirm('Are you sure you want to remove this attendee? Their order and tickets will be permanently deleted.')) return;

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error('Error removing attendee:', error);
            alert('Failed to remove attendee. Ensure you have the proper RLS policies.');
        } else {
            setAttendees(prev => prev.filter(a => a.orderId !== orderId));
            fetchEvents(); // Update stats
        }
    };

    // ── handleCreateOrUpdate ───────────────────────────────────────────────────
    // Handles both creating a new event and saving edits to an existing one.
    // After writing the event row it also creates/updates the associated ticket_type.
    //
    // Event type → ticket type mapping:
    //   'free'      → price=0,     name='RSVP'
    //   'paid'      → price=input, name='General Admission'
    //   'recurring' → price=0,     name='Recurring Event'
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();

        // Build the event row payload (recurring-only fields are null for other types)
        const eventPayload = {
            title: formData.title,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            description: formData.description,
            capacity: formData.capacity,
            organizer_id: user.id,
            end_date: formData.eventType === 'recurring' && formData.endDate ? formData.endDate : null,
            recurring_days: formData.eventType === 'recurring' && formData.recurringDays.length > 0 ? formData.recurringDays.join(', ') : null,
            rsvp_code: formData.eventType === 'free' && formData.rsvpCode.trim() !== '' ? formData.rsvpCode.trim() : null
        };

        const price = (formData.eventType === 'paid' || formData.eventType === 'recurring') ? Number(formData.price) : 0;
        const ticketTypeName = formData.eventType === 'paid' ? 'General Admission' :
                               formData.eventType === 'recurring' ? 'Recurring Event' : 'RSVP';

        if (editingEvent) {
            // ── UPDATE existing event ────────────────────────────────────────
            const { error } = await supabase
                .from('events')
                .update(eventPayload)
                .eq('id', editingEvent.id);

            if (error) {
                console.error('Error updating event:', error);
                alert('Failed to update event.');
            } else {
                // Update or create the ticket_type row for this event
                const existingTicketType = editingEvent.ticket_types?.[0];
                if (existingTicketType) {
                    // Update existing ticket type (preserves the id / existing ticket rows)
                    await supabase.from('ticket_types').update({
                        price: price,
                        quantity: formData.capacity,
                        name: ticketTypeName
                    }).eq('id', existingTicketType.id);
                } else {
                    // No ticket type exists yet — insert one
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
            // ── CREATE new event ─────────────────────────────────────────────
            const { data: newEvent, error } = await supabase
                .from('events')
                .insert([eventPayload])
                .select()
                .single();

            if (error) {
                console.error('Error creating event:', error);
                alert('Failed to create event.');
            } else if (newEvent) {
                // Every event needs at least one ticket_type for pricing/cart to work
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

    // ── handleEdit ─────────────────────────────────────────────────────────────
    // Pre-populates the form with an existing event's data so the user can edit it.
    // Reads the first ticket_type to determine whether the event was paid or recurring.
    const handleEdit = (event) => {
        const primaryTicket = event.ticket_types?.[0];
        const isRecurring = primaryTicket && primaryTicket.name === 'Recurring Event';
        const isPaid      = primaryTicket && Number(primaryTicket.price) > 0 && !isRecurring;

        setFormData({
            title:         event.title,
            date:          event.date,
            time:          event.time,
            location:      event.location,
            description:   event.description || '',
            capacity:      event.capacity || 0,
            eventType:     isPaid ? 'paid' : isRecurring ? 'recurring' : 'free',
            price:         (isPaid || isRecurring) && primaryTicket.price > 0 ? primaryTicket.price : '',
            endDate:       event.end_date || '',
            // Convert the stored comma-separated string back to an array for the checkboxes
            recurringDays: event.recurring_days ? event.recurring_days.split(', ') : [],
            rsvpCode:      event.rsvp_code || ''
        });
        setEditingEvent(event);
        setShowForm(true);
    };

    // ── handleDelete ───────────────────────────────────────────────────────────
    // Deletes the event row. Ticket types and ticket rows cascade automatically
    // because of ON DELETE CASCADE foreign keys defined in schema.sql.
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
            // Optimistically remove from local state, then re-fetch to update stats
            setEvents(events.filter(e => e.id !== eventId));
            fetchEvents();
        }
    };

    // ── handlePublish ──────────────────────────────────────────────────────────
    // Flips an event's status from 'draft' to 'published'.
    // Published events become visible to the public on the Browse page.
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

    // ── getStatusStyle ─────────────────────────────────────────────────────────
    // Returns inline style for the status column so published vs draft are visually distinct.
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
                                {(formData.eventType === 'paid' || formData.eventType === 'recurring') && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Ticket Price ($)</label>
                                        <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g. 15.00" className="input" style={{ width: '100%' }} />
                                    </div>
                                )}
                                {formData.eventType === 'free' && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>RSVP Access Code (Optional)</label>
                                        <input type="text" name="rsvpCode" value={formData.rsvpCode} onChange={handleInputChange} placeholder="e.g. WEDDING2026" className="input" style={{ width: '100%' }} />
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
                                    
                                    let priceInfo = 'RSVP (Free)';
                                    if (isRecu) {
                                        priceInfo = tType && Number(tType.price) > 0 ? `Recurring ($${Number(tType.price).toFixed(2)})` : 'Recurring (Free)';
                                    } else if (tType && Number(tType.price) > 0) {
                                        priceInfo = `$${Number(tType.price).toFixed(2)}`;
                                    } else if (event.rsvp_code) {
                                        priceInfo = `RSVP (Code: ${event.rsvp_code})`;
                                    }

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
                                                    <button onClick={() => fetchAttendees(event)} style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text)' }}>Attendees</button>
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

            {/* Attendees Modal */}
            {attendeesModalEvent && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'var(--color-surface-card)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--color-text)' }}>Attendees: {attendeesModalEvent.title}</h3>
                            <button onClick={closeAttendeesModal} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text)' }}>&times;</button>
                        </div>
                        
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {loadingAttendees ? (
                                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Loading attendees...</p>
                            ) : attendeeFetchError ? (
                                <div style={{ padding: '1.5rem', background: 'color-mix(in oklch, #ef4444, transparent 90%)', borderRadius: '6px', margin: '1rem 0' }}>
                                    <p style={{ color: '#ef4444', fontWeight: '600', marginBottom: '0.5rem' }}>Could not load attendees</p>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{attendeeFetchError}</p>
                                </div>
                            ) : attendees.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No attendees found for this event.</p>
                            ) : (
                                <table className="data-table" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendees.map(att => (
                                            <tr key={att.orderId}>
                                                <td>{att.name}</td>
                                                <td>{att.email}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button 
                                                        onClick={() => handleDeleteAttendance(att.orderId)}
                                                        style={{ background: 'color-mix(in oklch, #ef4444, transparent 85%)', color: '#ef4444', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Organizer;