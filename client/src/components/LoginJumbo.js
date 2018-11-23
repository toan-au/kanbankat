import React from 'react';

const LoginJumbo = () => {
  return (
    <div className="LoginJumbo">
      <div className="splash">
        <div className="brand-title">
          <h1 className="title">Agiboard!</h1>
          <h3 className="title">Organize your agile process</h3>
        </div>
        <a className="btn btn-primary btn-lg" role="button" href="/auth/google">
          Get started
        </a>
      </div>
    </div>
  );
};

export default LoginJumbo;
