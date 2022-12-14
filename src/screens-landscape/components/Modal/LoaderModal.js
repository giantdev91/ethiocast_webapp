import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';

class StandardModal extends PureComponent {
    constructor(props) {
        super(props);
    }
    getHeight() {
        return GLOBAL.Device_IsWebTV
            ? 300
            : GLOBAL.Device_IsPhone
            ? 250
            : GLOBAL.Device_IsAppleTV
            ? 450
            : 300;
    }
    getWidth() {
        return GLOBAL.Device_IsWebTV
            ? 700
            : GLOBAL.Device_IsPhone
            ? GLOBAL.Device_Width - 20
            : GLOBAL.Device_IsAppleTV
            ? 1050
            : 500;
    }
    render() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    position: 'absolute',
                    zIndex: 99999,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(7, 7, 7, 0.73)',
                }}
            >
                <View
                    style={{
                        backgroundColor: '#111',
                        width: this.getWidth(),
                        height: this.getHeight(),
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#000',
                            borderWidth: 3,
                            borderColor: '#111',
                        }}
                    >
                        <Text style={[styles.H3, {padding: 20}]}>
                            {this.props.Title}
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            padding: 20,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        {RenderIf(this.props.ShowLoader == true)(
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ActivityIndicator
                                    size={75}
                                    color={'#e0e0e0'}
                                />
                            </View>,
                        )}
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <Text style={[styles.H3, {padding: 5}]}>
                                {this.props.Progress}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
export default StandardModal;
