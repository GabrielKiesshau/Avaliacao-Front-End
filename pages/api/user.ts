import type {NextApiRequest, NextApiResponse} from 'next';
import { DefaultResponseMsg } from '../../types/DefaultResponseMsg';
import { UserRequest } from '../../types/UserRequest';
import { connectDb} from '../../middlewares/connectDb';
import md5 from 'md5';
import { UserModel } from '../../models/UserModel';
import { HttpStatus } from '../../constants/HttpStatus';
import { Messages } from '../../constants/Messages';

const userEndpoint = async (req : NextApiRequest, res : NextApiResponse<DefaultResponseMsg>) => {

    if (req.method === 'POST') {
        const body = req.body as UserRequest;

        if (!body.name || body.name.length < 2 ) {
            return res.status(HttpStatus.BadRequest).json({ error : Messages.User.INVALID_NAME});
        }

        if (!body.email || body.email.length < 5 ) {
            return res.status(HttpStatus.BadRequest).json({ error : Messages.User.INVALID_EMAIL});
        }

        if (!body.password || body.password.length < 4 ) {
            return res.status(HttpStatus.BadRequest).json({ error : Messages.User.INVALID_PASSWORD});
        }

        const existingUserWithEmail = await UserModel.find({email : body.email});
        
        if (existingUserWithEmail && existingUserWithEmail.length) {
            return res.status(HttpStatus.BadRequest).json({ error : Messages.User.EXISTS});
        }

        const user = {
            name : body.name,
            email : body.email,
            password : md5(body.password)
        }

        await UserModel.create(user);
        return res.status(HttpStatus.OK).json({ msg : Messages.User.CREATED});
    }

    return res.status(HttpStatus.MethodNotAllowed).json({ error : Messages.Technical.INVALID_METHOD });
}

export default connectDb(userEndpoint);