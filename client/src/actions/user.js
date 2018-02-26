import { GET_USER } from './types';
import axios from 'axios';

export const getUser = () => {
  return async dispatch => {
    const user = await axios.get('/auth/current');
    dispatch({ type: GET_USER, payload: user.data });
  };
};
