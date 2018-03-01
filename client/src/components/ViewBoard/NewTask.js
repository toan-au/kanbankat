import React, { Component } from 'react';
import { PlusIcon } from 'react-octicons';
import clickOutside from 'react-click-outside';

class NewTask extends Component {
  state = { description: '', showForm: false };

  handleDescChange(e) {
    this.setState({ description: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.description);
  }

  handleClickOutside() {
    this.closeForm();
  }

  toggleForm() {
    this.setState({ showForm: !this.state.showForm });
  }

  closeForm() {
    this.setState({ showForm: false });
  }

  renderForm() {
    return (
      <form className="clearfix" onSubmit={this.handleSubmit.bind(this)}>
        <div className="form-group">
          <textarea
            type="textarea"
            className="form-control"
            value={this.state.description}
            placeholder="New task..."
            onChange={this.handleDescChange.bind(this)}
          />
        </div>
        <button
          type="button"
          className="btn btn-danger float-left"
          onClick={this.toggleForm.bind(this)}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success float-right">
          Add
        </button>
      </form>
    );
  }

  renderButton() {
    return (
      <button
        type="button"
        className="btn btn-block btn-sm"
        onClick={this.toggleForm.bind(this)}
      >
        <PlusIcon />
      </button>
    );
  }

  render() {
    return (
      <div className="NewTask">
        {this.state.showForm ? this.renderForm() : this.renderButton()}
      </div>
    );
  }
}

export default clickOutside(NewTask);
