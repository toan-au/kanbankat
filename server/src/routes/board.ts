import { UpdateQuery } from "mongoose";
import express, { Request, Response, Router } from "express";
import requireLogin from "../middleware/requireLogin";
import requireOwnBoard from "../middleware/requireOwnBoard";
import asyncHandler from "../middleware/asyncHandler";
import boardController from "../controllers/boards.controller";
import _ from "lodash";
import { string } from "zod";

const router: Router = express.Router();

router.get("/api/test", (req, res) => res.send({ test: true }));

// *************
// BOARD STUFF
// *************

router.post(
  "/api/board",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const board = await boardController.createBoard(name, req.user?._id || "");
    res.send(board);
  })
);

type GetBoardsSchema = {
  params: {
    deleted?: boolean;
  };
};

router.get(
  "/api/boards",
  requireLogin,
  requireOwnBoard,
  asyncHandler(
    async (req: Request<GetBoardsSchema["params"]>, res: Response) => {
      const { deleted } = req.params;
      const boards = await boardController.getBoards(
        req.user?._id || "",
        deleted
      );
      res.send(boards);
    }
  )
);

router.get(
  "/api/board/:boardId",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req: Request, res: Response) => {
    const board = await boardController.getBoard(req.params.boardId);
    res.send(board);
  })
);

interface BoardUpdate {
  name: string;
  deleted: string;
}

router.patch(
  "/api/board/:boardId",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req, res) => {
    const { name, deleted } = req.body;
    const update = { name, deleted };
    const board = await boardController.editBoard(req.params.boardId, update);
    res.send(board);
  })
);

router.delete(
  "/api/board/:boardId",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req, res) => {
    const board = await boardController.deleteBoard(req.params.boardId);
    res.send(board);
  })
);

router.delete(
  "/api/board/destroy/:boardId",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req, res) => {
    const board = await boardController.destroyBoard(req.params.boardId);
    res.send(board);
  })
);

router.patch(
  "/api/board/:boardId/lists",
  requireLogin,
  asyncHandler(async (req, res) => {
    const { boardId, sourceIndex, destinationIndex } = req.body;
    const board = await boardController.shiftLists(
      boardId,
      sourceIndex,
      destinationIndex
    );
    res.send(board);
  })
);

// *************
// LIST STUFF
// *************

router.post(
  "/api/board/:boardId/list/",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    const list = await boardController.createList(req.params.boardId, name);
    res.send(list);
  })
);

router.patch(
  "/api/board/:boardId/list/:listId/",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    const list = await boardController.editList(
      req.params.boardId,
      req.params.listId,
      { name }
    );
    res.send(list);
  })
);

router.patch(
  "/api/board/:boardId/lists/tasks",
  requireLogin,
  asyncHandler(async (req, res) => {
    const {
      boardId,
      sourceListId,
      sourceIndex,
      destinationListId,
      destinationIndex,
    } = req.body;
    const board = await boardController.shiftTask(
      boardId,
      sourceListId,
      sourceIndex,
      destinationListId,
      destinationIndex
    );
    res.send(board);
  })
);

router.delete(
  "/api/board/:boardId/list/:listId",
  asyncHandler(async (req, res) => {
    const listId = await boardController.deleteList(
      req.params.boardId,
      req.params.listId
    );
    res.send(listId);
  })
);

// *************
// TASK STUFF
// *************

router.post(
  "/api/board/:boardId/list/:listId/task",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req, res) => {
    const { _id, name, content, color } = req.body;
    const task = await boardController.createTask(
      req.params.boardId,
      req.params.listId,
      { _id, name, content, color }
    );
    res.send(task);
  })
);

router.patch(
  "/api/board/:boardId/list/:listId/task/:taskId",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req, res) => {
    const { name, content, color } = req.body;
    const task = await boardController.editTask(
      req.params.boardId,
      req.params.listId,
      req.params.taskId,
      { name, content, color }
    );
    res.send(task);
  })
);

router.delete(
  "/api/board/:boardId/list/:listId/task/:taskId",
  requireLogin,
  requireOwnBoard,
  asyncHandler(async (req, res) => {
    const task = await boardController.deleteTask(
      req.params.boardId,
      req.params.listId,
      req.params.taskId
    );
    res.send(task);
  })
);

export default router;
