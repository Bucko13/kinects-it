/* eslint-disable max-len */
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
import { DeviceTransactionTable } from '../components/DeviceTransactionTable';
import CircularProgress from 'material-ui/CircularProgress';
import { FormMessageDialogue } from '../components/FormMessageDialogue';
import { browserHistory } from 'react-router';
import moment from 'moment';
import $ from 'jquery';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';

export class DevicePage extends React.Component {

  constructor(props) {
    super(props);
    this.errorMessages = {
      nameError: 'Please provide a valid name',
      unitsError: 'Please enter valid units',
      priceError: 'Please enter time and price options',
    };
    this.state = {
      deviceActive: false,
      canSubmit: true,
      error: '',
      totalCost: 0,
      totalSpent: 0,
      time: 6000,
      units: 0,
      transactions: [],
      spinner: false,
      checkoutFrameId: '',
      checkoutFrameSrc: '',
      paymentReceived: false,
      readyPayment: false,
      deviceState: '',
    };
  }

  componentWillMount() {
    if (!this.props.appState.featured.id) {
      browserHistory.push('/dashboard');
    }
  }

  componentDidMount() {
    const homeId = this.props.appState.house.id;
    const deviceId = this.props.appState.featured.id;
    const user = { user: this.props.authState.user.id };

    const apiPath = '/api/v1/homes/'.concat(homeId).concat('/devices/').concat(deviceId);
    $.get(apiPath, user, (res) => {
      if (res.success === false) {
        this.setState({
          error: 'Communication error',
          details: 'Failed to retrieve devices from home, please try again.',
        });
        this.openErrorMessage();
      } else {
        this.calculations(res.data);
      }
    })
    .fail((/* error */) => {
      this.openErrorMessage();
      this.setState({
        error: 'Error retrieving device info',
        details: 'There was an error retrieving the device information. Please try again.',
      });
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
        const checkoutFrameSrc = 'https://www.coinbase.com/checkouts/'.concat(txResult).concat('/inline');
        const checkoutFrameId = 'coinbase_inline_iframe_'.concat(txResult);
        this.setState({
          checkoutFrameId,
          checkoutFrameSrc,
        });
        window.addEventListener('message', this.receivePaymentMessage.bind(this), false);
      },
      error: (xhr, status, err) => {
        console.error('there was an error', status, err.toString());
      },
      complete: () => {
        this.setState({
          readyPayment: true,
          deviceState,
        });
        // this.setState({ spinner: false });
      },
    });
  }

  calculations(data) {
    const transactions = data;

    // set initial state
    let totalSpent = 0;

    for (let i = 0; i < transactions.length; i++) {
      // add to total earned
      totalSpent += parseInt(transactions[i].amountspent, 10);
      // update the transactions array to include real-language time for processing in the transaction table component
      transactions[i].formattedTime = moment(transactions[i].timestamp).format('MMM Do, YYYY');
      // update the transactions array to include real-language amount spent for processing in the transaction table component
      const minutes = Math.floor(transactions[i].timespent / 3600000);
      const formattedTime = `${minutes} minutes`;
      transactions[i].formattedTimeSpent = formattedTime;
    }

    this.setState({
      totalSpent,
      transactions,
    });
  }

  openErrorMessage() {
    this.messageDialogue.handleOpen();
  }

  receivePaymentMessage(event) {
    if (event.origin === 'https://www.coinbase.com') {
      const eventType = event.data.split('|')[0];     // "coinbase_payment_complete"
      if (eventType === 'coinbase_payment_complete') {
        console.log('Successful payment, toggle device');
        this.setState({ readyPayment: false });
        this.toggleDevice(this.state.deviceState);
      } else if (eventType === 'coinbase_payment_mispaid') {
        /* output error */
        this.setState({ readyPayment: false });
        console.log('Mispayment made');
      } else if (eventType === 'coinbase_payment_expired') {
        this.setState({ readyPayment: false });
        console.log('Mispayment made');
      } else {
        // Do something else, or ignore
      }
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
    const apiPath = '/api/v1/homes/1/devices/'.concat(hardwarekey);

    this.setState({ spinner: true });

    $.post(apiPath, deviceState, (res) => {
      if (!res.success) {
        this.setState({
          error: res.message,
          details: 'Failed to activate device, please try again',
        });
        this.openErrorMessage();
      } else {
        this.props.actions.toggleDevice(true);
        this.props.actions.paidUsage(true);
        const updatedTransactions = this.state.transactions.concat(res.transactionData);
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
        error: 'Communication error',
        details: 'Failed to connect to device, please try again',
      });
      this.openErrorMessage();
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
  }

  notifyFormError(data) {
    console.error('Form error:', data);
  }

  render() {
    let spinner = this.state.spinner ?
      <div className="loading"><CircularProgress size={2} /></div> : '';

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

    if (!this.props.appState.featured.isactive && !this.state.readyPayment) {
      formDisplay = (
        <Paper style={styles.paperStyle} className="transaction-form paper">
          <Formsy.Form
            onValid={() => this.enableButton()}
            onValidSubmit={(data) => this.submitForm(data)}
            onInvalidSubmit={() => this.notifyFormError()}
            autoComplete="off"
          >
            <FormsyRadioGroup
              name="time" defaultSelected="60000" onChange={(e) => this.handleTime(e)}
            >
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
              validations="isInt"
              validationError={this.errorMessages.unitsError}
              required
              style={styles.fieldStyles}
              onChange={(e) => this.handleUnits(e)}
              floatingLabelText="How many units do you want?"
            />
            <div style={styles.center}>
              <FlatButton
                style={styles.submitStyle}
                type="submit"
                label="Submit"
                disabled={!this.state.canSubmit}
              />
            </div>
          </Formsy.Form>
          <Subheader>
            <p>Total cost: {this.state.totalCost}</p>
          </Subheader>
        </Paper>
      );
    } else if (this.state.readyPayment) {
      formDisplay = (
        <h2>Please make your payment below.</h2>
      );
    } else if (this.state.deviceActive === true) {
      formDisplay = (
        <h2>You enabled the device! Your time expires {this.state.expiration}.</h2>
      );
    }

    let chart = <div></div>;
    let transactions = <div></div>;

    if (this.state.transactions.length > 0) {
      chart = <div><DeviceChart transactions={this.state.transactions} /></div>;
      transactions = <div><DeviceTransactionTable transactions={this.state.transactions} /></div>;
    }

    let newchart = <div></div>;

    if (this.state.updatedTransactions) {
      chart = <div></div>;
      newchart = <div><DeviceChart transactions={this.state.updatedTransactions} /></div>;
    }

    return (
      <div>
        <h2>Enable Device</h2>
        {spinner}

        <Card className="card header-card device-header">
          <CardHeader title={this.props.appState.featured.name} className="card-header" />
          <CardText>
            <List className="list">
              <Subheader>Device Description</Subheader>
              <ListItem
                className="list-item"
                primaryText={this.props.appState.featured.description}
                leftAvatar={<FontIcon className="material-icons">description</FontIcon>}
              />
              <Subheader>Total Spent</Subheader>
              <ListItem
                className="list-item"
                primaryText={'$'.concat(this.state.totalSpent)}
                leftAvatar={<FontIcon className="material-icons">highlight</FontIcon>}
              />
            </List>
          </CardText>
        </Card>
        <div>
          {formDisplay}
          {this.state.readyPayment &&
            <iframe
              id={this.state.checkoutFrameId}
              src={this.state.checkoutFrameSrc}
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
          <FormMessageDialogue
            ref={(node) => { this.messageDialogue = node; }}
            title={this.state.error}
            failure
          >
            <p>{this.state.details}</p>
          </FormMessageDialogue>
          <div className="row">
            <div className="medium-10 medium-centered columns">
              {transactions}
              {newchart}
              {chart}
            </div>
          </div>
        </div>
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
