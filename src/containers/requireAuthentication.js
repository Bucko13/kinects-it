import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import $ from 'jquery';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';

export function requireAuthentication(Component) {
  class AuthenticatedComponent extends React.Component {

    componentWillMount() {
      this.checkAuth();
    }

    checkAuth() {
      if (!this.props.authState.isAuthenticated) {
        // current local state not authenticated
        // check with server if current session is authenticated
        $.ajax({
          url: '/api/v1/authentication',
          type: 'GET',
          xhrFields: {
            withCredentials: true,
          },
        })
          .done((response) => {
            if (response) {
              console.log('what is the response from user on checkAuth:', response);
              this.props.actions.setUserAsHost(response.defaultviewhost);
              this.props.actions.setUser(response.user);
              this.props.actions.loadPayAccounts(response.payAccounts);
              if (response.house) {
                this.props.actions.addHouse(response.house);
              }
              this.props.actions.setAuthentication(true, response.sessionId);
            } else {
              browserHistory.push('/login');
            }
          })
          .fail((error) => {
            console.log('there was an error:', error);
          });
      }
    }

    render() {
      return (
        <div>
            {this.props.authState.isAuthenticated === true
              ? <Component {...this.props} />
              : null
            }
        </div>
      );
    }
  }

  AuthenticatedComponent.propTypes = {
    actions: PropTypes.object.isRequired,
    authState: PropTypes.object.isRequired,
    appState: PropTypes.object.isRequired,
  };

  function mapStateToProps(state) {
    return {
      authState: state.authState,
      appState: state.appState,
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(actions, dispatch),
    };
  }
  return connect(mapStateToProps, mapDispatchToProps)(AuthenticatedComponent);
}
