import React, { Component } from 'react';
import axios from 'axios';

export default class NewBoard extends Component {
  state = { name: '' };
  onChange(e) {
    this.setState({ name: e.target.value });
  }
  onSubmit(e) {
    e.preventDefault();
  }

  render() {
    return (
      <div className="NewBoard list">
        <form onSubmit={this.onSubmit.bind(this)}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="New list name"
              onChange={this.onChange.bind(this)}
              value={this.state.name}
            />
          </div>
        </form>
        <button className="btn btn-primary btn-block">Create</button>
      </div>
    );
  }
}
