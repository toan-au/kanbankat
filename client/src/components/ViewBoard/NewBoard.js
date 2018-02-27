import React, { Component } from 'react';
import axios from 'axios';
import { createList } from '../../actions/boards';
import { connect } from 'react-redux';

class NewBoard extends Component {
  state = { name: '' };
  onChange(e) {
    this.setState({ name: e.target.value });
  }
  onSubmit(e) {
    e.preventDefault();
    this.props.handleSubmit({ name: this.state.name });
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
          <input
            type="submit"
            className="btn btn-primary btn-block"
            value="Create"
          />
        </form>
      </div>
    );
  }
}

export default connect(null, {})(NewBoard);
