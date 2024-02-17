import React, { Component } from 'react';
import Main from './Main';
import { connect } from 'react-redux';
import { getUser } from '../actions/user';
import { withRouter } from 'react-router-dom';
import Topbar from './Topbar';

const App = () => {
  componentDidMount() {
    this.props.getUser();
  }

  return (
    <div className="App">
      <Topbar />
      <div>
        <Main />
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return { user: state.user };
};

// export default withRouter(
//   connect(
//     mapStateToProps,
//     { getUser }
//   )(App)
// );
