import React, { Component } from 'react';
import { View } from 'react-native';
// import {RegularIcons, SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text } from '../components/';
class MessageModalHome extends Component {
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
    componentDidMount() {
        this.getMessages();
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
    onPressDelete = index => {
        DAL.deleteMessage(
            GLOBAL.IMS,
            GLOBAL.CRM,
            GLOBAL.UserID,
            GLOBAL.Pass,
            index - 1,
        ).then(messages => {
            this.getMessages();
        });
    };
    onPressNext = () => {
        var index = -1;
        index = index + this.state.message_index + 1;
        if (index >= this.state.messages.length - 1) {
            var newMessage = this.state.messages[index];
            this.setState({
                type: newMessage.type,
                qrcode: newMessage.qrcode,
                content: newMessage.content,
                timestamp: newMessage.timestamp,
                show_message_home: true,
                message_index: index + 1,
            });
        }
    };
    onPressPrevious = () => {
        var index = -1;
        index = index + this.state.message_index - 1;
        if (index >= 0) {
            var newMessage = this.state.messages[index];
            this.setState({
                type: newMessage.type,
                qrcode: newMessage.qrcode,
                content: newMessage.content,
                timestamp: newMessage.timestamp,
                show_message_home: true,
                message_index: index + 1,
            });
        }
    };
    getMessages() {
        DAL.getMessages(
            GLOBAL.IMS,
            GLOBAL.CRM,
            GLOBAL.UserID,
            GLOBAL.Pass,
        ).then(messages => {
            try {
                if (messages != undefined) {
                    if (messages != null) {
                        if (messages.messages != null) {
                            if (messages.messages.length > 0) {
                                var newMessage =
                                    messages.messages[
                                    messages.messages.length - 1
                                    ];
                                this.setState({
                                    type: newMessage.type,
                                    qrcode: newMessage.qrcode,
                                    content: newMessage.content,
                                    timestamp: newMessage.timestamp,
                                    messages: messages.messages,
                                    message_index: messages.messages.length,
                                    count: messages.messages.length,
                                    show_message_home: true,
                                });
                            }
                        }
                    }
                }
            } catch (e) { }
        });
    }
    render() {
        return (
            <View style={{}}>
                {RenderIf(this.state.show_message_home == true)(
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: this.getBackgroundColor(
                                this.state.type,
                            ),
                            height:
                                GLOBAL.Device_IsWebTV ||
                                    GLOBAL.Device_IsAppleTV ||
                                    GLOBAL.Device_IsSmartTV
                                    ? 90
                                    : 60,
                            flexDirection: 'row',
                            borderRadius: 5,
                            width: '100%',
                            padding: 10,
                        }}
                    >
                        <View style={{ justifyContent: 'center' }}>
                            <QRCode
                                value={this.props.QRCode}
                                size={
                                    GLOBAL.Device_IsWebTV ||
                                        GLOBAL.Device_IsAppleTV ||
                                        GLOBAL.Device_IsSmartTV
                                        ? 60
                                        : 40
                                }
                                bgColor="purple"
                                fgColor="white"
                            />
                        </View>
                        <View
                            style={{
                                flex: 8,
                                justifyContent: 'center',
                                marginLeft: 20,
                            }}
                        >
                            <Text numberOfLines={2} bold>
                                {this.state.content}
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {RenderIf(this.state.type != 'Alert')(
                                <FocusButton
                                    onPress={() =>
                                        this.onPressDelete(
                                            this.state.message_index,
                                        )
                                    }
                                >
                                    <View
                                        style={{
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.50)',
                                            borderRadius: 5,
                                            width: 40,
                                            height: 40,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: 10,
                                        }}
                                    >
                                        <FontAwesome5
                                            style={{
                                                fontSize: 18,
                                                color: '#fff',
                                                padding: 10,
                                            }}
                                            // icon={RegularIcons.trashAlt}
                                            name="trash-alt"
                                        />
                                    </View>
                                </FocusButton>,
                                // <ButtonCircle underlayColor={GLOBAL.Button_Color} Icon={RegularIcons.trashAlt} onPress={() => this.onPressDelete(this.state.message_index)}></ButtonCircle>
                            )}
                        </View>
                        {RenderIf(this.state.count > 1)(
                            <View
                                style={{
                                    flex: 2,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingRight: 0,
                                }}
                            >
                                <FocusButton
                                    onPress={() => this.onPressPrevious()}
                                >
                                    <View
                                        style={{
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.50)',
                                            borderRadius: 5,
                                            width: 40,
                                            height: 40,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: 10,
                                        }}
                                    >
                                        <FontAwesome5
                                            style={{
                                                fontSize: 18,
                                                color: '#fff',
                                                padding: 10,
                                            }}
                                            // icon={SolidIcons.arrowLeft}
                                            name="arrow-left"
                                        />
                                    </View>
                                </FocusButton>

                                <Text
                                    style={[styles.H5, { paddingHorizontal: 10 }]}
                                >
                                    {this.state.message_index} -{' '}
                                    {this.state.count}
                                </Text>
                                <FocusButton onPress={() => this.onPressNext()}>
                                    <View
                                        style={{
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.50)',
                                            borderRadius: 5,
                                            width: 40,
                                            height: 40,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: 10,
                                        }}
                                    >
                                        <FontAwesome5
                                            style={{
                                                fontSize: 18,
                                                color: '#fff',
                                                padding: 10,
                                            }}
                                            // icon={SolidIcons.arrowRight}
                                            name="arrow-right"
                                        />
                                    </View>
                                </FocusButton>
                            </View>,
                        )}
                    </View>,
                )}
            </View>
        );
    }
}
export default MessageModalHome;
