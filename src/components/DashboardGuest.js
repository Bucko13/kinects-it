import React, { PropTypes } from 'react';
import { DeviceList } from './DeviceList';
import { LeaveHomeButton } from '../containers/LeaveHomeButton';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';

export const DashboardGuest = (props) => (
  <div>
    <div className="row">
      <Paper
        zDepth={1}
        className="dashboard-title medium-10 medium-centered columns"
      >
        <h2>
          <FontIcon
            className="material-icons"
            style={{ fontSize: '100%' }}
          >
          home
          </FontIcon>
          Welcome to {props.appState.house.name}!
        </h2>
      </Paper>
    </div>
    <DeviceList appState={props.appState} actions={props.actions} />
    <div className="row">
      <LeaveHomeButton
        appState={props.appState}
        authState={props.authState}
        actions={props.actions}
      />
    </div>
  </div>
);

DashboardGuest.propTypes = {
  appState: PropTypes.object.isRequired,
  authState: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

