import { Request, Response } from "express";
import { createLabel, getLabels, findAndUpdateLabel, findAndDeleteLabel } from "../services/label.service";

async function createLabelHandler(req: Request, res: Response) {
    const payload = req.body
    const label = await createLabel({...payload, user: req.user?._id});
    return res.send(label);
}

async function getLabelsHandler(req: Request, res: Response) {
    const labels = await getLabels({ user: req.user?._id });
    return res.send(labels);
}

async function editLabelHandler(req: Request, res: Response) {
    const label = await findAndUpdateLabel({ user: req.user?._id, _id: req.params.id }, req.body);
    return res.send(label)
}

async function deleteLabelHandler(req: Request, res: Response) {
    const label = await findAndDeleteLabel({ user: req.user?._id, _id: req.params.id })
    res.send(label)
}

export { createLabelHandler, getLabelsHandler, editLabelHandler, deleteLabelHandler }