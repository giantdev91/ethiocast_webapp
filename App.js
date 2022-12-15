import { StatusBar } from 'expo-status-bar';
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';

import { AppRegistry, FlatList, TextInput, View, Text, StyleSheet } from 'react-native';
import App from './src/app';
import KeyEvent from 'react-native-keyevent';
import QRCode from 'react-native-qrcode-svg';
import FontAwesome, {
  SolidIcons,
  RegularIcons,
  BrandIcons,
} from 'react-native-fontawesome';
import { MaterialIndicator } from 'react-native-indicators';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import Voice from '@react-native-voice/voice';
import PlayServices from 'react-native-play-services';
// import RNFetchBlob from 'rn-fetch-blob';
import NetInfo from '@react-native-community/netinfo';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import Orientation from 'react-native-orientation';
import FocusButton from './src/screen-portrait/components/FocusButton.tsx';

import clear from 'react-native-clear-app-cache';
import moment from 'moment';
import LANG from './src/languages/languages';
import LANG_CODES from './src/languages/language_codes';
import UTILS from './src/datalayer/utils';
import STYLE from './src/styling/style';
import REPORT from './src/datalayer/report_web';
import DAL from './src/datalayer/dal_web';
import TOKEN from './src/datalayer/token';
import baseStyle from './src/styling/base';
import RenderIf from './src/utils/RenderIf';
import { name as appName } from './app.json';
import Bugsnag from '@bugsnag/expo'
Bugsnag.start({ apiKey: 'd0ee703ffcc7d40d8a61d204eea9ad0a' });


// import { Client, Configuration, Report } from 'bugsnag-react-native';
// const config = new Configuration('d0ee703ffcc7d40d8a61d204eea9ad0a');
// config.appVersion = require('./package.json').version;
// const bugsnag = new Client(config);

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = Text.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

var DRMType = {
  WIDEVINE: 'widevine',
  PLAYREADY: 'playready',
  CLEARKEY: 'clearkey',
  FAIRPLAY: 'fairplay',
};

var GLOBALModule = require('./src/datalayer/global');
var GLOBAL = GLOBALModule.default;

GLOBAL.BaseCdnUrl = 'https://cloudtv.akamaized.net/';
GLOBAL.CDN_Prefix = 'https://cloudtv03.akamaized.net';
GLOBAL.BigQueryUrl = 'https://mwarebigquery.appspot.com/';
GLOBAL.DrmKeyServerUrl = 'https://wv-keyos.licensekeyserver.com';

global.PanGestureHandler = PanGestureHandler;
global.TapGestureHandler = TapGestureHandler;
global.State = State;

global.VideoView = null;
global.FocusButton = FocusButton;
global.Orientation = Orientation;
global.SystemNavigationBar = SystemNavigationBar;
global.RenderIf = RenderIf;
global.NetInfo = NetInfo;
// global.RNFetchBlob = RNFetchBlob;
global.Voice = Voice;
global.PlayServices = PlayServices;
// global.Configuration = Configuration;
// global.Report = Report;
// global.Bugsnag = Client;
global.moment = moment;
global.GestureRecognizer = GestureRecognizer;
global.swipeDirections = swipeDirections;
global.baseStyle = baseStyle;
global.KeyEvent = KeyEvent;
global.TOKEN = TOKEN;
global.GLOBAL = GLOBAL;
global.clear = clear;
global.useCastState = null;
global.CastState = null;
global.GoogleCast = null;
global.CastButton = null;
global.useCastSession = null;
global.useRemoteMediaClient = null;
global.LANG = LANG;
global.LANG_CODES = LANG_CODES;
global.UTILS = UTILS;
global.STYLE = STYLE;
global.DAL = DAL;
global.REPORT = REPORT;

global.styles = [];
global.reactNativeTvosController = null;
global.AccessToken = null;
global.LoginManager = null;
global.GraphRequest = null;
global.GraphRequestManager = null;
global.GoogleSignin = null;
global.statusCodes = null;
global.QRCode = QRCode;
global.FlatList = FlatList;
global.FontAwesome = FontAwesome;
global.SolidIcons = SolidIcons;
global.RegularIcons = RegularIcons;
global.BrandIcons = BrandIcons;
global.ActivityIndicator = MaterialIndicator;
global.AsyncStorage = AsyncStorage;
global.DRMType = DRMType;
// global.bugsnag = bugsnag;

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

export default App;
