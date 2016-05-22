/* eslint-disable max-len */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';
import Toggle from 'material-ui/Toggle';
import styles from '../assets/formStyles';
import { DeleteDeviceButton } from './DeleteDeviceButton';
import { DeviceChart } from '../components/DeviceChart';
import { DeviceTransactionTable } from '../components/DeviceTransactionTable';
import CircularProgress from 'material-ui/CircularProgress';
import { FormMessageDialogue } from '../components/FormMessageDialogue';
import { Card, CardHeader, CardText, CardTitle } from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import { browserHistory } from 'react-router';
import moment from 'moment';
import $ from 'jquery';
import kinectsitTheme from '../assets/kinectsitTheme';

export class DeviceProfilePage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: '',
      transactions: [],
      totalEarned: 0,
      spinner: false,
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

    const apiPath = '/api/v1/homes/'.concat(homeId).concat('/devices/').concat(deviceId);
    $.get(apiPath, (res) => {
      this.calculations(res);
    })
    .fail((/* error */) => {
      this.setState({
        error: 'Communication error',
        details: 'Failed to retrieve devices from home, please try again.',
      });
      this.openErrorMessage();
    });
  }

  openErrorMessage() {
    this.messageDialogue.handleOpen();
  }

  calculations(data) {
    const transactions = data;

    // set initial state
    let totalEarned = 0;

    for (let i = 0; i < transactions.length; i++) {
      // add to total earned
      totalEarned += parseInt(transactions[i].amountspent, 10);
      // update the transactions array to include real-language time for processing in the transaction table component
      transactions[i].formattedTime = moment(transactions[i].timestamp).format('MMM Do, YYYY');
      // update the transactions array to include real-language amount spent for processing in the transaction table component
      const minutes = Math.floor(transactions[i].timespent / 3600000);
      const formattedTime = `${minutes} minutes`;
      transactions[i].formattedTimeSpent = formattedTime;
    }

    this.setState({
      totalEarned,
      transactions,
    });
  }

  toggleDevice() {
    this.state.error = '';
    this.state.details = '';

    const id = this.props.appState.featured.id;
    const deviceState = {
      isactive: !this.props.appState.featured.isactive,
      paidusage: false,
    };

    const homeId = this.props.appState.house.id;
    const apiPath = '/api/v1/homes/'.concat(homeId).concat('/devices/').concat(id);

    this.setState({ spinner: true });

    $.post(apiPath, deviceState, (res) => {
      if (!res.success) {
        this.setState({
          error: 'Device communication error',
          details: res.message,
        });
        this.openErrorMessage();
      } else {
        if (this.props.appState.featured.isactive) {
          this.props.actions.toggleDevice(false);
        } else {
          this.props.actions.toggleDevice(true);
        }
      }
    })
    .fail(() => {
      this.setState({
        error: 'Device communication error',
        details: 'Failed to connect to device, please try again.',
      });
      this.openErrorMessage();
    })
    .always(() => {
      this.setState({ spinner: false });
    });
  }


  render() {
    let spinner = this.state.spinner ?
      <div className="loading"><CircularProgress size={2} /></div> : '';
    let toggle = (
      <div style={{ height: '150px', paddingTop: '20px' }}>
        <Toggle
          iconStyle={{ width: '120px' }}
          trackStyle={{ height: '75px', width: '220px', borderRadius: '220px' }}
          thumbStyle={{ width: '130px', height: '130px', top: '-20px' }}
          onToggle={() => this.toggleDevice()}
          defaultToggled={this.props.appState.featured.isactive}
        />
      </div>
    );

    if (this.props.appState.featured.id === '') {
      return (
        <div style={styles.center}>
          <h2>Uh oh!</h2>
          <p>You need to choose a device to display.</p>
          <p>Click <a href="/dashboard">here</a> to return to your dashboard.</p>
        </div>
      );
    }
    if (this.props.appState.featured.paidusage === true) {
      toggle = (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '0px' }}>Your guest has paid to use the device</p>
          <FontIcon
            className="material-icons"
            style={{ fontSize: '4em' }}
            color={kinectsitTheme.palette.warning1Color}
          >
          warning
          </FontIcon>
          <Subheader
            style={{ color: kinectsitTheme.palette.darkTextColor, lineHeight: '0px' }}
          >
          It cannot be toggled until it is complete
          </Subheader>
        </div>
      );
    }

    let chart = <div></div>;
    let transactions = <div></div>;

    if (this.state.transactions.length > 0) {
      chart = <div><DeviceChart transactions={this.state.transactions} /></div>;
      transactions = <div><DeviceTransactionTable transactions={this.state.transactions} /></div>;
    }

    return (
      <div>
        <Card className="card header-card device-header">
          <CardHeader title="About Your Device" className="card-header" />
          <CardTitle title={this.props.appState.featured.name} className="card-title" />
          <CardText className="card-text">
            <List className="list">
              <Subheader>Device Description</Subheader>
              <ListItem
                className="list-item"
                primaryText={this.props.appState.featured.description}
                leftAvatar={<FontIcon className="material-icons">description</FontIcon>}
              />
              <Subheader>Total Earned</Subheader>
              <ListItem
                className="list-item"
                primaryText={'You have earned $'.concat(this.state.totalEarned).concat(' from this device')}
                leftAvatar={<FontIcon className="material-icons">highlight</FontIcon>}
              />
            </List>
          </CardText>
        </Card>
        {spinner}
        <div className="row">
          <div className="medium-6 columns">
            {toggle}
          </div>
          <div className="medium-6 columns">
            <DeleteDeviceButton device={this.props.appState.featured} />
          </div>
        </div>
        <FormMessageDialogue
          ref={(node) => { this.messageDialogue = node; }}
          title={this.state.error}
          failure
        >
          <p>{this.state.details}</p>
        </FormMessageDialogue>
        <div className="chart-container">
          <h2>Recent Guest Transactions</h2>
          {chart}
          {transactions}
        </div>
      </div>
    );
  }
}

DeviceProfilePage.propTypes = {
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
)(DeviceProfilePage);

