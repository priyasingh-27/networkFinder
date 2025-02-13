const { findAllNetwork }=require('../repository/network.repository')

const prepare_prompt =async (query) => {
    const [err, networks] = await findAllNetwork();
    if (err) {
        if (err.code == 404) return notFoundResponse(res, 'User Not Found');
        if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
    }

    const prompt = `
    You are an AI assistant helping match startups with relevant investors and mentors. Your task is to analyze queries and find the most suitable matches from our network.

    INSTRUCTIONS:
    1. Analyze the user query delimited by <query></query> for:
    - Primary industry/category (e.g., SaaS, AI, Video, Blockchain, etc.)
    - Type needed (investor, mentor, or founder)
    - IMPORTANT: Both category AND type must match EXACTLY

    2. Search through the network members delimited by <network></network> and find matches based on:
    - Category must match EXACTLY (case-insensitive)
    - Type must match EXACTLY (case-insensitive)
    - Only return names where BOTH category AND type match
    
    3. Output Rules:
    - Return ONLY a JSON array of names
    - Do not include any markdown formatting or explanation text
    - If no matches found, return ["None"]
    - ONLY include names where both category AND type match exactly

    4. Examples:
    Query: "Looking for a SaaS founder"
    - Must match: category=SaaS AND type=Founder
    - Should return: ["Vikram"] (only if both conditions match)
    
    Query: "Need AI investor"
    - Must match: category=AI AND type=Investor
    - Should return: ["Ria"] (only if both conditions match)

    Network members: <network>${JSON.stringify(networks)}</network>

    User Query: <query>${query}</query>

    Return ONLY the array of names where BOTH category AND type match exactly.
    `;

    

    return prompt;
}

module.exports = prepare_prompt;