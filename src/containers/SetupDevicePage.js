import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import * as actions from '../actions/actions';
// import FontIcon from 'material-ui/FontIcon';
import Subheader from 'material-ui/Subheader';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import styles from '../assets/formStyles';
import Formsy from 'formsy-react';
import { FormsyText } from 'formsy-material-ui/lib';
import CircularProgress from 'material-ui/CircularProgress';
import $ from 'jquery';

export class SetupDevicePage extends React.Component {
  constructor(props) {
    super(props);
    this.errorMessages = {
      nameError: 'Please provide a valid name',
      descriptionError: 'Please enter a valid description',
      priceError: 'Please enter time and price options',
    };
    this.state = {
      changed: false,
      canSubmit: false,
      costPerDay: 0,
      costPerThreeHours: 0,
      costPerHour: 0,
      costPerMinute: 0,
      spinner: false,
    };
  }

  handleChange(e) {
    const cost = parseInt(e.target.value, 10);
    this.setState({
      costPerWeek: (168 * cost).toFixed(2),
      costPerDay: (24 * cost).toFixed(2),
      costPerHour: (cost).toFixed(2),
      costPerMinute: (cost / 60).toFixed(2),
    });
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

  submitForm(data) {
    const device = data;
    const house = this.props.appState.house.id;
    device.id = this.props.appState.configuredDevice.id;
    device.isactive = false;
    device.paidUsage = false;
    const apiPath = `/api/v1/homes/${house}/devices`;
    this.setState({ spinner: true });

    $.post(apiPath, device, () => {
      this.props.actions.setFeatured(device);
      browserHistory.push('/device-profile');
    })
    .fail((error) => {
      console.log(error);
    })
    .always(() => {
      this.setState({ spinner: false });
    });
  }

  notifyFormError(e) {
    console.error('Form error:', e.target.value);
  }

  render() {
    if (this.props.appState.configuredDevice.id === '') {
      return (
        <div style={styles.center}>
          <h2>Uh oh!</h2>
          There was an error. Click <a href="/add-device">here</a> to re-add your device.
        </div>
      );
    }

    let spinner = this.state.spinner ?
      <div className="loading"><CircularProgress size={2} /></div> : '';

    return (
      <div>
        <div style={styles.center}>
          <h2>Set up Device</h2>
          You must complete this form to add the device to your house.
        </div>
        {spinner}
        <Paper style={styles.paperStyle}>
          <Formsy.Form
            onValid={() => this.enableButton()}
            onInvalid={() => this.disableButton()}
            onValidSubmit={(data) => this.submitForm(data)}
            onInvalidSubmit={() => this.notifyFormError()}
            // onChange={() => this.newChange()}
            onSuccess={(data) => console.log('request received by the server!', data)}
          >
            <FormsyText
              name="name"
              validations="isExisty"
              validationError={this.errorMessages.nameError}
              required
              style={styles.fieldStyles}
              floatingLabelText="Device Name"
            />
            <FormsyText
              name="description"
              validations="isExisty"
              validationError={this.errorMessages.descriptionError}
              required
              style={styles.fieldStyles}
              floatingLabelText="Device Description"
            />
            <Subheader>How much do you want to charge (evaluated per hour)?</Subheader>
            <FormsyText
              name="cost"
              validations="isExisty" // add validation for number
              validationError={this.errorMessages.descriptionError}
              required
              style={styles.fieldStyles}
              onChange={(e) => this.handleChange(e)}
              floatingLabelText="Must be a whole number"
            />
            <FlatButton
              style={styles.submitStyle}
              type="submit"
              label="Submit"
              disabled={!this.state.canSubmit}
            />
          </Formsy.Form>
          <Subheader>
            <p>Cost per Minute: {this.state.costPerMinute}</p>
            <p>Cost per Hour: {this.state.costPerHour}</p>
            <p>Cost per Day: {this.state.costPerDay}</p>
            <p>Cost per Week: {this.state.costPerWeek}</p>
          </Subheader>
        </Paper>
      </div>
    );
  }
}

SetupDevicePage.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SetupDevicePage);

