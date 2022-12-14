import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';

class MessageModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            type: '',
            content: '',
            qrcode: '',
            timestamp: 0,
            messages: [],
            message_index: 0,
            show_message_home: false,
            count: 0,
        };
    }
    getHeight() {
        return GLOBAL.Device_IsWebTV ? 300 : GLOBAL.Device_IsPhone ? 250 : 300;
    }
    getWidth() {
        return GLOBAL.Device_IsWebTV
            ? 700
            : GLOBAL.Device_IsPhone
            ? GLOBAL.Device_Width - 20
            : 700;
    }
    getBackgroundColor(type) {
        if (type == 'Normal') {
            return '#82e0aa';
        }
        if (type == 'Alert') {
            return '#cb4335';
        }
        if (type == 'Warning') {
            return '#e67e22';
        }
        if (type == 'Information') {
            return '#3498db';
        }
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
                        backgroundColor: this.getBackgroundColor(
                            this.props.Status,
                        ),
                        padding: 10,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#111',
                            width: this.getWidth(),
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
                                {this.props.TextSubject}
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                padding: 20,
                                justifyContent: 'center',
                            }}
                        >
                            <View style={{flex: 1, justifyContent: 'center'}}>
                                <Text
                                    style={[
                                        styles.Standard,
                                        {padding: 5, marginBottom: 20},
                                    ]}
                                >
                                    {this.props.TextContent}
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        backgroundColor: '#222',
                                        padding: 10,
                                    }}
                                >
                                    <View>
                                        <QRCode
                                            value={this.props.QRCode}
                                            size={75}
                                            bgColor="purple"
                                            fgColor="white"
                                        />
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            marginLeft: 20,
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.Medium,
                                                {padding: 5},
                                            ]}
                                        >
                                            {LANG.getTranslation(
                                                'scan_qr_code',
                                            )}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <ButtonFullSize
                                onPress={this.props.OnPressButton1}
                                Width={this.getWidth() - 10}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={true}
                                Text={LANG.getTranslation('close')}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
export default MessageModal;
