import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose from 'mongoose';
import { DefaultResponseMsg } from '../types/DefaultResponseMsg';
import { HttpStatus } from '../constants/HttpStatus';
import { Messages } from '../constants/Messages';

export const connectDb = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse<DefaultResponseMsg>) => {

    console.log('MongoDb readystate', mongoose.connections[0].readyState);
    if (mongoose.connections[0].readyState) {
        return handler(req, res);
    }

    const {DB_CONNECTION_STRING} = process.env;
    if (!DB_CONNECTION_STRING) {
        return res.status(HttpStatus.InternalServerError).json({ error : Messages.Technical.MISSING_DB_INFO });
    }

    await mongoose.connect(DB_CONNECTION_STRING);
    mongoose.connection.on('connected', () => console.log('Connected to the database'));
    mongoose.connection.on('error', error => console.log('An error occurred connecting to the database: ' + error));

    return handler(req, res);
}