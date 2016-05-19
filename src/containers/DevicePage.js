import React, { PropTypes } from 'react';
import { DeviceChart } from '../components/DeviceChart';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import styles from '../assets/formStyles';
import Formsy from 'formsy-react';
// import FontIcon from 'material-ui/FontIcon';
import { FormsyText, FormsyRadioGroup, FormsyRadio } from 'formsy-material-ui/lib';
import CircularProgress from 'material-ui/CircularProgress';
import $ from 'jquery';
import moment from 'moment';

export class DevicePage extends React.Component {

  constructor(props) {
    super(props);
    this.errorMessages = {
      nameError: 'Please provide a valid name',
      descriptionError: 'Please enter a valid description',
      priceError: 'Please enter time and price options',
    };
    this.state = {
      deviceActive: false,
      canSubmit: false,
      error: '',
      totalCost: 0,
      time: 0,
      units: 0,
      deviceTransactions: [],
      spinner: false,
      checkoutFrameId: '',
      checkoutFrameSrc: '',
      paymentReceived: false,
      readyPayment: false,
    };
  }

  componentDidMount() {
    const homeId = this.props.appState.house.id;
    const deviceId = this.props.appState.featured.id;
    const user = { user: this.props.authState.user.id };

    const apiPath = '/api/v1/homes/'.concat(homeId).concat('/devices/').concat(deviceId);
    $.get(apiPath, user, (req) => {
      this.setState({
        deviceTransactions: req,
      });
    })
    .fail((error) => {
      console.log('error in server response', error);
    });
  }

/**
* A method to retrieve the account information of the currently signed in user
*/
  purchaseDevice(deviceState) {
    /**
    * @type constant
    * @description This object gets sent in the post request body to the REST API for transactions
    */
    console.log('running purchaseDevice');
    const txBody = {
      homeId: this.props.appState.house.id,
      device: {
        name: this.props.appState.featured.name,
        id: this.props.appState.featured.id,
        description: this.props.appState.featured.description,
      },
      amount: parseFloat(this.state.totalCost),
      deviceState,
    };
    const userId = this.props.authState.user.id;
    const txApiRoute = '/api/v1/users/'.concat(userId).concat('/payment');
    $.ajax({
      url: txApiRoute,
      dataType: 'json',
      crossDomain: true,
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(txBody),
      success: (txResult) => {
        console.log('got a response back from transaction server:', txResult);
        const checkoutFrameSrc = 'https://www.coinbase.com/checkouts/'.concat(txResult).concat('/inline');
        // const checkoutButtonLink = 'https://www.coinbase.com/checkouts/'.concat(txResult);
        const checkoutFrameId = 'coinbase_inline_iframe_'.concat(txResult);
        console.log('frameSrc: ', checkoutFrameSrc);
        console.log('frameId: ', checkoutFrameId);
        this.setState({
          checkoutFrameId,
          checkoutFrameSrc,
        });
        window.addEventListener('message', this.receivePaymentMessage, false);
      },
      error: (xhr, status, err) => {
        console.error('there was an error', status, err.toString());
      },
      complete: () => {
        this.setState({
          readyPayment: true,
        });
        // this.setState({ spinner: false });
      },
    });
  }

  receivePaymentMessage(event) {
    if (event.origin === 'https://www.coinbase.com') {
      const eventType = event.data.split('|')[0];     // "coinbase_payment_complete"
      const eventId = event.data.split('|')[1];     // ID for this payment type
      console.log('eventType:', eventType);
      console.log('eventId:', eventId);
    }
  }

  totalCost(time, units) {
    const costPerMs = this.props.appState.featured.usagecostoptions / 3600000;
    return (units * time * costPerMs).toFixed(2);
  }

  handleTime(e) {
    const time = parseInt(e.target.value, 10);
    const totalCost = this.totalCost(time, this.state.units);

    this.setState({
      time,
      totalCost,
    });
  }

