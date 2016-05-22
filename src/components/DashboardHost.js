import React, { PropTypes } from 'react';
import { DeviceAddButton } from './DeviceAddButton';
import { DeviceList } from './DeviceList';
import { Card, CardHeader, CardText } from 'material-ui/Card';

export const DashboardHost = (props) => (
  <div>
    <h1>Your Host Dashboard</h1>
    <div className="row">
      <div className="medium-5 offset-medium-1 columns">
        <Card className="card header-card">
          <CardHeader className="card-header" title="Host Code" />
          <CardText>
            {props.appState.house.code}
          </CardText>
        </Card>
      </div>
      <div className="medium-5 columns">
        <Card className="card header-card" >
          <CardHeader className="card-header" title="Host Name" />
          <CardText>
            {props.appState.house.name}
          </CardText>
        </Card>
      </div>
    </div>
    <div className="row">
      <DeviceAddButton className="medium-4 columns centered-medium" />
    </div>
    <DeviceList appState={props.appState} actions={props.actions} />
  </div>
);

DashboardHost.propTypes = {
  appState: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

