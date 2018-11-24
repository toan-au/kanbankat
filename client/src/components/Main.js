import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import LoginJumbo from './LoginJumbo';
import Boards from './ListBoard/Boards';
import ViewBoard from './ViewBoard/ViewBoard';
import Home from './Home/Home';

class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path="/boards" component={Boards} />
          <Route exact path="/board/:boardId" component={ViewBoard} />
          <Route path="/" component={Home} />
        </Switch>
      </main>
    );
  }
}

export default Main;
