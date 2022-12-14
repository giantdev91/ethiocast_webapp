import React, { Component, PureComponent } from 'react';
import { View, TextInput, TouchableHighlight } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Input_Search extends Component {
    render() {
        return (
            <View style={{ margin: 10, flex: 1 }}>
                {RenderIf(GLOBAL.Device_IsAppleTV == true)(
                    <View
                        style={[
                            styles.InputCode,
                            {
                                borderRadius: 5,
                                borderWidth: 3,
                                width: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.23)',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                height: 100,
                            },
                        ]}
                    >
                        <TouchableHighlight
                            hasTVPreferredFocus={true}
                            style={{ borderRadius: 5, width: '100%' }}
                            underlayColor={GLOBAL.Button_Color}
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
                                    <FontAwesome5
                                        style={{
                                            fontSize: 30,
                                            color: '#fff',
                                            marginLeft: 30,
                                        }}
                                        // icon={SolidIcons.search}
                                        name="search"
                                    />
                                    <TextInput
                                        {...this.props}
                                        ref={inputbox =>
                                            (this.inputbox = inputbox)
                                        }
                                        style={[
                                            styles.Input,
                                            {
                                                width:
                                                    this.props.isTV != undefined
                                                        ? this.props.Width
                                                        : GLOBAL.App_Theme ==
                                                            'Iridium'
                                                            ? this.props.Width - 240
                                                            : this.props.Width,
                                                height: 80,
                                                borderBottomColor:
                                                    'transparent',
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
                        </TouchableHighlight>
                    </View>,
                )}
                {RenderIf(GLOBAL.Device_IsAppleTV == false)(
                    <View
                        style={[
                            styles.InputCode,
                            {
                                borderRadius: 5,
                                borderWidth: 3,

                                width: '95%',
                                backgroundColor: 'rgba(0, 0, 0, 0.23)',
                                //justifyContent: 'center',
                                //alignContent: 'center',
                                //alignItems: 'center',
                                //height: 40
                            },
                        ]}
                    >
                        <TouchableHighlight
                            style={{ borderRadius: 5, width: '100%' }}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this.inputbox.focus()}
                        >
                            <View style={{ flexDirection: 'column' }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <FontAwesome5
                                        style={{
                                            fontSize: 20,
                                            color: '#fff',
                                            marginLeft: 20,
                                            marginRight: 20,
                                        }}
                                        // icon={SolidIcons.search}
                                        name="search"
                                    />
                                    <TextInput
                                        {...this.props}
                                        ref={inputbox =>
                                            (this.inputbox = inputbox)
                                        }
                                        style={[
                                            styles.InputSearch,
                                            {
                                                width:
                                                    this.props.isTV == undefined
                                                        ? this.props.Width - 200
                                                        : this.props.Width,
                                                borderBottomColor:
                                                    'transparent',
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
                        </TouchableHighlight>
                    </View>,
                )}
            </View>
        );
    }
}
export default Input_Search;
