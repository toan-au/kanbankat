import { GET_BOARD } from './types';
import axios from 'axios';

export const getBoard = boardId => {
  return async dispatch => {
    const board = await axios('/api/board/' + boardId);
    dispatch({ type: GET_BOARD, payload: board.data });
  };
};
