import { GET_BOARD, SHIFT_TASK } from '../actions/types';
import dotProp from 'dot-prop-immutable';

export default (state = {}, action) => {
  switch (action.type) {
    case GET_BOARD:
      return action.payload;

    case SHIFT_TASK:
      return {
        ...state,
        lists: [...action.payload]
      };
    default:
      return state;
  }
};
