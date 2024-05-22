import { Model, Types } from "mongoose";

interface Task {
  _id: Types.ObjectId;
  name: string;
  content: string;
  color: string;
}

interface List {
  _id: Types.ObjectId;
  name: string;
  tasks: Task[];
  deleted: boolean;
  deletedOn?: Date;
}

interface Board {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  about: string;
  lists: List[];
  deleted: boolean;
  deletedOn?: Date;
}

export interface UserModel extends Document {
  googleId: String;
  githubId: String;
  displayName: String;
  boards: Board[];
}

declare global {
  namespace Express {
    export interface User extends UserModel {}
  }
}
