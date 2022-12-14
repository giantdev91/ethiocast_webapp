import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
// import FontAwesome5 from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Button_Normal extends Component {
    render() {
        return (
            <View>
                {RenderIf(!GLOBAL.Device_IsAppleTV)(
                    <View
                        style={[
                            this.props.Left != null
                                ? styles.ButtonNormalLeft
                                : GLOBAL.Device_IsSmartTV
                                    ? styles.ButtonNormalSmartTV
                                    : styles.ButtonNormal,
                            { borderRadius: 5, backgroundColor: '#000' },
                        ]}
                    >
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            disabled={
                                this.props.Disabled == undefined
                                    ? false
                                    : this.props.Disabled
                            }
                            style={[
                                this.props.Left != null
                                    ? styles.ButtonNormalLeft
                                    : GLOBAL.Device_IsSmartTV
                                        ? styles.ButtonNormalSmartTV
                                        : styles.ButtonNormal,
                                { borderRadius: 5 },
                            ]}
                            Padding={this.props.Padding}
                            hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                            underlayColor={this.props.underlayColor}
                            onPress={() => this.props.onPress()}
                        >
                            <View
                                style={[
                                    ,
                                    this.props.Left != null
                                        ? styles.ButtonNormalLeft
                                        : GLOBAL.Device_IsSmartTV
                                            ? styles.ButtonNormalSmartTV
                                            : styles.ButtonNormal,
                                ]}
                            >
                                {RenderIf(
                                    this.props.Icon != undefined &&
                                    this.props.Left == null,
                                )(
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        {
                                            (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                                <FontAwesome
                                                    style={{
                                                        color: '#fff',
                                                        fontSize:
                                                            GLOBAL.Device_IsSmartTV
                                                                ? 35
                                                                : 20,
                                                    }}
                                                    // icon={this.props.Icon}
                                                    name={this.props.Icon}
                                                />
                                            ) : (
                                                <FontAwesome5
                                                    style={{
                                                        color: '#fff',
                                                        fontSize:
                                                            GLOBAL.Device_IsSmartTV
                                                                ? 35
                                                                : 20,
                                                    }}
                                                    // icon={this.props.Icon}
                                                    name={this.props.Icon}
                                                />
                                            )
                                        }

                                        <Text
                                            style={[
                                                styles.Standard,
                                                { margin: 5 },
                                            ]}
                                        >
                                            {this.props.Text}
                                        </Text>
                                    </View>,
                                )}
                                {RenderIf(
                                    this.props.Icon != undefined &&
                                    this.props.Left != null,
                                )(
                                    <View
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 8,
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.Standard,
                                                    { marginLeft: 10 },
                                                ]}
                                            >
                                                {this.props.Text}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                flex: 2,
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {
                                                (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                                    <FontAwesome
                                                        style={{
                                                            color: '#fff',
                                                            fontSize: 20,
                                                        }}
                                                        // icon={this.props.Icon}
                                                        name={this.props.Icon}
                                                    />
                                                ) : (
                                                    <FontAwesome5
                                                        style={{
                                                            color: '#fff',
                                                            fontSize: 20,
                                                        }}
                                                        // icon={this.props.Icon}
                                                        name={this.props.Icon}
                                                    />
                                                )
                                            }

                                        </View>
                                    </View>,
                                )}
                                {RenderIf(
                                    this.props.Icon == undefined &&
                                    this.props.Left == null,
                                )(
                                    <Text style={styles.Standard}>
                                        {this.props.Text}
                                    </Text>,
                                )}
                                {RenderIf(
                                    this.props.Icon == undefined &&
                                    this.props.Left != null,
                                )(
                                    <Text
                                        style={[
                                            styles.Standard,
                                            { marginLeft: 10 },
                                        ]}
                                    >
                                        {this.props.Text}
                                    </Text>,
                                )}
                            </View>
                        </TouchableHighlightFocus>
                    </View>,
                )}
                {RenderIf(GLOBAL.Device_IsAppleTV)(
                    <View
                        style={[
                            this.props.Left != null
                                ? styles.ButtonNormalLeftApple
                                : styles.ButtonNormalApple,
                            { backgroundColor: '#000', borderRadius: 5 },
                        ]}
                    >
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            style={[
                                this.props.Left != null
                                    ? styles.ButtonNormalLeftApple
                                    : styles.ButtonNormalApple,
                                { borderRadius: 5 },
                            ]}
                            disabled={
                                this.props.Disabled == undefined
                                    ? false
                                    : this.props.Disabled
                            }
                            Padding={this.props.Padding}
                            hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                            underlayColor={this.props.underlayColor}
                            onPress={() => this.props.onPress()}
                        >
                            <View
                                style={[
                                    this.props.Left != null
                                        ? styles.ButtonNormalLeftApple
                                        : styles.ButtonNormalApple,
                                ]}
                            >
                                {RenderIf(
                                    this.props.Icon != undefined &&
                                    this.props.Left == null,
                                )(
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        {
                                            (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                                <FontAwesome
                                                    style={{
                                                        color: '#fff',
                                                        fontSize:
                                                            GLOBAL.Device_IsAppleTV
                                                                ? 35
                                                                : 20,
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
                                                                ? 35
                                                                : 20,
                                                    }}
                                                    // icon={this.props.Icon}
                                                    name={this.props.Icon}
                                                />
                                            )
                                        }

                                        <Text
                                            style={[
                                                styles.Standard,
                                                { margin: 5 },
                                            ]}
                                        >
                                            {this.props.Text}
                                        </Text>
                                    </View>,
                                )}
                                {RenderIf(
                                    this.props.Icon != undefined &&
                                    this.props.Left != null,
                                )(
                                    <View
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 8,
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.Standard,
                                                    { marginLeft: 10 },
                                                ]}
                                            >
                                                {this.props.Text}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                flex: 2,
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {
                                                (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                                    <FontAwesome
                                                        style={{
                                                            color: '#fff',
                                                            fontSize: 20,
                                                        }}
                                                        // icon={this.props.Icon}
                                                        name={this.props.Icon}
                                                    />
                                                ) : (
                                                    <FontAwesome5
                                                        style={{
                                                            color: '#fff',
                                                            fontSize: 20,
                                                        }}
                                                        // icon={this.props.Icon}
                                                        name={this.props.Icon}
                                                    />
                                                )
                                            }

                                        </View>
                                    </View>,
                                )}
                                {RenderIf(
                                    this.props.Icon == undefined &&
                                    this.props.Left == null,
                                )(
                                    <Text style={styles.Standard}>
                                        {this.props.Text}
                                    </Text>,
                                )}
                                {RenderIf(
                                    this.props.Icon == undefined &&
                                    this.props.Left != null,
                                )(
                                    <Text
                                        style={[
                                            styles.Standard,
                                            { marginLeft: 10 },
                                        ]}
                                    >
                                        {this.props.Text}
                                    </Text>,
                                )}
                            </View>
                        </TouchableHighlightFocus>
                    </View>,
                )}
            </View>
        );
    }
}
export default Button_Normal;
