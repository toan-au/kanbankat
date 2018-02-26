import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getBoard } from '../../actions/boards';
import { withRouter } from 'react-router-dom';
import BackButton from '../BackButton';

class ViewBoard extends Component {
  componentDidMount() {
    this.props.getBoard(this.props.match.params.boardId);
  }

  renderTasks(tasks = []) {
    return tasks.map(task => (
      <div className="task" key={task._id}>
        <span>{task.name}</span>
        <p>{task.description}</p>
      </div>
    ));
  }

  renderLists(lists = []) {
    return lists.map(list => (
      <div className="list" key={list._id}>
        <h5 className="list-header">{list.name}</h5>
        <div className="tasks">{this.renderTasks(list.tasks)}</div>
      </div>
    ));
  }

  render() {
    return (
      <div className="ViewBoard container-fluid">
        <div className="container">
          <BackButton />
          <h1>{this.props.board.name}</h1>
        </div>
        <div className="lists">{this.renderLists(this.props.board.lists)}</div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { board: state.board };
};

export default withRouter(connect(mapStateToProps, { getBoard })(ViewBoard));
