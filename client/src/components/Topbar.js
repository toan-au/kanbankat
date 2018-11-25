import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { PersonIcon } from 'react-octicons';

class Topbar extends Component {
  renderUserMenu() {
    const userDropdown = (
      <ul className="navbar-nav float-right">
        <li className="nav-item dropdown float-right" key="userDropdown">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="navbarDropdownMenuLink"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Welcome {this.props.user.displayName}
          </a>
          <div
            className="dropdown-menu"
            aria-labelledby="navbarDropdownMenuLink"
          >
            <a href="/auth/google" className="dropdown-item">
              Change user
            </a>
            <a href="/auth/logout" className="dropdown-item">
              Logout
            </a>
          </div>
        </li>
      </ul>
    );
    if (Object.keys(this.props.user).length !== 0) {
      return userDropdown;
    }
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand" href="#">
            Agiboard
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className="nav-link" href="#">
                  Home <span className="sr-only">(current)</span>
                </Link>
              </li>
              <li className="nav-item">{this.renderUserMenu()}</li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(mapStateToProps)(Topbar);
