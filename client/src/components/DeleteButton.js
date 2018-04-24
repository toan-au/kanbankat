import React from 'react';
import { XIcon } from 'react-octicons';

const DeleteButton = props => {
  const handleClick = e => {
    // stops button from linking to anything if this is a child of another button
    e.preventDefault();
    props.onClick();
  };

  return (
    <button className="btn-delete" type="button" onClick={handleClick}>
      {props.text || <XIcon style={{ position: 'relative', top: '2px' }} />}
    </button>
  );
};

export default DeleteButton;
