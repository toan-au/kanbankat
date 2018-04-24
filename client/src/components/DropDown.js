import React, { Component } from 'react';
import { KebabVeritcalIcon } from 'react-octicons';

class DropDown extends Component {
  render() {
    return (
      <div className="DropDown float-right">
        <div className="dropright">
          <button
            className="toggleButton"
            id="dropdownMenu"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="true"
          >
            <KebabVeritcalIcon />
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenu">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default DropDown;
