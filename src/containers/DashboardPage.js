import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';
import { DashboardHost } from '../components/DashboardHost';
import { DashboardGuest } from '../components/DashboardGuest';
import { browserHistory } from 'react-router';
import $ from 'jquery';

export class DashboardPage extends React.Component {

  componentWillMount() {
    if (!this.props.appState.house.id) {
      browserHistory.push('/join-rental');
    }
    const userHouseId = this.props.appState.house.id;
    const urlPath = '/api/v1/homes/'.concat(userHouseId).concat('/devices');
    $.ajax({
      url: urlPath,
      dataType: 'json',
      crossDomain: true,
      method: 'GET',
      contentType: 'application/json; charset=utf-8',
      // data: JSON.stringify(data),
      success: (result) => {
        this.props.actions.loadDevices(result);
      },
      error: (/* xhr, status, err */) => {
      },
    });
  }

  clickButton() {
    this.props.actions.addDevice(this.state.device);
  }

  render() {
    if (this.props.appState.isHost) {
      return (
        <div className="row dashboard-container">
          <div className="host-dashboard dashboard">
            <DashboardHost appState={this.props.appState} actions={this.props.actions} />
          </div>
        </div>
      );
    }
    return (
      <div className="dashboard-container">
        <div className="guest-dashboard dashboard">
          <DashboardGuest
            appState={this.props.appState}
            authState={this.props.authState}
            actions={this.props.actions}
          />
        </div>
      </div>
    );
  }
}

DashboardPage.propTypes = {
  authState: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  appState: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    appState: state.appState,
    authState: state.authState,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);

