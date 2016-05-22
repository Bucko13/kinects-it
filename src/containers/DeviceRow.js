import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/actions';
import RaisedButton from 'material-ui/RaisedButton';
import { NavLink } from '../components/NavLink';
import FontIcon from 'material-ui/FontIcon';
import { List, ListItem } from 'material-ui/List';
// import kinectsitTheme from '../assets/kinectsitTheme';
import { Card, CardHeader, CardText } from 'material-ui/Card';

export class DeviceRow extends React.Component {

  setFeatured() {
    this.props.actions.setFeatured(this.props.device);
  }

  render() {
    let active = 'Active';
    let buttonMessage = 'View Transactions';

    if (this.props.device.isactive === false) {
      buttonMessage = 'Purchase Usage';
      active = 'No';
    }

    let guestButton = (
      <NavLink to="/device">
        <RaisedButton
          className="device-button"
          label={buttonMessage}
          onClick={() => this.setFeatured()}
        />
      </NavLink>
    );

    if (this.props.appState.isHost) {
      return (
        <Card className={'device-card '.concat(active === 'No' ? 'inactive' : 'active')}>
          <FontIcon
            className="material-icons"
          >
          widgets
          </FontIcon>
          <CardHeader
            className="device-header"
            title={this.props.device.name}
            actAsExpander
            showExpandableButton
          />
          <CardText expandable>
            <div key={this.props.device.id} className="device-description">
              <List className="description-list">
                <ListItem primaryText={'Status: '.concat(active)} />
                <ListItem
                  primaryText={
                    'Device Description: '.concat(this.props.device.description)}
                />
              </List>
            </div>
          </CardText>
          <NavLink to="/device-profile">
            <RaisedButton
              className="device-button"
              label="Device Options"
              onClick={() => this.setFeatured()}
            />
          </NavLink>
        </Card>
      );
    }
    return (
      <Card className={'device-card '.concat(active === 'No' ? 'inactive' : 'active')}>
        <FontIcon
          className="material-icons"
        >
        widgets
        </FontIcon>
        <CardHeader
          className="device-header"
          title={this.props.device.name}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable>
          <div key={this.props.device.id} className="device-description">
            <List className="description-list">
              <ListItem primaryText={'Name: '.concat(this.props.device.name)} />
              <ListItem primaryText={'Is Active: '.concat(active)} />
            </List>
          </div>
        </CardText>
        {guestButton}
      </Card>
    );
  }
}

DeviceRow.propTypes = {
  device: PropTypes.object.isRequired,
  appState: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
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
)(DeviceRow);

