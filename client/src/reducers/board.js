import { GET_BOARD } from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case GET_BOARD:
      return action.payload;

    default:
      return state;
  }
};
