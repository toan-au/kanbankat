import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LoginJumbo from './LoginJumbo';
import Boards from './Boards';

const Main = () => {
  return (
    <main>
      <Switch>
        <Route exact path="/boards" component={Boards} />
        <LoginJumbo />
      </Switch>
    </main>
  );
};

export default Main;
