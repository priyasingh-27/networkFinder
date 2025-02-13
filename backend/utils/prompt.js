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
    - Whether they're seeking an investor, mentor or founder

    2. Search through the network members delimited by <network></network> and find matches based on:
    - Category/industry alignment
    - Role type (investor or mentor) matching the query needs
    - Return ONLY the names of matching network members
    
    3. Output Rules:
    - Return an array of matching names in exactly this format: ["name1", "name2"]
    - If no matches found, return ["None"]
    
    4. Examples:
    Query: "We are a video streaming startup looking for investors to scale our platform"
    Expected analysis:
    - Category: Video
    - Type needed: Investor
    
    Query: "Need mentor guidance for our blockchain product development"
    Expected analysis:
    - Category: Blockchain
    - Type needed: Mentor

    Network members: <network>${JSON.stringify(networks)}</network>

    User Query: <query>${query}</query>

    Provide ONLY the array of names matching the format described above.
    `;

    

    return prompt;
}

module.exports = prepare_prompt;