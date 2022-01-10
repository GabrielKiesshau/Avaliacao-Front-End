import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import { DefaultResponseMsg } from '../types/DefaultResponseMsg';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { HttpStatus } from '../constants/HttpStatus';

export const jwtValidator = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse<DefaultResponseMsg>) => {

    const {SECRET_KEY} = process.env;
    if (!SECRET_KEY) {
        return res.status(HttpStatus.InternalServerError).json({error : 'Missing ENV SECRET KEY when executing the project'});
    }

    if (!req || !req.headers) {
        return res.status(HttpStatus.BadRequest).json({error : 'It was not possible to validate the security token'});
    }

    if (req.method !== 'OPTIONS') {
        try{
            const authorization = req.headers['authorization'];
            if (!authorization) {
                return res.status(HttpStatus.BadRequest).json({error : 'It was not possible to validate the security token'});
            }
    
            const token = authorization.substring(7);
            if (!token) {
                return res.status(HttpStatus.BadRequest).json({error : 'Missing security token'});
            }
    
            const decode = await jwt.verify(token, SECRET_KEY) as JwtPayload;
            if (!decode) {
                return res.status(HttpStatus.BadRequest).json({error : 'It was not possible to validate the security token'});
            }
    
            if (req.body) {
                req.body.userId = decode._id;
            }else if (req.query) {
                req.query.userId = decode._id;
            }
        } catch(e) {
            return res.status(HttpStatus.BadRequest).json({error : 'It was not possible to validate the security token'});
        }
    }

    return handler(req, res);
}