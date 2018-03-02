import React from 'react';
import { XIcon } from 'react-octicons';

const DeleteButton = props => {
  return (
    <button className="btn-delete" type="button" onClick={props.handleClick}>
      <XIcon style={{ position: 'relative', top: '2px' }} />
    </button>
  );
};

export default DeleteButton;
