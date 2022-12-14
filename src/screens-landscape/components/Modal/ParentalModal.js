import React, { PureComponent } from 'react';
import { View, Text, TouchableHighlight, TextInput } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class ParentalModal extends PureComponent {
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
                    : 700;
    }
    getInputWidth() {
        return GLOBAL.Device_IsWebTV
            ? 400
            : GLOBAL.Device_IsPhone
                ? GLOBAL.Device_Width - 80
                : GLOBAL.Device_IsAppleTV
                    ? 600
                    : 400;
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
                        <Text style={[styles.H3, { padding: 20 }]}>
                            {this.props.Title}
                        </Text>
                    </View>
                    <View
                        style={{ flex: 1, padding: 20, justifyContent: 'center' }}
                    >
                        <View style={[styles.InputCode]}>
                            <Text
                                style={[styles.Standard, { paddingVertical: 10 }]}
                            >
                                {LANG.getTranslation('enter_pin_access')}
                            </Text>
                            {/* <TouchableHighlight
                                style={{
                                    marginLeft: 30,
                                    marginRight: 30,
                                    borderWidth: 3,
                                    borderColor: 'transparent',
                                    width: this.getInputWidth(),
                                    backgroundColor: '#222',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                                hasTVPreferredFocus={true}
                                underlayColor={GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet ? 'transparent' : GLOBAL.Button_Color} onPress={() => this.inputbox.focus()} onPressIn={() => this.inputbox.focus()}>
                                <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                                        <FontAwesome5 style={{ fontSize: 20, color: '#fff' }} icon={SolidIcons.lock} />
                                        <TextInput
                                            {...this.props}
                                            ref={inputbox => this.inputbox = inputbox}
                                            style={[styles.InputSleek, { width: 140 }]}
                                            placeholder={this.props.Placeholder}
                                            underlineColorAndroid='transparent'
                                            placeholderTextColor='#fff'
                                            selectionColor='#000'
                                            keyboardAppearance={'dark'}
                                            secureTextEntry={true}
                                        />
                                        {RenderIf(this.props.showerror)(
                                            <FontAwesome5 style={{ fontSize: 20, color: 'red' }} icon={SolidIcons.exclamationTriangle} />
                                        )}
                                    </View>
                                </View>
                            </TouchableHighlight> */}

                            <Parental_Keyboard
                                onChangeText={this.handleInputCode}
                            ></Parental_Keyboard>
                        </View>
                    </View>
                    {/* {RenderIf(this.props.OnPressButton2 != undefined)(
                        <View style={{ flexDirection: 'row' }}>
                            <ButtonFullSize onPress={this.props.OnPressButton1} Width={(this.getWidth() / 2) - 10} Padding={0} underlayColor={GLOBAL.Button_Color} hasTVPreferredFocus={false} Text={LANG.getTranslation(this.props.TextButton1)} />
                            <ButtonFullSize onPress={this.props.OnPressButton2} Width={(this.getWidth() / 2) - 10} Padding={0} underlayColor={GLOBAL.Button_Color} hasTVPreferredFocus={true} Text={LANG.getTranslation(this.props.TextButton2)} />
                        </View>
                    )} */}
                </View>
            </View>
        );
    }
}
export default ParentalModal;
