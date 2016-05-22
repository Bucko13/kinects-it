import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import kinectsitTheme from '../assets/kinectsitTheme';
// import RaisedButton from 'material-ui/RaisedButton';
// import SignupForm from '../containers/SignupForm';
import $ from 'jquery';

export class Home extends React.Component {
  componentWillMount() {
    $('#app').addClass('home');
  }

  componentWillUnmount() {
    $('#app').removeClass('home');
  }
  render() {
    return (
      <div>
        <div className="fullscreen-bg">
          <video
            loop
            muted
            autoPlay
            poster="./assets/videos/videoframe.png"
            className="fullscreen-bg__video"
          >
            <source src="../assets/videos/kinectsit.webmhd.webm" type="video/webm" />
            <source src="../assets/videos/kinectsit.mp4" type="video/mp4" />
            <source src="../assets/videos/kinectsit.oggtheora.ogv" type="video/ogg" />
          </video>
        </div>
        <div className="home-container row">
          <div className="small-10 small-offset-1 medium-6 medium-offset-5 columns">
            <Card
              className="card"
              style={{
                background: 'none',
                border: '1px solid '.concat(kinectsitTheme.palette.textColor),
              }}
            >
              <CardTitle
                title="Your Appliances are Lazy"
                subtitle="Put them to work with Kinects It!"
              />
              <CardText>
                With Kinects.It, you don't need to wait for your home to get smart.
                Just plug in and get started. No more hunting for quarters or
                surprises on your electricity bill.
              </CardText>
              <FlatButton
                label="Get Started"
                linkButton
                href="/signup"
                hoverColor={kinectsitTheme.palette.accent1Color}
                style={
                  { color: kinectsitTheme.palette.textColor,
                    borderColor: kinectsitTheme.palette.textColor,
                    background: 'none',
                    border: '1px solid',
                  }
                }
                primary
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
