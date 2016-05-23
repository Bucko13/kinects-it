/* eslint-disable no-param-reassign, no-return-assign */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';
import Formsy from 'formsy-react';
import { FormsyText, FormsyRadioGroup, FormsyRadio } from 'formsy-material-ui/lib';
import $ from 'jquery';
import { FormMessageDialogue } from '../components/FormMessageDialogue';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import styles from '../assets/formStyles';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import { browserHistory } from 'react-router';
import FontIcon from 'material-ui/FontIcon';

class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    this.errorMessages = {
      emailError: 'Please provide a valid email',
      passwordError: 'Please enter a password of at least 5 characters',
      nameError: 'Please enter a user name',
      mismatchPassword: 'Your passwords don\'t match',
    };
    this.state = {
      canSubmit: true,
      dialogueOpen: false,
      isHost: true,
    };
  }

  componentWillMount() {
    $('body').addClass('blur-bg');
  }

  componentWillUnmount() {
    $('body').removeClass('blur-bg');
  }

  onUserTypeChange(event) {
    if (event.target.value === 'guest') {
      this.setState({
        isHost: false,
      });
    } else {
      this.setState({
        isHost: true,
      });
    }
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

  openErrorMessage() {
    this.messageDialogue.handleOpen();
  }

  submitForm(data) {
    // need to do this because checkbox components won't fire. Radio buttons work
    // but need to send a boolean to the server
    if (data.host === 'host') {
      data.defaultviewhost = true;
    } else {
      data.defaultviewhost = false;
    }
    if (!data.avatarURL) {
      data.avatarURL = '';
      data.coinbaseId = '';
    }

    this.setState({ spinner: true });

    $.ajax({
      url: '/api/v1/users/',
      dataType: 'json',
      crossDomain: true,
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: (response) => {
        if (!response.login) {
          // server could not add user to the database
          this.openErrorMessage();
        } else {
          // if the response.login is true then user was added
          // first execute action to set user type to host
          if (data.defaultviewhost === true) {
            this.props.actions.setUserAsHost(true);
          } else {
            this.props.actions.setUserAsHost(false);
          }
          // Next set authentication
          this.props.actions.setAuthentication(true, response.sessionId);
          this.props.actions.setUser(response.user);
          this.props.actions.loadPayAccounts(response.payAccounts);
          // next reroute to User Dashboard or join rental
          if (response.house) {
            this.props.actions.addHouse(response.house);
            browserHistory.push('dashboard');
          } else {
            browserHistory.push('join-rental');
          }
        }
      },
      error: (xhr, status, err) => {
        console.error('there was an error', status, err.toString());
      },
      complete: () => {
        this.setState({ spinner: false });
      },
    });
  }

  notifyFormError(data) {
    console.error('Form error:', data);
  }

  render() {
    let spinner = this.state.spinner ?
      <div className="loading"><CircularProgress size={2} /></div> : '';
    return (
      <div>
        {spinner}
        <Paper style={styles.paperStyle}>
          <div className="row">
            <div className="medium-8 medium-offset-2 small-12 columns">
              <FlatButton
                className="expanded button"
                label="Sign Up With Coinbase"
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
            onValidSubmit={(data) => this.submitForm(data)}
            onInvalidSubmit={() => this.notifyFormError()}
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
              name="email"
              validations="isEmail"
              validationError={this.errorMessages.emailError}
              required
              style={styles.fieldStyles}
              floatingLabelText="E-mail"
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
            <FormsyText
              name="repeated_password"
              validations="equalsField:password"
              validationError={this.errorMessages.mismatchPassword}
              required
              type="password"
              style={styles.fieldStyles}
              hintText="Must be same as above"
              floatingLabelText="Re-type password"
            />
            <Subheader>Will you be a Host or a Guest</Subheader>
            <FormsyRadioGroup
              name="host" defaultSelected="host"
              onChange={(event) => this.onUserTypeChange(event)}
            >
              <FormsyRadio
                value="host"
                label="I'm a host"
              />
              <FormsyRadio
                value="guest"
                label="I'm a guest"
              />
            </FormsyRadioGroup>
            {
              (this.state.isHost) ?
                <FormsyText
                  name="home"
                  validations={this.state.homeRequired}
                  validationError={this.errorMessages.homeError}
                  style={styles.fieldStyles}
                  required
                  floatingLabelText="Home Name"
                />
                : ''
            }
            <div style={styles.center}>
              <FlatButton
                className="expanded button"
                style={styles.submitStyle}
                type="submit"
                label="Submit"
                disabled={!this.state.canSubmit}
              />
            </div>
          </Formsy.Form>
          <FormMessageDialogue
            ref={(node) => this.messageDialogue = node}
            title="User Already Exists"
            failure
          >
            <p>This email or username already exists.
            Please choose another username or if you already have an account
            you can try and login</p>
          </FormMessageDialogue>
        </Paper>
      </div>
    );
  }
}

SignupForm.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SignupForm);

