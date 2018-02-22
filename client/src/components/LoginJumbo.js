import React from 'react';
import { Link } from 'react-router-dom';

const LoginJumbo = () => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-4">Welcome to Agiboard!</h1>
        <p className="lead">
          A trello clone made from using various open source technologies such
          as react, redux, node and passport
        </p>
        <hr className="my-4" />
        <p className="lead">Please login to access your boards</p>
        <Link to="/auth/google">
          <button className="btn btn-primary btn-lg" role="button">
            Login with google
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LoginJumbo;
