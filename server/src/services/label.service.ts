import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import LabelModel from "../models/label.model";
import { LabelDocument } from "../types";


export async function createLabel(label: LabelDocument) {
    const newLabel = await LabelModel.create(label);
    return newLabel;
}

export async function getLabels(query: FilterQuery<LabelDocument>) {
    const labels = await LabelModel.find(query)
    return labels;
}

export async function findAndUpdateLabel(
    query: FilterQuery<LabelDocument>,
    update: UpdateQuery<LabelDocument>,
    options: QueryOptions = { new: true }
  ) {
    return LabelModel.findOneAndUpdate(query, update, options);
}

export async function findAndDeleteLabel(query: FilterQuery<LabelDocument>) {
  return LabelModel.findOneAndDelete(query)
}