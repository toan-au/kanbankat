import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Topbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark bg-dark justify-content-between mb-4">
        <Link to="/" className="navbar-brand">
          Agiboard
        </Link>
      </nav>
    );
  }
}

export default Topbar;
