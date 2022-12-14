import React, { Component } from 'react';
import { View, TextInput } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Input_Standard extends Component {
    render() {
        return (
            <View>
                {RenderIf(GLOBAL.Device_IsAppleTV == true)(
                    <View
                        style={[
                            styles.InputStandard,
                            GLOBAL.Device_IsAppleTV
                                ? styles.ButtonNormalApple
                                : styles.ButtonNormal,
                        ]}
                    >
                        <TouchableHighlightFocus
                            style={
                                GLOBAL.Device_IsAppleTV
                                    ? styles.ButtonNormalApple
                                    : styles.ButtonNormal
                            }
                            Padding={this.props.Padding}
                            hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                            underlayColor={this.props.underlayColor}
                            onPress={() => this.inputbox.focus()}
                        >
                            <View style={{ flexDirection: 'column' }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    {RenderIf(this.props.icon != undefined)(
                                        (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                            <FontAwesome
                                                style={[
                                                    styles.IconsMenu,
                                                    { padding: 10 },
                                                ]}
                                                // icon={this.props.icon}
                                                name={this.props.icon}
                                            />
                                        ) : (
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenu,
                                                    { padding: 10 },
                                                ]}
                                                // icon={this.props.icon}
                                                name={this.props.icon}
                                            />
                                        )
                                    )}
                                    <TextInput
                                        {...this.props}
                                        style={[
                                            styles.Input,
                                            {
                                                height: 80,
                                                width: this.props.width * 1.5,
                                                borderBottomColor:
                                                    'transparent',
                                                color: '#fff',
                                                borderColor: '#444',
                                                paddingLeft: 10,
                                                borderWidth: 2,
                                            },
                                        ]}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#fff"
                                        selectionColor="#000"
                                        keyboardAppearance={'dark'}
                                    ></TextInput>
                                </View>
                            </View>
                        </TouchableHighlightFocus>
                    </View>,
                )}
                {RenderIf(GLOBAL.Device_IsAppleTV == false)(
                    <View style={[styles.InputStandard]}>
                        <TouchableHighlightFocus
                            style={{
                                borderRadius: 5,
                                height: 60,
                                justifyContent: 'center',
                            }}
                            Padding={this.props.Padding}
                            hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                            underlayColor={this.props.underlayColor}
                            onPress={() => this.inputbox.focus()}
                        >
                            <View style={{ flexDirection: 'column' }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    {RenderIf(this.props.icon != undefined)(
                                        (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                            <FontAwesome
                                                style={[
                                                    styles.IconsMenu,
                                                    { padding: 10 },
                                                ]}
                                                // icon={this.props.icon}
                                                name={this.props.icon}
                                            />
                                        ) : (
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenu,
                                                    { padding: 10 },
                                                ]}
                                                // icon={this.props.icon}
                                                name={this.props.icon}
                                            />
                                        )
                                    )}
                                    <TextInput
                                        {...this.props}
                                        ref={inputbox =>
                                            (this.inputbox = inputbox)
                                        }
                                        style={[
                                            styles.Input,
                                            {
                                                width: this.props.width,
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.40)',
                                                height:
                                                    GLOBAL.Device_IsWebTV &&
                                                        !GLOBAL.Device_IsSmartTV
                                                        ? 25
                                                        : 45,
                                                paddingLeft: 10,
                                                borderColor: '#444',
                                                borderWidth: 2,
                                            },
                                        ]}
                                        placeholder={this.props.Placeholder}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#fff"
                                        selectionColor="#000"
                                        keyboardAppearance={'dark'}
                                    />
                                </View>
                            </View>
                        </TouchableHighlightFocus>
                    </View>,
                )}
            </View>
        );
    }
}
export default Input_Standard;
