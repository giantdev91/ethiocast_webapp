import React, { Component } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Button_Normal extends Component {
    render() {
        return (
            <View
                style={[
                    styles.ButtonCirle,
                    {
                        width:
                            this.props.Size != null
                                ? this.props.Size + 30
                                : GLOBAL.Device_IsAppleTV
                                    ? 70
                                    : 50,
                        height:
                            this.props.Size != null
                                ? this.props.Size + 30
                                : GLOBAL.Device_IsAppleTV
                                    ? 70
                                    : 50,
                        borderRadius:
                            this.props.Size != null
                                ? this.props.Size + 30
                                : GLOBAL.Device_IsAppleTV
                                    ? 70
                                    : 50 / 2,
                    },
                ]}
            >
                <TouchableHighlightFocus
                    BorderRadius={100}
                    Padding={0}
                    Margin={0}
                    {...this.props}
                    style={[
                        styles.ButtonCirle,
                        {
                            width:
                                this.props.Size != null
                                    ? this.props.Size + 30
                                    : GLOBAL.Device_IsAppleTV
                                        ? 70
                                        : 50,
                            height:
                                this.props.Size != null
                                    ? this.props.Size + 30
                                    : GLOBAL.Device_IsAppleTV
                                        ? 70
                                        : 50,
                            borderRadius:
                                this.props.Size != null
                                    ? this.props.Size + 30
                                    : GLOBAL.Device_IsAppleTV
                                        ? 70
                                        : 50 / 2,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        },
                    ]}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={this.props.underlayColor}
                    onPress={() => this.props.onPress()}
                    onFocus={() =>
                        this.props.onFocus != undefined
                            ? this.props.onFocus()
                            : null
                    }
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
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
                            {RenderIf(this.props.Icon != null)(

                                (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ?
                                    <FontAwesome
                                        style={[
                                            styles.Shadow,
                                            {
                                                color:
                                                    this.props.Color != undefined
                                                        ? this.props.Color
                                                        : '#fff',
                                                fontSize:
                                                    this.props.Size == null
                                                        ? GLOBAL.Device_IsAppleTV
                                                            ? 35
                                                            : 20
                                                        : this.props.Size,
                                                padding: 0,
                                                margin:
                                                    this.props.Margin != undefined
                                                        ? this.props.Margin
                                                        : 0,
                                            },
                                        ]}
                                        // icon={this.props.Icon}
                                        name={this.props.Icon}
                                    />
                                    :
                                    <FontAwesome5
                                        style={[
                                            styles.Shadow,
                                            {
                                                color:
                                                    this.props.Color != undefined
                                                        ? this.props.Color
                                                        : '#fff',
                                                fontSize:
                                                    this.props.Size == null
                                                        ? GLOBAL.Device_IsAppleTV
                                                            ? 35
                                                            : 20
                                                        : this.props.Size,
                                                padding: 0,
                                                margin:
                                                    this.props.Margin != undefined
                                                        ? this.props.Margin
                                                        : 0,
                                            },
                                        ]}
                                        // icon={this.props.Icon}
                                        name={this.props.Icon}
                                    />
                            )}
                            {RenderIf(this.props.Image != null)(
                                <Image
                                    source={{
                                        uri:
                                            GLOBAL.ImageUrlCMS +
                                            this.props.Image,
                                    }}
                                    style={{
                                        width: this.props.Size,
                                        height: this.props.Size,
                                    }}
                                />,
                            )}
                            {RenderIf(this.props.LocalImage != null)(
                                <Image
                                    source={this.props.LocalImage}
                                    style={{
                                        width: this.props.Size,
                                        height: this.props.Size,
                                    }}
                                />,
                            )}
                            {RenderIf(this.props.ChromeCast != null)(
                                <Image
                                    source={require('../../../images/chromecast.png')}
                                    style={{ width: 20, height: 20 }}
                                />,
                            )}
                            {RenderIf(this.props.Text != null)(
                                <Text
                                    style={[
                                        styles.Shadow,
                                        {
                                            margin: 10,
                                            fontSize: this.props.Size,
                                            color: '#fff',
                                        },
                                    ]}
                                >
                                    {this.props.Text}
                                </Text>,
                            )}
                        </View>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
}
export default Button_Normal;
