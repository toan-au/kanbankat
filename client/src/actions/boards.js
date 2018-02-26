import { GET_BOARDS } from './types';
import axios from 'axios';

export const getBoards = userId => {
  return async dispatch => {
    const boards = axios('/api/boards/' + userId);
  };
};
