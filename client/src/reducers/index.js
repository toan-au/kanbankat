import { combineReducers } from 'redux';
import user from './user';
import boards from './boards';

export default combineReducers({
  user,
  boards
});
