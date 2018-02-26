import React, { Component } from 'react';
import './App.css';
import Main from './Main';
import { connect } from 'react-redux';
import { getUser } from '../actions/user';

class App extends Component {
  componentDidMount() {
    this.props.getUser();
    console.log(this.props.user);
    console.log('you are so beautiful');
  }

  render() {
    return (
      <div className="App container-fluid">
        <Main />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(mapStateToProps, { getUser })(App);
