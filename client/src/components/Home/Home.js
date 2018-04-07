import React, { Component } from 'react';
import { connect } from 'react-redux';
import LoginJumbo from '../LoginJumbo';

class Home extends Component {
  render() {
    // if user is logged in, redirect to /boards
    if (Object.keys(this.props.user).length !== 0) {
      this.props.history.push('/boards');
    }
    return (
      <div>
        <LoginJumbo />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(mapStateToProps)(Home);
