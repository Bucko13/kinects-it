import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { browserHistory } from 'react-router';
import $ from 'jquery';
import kinectsitTheme from '../assets/kinectsitTheme';
import Subheader from 'material-ui/Subheader';


export class DeleteDeviceButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: '',
    };
  }

  removeDevice() {
    const deviceId = this.props.device.id;
    /* homes id does not matter in this API call, not used */
    const urlPath = '/api/v1/homes/1/devices/'.concat(deviceId);

    $.ajax({
      url: urlPath,
      dataType: 'json',
      crossDomain: true,
      method: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      success: () => {
        // send user to dashboard and new list of devices will populate
        browserHistory.push('/dashboard');
      },
      error: (/* xhr, status, err */) => {
        this.setState({ error: 'Error leaving device - please try again in a few minutes.' });
      },
    });
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <h5>Warning</h5>
        <RaisedButton
          style={{ width: '100%' }}
          backgroundColor={kinectsitTheme.palette.accent1Color}
          label="Remove Device"
          onClick={() => (this.removeDevice())}
        />
        <div>{this.state.error}</div>
        <Subheader
          style={{
            color: kinectsitTheme.palette.darkTextColor,
            lineHeight: '0px',
            display: 'inline-block',
            marginTop: '1.5em',
          }}
        >
        This action can not be undone.
        </Subheader>
      </div>
    );
  }
}

DeleteDeviceButton.propTypes = {
  device: PropTypes.object.isRequired,
};

