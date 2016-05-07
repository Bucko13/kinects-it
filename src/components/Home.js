import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';


export const HomePage = () => (
  <div>
    <h1>Welcome to Kinects.It!</h1>
    <div>
      <h2 id="how-it-works">Here's how it works</h2>
      <RaisedButton label="Get Started" />
    </div>
  </div>
);

HomePage.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);

