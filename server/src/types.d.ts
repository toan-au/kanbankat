import mongoose, { Model, Types } from "mongoose";

export interface TaskDocument {
  readonly _id: Types.ObjectId;
  name: string;
  content: string;
  color: string;
}

export interface LabelDocument {
  readonly _id: Types.ObjectId;
  name: string;
  hexColour: string;
  board: BoardDocument;
}

export interface ListDocument {
  readonly _id: Types.ObjectId;
  name: string;
  tasks: TaskDocument[];
  deleted: boolean;
  deletedOn?: Date;
}

export interface BoardDocument extends mongoose.Document {
  readonly _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  about: string;
  lists: mongoose.Types.DocumentArray<ListDocument>;
  deleted: boolean;
  deletedOn?: Date;
}

export interface UserDocument extends mongoose.Document {
  readonly _id: string;
  googleId: String;
  githubId: String;
  displayName: String;
  boards: BoardDocument[];
  labels: LabelDocument[];
}

declare global {
  namespace Express {
    export interface User extends UserDocument {}
  }
}
