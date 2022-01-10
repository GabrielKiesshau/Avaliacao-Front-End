import md5 from 'md5';
import type {NextApiRequest, NextApiResponse} from 'next';
import { connectDb } from '../../middlewares/connectDb';
import { UserModel } from '../../models/UserModel';
import { DefaultResponseMsg } from '../../types/DefaultResponseMsg';
import { LoginRequest } from '../../types/LoginRequest';
import jwt from 'jsonwebtoken';
import { LoginResponse } from '../../types/LoginResponse';
import { HttpStatus } from '../../constants/HttpStatus';
import { Messages } from '../../constants/Messages';

const loginEndpoint = async(req : NextApiRequest, 
    res : NextApiResponse<DefaultResponseMsg | LoginResponse>) => {

    const {SECRET_KEY} = process.env;
    if (!SECRET_KEY) {
        return res.status(HttpStatus.InternalServerError).json({ error : Messages.Technical.MISSING_JWT_KEY});
    }
    
    if (req.method === 'POST') {
        const body = req.body as LoginRequest;
        if (!body || !body.login || !body.password) {
            return res.status(HttpStatus.BadRequest).json({ error : Messages.User.MISSING_INFO});
        }

        const usersFound = await UserModel.find({ email : body.login, password : md5(body.password)});
        if ( usersFound && usersFound.length > 0 ) {
            const user = usersFound[0];
            const token = jwt.sign({_id : user._id}, SECRET_KEY);
            
            const result = {
                name : user.name,
                email : user.email,
                token
            }

            return res.status(HttpStatus.OK).json(result);
        }

        return res.status(HttpStatus.BadRequest).json({ error : Messages.User.NOT_FOUND});
    }

    return res.status(HttpStatus.MethodNotAllowed).json({ error : Messages.Technical.INVALID_METHOD });
}

export default connectDb(loginEndpoint);