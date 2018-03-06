import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';

class NewBoard extends Component {
  state = { name: '' };
  onChange(e) {
    this.setState({ name: e.target.value });
  }
  onSubmit(e) {
    e.preventDefault();
    this.props.handleSubmit({ name: this.state.name });
    this.setState({ name: '' });
  }

  render() {
    return (
      // <Draggable
      //   draggableId="somerandomId"
      //   type="NULL"
      //   isDragDisabled={true}
      //   index={900}
      // >
      //   {(provided, snapshot) => (
      //     <div ref={provided.innerRef} {...provided.draggableProps}>
      //       <div className="NewList list">
      //         <form onSubmit={this.onSubmit.bind(this)}>
      //           <div className="form-group">
      //             <input
      //               type="text"
      //               className="form-control"
      //               placeholder="New list name"
      //               onChange={this.onChange.bind(this)}
      //               value={this.state.name}
      //             />
      //           </div>
      //           <input
      //             type="submit"
      //             className="btn btn-primary btn-block"
      //             value="Create"
      //           />
      //         </form>
      //       </div>
      //     </div>
      //   )}
      // </Draggable>
      <div>
        <div className="NewList list">
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
      </div>
    );
  }
}

export default connect(null, {})(NewBoard);
