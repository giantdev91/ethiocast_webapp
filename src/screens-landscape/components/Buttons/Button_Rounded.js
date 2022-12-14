import React, { Component } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Button_Rounded extends Component {
    getText(text) {
        if (text == '') {
            return;
        }
        if (text == null) {
            return;
        }
        if (this.props.Caps != undefined) {
            if (this.props.Caps == true) {
                return text.toUpperCase();
            }
            if (this.props.Caps == false) {
                return text.toLowerCase();
            }
        } else {
            return text;
        }
    }

    render() {
        return (
            <View>
                {RenderIf(this.props.Wide == undefined)(
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                width:
                                    this.props.Size != undefined
                                        ? this.props.Size
                                        : 20,
                                height:
                                    this.props.Size != undefined
                                        ? this.props.Size
                                        : 20,
                                borderRadius: 5,
                                margin: 1,
                                padding: 0,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            },
                        ]}
                    >
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            pointerEvents={'box-none'}
                            {...this.props}
                            Margin={0}
                            Padding={0}
                            style={[
                                {
                                    width:
                                        this.props.Size != undefined
                                            ? this.props.Size
                                            : 20,
                                    height:
                                        this.props.Size != undefined
                                            ? this.props.Size
                                            : 20,
                                    borderRadius: 5,
                                    margin: 0,
                                    padding: 0,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                },
                            ]}
                            hasTVPreferredFocus={
                                this.props.hasTVPreferredFocus != undefined
                                    ? this.props.hasTVPreferredFocus
                                    : false
                            }
                            underlayColor={this.props.underlayColor}
                            onPress={() => this.props.onPress()}
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
                                    {RenderIf(
                                        this.props.Icon != null &&
                                        this.props.style == undefined,
                                    )(
                                        <FontAwesome5
                                            style={[
                                                styles.Shadow,
                                                {
                                                    color:
                                                        this.props.Color !=
                                                            undefined
                                                            ? this.props.Color
                                                            : '#fff',
                                                    fontSize:
                                                        this.props.FontSize !=
                                                            undefined
                                                            ? this.props
                                                                .FontSize
                                                            : 20,
                                                    padding: 0,
                                                    margin: 0,
                                                },
                                            ]}
                                            // icon={this.props.Icon}
                                            name={this.props.Icon}
                                        />,
                                    )}
                                    {RenderIf(
                                        this.props.Icon != null &&
                                        this.props.style != undefined,
                                    )(
                                        <FontAwesome5
                                            style={[
                                                styles.Shadow,
                                                this.props.style,
                                                {
                                                    color:
                                                        this.props.Color !=
                                                            undefined
                                                            ? this.props.Color
                                                            : '#fff',
                                                    fontSize:
                                                        this.props.FontSize !=
                                                            undefined
                                                            ? this.props
                                                                .FontSize
                                                            : 20,
                                                    padding: 0,
                                                    margin: 0,
                                                },
                                            ]}
                                            // icon={this.props.Icon}
                                            name={this.props.Icon}
                                        />,
                                    )}
                                    {RenderIf(this.props.Image != null)(
                                        <Image
                                            source={{
                                                uri:
                                                    GLOBAL.ImageUrlCMS +
                                                    this.props.Image,
                                            }}
                                            style={{
                                                width:
                                                    this.props.Size != undefined
                                                        ? this.props.Size
                                                        : 20,
                                                height:
                                                    this.props.Size != undefined
                                                        ? this.props.Size
                                                        : 20,
                                            }}
                                        />,
                                    )}
                                    {RenderIf(this.props.LocalImage != null)(
                                        <Image
                                            source={this.props.LocalImage}
                                            style={{
                                                width:
                                                    this.props.Size != undefined
                                                        ? this.props.Size
                                                        : 20,
                                                height:
                                                    this.props.Size != undefined
                                                        ? this.props.Size
                                                        : 20,
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
                                                    fontSize:
                                                        this.props.FontSize !=
                                                            undefined
                                                            ? this.props
                                                                .FontSize
                                                            : 20,
                                                    color: '#fff',
                                                },
                                            ]}
                                        >
                                            {this.getText(this.props.Text)}
                                        </Text>,
                                    )}
                                </View>
                            </View>
                        </TouchableHighlightFocus>
                    </View>,
                )}
                {RenderIf(this.props.Wide != undefined)(
                    <View
                        style={[
                            {
                                backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                height:
                                    this.props.Size != undefined
                                        ? this.props.Size
                                        : 20,
                                borderRadius: 5,
                                margin: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            },
                        ]}
                    >
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            pointerEvents={'box-none'}
                            {...this.props}
                            Margin={0}
                            Padding={0}
                            style={[
                                {
                                    height:
                                        this.props.Size != undefined
                                            ? this.props.Size
                                            : 20,
                                    borderRadius: 5,
                                    margin: 0,
                                    padding: 0,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                },
                            ]}
                            hasTVPreferredFocus={
                                this.props.hasTVPreferredFocus != undefined
                                    ? this.props.hasTVPreferredFocus
                                    : false
                            }
                            underlayColor={this.props.underlayColor}
                            onPress={() => this.props.onPress()}
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
                                    {RenderIf(
                                        this.props.Icon != null &&
                                        this.props.style == undefined,
                                    )(
                                        <FontAwesome5
                                            style={[
                                                styles.Shadow,
                                                {
                                                    color:
                                                        this.props.Color !=
                                                            undefined
                                                            ? this.props.Color
                                                            : '#fff',
                                                    fontSize:
                                                        this.props.FontSize !=
                                                            undefined
                                                            ? this.props
                                                                .FontSize
                                                            : 20,
                                                    padding: 0,
                                                    margin: 0,
                                                },
                                            ]}
                                            // icon={this.props.Icon}
                                            name={this.props.Icon}
                                        />,
                                    )}
                                    {RenderIf(
                                        this.props.Icon != null &&
                                        this.props.style != undefined,
                                    )(
                                        <FontAwesome5
                                            style={[
                                                styles.Shadow,
                                                this.props.style,
                                                {
                                                    color:
                                                        this.props.Color !=
                                                            undefined
                                                            ? this.props.Color
                                                            : '#fff',
                                                    fontSize:
                                                        this.props.FontSize !=
                                                            undefined
                                                            ? this.props
                                                                .FontSize
                                                            : 20,
                                                    padding: 0,
                                                    margin: 0,
                                                },
                                            ]}
                                            // icon={this.props.Icon}
                                            name={this.props.Icon}
                                        />,
                                    )}
                                    {RenderIf(this.props.Image != null)(
                                        <Image
                                            source={{
                                                uri:
                                                    GLOBAL.ImageUrlCMS +
                                                    this.props.Image,
                                            }}
                                            style={{
                                                width:
                                                    this.props.Size != undefined
                                                        ? this.props.Size
                                                        : 20,
                                                height:
                                                    this.props.Size != undefined
                                                        ? this.props.Size
                                                        : 20,
                                            }}
                                        />,
                                    )}
                                    {RenderIf(this.props.LocalImage != null)(
                                        <Image
                                            source={this.props.LocalImage}
                                            style={{
                                                width:
                                                    this.props.Size != undefined
                                                        ? this.props.Size
                                                        : 20,
                                                height:
                                                    this.props.Size != undefined
                                                        ? this.props.Size
                                                        : 20,
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
                                                    fontSize:
                                                        this.props.FontSize !=
                                                            undefined
                                                            ? this.props
                                                                .FontSize
                                                            : 20,
                                                    color: '#fff',
                                                    paddingHorizontal: 10,
                                                },
                                            ]}
                                        >
                                            {this.getText(this.props.Text)}
                                        </Text>,
                                    )}
                                </View>
                            </View>
                        </TouchableHighlightFocus>
                    </View>,
                )}
            </View>
        );
    }
}
export default Button_Rounded;
