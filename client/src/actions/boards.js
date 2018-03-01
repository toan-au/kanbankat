import { GET_BOARD, SHIFT_TASK, CREATE_LIST } from './types';
import axios from 'axios';

export const getBoard = boardId => {
  return async dispatch => {
    const board = await axios('/api/board/' + boardId);
    dispatch({ type: GET_BOARD, payload: board.data });
  };
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

export const createList = (boardId, list) => {
  return async dispatch => {
    const board = await axios.post('/api/board/list/' + boardId, list);
    dispatch({ type: CREATE_LIST, payload: board.data });
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
