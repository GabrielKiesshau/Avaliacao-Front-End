import type { NextApiRequest, NextApiResponse } from 'next';
import { DefaultResponseMsg } from '../../types/DefaultResponseMsg';
import { connectDb } from '../../middlewares/connectDb';
import { jwtValidator } from '../../middlewares/jwtValidator';
import { TaskRequest } from '../../types/TaskRequest';
import moment from 'moment';
import { TaskModel } from '../../models/TaskModel';
import { GetTasksParams } from '../../types/GetTasksParams';
import { HttpStatus } from '../../constants/HttpStatus';
import { Messages } from '../../constants/Messages';

const taskEndpoint = async (req: NextApiRequest, res: NextApiResponse<DefaultResponseMsg | any>) => {

    const { userId } = req?.body || req?.query;

    switch (req.method) {
        case 'POST':
            return await saveTask(req, res, userId);
        case 'PUT':
            return await updateTask(req, res, userId);
        case 'DELETE':
            return await deleteTask(req, res, userId);
        case 'GET':
            return await getTasks(req, res, userId);
        default:
            return res.status(HttpStatus.MethodNotAllowed).json({ error: Messages.Technical.INVALID_METHOD });
    }
}

const validateBody = (body : TaskRequest, userId : string) => {
    if (!userId) {
        return 'User not provided';
    }

    if (!body.name || body.name.length < 2) {
        return 'Invalid name';
    }

    if (!body.previsionDate) {
        return 'Invalid date';
    }
}

const saveTask = async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
    const body = req.body as TaskRequest;

    const errorMsg = validateBody(body, userId);
    if (errorMsg) {
        return res.status(HttpStatus.BadRequest).json({ error: errorMsg });
    }

    const previsionDate = moment(body.previsionDate);
    const now = moment();
    now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    if (previsionDate.isBefore(now)) {
        return res.status(HttpStatus.BadRequest).json({ error: Messages.Tasks.EARLY_DATE });
    }

    const task = {
        name: body.name,
        userId,
        previsionDate: previsionDate.toDate()
    }

    await TaskModel.create(task);
    return res.status(HttpStatus.OK).json({ msg: Messages.Tasks.CREATED });
}

const updateTask = async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
    const body = req.body as TaskRequest;

    const taskId = req?.query?.id;
    if (!taskId) {
        return res.status(HttpStatus.BadRequest).json({ error: Messages.Tasks.NOT_PROVIDED });
    }

    const task = await TaskModel.findById(taskId);
    if (!task || task.userId !== userId) {
        return res.status(HttpStatus.BadRequest).json({ error: Messages.Tasks.NOT_FOUND });
    }

    const errorMsg = validateBody(body, userId);
    if (errorMsg) {
        return res.status(HttpStatus.BadRequest).json({ error: errorMsg });
    }

    const previsionDate = moment(body.previsionDate);
    
    task.name = body.name;
    task.previsionDate = previsionDate;
    task.finishDate = body.finishDate ? moment(body.finishDate) : null;

    await TaskModel.findByIdAndUpdate({ _id: task._id}, task);
    return res.status(HttpStatus.OK).json({ msg: Messages.Tasks.CHANGED });
}

const deleteTask = async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
    const taskId = req?.query?.id;
    if (!taskId) {
        return res.status(HttpStatus.BadRequest).json({ error: Messages.Tasks.NOT_PROVIDED });
    }

    const task = await TaskModel.findById(taskId);
    if (!task || task.userId !== userId) {
        return res.status(HttpStatus.BadRequest).json({ error: Messages.Tasks.NOT_FOUND });
    }

    await TaskModel.findByIdAndDelete({ _id: task._id});
    return res.status(HttpStatus.OK).json({ msg: Messages.Tasks.REMOVED });
}

const getTasks = async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
   
    const params =  req.query as GetTasksParams;

    const query = {
        userId
    } as any;

    if (params?.previsionDateStart) {
        const startDate = moment(params?.previsionDateStart).toDate();
        query.previsionDate = {$gte : startDate};
    }

    if (params?.previsionDateEnd) {
        const endDate = moment(params?.previsionDateEnd).toDate();
        
        if (!query.previsionDate) {
            query.previsionDate = {}
        }

        query.previsionDate.$lte = endDate;
    }

    if (params?.status) {
        const status = parseInt(params?.status);
        switch(status) {
            case 1 : query.finishDate = null;
                break;
            case 2 : query.finishDate = {$ne : null};
        }
    }

    const result = await TaskModel.find(query);
    return res.status(HttpStatus.OK).json(result);
}

export default connectDb(jwtValidator(taskEndpoint));