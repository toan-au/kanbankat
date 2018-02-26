import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import LoginJumbo from './LoginJumbo';
import Boards from './Boards';
import ViewBoard from './pages/ViewBoard';

class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path="/boards" component={Boards} />
          <Route exact path="/board/:boardId" component={ViewBoard} />
          <Route exact path="/aye/123" component={LoginJumbo} />
          <Route path="/" component={LoginJumbo} />
        </Switch>
      </main>
    );
  }
}

export default Main;
