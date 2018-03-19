import React, { Component } from 'react';
import './App.css';
import Main from './Main';
import { connect } from 'react-redux';
import { getUser } from '../actions/user';
import { withRouter } from 'react-router-dom';
import Topbar from './Topbar';

class App extends Component {
  componentDidMount() {
    this.props.getUser();
  }

  render() {
    return (
      <div className="App">
        <Topbar />
        <div className="container-fluid">
          <Main />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default withRouter(connect(mapStateToProps, { getUser })(App));
