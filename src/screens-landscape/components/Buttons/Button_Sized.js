import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Button_Sized extends Component {
    render() {
        return (
            <View>
                {RenderIf(this.props.SideMenu == undefined)(
                    <View
                        style={[
                            GLOBAL.Device_IsAppleTV
                                ? styles.ButtonSizedApple
                                : GLOBAL.Device_IsSmartTV
                                    ? styles.ButtonSizedSmartTV
                                    : styles.ButtonSized,
                            {
                                width: this.props.Width,
                                backgroundColor: this.props.Color,
                                justifyContent: 'center',
                                alignContent: 'center',
                                borderRadius: 5,
                                backgroundColor: '#000',
                            },
                        ]}
                    >
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            style={{
                                height: '100%',
                                borderRadius: 5,
                                width: this.props.Width,
                            }}
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
                                                style={{
                                                    color: '#fff',
                                                    fontSize: GLOBAL.Device_IsAppleTV
                                                        ? 35
                                                        : 20,
                                                    paddingRight: 5,
                                                }}
                                                // icon={this.props.Icon}
                                                name={this.props.Icon}
                                            />
                                        ) : (
                                            <FontAwesome5
                                                style={{
                                                    color: '#fff',
                                                    fontSize: GLOBAL.Device_IsAppleTV
                                                        ? 35
                                                        : 20,
                                                    paddingRight: 5,
                                                }}
                                                // icon={this.props.Icon}
                                                name={this.props.Icon}
                                            />
                                        )
                                    }

                                    <Text
                                        numberOfLines={1}
                                        style={[styles.Standard, { margin: 5 }]}
                                    >
                                        {this.props.Text}
                                    </Text>
                                </View>,
                            )}
                            {RenderIf(
                                this.props.Icon == undefined &&
                                this.props.IconRight == undefined,
                            )(
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
                                        numberOfLines={1}
                                        style={[styles.Menu]}
                                    >
                                        {this.props.Text}
                                    </Text>
                                </View>,
                            )}
                            {RenderIf(this.props.IconRight != undefined)(
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
                                        numberOfLines={1}
                                        style={[styles.Menu, { margin: 5 }]}
                                    >
                                        {this.props.Text}
                                    </Text>
                                    {
                                        (this.props.IconRight == 'heart' || this.props.IconRight == 'heart-o') ? (
                                            <FontAwesome
                                                style={{
                                                    position: 'absolute',
                                                    left: this.props.Width / 2,
                                                    width: this.props.Width,
                                                    color: '#fff',
                                                    fontSize: GLOBAL.Device_IsAppleTV
                                                        ? 25
                                                        : 15,
                                                    paddingRight: 5,
                                                }}
                                                // icon={this.props.IconRight}
                                                name={this.props.IconRight}
                                            />
                                        ) : (
                                            <FontAwesome5
                                                style={{
                                                    position: 'absolute',
                                                    left: this.props.Width / 2,
                                                    width: this.props.Width,
                                                    color: '#fff',
                                                    fontSize: GLOBAL.Device_IsAppleTV
                                                        ? 25
                                                        : 15,
                                                    paddingRight: 5,
                                                }}
                                                // icon={this.props.IconRight}
                                                name={this.props.IconRight}
                                            />
                                        )
                                    }

                                </View>,
                            )}
                        </TouchableHighlightFocus>
                    </View>,
                )}
                {RenderIf(
                    this.props.SideMenu != undefined &&
                    this.props.Disabled == undefined,
                )(
                    <View
                        style={[
                            GLOBAL.Device_IsAppleTV
                                ? styles.ButtonSizedAppleLeft
                                : GLOBAL.Device_IsSmartTV
                                    ? styles.ButtonSizedSmartTVLeft
                                    : styles.ButtonSizedLeft,
                            {
                                width: this.props.Width,
                                backgroundColor: this.props.Color,
                                justifyContent: 'center',
                                alignContent: 'center',
                                borderRadius: 5,
                                backgroundColor: '#000',
                            },
                        ]}
                    >
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            style={{
                                height: '100%',
                                borderRadius: 5,
                                windth: this.props.Width,
                            }}
                            Padding={this.props.Padding}
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
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.Menu,
                                                { marginVertical: 5 },
                                            ]}
                                        >
                                            {this.props.Text}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            alignItems: 'flex-end',
                                        }}
                                    >
                                        {
                                            (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                                <FontAwesome
                                                    style={{
                                                        color: '#fff',
                                                        fontSize:
                                                            GLOBAL.Device_IsAppleTV
                                                                ? 20
                                                                : 15,
                                                        paddingRight: 5,
                                                    }}
                                                    // icon={this.props.Icon}
                                                    name={this.props.Icon}
                                                />
                                            ) : (
                                                <FontAwesome5
                                                    style={{
                                                        color: '#fff',
                                                        fontSize:
                                                            GLOBAL.Device_IsAppleTV
                                                                ? 20
                                                                : 15,
                                                        paddingRight: 5,
                                                    }}
                                                    // icon={this.props.Icon}
                                                    name={this.props.Icon}
                                                />
                                            )
                                        }

                                    </View>
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
                                        numberOfLines={1}
                                        style={[styles.Menu]}
                                    >
                                        {this.props.Text}
                                    </Text>
                                </View>,
                            )}
                        </TouchableHighlightFocus>
                    </View>,
                )}
                {RenderIf(
                    this.props.SideMenu != undefined &&
                    this.props.Disabled != undefined,
                )(
                    <View
                        style={[
                            GLOBAL.Device_IsAppleTV
                                ? styles.ButtonSizedAppleLeft
                                : GLOBAL.Device_IsSmartTV
                                    ? styles.ButtonSizedSmartTVLeft
                                    : styles.ButtonSizedLeft,
                            {
                                width: this.props.Width,
                                backgroundColor: this.props.Color,
                                justifyContent: 'center',
                                alignContent: 'center',
                                borderRadius: 5,
                                backgroundColor: '#000',
                            },
                        ]}
                    >
                        <View
                            style={[
                                GLOBAL.Device_IsAppleTV
                                    ? styles.ButtonSizedAppleLeft
                                    : styles.ButtonSizedLeft,
                                {
                                    width: this.props.Width,
                                    justifyContent: 'center',
                                    backgroundColor:
                                        'rgba(204, 204, 204, 0.10)',
                                    paddingHorizontal: 2,
                                },
                            ]}
                            Padding={this.props.Padding}
                            underlayColor={this.props.underlayColor}
                            onPress={() => this.props.onPress()}
                        >
                            {RenderIf(this.props.Icon != undefined)(
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {
                                        (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                            <FontAwesome
                                                style={{
                                                    color: '#fff',
                                                    fontSize: GLOBAL.Device_IsAppleTV
                                                        ? 35
                                                        : 20,
                                                    paddingRight: 5,
                                                }}
                                                // icon={this.props.Icon}
                                                name={this.props.Icon}
                                            />
                                        ) : (
                                            <FontAwesome5
                                                style={{
                                                    color: '#fff',
                                                    fontSize: GLOBAL.Device_IsAppleTV
                                                        ? 35
                                                        : 20,
                                                    paddingRight: 5,
                                                }}
                                                // icon={this.props.Icon}
                                                name={this.props.Icon}
                                            />
                                        )
                                    }

                                    <Text
                                        numberOfLines={1}
                                        style={[styles.Standard, { margin: 5 }]}
                                    >
                                        {this.props.Text}
                                    </Text>
                                </View>,
                            )}
                            {RenderIf(this.props.Icon == undefined)(
                                <Text numberOfLines={1} style={[styles.Menu]}>
                                    {this.props.Text}
                                </Text>,
                            )}
                        </View>
                    </View>,
                )}
            </View>
        );
    }
}
export default Button_Sized;
