import React, { useState, useEffect } from 'react';
import { View, Text, Animated, Image } from 'react-native';
// import {RegularIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
//import moment from "moment";

function Program({ onMount }) {
    const [value, setValue] = useState([]);
    this.fadeAnimation = new Animated.Value(0);

    getIcons = (channel, program) => {
        var timestampNow = moment().unix();
        if (channel.is_dveo == true || channel.is_flussonic == true) {
            if (program.e > timestampNow && program.s > timestampNow) {
                if (
                    GLOBAL.EPG_Days > GLOBAL.UserInterface.general.catchup_days
                ) {
                    return;
                }
                if (GLOBAL.UserInterface.general.enable_recordings == false) {
                    return;
                }
                return (
                    <View
                        style={{
                            backgroundColor: 'crimson',
                            padding: 3,
                            borderRadius: 100,
                            marginHorizontal: 5,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[styles.IconsItvSmall, { color: '#fff' }]}
                            // icon={RegularIcons.dotCircle}
                            name="dot-circle"
                        />
                    </View>
                );
            } else if (program.e < timestampNow) {
                if (
                    GLOBAL.EPG_Days * -1 >
                    GLOBAL.UserInterface.general.catchup_days
                ) {
                    return;
                }
                if (GLOBAL.UserInterface.general.enable_catchuptv == false) {
                    return;
                }
                return (
                    <View
                        style={{
                            backgroundColor: 'royalblue',
                            padding: 3,
                            borderRadius: 100,
                            marginHorizontal: 5,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[styles.IconsItvSmall, { color: '#fff' }]}
                            // icon={SolidIcons.history}
                            name="history"
                        />
                    </View>
                );
            } else if (program.e > timestampNow && program.s < timestampNow) {
                return (
                    <View
                        style={{
                            backgroundColor: 'forestgreen',
                            padding: 3,
                            borderRadius: 100,
                            marginHorizontal: 5,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[styles.IconsItvSmall, { color: '#fff' }]}
                            // icon={SolidIcons.playCircle}
                            name="play-circle"
                        />
                    </View>
                );
            }
        } else {
            if (program.e > timestampNow && program.s < timestampNow) {
                return (
                    <View
                        style={{
                            backgroundColor: 'forestgreen',
                            padding: 3,
                            borderRadius: 100,
                            marginHorizontal: 5,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[styles.IconsItvSmall, { color: '#fff' }]}
                            // icon={SolidIcons.playCircle}
                            name="play-circle"
                        />
                    </View>
                );
            }
        }
    };

    useEffect(() => {
        onMount([value, setValue]);
        this.fadeIn();
    }, [onMount, value]);

    fadeIn = () => {
        Animated.timing(this.fadeAnimation, {
            toValue: 1,
            duration: 1000,
        }).start();
    };
    if (value.s != undefined) {
        return (
            <Animated.View
                style={{
                    marginHorizontal: 20,
                    opacity: this.fadeAnimation,
                }}
            >
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View
                        style={{
                            marginVertical: 15,
                            marginHorizontal: 25,
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            source={{
                                uri:
                                    GLOBAL.ImageUrlCMS +
                                    GLOBAL.EPG_Channel.icon,
                            }}
                            style={{
                                height:
                                    (GLOBAL.Device_IsWebTV &&
                                        !GLOBAL.Device_IsSmartTV) ||
                                        GLOBAL.Device_IsAppleTV ||
                                        GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen'
                                        ? 140
                                        : 70,
                                width:
                                    (GLOBAL.Device_IsWebTV &&
                                        !GLOBAL.Device_IsSmartTV) ||
                                        GLOBAL.Device_IsAppleTV ||
                                        GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen'
                                        ? 140
                                        : 70,
                            }}
                        />
                    </View>
                    <View
                        style={{
                            height: 175,
                            marginVertical: 10,
                            marginHorizontal: 25,
                        }}
                    >
                        {/* <Text numberOfLines={1} style={[styles.H2, styles.Shadow, { width: (GLOBAL.Device_Width / 2) - 100 }]}>{GLOBAL.EPG_Channel.name}</Text> */}
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H2,
                                styles.Shadow,
                                { width: GLOBAL.Device_Width / 2 - 100 },
                            ]}
                        >
                            {value.n}{' '}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[styles.Medium, styles.Shadow]}
                        >
                            {moment
                                .unix(value.s)
                                .format('dddd ' + GLOBAL.Clock_Setting)}{' '}
                            -{' '}
                            {moment.unix(value.e).format(GLOBAL.Clock_Setting)}
                        </Text>
                        <Text
                            numberOfLines={3}
                            style={[
                                styles.Standard,
                                styles.Shadow,
                                { width: GLOBAL.Device_Width / 2 },
                            ]}
                        >
                            {value.d != undefined ? value.d : ''}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        );
    } else {
        return null;
    }
}
export default Program;
