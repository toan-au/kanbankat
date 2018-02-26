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
        <a className="btn btn-primary btn-lg" role="button" href="/auth/google">
          Login with google
        </a>
        <Link to="boards" className="btn btn-secondary btn-lg">
          Boards
        </Link>
      </div>
    </div>
  );
};

export default LoginJumbo;
