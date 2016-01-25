import React, { PropTypes } from 'react'
import {ButtonGroup, Button} from 'react-bootstrap'

export class MediaListToolbar extends React.Component {
  static propTypes = {
    selectedMediaIds: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  };

  selectAll() {
    this.props.actions.selectAllMedia();
  }

  unselectAll() {
    this.props.actions.unselectAllMedia();
  }

  render () {
    let countIds = this.props.selectedMediaIds.length;
    let style = {
      maxHeight: countIds > 0 ? '50px' : 0,
      padding: countIds > 0 ? '0 20px 20px' : '0 20px'
    };

    return (
        <div className='listings__toolbar' style={style}>
          <ButtonGroup bsSize="small">
            <Button className="btn-count" disabled>
              <span className="count">{countIds}</span> selected files
            </Button>
            <Button>
              <i className="fa fa-trash" /> Delete selected
            </Button>
            <Button onClick={this.selectAll.bind(this)}>Select all</Button>
            <Button onClick={this.unselectAll.bind(this)}>Deselect all</Button>
          </ButtonGroup>
        </div>
    )
  }
}

export default MediaListToolbar