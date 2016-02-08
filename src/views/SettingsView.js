import React, { PropTypes } from 'react'
import connectWrapper from '../redux/utils/connect'
import actions from '../redux/rootActions'
import SpottingGroups from '../components/settings/SpottingGroups'
import Predictions from '../components/settings/Predictions'
import Detections from '../components/settings/Detections'
import Numbers from '../components/settings/Numbers'

export class AllView extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    state: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  };

  componentWillMount() {
    this.props.actions.getGroups(this.props.state.auth.token);
    this.props.actions.getItems(this.props.state.auth.token, 'predictions');
    this.props.actions.getItems(this.props.state.auth.token, 'detection');
    this.props.actions.getItems(this.props.state.auth.token, 'numbers');
  }

  render () {
    let state = this.props.state;
    return (
      <div className='content-settings'>
        <div className="content__heading">
          <h3>Settings</h3>
        </div>
        <div className="content__body">
          <SpottingGroups token={this.props.state.auth.token}
                          groupsState={state.settings.groups}
                          actions={this.props.actions}/>

          <Predictions token={this.props.state.auth.token}
                       state={state.settings.items.predictions}
                       actions={this.props.actions}/>

          <Detections token={this.props.state.auth.token}
                      state={state.settings.items.detection}
                      actions={this.props.actions}/>

          <Numbers token={this.props.state.auth.token}
                   state={state.settings.items.numbers}
                   actions={this.props.actions}/>
        </div>
      </div>
    )
  }
}

export default connectWrapper(actions, AllView)
