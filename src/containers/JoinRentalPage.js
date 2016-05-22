import React, { PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import Formsy from 'formsy-react';
import { FormsyText } from 'formsy-material-ui/lib';
import styles from '../assets/formStyles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';
import { browserHistory } from 'react-router';
import CircularProgress from 'material-ui/CircularProgress';
import { FormMessageDialogue } from '../components/FormMessageDialogue';
import $ from 'jquery';

export class JoinRentalPage extends React.Component {

  constructor(props) {
    super(props);

    this.errorMessages = {
      inviteCodeError: 'Please enter an invite code',
      submitError: 'Please resolve invalid input and try again',
    };

    this.state = {
      error: '',
      details: '',
      canSubmit: true,
      spinner: false,
    };
  }

  openErrorMessage() {
    this.messageDialogue.handleOpen();
  }

  addRental(data) {
    const userId = this.props.authState.user.id;
    const code = data.inviteCode;
    const urlPath = '/api/v1/users/'.concat(userId).concat('/homes/').concat(code);

    this.setState({ spinner: true });

    $.ajax({
      url: urlPath,
      dataType: 'json',
      crossDomain: true,
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: (response) => {
        if (!response.success) {
          this.openErrorMessage();
          this.setState({
            error: 'Error Joining Home',
            details: response.message,
          });
        } else {
          const house = {
            id: response.houseid,
            code: data.inviteCode,
            name: response.housename,
          };
          this.props.actions.addHouse(house);
          browserHistory.push('/dashboard');
        }
        this.setState({ spinner: false });
      },
      error: (/* xhr, status, err */) => {
        this.setState({ error: 'Failed to find home',
                        details: 'Please resolve invalid input and try again.' });
        this.openErrorMessage();
        this.setState({ spinner: false });
      },
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

  formErrorMessage(error) {
    let msg = null;
    if (error === 'INVALID_JOIN_RENTAL') {
      msg = 'Please resolve invalid input and try again.';
    }

    return msg;
  }

  render() {
    let spinner = this.state.spinner ?
      <div className="loading"><CircularProgress size={2} /></div> : '';

    return (
      <div>
        <h2>Join new rental</h2>
        {spinner}
        <Paper style={styles.paperStyle}>
          <Formsy.Form
            onValid={() => this.enableButton()}
            onValidSubmit={(data) => this.addRental(data)}
            onInvalidSubmit={this.errorMessages.submitError}
            autoComplete="off"
          >
            <FormsyText
              name="inviteCode"
              validations="isExisty"
              validationError={this.errorMessages.inviteCodeError}
              required
              style={styles.fieldStyles}
              floatingLabelText="Invite Code"
            />
            <div style={styles.center}>
              <FlatButton
                style={styles.submitStyle}
                type="submit"
                label="Join"
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


JoinRentalPage.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(JoinRentalPage);

