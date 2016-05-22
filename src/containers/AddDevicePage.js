import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import Formsy from 'formsy-react';
import { FormsyText } from 'formsy-material-ui/lib';
import styles from '../assets/formStyles';
import { browserHistory } from 'react-router';
import CircularProgress from 'material-ui/CircularProgress';
import { FormMessageDialogue } from '../components/FormMessageDialogue';
import $ from 'jquery';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import kinectsitTheme from '../assets/kinectsitTheme';

export class AddDevicePage extends React.Component {

  constructor(props) {
    super(props);

    this.errorMessages = {
      deviceIdError: 'Please provide a valid device ID',
    };

    this.state = {
      error: '',
      canSubmit: true,
      spinner: false,
    };
  }

  openErrorMessage() {
    this.messageDialogue.handleOpen();
  }

  enableButton() {
    this.setState({
      canSubmit: true,
    });
  }

  disableButton() {
    this.setState({
      canSubmit: false,
    });
  }

  /**
    Called on after submit form to check hardware
  */
  pingDevice(device) {
    const deviceState = { isActive: true };
    /* homes id does not matter in this API call, not used */
    const apiPath = '/api/v1/homes/1/devices/ping/'.concat(device.deviceId);
    this.disableButton();
    this.setState({ spinner: true });

    $.post(apiPath, deviceState, (req) => {
      const configuredDevice = {
        configured: true,
        id: device.deviceId,
        isActive: true,
      };

      if (!req.success === true) {
        this.openErrorMessage();
        this.setState({
          error: 'Unable to add the device',
          details: req.message,
        });
      } else {
        this.props.actions.addDevice(configuredDevice);
        // send user to setupDevice page if successful response
        browserHistory.push('/setup-device');
      }
    })
    .fail(() => {
      // set local state to display error
      this.setState({
        error: 'Unable to add the device',
        details: 'Failed to connect to device, please try again.',
      });
    })
    .always(() => {
      this.setState({ spinner: false });
      this.enableButton();
    });
  }

  render() {
    let spinner = this.state.spinner ?
      <div className="loading"><CircularProgress size={2} /></div> : '';

    return (
      <div>
        <h2>Add Device</h2>
        {spinner}
        <Card className="card header-card">
          <CardHeader
            className="card-header"
            title="Your device should be OFF before starting this process."
          />
          <CardText>
            <p>Enter a device ID to begin setting up a new device.</p>
          </CardText>
        </Card>

        <Paper style={styles.paperStyle}>
          <Formsy.Form
            onValid={() => this.enableButton()}
            onValidSubmit={(data) => { this.pingDevice(data); }}
            onInvalidSubmit={() => this.notifyFormError()}
            autoComplete="off"
          >
            <FormsyText
              name="deviceId"
              validations="isExisty"
              validationError={this.errorMessages.deviceIdError}
              required
              style={styles.fieldStyles}
              floatingLabelText="Enter Device ID"
            />
            <div style={styles.center}>
              <FlatButton
                style={{ width: '100%' }}
                backgroundColor={kinectsitTheme.palette.successColor}
                hoverColor={kinectsitTheme.palette.successDark}
                type="submit"
                label="Find a Device"
                disabled={!this.state.canSubmit}
              />
            </div>
          </Formsy.Form>
          <FormMessageDialogue
            ref={(node) => { this.messageDialogue = node; }}
            title={this.state.error}
            failure
          >
            <p>{this.state.details}</p>
          </FormMessageDialogue>
        </Paper>
      </div>
    );
  }
}

AddDevicePage.propTypes = {
  actions: PropTypes.object.isRequired,
  appState: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    appState: state.appState,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddDevicePage);
