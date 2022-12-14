import React, {Component} from 'react';
import {
    View,
    Text,
    Dimensions,
    StyleSheet,
    Platform,
    Image,
} from 'react-native';
import RNRestart from 'react-native-restart';
import LANG from '../languages/languages';

var GLOBALModule = require('../datalayer/global');
var GLOBAL = GLOBALModule.default;

const {width} = Dimensions.get('window');

export default class OfflineNotice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
        };
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
        }
        if (
            GLOBAL.Device_IsWebTV == false &&
            GLOBAL.Device_IsAppleTV == false
        ) {
            NetInfo.fetch().then(isConnected => {
                if (isConnected == true) {
                    this.setState({
                        isConnected: true,
                    });
                } else {
                    this.setState({
                        isConnected: false,
                    });
                }
            });
            // Subscribe
            const unsubscribe = NetInfo.addEventListener(state => {
                this.handleConnectivityChange(state.isConnected);
            });
            // Unsubscribe
            unsubscribe();
            // NetInfo.addEventListener(
            //     'connectionChange',
            //     this.handleConnectivityChange,
            // );
        }
    }

    componentWillUnmount() {
        // Subscribe
        const unsubscribe = NetInfo.addEventListener(state => {
            this.handleConnectivityChange(state.isConnected);
        });
        // Unsubscribe
        unsubscribe();
        // NetInfo.removeEventListener(
        //   'connectionChange',
        //   this.handleConnectivityChange,
        // );
    }

    handleConnectivityChange = isConnected => {
        if (isConnected == true) {
            this.setState({
                isConnected: true,
            });
        } else {
            this.setState({
                isConnected: false,
            });
        }
    };
    _openSettings() {}
    MiniOfflineSign() {
        return (
            <View>
                <View style={styles.offlineContainer}>
                    <View>
                        <Image
                            source={require('../images/wifi_off-black-48dp/2x/outline_wifi_off_black_48dp.png')}
                            style={styles.player_button_icon}
                        />
                    </View>
                </View>
                <View style={styles.offlineContainer}>
                    <View>
                        <Text style={styles.offlineText}>
                            {LANG.getTranslation('no_internet_connection')}
                        </Text>
                    </View>
                </View>
                <View style={styles.offlineContainer}>
                    <View>
                        {RenderIf(GLOBAL.Device_System == 'Android')(
                            <TouchableHighlightFocus
                                style={{backgroundColor: '#444'}}
                                underlayColor={'#888'}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() =>
                                    AndroidOpenSettings.generalSettings()
                                }>
                                <View>
                                    <Text style={styles.login_text_}>
                                        {LANG.getTranslation('open_settings')}
                                    </Text>
                                </View>
                            </TouchableHighlightFocus>,
                        )}
                    </View>
                </View>
                <View style={styles.offlineContainer}>
                    <View>
                        {RenderIf(GLOBAL.Device_System == 'Android')(
                            <TouchableHighlightFocus
                                style={{backgroundColor: '#444'}}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() => RNRestart.Restart()}>
                                <View>
                                    <Text style={styles.login_text_}>
                                        {LANG.getTranslation(
                                            'retry_loading_app',
                                        )}
                                    </Text>
                                </View>
                            </TouchableHighlightFocus>,
                        )}
                    </View>
                </View>
            </View>
        );
    }
    render() {
        if (this.state.isConnected == false) {
            return this.MiniOfflineSign();
        } else {
            return null;
        }
    }
}

const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        height: 100,
        width,
    },
    offlineText: {
        color: '#fff',
        fontSize: 20,
    },
});
