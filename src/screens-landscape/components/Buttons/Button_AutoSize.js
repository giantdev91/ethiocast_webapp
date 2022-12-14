import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Button_AutoSize extends Component {
    render() {
        return (
            <View
                style={[
                    GLOBAL.Device_IsAppleTV
                        ? styles.ButtonAutoSizeApple
                        : GLOBAL.Device_IsSmartTV
                            ? styles.ButtonAutoSizeSmartTV
                            : styles.ButtonAutoSize,
                    { borderRadius: 5, backgroundColor: '#000' },
                ]}
            >
                <TouchableHighlightFocus
                    BorderRadius={5}
                    {...this.props}
                    onFocusExtra={
                        this.props.onFocusExtra != undefined
                            ? () => this.props.onFocusExtra()
                            : null
                    }
                    style={{ borderRadius: 5, height: '100%' }}
                    Padding={this.props.Padding}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={this.props.underlayColor}
                    onPress={() => this.props.onPress()}
                >
                    {RenderIf(this.props.Icon != undefined)(
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                paddingHorizontal: 10,
                            }}
                        >
                            {
                                (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                    <FontAwesome
                                        style={[
                                            styles.Shadow,
                                            {
                                                color: '#fff',
                                                fontSize: GLOBAL.Device_IsAppleTV
                                                    ? 35
                                                    : 20,
                                            },
                                        ]}
                                        // icon={this.props.Icon}
                                        name={this.props.Icon} />
                                ) : (
                                    <FontAwesome5
                                        style={[
                                            styles.Shadow,
                                            {
                                                color: '#fff',
                                                fontSize: GLOBAL.Device_IsAppleTV
                                                    ? 35
                                                    : 20,
                                            },
                                        ]}
                                        // icon={this.props.Icon}
                                        name={this.props.Icon} />
                                )
                            }

                            <Text style={[styles.Standard, { margin: 5 }]}>
                                {this.props.Text}
                            </Text>
                        </View>,
                    )}
                    {RenderIf(this.props.Icon == undefined)(
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                paddingHorizontal: 10,
                            }}
                        >
                            <Text
                                style={[
                                    this.props.FontSize != null
                                        ? this.props.FontSize
                                        : styles.Standard,
                                    { paddingHorizontal: 5 },
                                ]}
                            >
                                {this.props.Text}
                            </Text>
                        </View>,
                    )}
                </TouchableHighlightFocus>
            </View>
        );
    }
}
export default Button_AutoSize;
