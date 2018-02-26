import { GET_BOARDS } from '../actions/types';

export default (state = [], action) => {
  switch (action.type) {
    case GET_BOARDS:
      return action.payload;

    default:
      return state;
  }
};
