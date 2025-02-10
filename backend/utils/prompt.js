const prepare_prompt = (query) => {
    const mentors = [
        {"name": "Himani", "category": "video", "type": "mentor"},
        {"name": "Himanshu", "category": "Marketing", "type": "investor"},
        {"name": "Sham", "category": "Ecommerce", "type": "Mentor"},
        {"name": "Inga", "category": "photography", "type": "Mentor"},
        {"name": "Suchi", "category": "Blockchain", "type": "investor"},
        {"name": "Anamika", "category": "AI", "type": "Investor" },
        {"name": "Mira", "category": "AI", "type": "Investor"}
    ];

    const prompt = `
    Your task is to perform the following actions:
    1 - From the query delimited by <>, you need to analyze the query
    2 - According to the query you need to search in the given list of mentors/investors delimited by <>
    3 - You need to output in the format: ["name1" ,"name2"...]

    List of mentors/investors:<${JSON.stringify(mentors)}>
    Query:<${query}>
    `;

    return prompt;
}

module.exports = prepare_prompt;