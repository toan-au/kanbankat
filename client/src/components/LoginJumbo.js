import React from 'react';

const LoginJumbo = () => {
  return (
    <div className="container">
      <div className="splash">
        <h1>Agiboard!</h1>
        <h3>Organize your agile process</h3>
        <a className="btn btn-primary btn-lg" role="button" href="/auth/google">
          Get started
        </a>
      </div>
    </div>
  );
};

export default LoginJumbo;
