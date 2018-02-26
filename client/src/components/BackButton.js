import React from 'react';
import { withRouter } from 'react-router-dom';

const BackButton = props => {
  const goBack = () => {
    props.history.goBack();
  };
  return (
    <button className="btn btn-default" onClick={goBack}>
      Back
    </button>
  );
};

export default withRouter(BackButton);
