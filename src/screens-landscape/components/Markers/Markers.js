import { lang } from 'moment';
import React, { Component } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Marker_Catchup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: 0,
        };
    }
    onLayout = event => {
        if (this.state.width == 0) {
            let width = event.nativeEvent.layout.width;
            this.setState({
                width: width,
            });
        }
    };
    render() {
        var txt =
            GLOBAL.Device_IsAndroidTV ||
                GLOBAL.Device_IsFireTV ||
                GLOBAL.Device_IsWebTV ||
                GLOBAL.Device_IsTablet ||
                GLOBAL.Device_IsAppleTV ||
                GLOBAL.Device_IsSmartTV
                ? styles.BoldTextSmall
                : styles.BoldTextBig;
        var pad =
            GLOBAL.Device_IsAndroidTV ||
                GLOBAL.Device_IsFireTV ||
                GLOBAL.Device_IsTablet ||
                GLOBAL.Device_IsPhone
                ? 0
                : GLOBAL.Device_IsSmartTV
                    ? 10
                    : 3;
        if (
            this.props.Mini == undefined &&
            this.props.onPress != undefined &&
            this.props.Big != undefined &&
            this.props.Favorite == undefined &&
            this.props.Icon == undefined
        ) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    style={{ borderRadius: 2 }}
                    Padding={this.props.Padding}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress()}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: this.props.Color,
                            borderRadius: 5,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.BoldTextBig,
                                { padding: 10, paddingHorizontal: 20 },
                            ]}
                        >
                            {this.props.Text}
                        </Text>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            this.props.Mini == undefined &&
            this.props.onPress != undefined &&
            this.props.Big != undefined &&
            this.props.Favorite == undefined &&
            this.props.Icon != undefined
        ) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    style={{
                        borderRadius: 2,
                        height:
                            GLOBAL.Device_IsPhone ||
                                GLOBAL.Device_IsAndroidTV ||
                                GLOBAL.Device_IsFireTV ||
                                GLOBAL.Device_IsTablet
                                ? 40
                                : 60,
                    }}
                    Padding={this.props.Padding}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress()}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: this.props.Color,
                            borderRadius: 2,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 10,
                            borderRadius: 5,
                        }}
                    >
                        <Text numberOfLines={1} style={[txt, { padding: pad }]}>
                            {this.props.Text}
                        </Text>
                        {
                            (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                                <FontAwesome
                                    style={[styles.IconsMenu, { padding: pad }]}
                                    // icon={this.props.Icon}
                                    name={this.props.Icon}
                                />
                            ) : (
                                <FontAwesome5
                                    style={[styles.IconsMenu, { padding: pad }]}
                                    // icon={this.props.Icon}
                                    name={this.props.Icon}
                                />
                            )
                        }
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            this.props.Mini == undefined &&
            this.props.onPress != undefined &&
            this.props.Big == undefined &&
            this.props.Favorite == undefined &&
            this.props.Icon == undefined
        ) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    style={{ borderRadius: 2, marginRight: 5 }}
                    Padding={this.props.Padding}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress()}
                >
                    <View
                        style={{
                            backgroundColor: this.props.Color,
                            borderRadius: 2,
                        }}
                    >
                        <Text numberOfLines={1} style={[txt, { padding: pad }]}>
                            {this.props.Text}
                        </Text>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            this.props.Mini == undefined &&
            this.props.Progress == undefined &&
            this.props.Big == undefined &&
            this.props.onPress == undefined &&
            this.props.Favorite == undefined &&
            this.props.Empty == undefined &&
            this.props.Icon == undefined
        ) {
            return (
                <View
                    style={{
                        backgroundColor: this.props.Color,
                        padding: 5,
                        marginHorizontal: 5,
                        borderRadius: 5,
                    }}
                >
                    <Text numberOfLines={1} style={[txt, { padding: pad }]}>
                        {this.props.Text}
                    </Text>
                </View>
            );
        }
        if (this.props.Empty != undefined && this.props.Mini == undefined) {
            return (
                <View
                    style={{
                        backgroundColor: 'transparent',
                        marginRight: 5,
                        padding: 5,
                        marginBottom: 5,
                        marginTop: 5,
                        borderRadius: 5,
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={[styles.BoldTextSmall, { color: 'transparent' }]}
                    >
                        {this.props.Text}
                    </Text>
                </View>
            );
        }
        if (this.props.Progress != undefined && this.props.Mini == undefined) {
            var progress = this.props.Progress;
            if (this.props.Progress < 20) {
                progress = 20;
            }
            return (
                <View onLayout={this.onLayout}>
                    <View
                        style={{
                            marginRight: 5,
                            marginTop: 5,
                            marginBottom: 5,
                            borderRadius: 2,
                            padding: 5,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.BoldTextSmall,
                                { color: 'transparent' },
                            ]}
                        >
                            {this.props.Text}
                        </Text>
                    </View>
                    <View
                        style={{
                            marginRight: 5,
                            marginTop: 5,
                            marginBottom: 5,
                            borderRadius: 5,
                            position: 'absolute',
                            zIndex: 3,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[styles.BoldTextSmall, { paddingTop: 5 }]}
                        >
                            {this.props.Text}
                        </Text>
                    </View>
                    <View
                        style={{
                            borderWidth: 3,
                            borderColor: this.props.Color,
                            marginRight: 5,
                            marginBottom: 5,
                            marginTop: 5,
                            width: (this.state.width / 100) * progress,
                            backgroundColor: this.props.Color,
                            position: 'absolute',
                            height: 28,
                            zIndex: 1,
                            borderRadius: 5,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.BoldTextSmall,
                                { color: 'transparent' },
                            ]}
                        >
                            {this.props.Text}
                        </Text>
                    </View>
                    <View
                        style={{
                            backgroundColor: this.props.Color,
                            marginRight: 5,
                            marginTop: 5,
                            marginBottom: 5,
                            borderRadius: 5,
                            position: 'absolute',
                            zIndex: 0,
                            height: 28,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.BoldTextSmall,
                                { color: 'transparent' },
                            ]}
                        >
                            {this.props.Text}
                        </Text>
                    </View>
                    <View
                        style={{
                            borderWidth: 3,
                            borderColor: this.props.Color,
                            marginRight: 5,
                            marginTop: 5,
                            marginBottom: 5,
                            borderRadius: 5,
                            height: 28,
                            position: 'absolute',
                            zIndex: 2,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.BoldTextSmall,
                                { color: 'transparent' },
                            ]}
                        >
                            {this.props.Text}
                        </Text>
                    </View>
                </View>
            );
        }
        if (this.props.Mini != undefined) {
            return (
                <View
                    style={{
                        backgroundColor: this.props.Color,
                        padding: 2,
                        margin: 5,
                        borderRadius: 5,
                        width: 100,
                        alignItems: 'center',
                    }}
                >
                    <Text numberOfLines={1} style={[txt, { padding: 0 }]}>
                        {this.props.Text}
                    </Text>
                </View>
            );
        }
        if (this.props.Favorite != undefined) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={2}
                    style={{
                        borderRadius: 2,
                        height:
                            GLOBAL.Device_IsPhone ||
                                GLOBAL.Device_IsAndroidTV ||
                                GLOBAL.Device_IsFireTV ||
                                GLOBAL.Device_IsTablet
                                ? 31
                                : GLOBAL.Device_IsSmartTV
                                    ? 61
                                    : 46,
                    }}
                    Padding={this.props.Padding}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress()}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: this.props.Color,
                            borderRadius: 2,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            padding: 5,
                        }}
                    >
                        {RenderIf(
                            this.props.Favorite == false &&
                            GLOBAL.Device_IsPhone == false,
                        )(
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        txt,
                                        { paddingLeft: 10, paddingRight: 5 },
                                    ]}
                                >
                                    {LANG.getTranslation('favorite')}
                                </Text>
                                <FontAwesome
                                    style={[styles.IconsMenuSmall, { margin: 0 }]}
                                    // icon={RegularIcons.heart}
                                    name="heart-o"
                                />
                            </View>,
                        )}
                        {RenderIf(
                            this.props.Favorite == false &&
                            GLOBAL.Device_IsPhone == true,
                        )(
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        txt,
                                        { paddingLeft: 5, paddingRight: 5 },
                                    ]}
                                >
                                    {LANG.getTranslation('favorite')}
                                </Text>
                                <FontAwesome
                                    style={[styles.IconsMenuSmall, { margin: 0 }]}
                                    // icon={RegularIcons.heart}
                                    name="heart-o"
                                />
                            </View>,
                        )}
                        {RenderIf(
                            this.props.Favorite == true &&
                            GLOBAL.Device_IsPhone == false,
                        )(
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        txt,
                                        { paddingLeft: 10, paddingRight: 5 },
                                    ]}
                                >
                                    {LANG.getTranslation('favorite')}
                                </Text>
                                <FontAwesome
                                    style={[styles.IconsMenuSmall, { margin: 0 }]}
                                    // icon={SolidIcons.heart}
                                    name="heart"
                                />
                            </View>,
                        )}
                        {RenderIf(
                            this.props.Favorite == true &&
                            GLOBAL.Device_IsPhone == true,
                        )(
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        txt,
                                        { paddingLeft: 5, paddingRight: 5 },
                                    ]}
                                >
                                    {LANG.getTranslation('favorite')}
                                </Text>
                                <FontAwesome
                                    style={[styles.IconsMenu, { margin: 0 }]}
                                    // icon={SolidIcons.heart}
                                    name="heart"
                                />
                            </View>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextState.width !== this.state.width ||
            nextProps.Favorite !== this.props.Favorite ||
            nextState.Text !== this.props.Text
        );
    }
}
export default Marker_Catchup;
