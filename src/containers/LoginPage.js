/* eslint-disable no-param-reassign*/
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
import FontIcon from 'material-ui/FontIcon';
import { Card, CardTitle } from 'material-ui/Card';

export class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.errorMessages = {
      passwordError: 'Please enter a password of at least 5 characters',
      nameError: 'Please enter a user name',
      submitError: 'Please resolve invalid input and try again',
    };
    this.state = {
      // setting to always be true due to Formsy only validating on blur of text fields
      // TODO: write onChange to do own validation and set this back to false
      canSubmit: true,
      error: '',
    };
  }

  componentWillMount() {
    $('body').addClass('blur-bg');
  }

  componentWillUnmount() {
    $('body').removeClass('blur-bg');
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

  login(data) {
    this.setState({ spinner: true });

    $.ajax({
      url: '/api/v1/session/',
      dataType: 'json',
      crossDomain: true,
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: (response) => {
        this.setState({ spinner: false });
        if (!response.login) {
          // server could not log user in, show error
          this.setState({ error: 'INVALID_LOGIN' });
          this.openErrorMessage();
        } else {
          this.props.actions.setAuthentication(true, response.sessionId);
          this.props.actions.setUser(response.user);
          this.props.actions.loadPayAccounts(response.payAccounts);
          if (response.host) {
            this.props.actions.setUserAsHost(true);
            this.props.actions.addHouse(response.house);
            // send user to dashboard page if successful response
            browserHistory.push('/dashboard');
          } else {
            // user is guest
            this.props.actions.setUserAsHost(false);
            // if the user is in a house, send to dashboard, otherwise send to join-rental
            if (response.house) {
              this.props.actions.addHouse(response.house);
              browserHistory.push('dashboard');
            } else {
              browserHistory.push('join-rental');
            }
          }
        }
      },
      error: (/* xhr, status, err */) => {
        this.setState({ spinner: false });
        this.setState({ error: 'INVALID_LOGIN' });
        this.openErrorMessage();
      },
      complete: () => {
      },
    });
  }

  openErrorMessage() {
    this.messageDialogue.handleOpen();
  }

  formErrorMessage(error) {
    let msg = null;
    if (error === 'INVALID_SUBMIT') {
      msg = 'Please resolve invalid input and try again.';
    } else if (error === 'INVALID_LOGIN') {
      msg = 'Invalid Login';
    } else {
      msg = 'Unknown error';
    }

    return msg;
  }

  render() {
    let spinner = this.state.spinner ?
      <div className="loading"><CircularProgress size={2} /></div> : '';

    return (
      <div className="medium-8 medium-centered columns">
        <Card
          style={{
            boxShadow: 'none',
            textAlign: 'center',
            backgroundColor: 'none',
          }}
        >
          <CardTitle
            title="Login to your account"
          />
        </Card>
        {spinner}
        <Paper style={styles.paperStyle} className="column align-self-middle">
          <div className="row">
            <div className="medium-8 medium-offset-2 small-12 columns">
              <FlatButton
                className="expanded button"
                label="Login With Coinbase"
                backgroundColor="#2b71b1"
                hoverColor="#18355C"
                linkButton
                href="/api/v1/auth/coinbase"
                style={{ color: 'white' }}
                secondary
                icon={<FontIcon className="material-icons">arrow_right</FontIcon>}
              />
            </div>
          </div>
          <Formsy.Form
            onValid={() => this.enableButton()}
            onValidSubmit={(data) => this.login(data)}
            onInvalidSubmit={this.errorMessages.submitError}
            autoComplete="off"
            onChange={this.validateForm}
          >
            <FormsyText
              name="name"
              validations="isExisty"
              validationError={this.errorMessages.nameError}
              required
              style={styles.fieldStyles}
              floatingLabelText="User Name"
            />
            <FormsyText
              name="password"
              validations="minLength:5"
              validationError={this.errorMessages.passwordError}
              required
              type="password"
              style={styles.fieldStyles}
              hintText="Minimum 5 characters"
              floatingLabelText="Password"
            />
            <div style={styles.center}>
              <FlatButton
                className="expanded button"
                style={styles.submitStyle}
                type="submit"
                label="Login"
                disabled={!this.state.canSubmit}
              />
            </div>
          </Formsy.Form>
          <FormMessageDialogue
            ref={(node) => { this.messageDialogue = node; }}
            title={this.formErrorMessage(this.state.error)}
            failure
          >
            <p>The login attempt failed.  Please re-enter your user name and password.</p>
          </FormMessageDialogue>
        </Paper>
      </div>
    );
  }
}

LoginPage.propTypes = {
  actions: PropTypes.object.isRequired,
  authState: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
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
)(LoginPage);

