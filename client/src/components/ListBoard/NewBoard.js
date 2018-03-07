import React, { Component } from 'react';

export default class NewBoard extends Component {
  state = { showForm: false, boardName: '' };

  handleCreateBoard(e) {
    e.preventDefault();
    const newBoard = { name: this.state.boardName };
    this.props.handleCreateBoard(newBoard);
    this.setState({ boardName: '' });
  }

  handleNameChange(e) {
    this.setState({ boardName: e.target.value });
  }

  toggleForm() {
    this.setState({ showForm: !this.state.showForm });
  }

  renderForm() {
    return (
      <div>
        <form onSubmit={this.handleCreateBoard.bind(this)}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Board name..."
              value={this.state.boardName}
              onChange={this.handleNameChange.bind(this)}
              className="form-control mb-3"
            />
            <span className="input-group-btn">
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </span>
          </div>
        </form>
      </div>
    );
  }

  renderButton() {
    return (
      <button
        className="btn btn-primary form-control"
        onClick={this.toggleForm.bind(this)}
      >
        Create board
      </button>
    );
  }

  render() {
    return (
      <div className="row justify-content-md-center">
        <div className="NewBoard col-md-6">
          {this.state.showForm ? this.renderForm() : this.renderButton()}
        </div>
      </div>
    );
  }
}
