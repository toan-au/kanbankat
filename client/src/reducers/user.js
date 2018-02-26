import { GET_USER } from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case GET_USER:
      return action.payload;

    default:
      return state;
  }
};
