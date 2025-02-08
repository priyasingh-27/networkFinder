const joi_schema = require('../joi_validation/network/register.joi');
const {findAllNetwork } = require('../repository/network.repository');
const { successResponse, badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } = require('../utils/response')
const { pool } = require('../db/dbConfig');

const getAllNetworks = async (req, res) => {
    try {
        const [error, networks] = await findAllNetwork();
        if (error) {
            if (error.code == 404) {
                return notFoundResponse(res, 'No network not found');
            } else {
                return serverErrorResponse(res, 'Internal server error');
            }
        }
        return successResponse(res, networks, 'All the networks retrieved successfully');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal Server Error');
    }
}

const registerNetwork = async (req, res)=>{

    try {
        const { error } = joi_schema.validate(req.body);
        if (error) {
            return badRequestResponse(res, 'Invalid data entered')
        }

        await pool.promise().query(
            'INSERT INTO network (name, category, type) VALUES (?,?,?)', [req.body.name, req.body.category, req.body.type]
        );

        return successResponse(res, 'User registered successfully');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal Server Error');
    }
}

module.exports = {
    registerNetwork,
    getAllNetworks
}