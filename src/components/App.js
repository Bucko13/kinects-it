import React, { PropTypes } from 'react';
import TitleBar from './TitleBar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import kinectsitBaseTheme from '../assets/kinectsitTheme';
const kinectsitTheme = getMuiTheme(kinectsitBaseTheme);

/**
* This is an import the global styles sheet.
* Webpack combines this and ouputs as a unique stylesheet when run
*/
import '../assets/scss/app.scss';

export const App = (props) => (
  <MuiThemeProvider muiTheme={kinectsitTheme}>
    <div className="app-container">
      <TitleBar store={props.store} />
      <div className="expanded row">
        <div className="page medium-8 medium-centered columns">
          {props.children}
        </div>
      </div>
    </div>
  </MuiThemeProvider>
);

App.propTypes = {
  children: PropTypes.element,
  route: PropTypes.object,
  store: PropTypes.object,
};

