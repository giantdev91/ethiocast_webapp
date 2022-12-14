import React, { Component } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
// import FontAwesome5, {
//     SolidIcons,
//     RegularIcons,
//     BrandIcons,
// } from 'react-native-FontAwesome5';

import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Radio_Button extends Component {
    render() {
        return (
            <View
                style={{
                    borderRadius: 5,
                    backgroundColor: 'rgba(0, 0, 0, 0.40)',
                    height: GLOBAL.COL_10 - 10,
                    marginHorizontal: 5,
                }}
            >
                <TouchableHighlightFocus
                    BorderRadius={5}
                    style={{ borderRadius: 5, height: GLOBAL.COL_10 - 10 }}
                    Padding={this.props.Padding}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={this.props.underlayColor}
                    onPress={() => this.props.onPress()}
                >
                    <View
                        style={{
                            flexDirection: 'column',
                            padding: 5,
                            borderRadius: 5,
                            width: GLOBAL.COL_10,
                            height: GLOBAL.COL_10,
                        }}
                    >
                        <View
                            style={{
                                margin: 5,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <Text numberOfLines={1} style={styles.Medium}>
                                {this.props.Text}
                            </Text>
                        </View>
                        <View
                            style={{
                                margin: 5,
                                height: GLOBAL.Device_IsPhone ? 20 : 40,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            {RenderIf(this.props.Check == true)(
                                <FontAwesome5
                                    style={{
                                        color: 'forestgreen',
                                        fontSize: GLOBAL.Device_IsAppleTV
                                            ? 40
                                            : GLOBAL.Device_IsPhone
                                                ? 20
                                                : 30,
                                    }}
                                    // icon={SolidIcons.check}
                                    name="check"
                                />,
                            )}
                        </View>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
}
export default Radio_Button;
