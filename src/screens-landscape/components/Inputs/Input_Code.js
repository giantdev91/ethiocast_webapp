import React, { Component, PureComponent } from 'react';
import { View, TextInput, TouchableHighlight } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Input_Code extends Component {
    render() {
        return (
            <View style={[styles.InputCode, { width: this.props.width + 40 }]}>
                <TouchableHighlight
                    style={{
                        marginLeft: 30,
                        marginRight: 30,
                        borderRadius: 100,
                        borderWidth: 3,
                        borderColor: 'transparent',
                        width: 300,
                        backgroundColor: 'rgba(0, 0, 0, 0.23)',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}
                    hasTVPreferredFocus={true}
                    underlayColor={
                        GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                            ? 'transparent'
                            : GLOBAL.Button_Color
                    }
                    onPress={() => this.inputbox.focus()}
                    onPressIn={() => this.inputbox.focus()}
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
                            <FontAwesome5
                                style={{ fontSize: 20, color: '#fff' }}
                                // icon={SolidIcons.lock}
                                name="lock"
                            />
                            <TextInput
                                {...this.props}
                                ref={inputbox => (this.inputbox = inputbox)}
                                style={[
                                    styles.InputSleek,
                                    { width: this.props.width },
                                ]}
                                placeholder={this.props.Placeholder}
                                underlineColorAndroid="transparent"
                                placeholderTextColor="#fff"
                                selectionColor="#000"
                                keyboardAppearance={'dark'}
                            />
                            {RenderIf(this.props.showerror)(
                                <FontAwesome5
                                    style={{ fontSize: 20, color: 'red' }}
                                    // icon={SolidIcons.exclamationTriangle}
                                    name="exclamation-triangle"
                                />,
                            )}
                        </View>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
}
export default Input_Code;