  handleUnits(e) {
    const units = parseInt(e.target.value, 10);
    const totalCost = this.totalCost(this.state.time, units);

    this.setState({
      units,
      totalCost,
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

  toggleDevice(deviceState) {
    const hardwarekey = this.props.appState.featured.hardwarekey;
     // TODO: need to replace the home ID with the real one once it is in appState
    const apiPath = '/api/v1/homes/1/devices/'.concat(hardwarekey);

    this.setState({ spinner: true });

    $.post(apiPath, deviceState, (res) => {
      if (!res.success) {
        this.setState({
          error: res.message,
        });
      } else {
        this.props.actions.toggleDevice(true);
        this.props.actions.paidUsage(true);
        const updatedTransactions = this.state.deviceTransactions.concat(res.transactionData);
        const currentTime = Date.now();
        const expirationTime = currentTime + res.transactionData.timespent;
        const expiration = moment(expirationTime).calendar().toLowerCase();
        this.setState({
          deviceActive: true,
          updatedTransactions,
          expiration,
        });
      }
    })
    .fail(() => {
      // set local state to display error
      this.setState({
        error: 'Failed to connect to device, try again.',
      });
    })
    .always(() => {
      this.setState({ spinner: false });
    });
  }

  submitForm(data) {
    const totalTime = data.time * data.units;
    const deviceState = this.props.appState.featured;
    deviceState.payaccountid = this.props.appState.payAccounts[0].id; // first payment option
    deviceState.timespent = totalTime;
    deviceState.amountspent = this.totalCost(data.time, data.units);
    deviceState.paidusage = true;
    deviceState.isactive = true;
    deviceState.deviceid = this.props.appState.featured.id;

    this.purchaseDevice(deviceState);
    // this.toggleDevice(deviceState);
  }

  notifyFormError(data) {
    console.error('Form error:', data);
  }

  render() {
    let spinner = this.state.spinner ?
      <div className="loading"><CircularProgress size={2} /></div> : '';
    let errorMsg = <div style={styles.error}>{this.state.error}</div>;

    if (this.props.appState.featured.id === '') {
      return (
        <div style={styles.center}>
          <h2>Uh oh!</h2>
          <p>You need to choose a device to display.</p>
          <p>Click <a href="/dashboard">here</a> to return to your dashboard.</p>
        </div>
      );
    }

    let formDisplay = <h2>This device is currently active!</h2>;

    if (!this.props.appState.featured.isactive) {
      formDisplay = (
        <Paper style={styles.paperStyle}>
          <Formsy.Form
            onValid={() => this.enableButton()}
            onInvalid={() => this.disableButton()}
            onValidSubmit={(data) => this.submitForm(data)}
            onInvalidSubmit={() => this.notifyFormError()}
          >
            <FormsyRadioGroup name="time" defaultSelected="1" onChange={(e) => this.handleTime(e)}>
              <FormsyRadio
                value="60000"
                label="1 minute"
              />
              <FormsyRadio
                value="3600000"
                label="1 hour"
              />
              <FormsyRadio
                value="86400000"
                label="1 day"
              />
            </FormsyRadioGroup>
            <FormsyText
              name="units"
              validations="isExisty"
              validationError={this.errorMessages.descriptionError}
              required
              style={styles.fieldStyles}
              onChange={(e) => this.handleUnits(e)}
              floatingLabelText="How many units do you want?"
            />
            <FlatButton
              style={styles.submitStyle}
              type="submit"
              label="Submit"
              disabled={!this.state.canSubmit}
            />
          </Formsy.Form>
          <Subheader>
            <p>Total cost: {this.state.totalCost}</p>
          </Subheader>
        </Paper>
      );
    } else if (this.state.deviceActive === true) {
      formDisplay = (
        <h2>You enabled the device! Your time expires {this.state.expiration}.</h2>
      );
    }

    let chart = <div></div>;

    if (this.state.deviceTransactions.length > 0) {
      chart = <div><DeviceChart transactions={this.state.deviceTransactions} /></div>;
    }

    let newchart = <div></div>;

    if (this.state.updatedTransactions) {
      chart = <div></div>;
      newchart = <div><DeviceChart transactions={this.state.updatedTransactions} /></div>;
    }

    return (
      <div>
        <h2>How much time would you like to use the {this.props.appState.featured.name}?</h2>
        {errorMsg}
        {spinner}
        <h3>This device is: {this.props.appState.featured.description}</h3>
        {formDisplay}
        {newchart}
        {chart}
        {this.state.readyPayment &&
          <iframe
            id="coinbase_inline_iframe_342c513cb4ea6f9b5c4e8b7904421ad1"
            src="https://www.coinbase.com/checkouts/342c513cb4ea6f9b5c4e8b7904421ad1/inline"
            style={
              {
                width: '460px',
                height: '350px',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }
            }
            allowTransparency="true"
            frameBorder="0"
          ></iframe>
        }
      </div>
    );
  }
}


DevicePage.propTypes = {
  actions: PropTypes.object.isRequired,
  appState: PropTypes.object.isRequired,
  authState: PropTypes.object.isRequired,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DevicePage);

// ****** was using to test the purchase *****/
// <FlatButton
//   label="Check Coinbase Account"
//   backgroundColor="#2b71b1"
//   hoverColor="#18355C"
//   onMouseUp={() => this.getAcctInfo()}
//   onTouchEnd={() => this.getAcctInfo()}
//   style={{ color: 'white' }}
//   secondary
//   icon={<FontIcon className="material-icons">arrow_right</FontIcon>}
// />
// <Paper style={styles.paperStyle}>
//   <a href={this.state.accountInfo} data-button-text="Rent Device">Click Me</a>
// </Paper>
