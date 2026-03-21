/**
 * getEventCategoryAndImage
 *
 * Inspects an event's title and description to automatically assign:
 *   - a category label (e.g. 'Tech & Innovation', 'Music')
 *   - a matching Toronto-themed fallback image from Unsplash
 *
 * This runs client-side so no extra DB column is needed — categories
 * are derived purely from keyword matching at render time.
 *
 * @param {string} title       - The event title
 * @param {string} description - The event description (optional)
 * @returns {{ category: string, defaultImage: string }}
 */
export const getEventCategoryAndImage = (title, description) => {
    // Merge title + description into one lowercase string for easy keyword matching
    const combinedText = (title + " " + (description || "")).toLowerCase();

    // Default fallback: generic Toronto city photo + 'Community' category
    let defaultImage = "https://images.unsplash.com/photo-1632533794618-808be7570b1f?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dG9yb250byUyMGNpdHl8ZW58MHx8fHwxNzc0MDU3ODIzfDA&ixlib=rb-4.1.0&w=800&q=80";
    let category = 'Community';

    // Each branch checks for keywords and swaps in the appropriate category + image
    if (combinedText.match(/tech|hackathon|startup|code|software|app|AI|developer/i)) {
        category = 'Tech & Innovation';
        defaultImage = "https://images.unsplash.com/photo-1643500326854-c82fcae849b7?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dG9yb250byUyMHRlY2h8ZW58MHx8fHwxNzc0MDU3ODI0fDA&ixlib=rb-4.1.0&w=800&q=80";
    } else if (combinedText.match(/art|gallery|exhibition|painting|design|creative/i)) {
        category = 'Arts & Culture';
        defaultImage = "https://images.unsplash.com/photo-1645594778060-d2e2e487b8c1?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8dG9yb250byUyMGFydHxlbnwwfHx8fDE3NzQwNTc4MjR8MA&ixlib=rb-4.1.0&w=800&q=80";
    } else if (combinedText.match(/sport|basketball|soccer|fitness|run|workout|yoga/i)) {
        category = 'Sports & Fitness';
        defaultImage = "https://images.unsplash.com/photo-1597606986426-89055191ed61?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8dG9yb250byUyMHNwb3J0c3xlbnwwfHx8fDE3NzQwNTc4MjR8MA&ixlib=rb-4.1.0&w=800&q=80";
    } else if (combinedText.match(/food|drink|tasting|dinner|restaurant|beer|wine/i)) {
        category = 'Food & Drink';
        defaultImage = "https://images.unsplash.com/photo-1712286928542-17af515d3dcd?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dG9yb250byUyMGZvb2R8ZW58MHx8fHwxNzc0MDU3ODI0fDA&ixlib=rb-4.1.0&w=800&q=80";
    } else if (combinedText.match(/business|networking|founder|investor|finance|market/i)) {
        category = 'Business';
        defaultImage = "https://images.unsplash.com/photo-1714428586252-d72da2ece0a0?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dG9yb250byUyMGJ1c2luZXNzfGVufDB8fHx8MTc3NDA1NzgyNHww&ixlib=rb-4.1.0&w=800&q=80";
    } else if (combinedText.match(/education|workshop|class|learn|seminar|lecture/i)) {
        category = 'Education';
        defaultImage = "https://images.unsplash.com/photo-1618255630366-f402c45736f6?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dG9yb250byUyMHVuaXZlcnNpdHl8ZW58MHx8fHwxNzc0MDU3ODI1fDA&ixlib=rb-4.1.0&w=800&q=80";
    } else if (combinedText.match(/music|concert|band|dj|live|festival|dance/i)) {
        category = 'Music';
        defaultImage = "https://images.unsplash.com/photo-1567105800714-0106cfd63b55?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8dG9yb250byUyMGNvbmNlcnR8ZW58MHx8fHwxNzc0MDU3ODI1fDA&ixlib=rb-4.1.0&w=800&q=80";
    } else if (combinedText.match(/community|volunteer|meetup|social|gathering|party/i)) {
        category = 'Community';
        defaultImage = "https://images.unsplash.com/photo-1505696484778-f3ef5189cf07?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dG9yb250byUyMHBlb3BsZXxlbnwwfHx8fDE3NzQwNTc4MjV8MA&ixlib=rb-4.1.0&w=800&q=80";
    }

    return { category, defaultImage };
};
