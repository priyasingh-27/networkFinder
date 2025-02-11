const { findAllNetwork }=require('../repository/network.repository')

const prepare_prompt =async (query) => {
    const [err, networks] = await findAllNetwork();
    if (err) {
        if (err.code == 404) return notFoundResponse(res, 'User Not Found');
        if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
    }

    const prompt = `
    Your task is to perform the following actions:
    1 - From the query delimited by <>, you need to analyze the query
    2 - According to the query you need to search in the given list of mentors/investors delimited by <>
    3 - You need to output in the format: ["name1" ,"name2"...]

    List of mentors/investors:<${JSON.stringify(networks)}>
    Query:<${query}>
    `;

    return prompt;
}

module.exports = prepare_prompt;