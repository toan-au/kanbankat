import { GET_USER } from './types';
import axios from axios;

export const getUser = () => {
  return (dispatch) => {
    const user = await axios.get('/auth/current');
    dispatch({action: GET_USER, payload: user});
  }
};