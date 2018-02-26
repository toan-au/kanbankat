import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getBoard } from '../../actions/boards';

class ViewBoard extends Component {
  componentDidMount() {
    this.props.getBoard(this.props.match.params.boardId);
  }

  renderLists(lists = []) {
    return lists.map(list => {
      <div className="list">{list.name}</div>;
    });
  }

  render() {
    return (
      <div className="ViewBoard container-fluid">
        {console.log(this.props)}
        <div className="container">
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

export default connect(mapStateToProps, { getBoard })(ViewBoard);
