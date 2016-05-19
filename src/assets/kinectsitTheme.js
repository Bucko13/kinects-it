/* eslint-disable strict, no-underscore-dangle */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _colors = require('material-ui/styles/colors');

const _colorManipulator = require('material-ui/utils/colorManipulator');

const _spacing = require('material-ui/styles/spacing');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _spacing2 = _interopRequireDefault(_spacing);

const textColor = _colors.fullWhite;

exports.default = {
  spacing: _spacing2.default,
  fontFamily: 'Roboto, sans-serif',
  appBar: {
    textColor: _colors.grey100,
    titleStyle: {
      textAlign: 'center',
      marginLeft: '-5%',
    },
  },
  palette: {
    primary1Color: _colors.deepOrangeA700,
    // primary1Color: _colors.blueGrey400,
    primary2Color: _colors.deepOrangeA700,
    primary3Color: _colors.grey600,
    accent1Color: _colors.blueGrey400,
    accent2Color: _colors.pinkA400,
    accent3Color: _colors.pinkA100,
    textColor,
    alternateTextColor: '#303030',
    canvasColor: '#303030',
    borderColor: (0, _colorManipulator.fade)(_colors.fullWhite, 0.3),
    disabledColor: (0, _colorManipulator.fade)(_colors.fullWhite, 0.3),
    pickerHeaderColor: (0, _colorManipulator.fade)(_colors.fullWhite, 0.12),
    clockCircleColor: (0, _colorManipulator.fade)(_colors.fullWhite, 0.12),
  },
};
