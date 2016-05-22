import React from 'react';
// import RaisedButton from 'material-ui/RaisedButton';
import { NavLink } from './NavLink';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import kinectsitTheme from '../assets/kinectsitTheme';
import Paper from 'material-ui/Paper';

export const DeviceAddButton = () => (
  <div style={{ textAlign: 'center', padding: '30px 0px' }} className="row">
    <Paper
      zDepth={3}
      className="medium-5 columns medium-centered"
      style={{ padding: '1em' }}
    >
      <h4>Add A New Device</h4>
      <NavLink to="/add-device">
        <FloatingActionButton backgroundColor={kinectsitTheme.palette.successColor}>
          <ContentAdd />
        </FloatingActionButton>
      </NavLink>
    </Paper>
  </div>
);


      // <RaisedButton label="Add Device" backgroundColor={kinectsitTheme.palette.primary1Color} />
