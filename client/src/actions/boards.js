import {
  GET_BOARD,
  SHIFT_TASK,
  CREATE_LIST,
  CREATE_TASK,
  DELETE_LIST,
  SHIFT_LIST,
  CREATE_BOARD,
  DELETE_BOARD,
  RESET_VIEW_BOARD,
  RENAME_LIST,
  DELETE_TASK
} from './types';
import axios from 'axios';
import ObjectID from 'bson-objectid';

export const createBoard = board => {
  return async dispatch => {
    await axios.post('/api/board', board);
    dispatch({ type: CREATE_BOARD });
  };
};

export const getBoard = boardId => {
  return async dispatch => {
    const board = await axios('/api/board/' + boardId);
    dispatch({ type: GET_BOARD, payload: board.data });
  };
};

export const deleteBoard = boardId => {
  return async dispatch => {
    await axios.delete('/api/board/' + boardId);
    dispatch({ type: DELETE_BOARD });
  };
};

export const resetViewBoard = () => {
  return { type: RESET_VIEW_BOARD };
};

// shift task based on shift value
export const shiftTask = dropResult => {
  return (dispatch, getState) => {
    const { destination, source } = dropResult;
    const { board } = { ...getState() };
    let srcIndex, destIndex;
    board.lists.find((list, index) => {
      srcIndex = index;
      return list._id === source.droppableId;
    });
    board.lists.find((list, index) => {
      destIndex = index;
      return list._id === destination.droppableId;
    });

    // make copies of the lists
    const srcList = { ...board.lists[srcIndex] };

    // If source and destination are the same then edit the same object
    let destList;
    if (srcIndex === destIndex) {
      destList = srcList;
    } else {
      destList = { ...board.lists[destIndex] };
    }

    // get the task
    const task = srcList.tasks[source.index];

    destination.index = Math.max(destination.index, 0);

    // delete task from srcList and put into destList
    srcList.tasks = [
      ...srcList.tasks.slice(0, source.index),
      ...srcList.tasks.slice(source.index + 1)
    ];
    destList.tasks = [
      ...destList.tasks.slice(0, destination.index),
      task,
      ...destList.tasks.slice(destination.index)
    ];

    const newLists = updateObjectInArray(board.lists, {
      item: srcList,
      index: srcIndex
    });
    const newerLists = updateObjectInArray(newLists, {
      item: destList,
      index: destIndex
    });

    // Do back end update
    axios.patch(`/api/board/list/${board._id}`, { newerLists });

    dispatch({ type: SHIFT_TASK, payload: newerLists });
  };
};

export const shiftList = dropResult => {
  return (dispatch, getState) => {
    const { draggableId, destination } = dropResult;
    const { lists } = { ...getState().board };

    // remove list from lists
    const removeList = lists.filter(l => l._id !== draggableId);
    const draggedList = lists.find(l => l._id === draggableId);

    // re-add list to correct position
    removeList.splice(destination.index, 0, draggedList);

    // update api
    axios.patch(`/api/board/${destination.droppableId}/shift`, removeList);
    dispatch({ type: SHIFT_LIST, payload: removeList });
  };
};

export const createList = (boardId, list) => {
  return async dispatch => {
    const board = await axios.post('/api/board/list/' + boardId, list);
    dispatch({ type: CREATE_LIST, payload: board.data });
  };
};

export const renameList = (boardId, listId, listName) => {
  return (dispatch, getState) => {
    const { lists } = { ...getState().board };
    let listIdx;
    // find the list within state
    const list = lists.find((l, idx) => {
      listIdx = idx;
      return l._id === listId;
    });

    // change the list's name
    list.name = listName;

    // retunr updated lists
    const action = { item: list, index: listIdx };
    const newLists = updateObjectInArray(lists, action);

    // persist to DB
    axios.patch('/api/board/list/' + boardId, { newerLists: newLists });

    dispatch({ type: RENAME_LIST, payload: newLists });
  };
};

export const createTask = (boardId, listId, task) => {
  return (dispatch, getState) => {
    // update client side
    // create the ObjectID on the client side so we can dispatch it immediately
    task._id = ObjectID();

    const { lists } = { ...getState().board };

    // find index & copy of task's list
    let listIdx;
    const list = lists.find((l, i) => {
      listIdx = i;
      return l._id === listId;
    });

    // build copy of the tasks array and create a NEW list object
    const newList = { ...list, tasks: [...list.tasks, task] };
    lists[listIdx] = newList;

    // update api
    axios.post(`/api/board/task/${boardId}/${listId}`, task);
    dispatch({ type: CREATE_TASK, payload: lists });
  };
};

export const deleteTask = (boardId, listId, taskId) => {
  return (dispatch, getState) => {
    let listIdx;
    const { lists } = { ...getState().board };
    const list = lists.find((l, i) => {
      listIdx = i;
      return l._id === listId;
    });
    const tasks = [...list.tasks];
    const newTasks = tasks.filter(t => t._id !== taskId);

    // update the tasks in chosen list
    list.tasks = newTasks;

    // update the array of lists
    const action = { index: listIdx, item: list };
    const newLists = updateObjectInArray(lists, action);

    // update backend
    axios.patch('/api/board/list/' + boardId, { newerLists: newLists });

    // dispatch changes
    dispatch({ type: DELETE_TASK, payload: newLists });
  };
};

export const renameTask = (boardId, listId, taskId) => {
  return (dispatch, getState) => {};
};

export const deleteList = (boardId, listId) => {
  return (dispatch, getState) => {
    const { lists } = { ...getState().board };
    const newLists = lists.filter(l => l._id !== listId);
    // persist the dlete to DB
    axios.delete(`/api/board/list/${boardId}/${listId}`);
    dispatch({ type: DELETE_LIST, payload: newLists });
  };
};

function updateObjectInArray(array, action) {
  return array.map((item, index) => {
    if (index !== action.index) {
      // This isn't the item we care about - keep it as-is
      return item;
    }
    // Otherwise, this is the one we want - return an updated value
    return {
      ...item,
      ...action.item
    };
  });
}
