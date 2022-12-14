import React, {Component, PureComponent} from 'react';
import {Image, View, Text} from 'react-native';

import MESSAGE from '../../../../datalayer/message';
import SUBSCRIPTION from '../../../../datalayer/subscription';
import ACTION from '../../../../datalayer/action';
import TimerMixin from 'react-timer-mixin';
export default class Header extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        var city = '';
        if (GLOBAL.User.customer != undefined) {
            city = GLOBAL.User.customer.city;
        }
        var progress = Math.round(
            (GLOBAL.Storage_Used / GLOBAL.Storage_Total) * 100,
        );
        this.state = {
            logo: GLOBAL.Logo,
            city: city,
            clock_time: moment().format(GLOBAL.Clock_Setting),
            progress: progress,
            weather: null,
            weather_icons: true,
            weather_text: false,
            weather_icon: require('../../../../images/weather/day/113.png'),
            logoheight: 0,
        };
    }
    componentDidMount() {
        if (
            this.state.weather != null &&
            GLOBAL.Device_IsPhone == false &&
            GLOBAL.Device_IsTablet == false &&
            GLOBAL.UserInterface.general.enable_weather == true
        ) {
            this.getWeather();
        }
    }
    componentWillUnmount() {
        TimerMixin.clearTimeout(this.timelinetimer);
    }
    startTimer() {
        TimerMixin.clearTimeout(this.timelinetimer);
        this.timelinetimer = TimerMixin.setTimeout(() => {
            this.setState({
                clock_time: moment().format(GLOBAL.Clock_Setting),
            });
            this.startTimer();
        }, 30000);
    }
    getWeather() {
        DAL.getWeather()
            .then(weather => {
                if (weather != null) {
                    if (weather.data != undefined) {
                        if (weather.data.current_condition != undefined) {
                            var imageSource = weatherImages.find(
                                i =>
                                    i.id ===
                                    weather.data.current_condition[0]
                                        .weatherCode,
                            );
                            this.setState({
                                weather:
                                    weather.data.current_condition[0].temp_C +
                                    ' °C - ' +
                                    weather.data.current_condition[0].temp_F +
                                    ' °F',
                                weather_icon: imageSource.image,
                            });
                        }
                    }
                }
            })
            .catch(error => {});
    }
    render() {
        return (
            <View
                style={[
                    styles.Header,
                    {
                        position: 'absolute',
                        zIndex: 99999,
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignContent: 'center',
                        alignItems: 'center',
                    },
                ]}
            >
                <View
                    style={[
                        {
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                        },
                    ]}
                >
                    <View
                        style={{
                            width: '100%',
                            zIndex: 9999,
                            position: 'absolute',
                        }}
                    >
                        <ACTION />
                        <SUBSCRIPTION />
                        <MESSAGE />
                    </View>
                    <View
                        style={[
                            {
                                flex:
                                    (GLOBAL.Device_IsPhone == false &&
                                        GLOBAL.Has_Wallet == false &&
                                        this.state.weather == null) ||
                                    GLOBAL.Show_Weather == false
                                        ? 4
                                        : 2,
                                paddingTop: 0,
                            },
                        ]}
                    >
                        <Image
                            style={styles.Header_Logo}
                            resizeMethod={'scale'}
                            resizeMode={'contain'}
                            source={{uri: this.state.logo}}
                        ></Image>
                    </View>
                    {RenderIf(GLOBAL.Device_IsPhone == false)(
                        <View style={{flex: 1}}>
                            <Text style={styles.text_white_medium_thin}></Text>
                        </View>,
                    )}
                    {RenderIf(GLOBAL.Has_Wallet)(
                        <View
                            style={[
                                styles.view_center,
                                {
                                    flex: 1,
                                    paddingTop:
                                        GLOBAL.Device_IsPhone &&
                                        GLOBAL.Device_Manufacturer == 'Apple'
                                            ? 15
                                            : 0,
                                    borderLeftWidth: 1,
                                },
                            ]}
                        >
                            <Text style={styles.Small}>
                                {LANG.getTranslation('wallet')}
                            </Text>
                            <Text style={styles.Small}>
                                {GLOBAL.Wallet_Credits}{' '}
                                {LANG.getTranslation('credits')}
                            </Text>
                        </View>,
                    )}
                    {RenderIf(
                        this.state.weather != null &&
                            GLOBAL.Device_IsPhone == false &&
                            GLOBAL.Device_IsTablet == false &&
                            GLOBAL.UserInterface.general.enable_weather == true,
                    )(
                        <View
                            style={{
                                flex: 1,
                                paddingTop:
                                    GLOBAL.Device_IsPhone &&
                                    GLOBAL.Device_Manufacturer == 'Apple'
                                        ? 15
                                        : 0,
                                borderLeftWidth: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                            }}
                        >
                            <View
                                style={[
                                    styles.view_center,
                                    {flexDirection: 'row'},
                                ]}
                            >
                                <View
                                    style={[
                                        {paddingRight: 5, paddingBottom: 5},
                                    ]}
                                >
                                    <Image
                                        source={this.state.weather_icon}
                                        style={styles.weather_icon}
                                        resizeMethod="resize"
                                        resizeMode="contain"
                                    />
                                </View>
                                <View>
                                    <Text style={[styles.H3]}>
                                        {this.state.weather}
                                    </Text>
                                    <Text style={[styles.Date]}>
                                        {this.state.city}
                                    </Text>
                                </View>
                            </View>
                        </View>,
                    )}
                    {RenderIf(
                        GLOBAL.Device_IsPhone == false &&
                            GLOBAL.Device_IsTablet == false &&
                            GLOBAL.UserInterface.general.enable_clock == true,
                    )(
                        <View
                            style={{
                                flex: 1,
                                paddingTop:
                                    GLOBAL.Device_IsPhone &&
                                    GLOBAL.Device_Manufacturer == 'Apple'
                                        ? 15
                                        : 0,
                            }}
                        >
                            <View style={styles.view_center}>
                                <Text style={[styles.H3]}>
                                    {this.state.clock_time}
                                </Text>
                                {RenderIf(
                                    GLOBAL.Device_IsTV ||
                                        GLOBAL.Device_IsSmartTV,
                                )(
                                    <Text
                                        style={[styles.Medium, {marginTop: -5}]}
                                    >
                                        {moment().format('MMM Do YYYY')}
                                    </Text>,
                                )}
                            </View>
                        </View>,
                    )}
                </View>
            </View>
        );
    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextState.clock_time !== this.state.clock_time;
    }
}
const weatherImages = [
    {
        id: '113',
        image: require('../../../../images/weather/day/113.png'),
    },
    {
        id: '116',
        image: require('../../../../images/weather/day/116.png'),
    },
    {
        id: '119',
        image: require('../../../../images/weather/day/119.png'),
    },
    {
        id: '122',
        image: require('../../../../images/weather/day/122.png'),
    },
    {
        id: '143',
        image: require('../../../../images/weather/day/143.png'),
    },
    {
        id: '176',
        image: require('../../../../images/weather/day/176.png'),
    },
    {
        id: '179',
        image: require('../../../../images/weather/day/179.png'),
    },
    {
        id: '182',
        image: require('../../../../images/weather/day/182.png'),
    },
    {
        id: '185',
        image: require('../../../../images/weather/day/185.png'),
    },
    {
        id: '200',
        image: require('../../../../images/weather/day/200.png'),
    },
    {
        id: '227',
        image: require('../../../../images/weather/day/227.png'),
    },
    {
        id: '230',
        image: require('../../../../images/weather/day/230.png'),
    },
    {
        id: '248',
        image: require('../../../../images/weather/day/248.png'),
    },
    {
        id: '260',
        image: require('../../../../images/weather/day/260.png'),
    },
    {
        id: '263',
        image: require('../../../../images/weather/day/263.png'),
    },
    {
        id: '266',
        image: require('../../../../images/weather/day/266.png'),
    },
    {
        id: '281',
        image: require('../../../../images/weather/day/281.png'),
    },
    {
        id: '284',
        image: require('../../../../images/weather/day/284.png'),
    },
    {
        id: '293',
        image: require('../../../../images/weather/day/293.png'),
    },
    {
        id: '296',
        image: require('../../../../images/weather/day/296.png'),
    },
    {
        id: '299',
        image: require('../../../../images/weather/day/299.png'),
    },
    {
        id: '302',
        image: require('../../../../images/weather/day/302.png'),
    },
    {
        id: '305',
        image: require('../../../../images/weather/day/305.png'),
    },
    {
        id: '308',
        image: require('../../../../images/weather/day/308.png'),
    },
    {
        id: '311',
        image: require('../../../../images/weather/day/311.png'),
    },
    {
        id: '314',
        image: require('../../../../images/weather/day/314.png'),
    },
    {
        id: '317',
        image: require('../../../../images/weather/day/317.png'),
    },
    {
        id: '320',
        image: require('../../../../images/weather/day/320.png'),
    },
    {
        id: '323',
        image: require('../../../../images/weather/day/323.png'),
    },
    {
        id: '326',
        image: require('../../../../images/weather/day/326.png'),
    },
    {
        id: '329',
        image: require('../../../../images/weather/day/329.png'),
    },
    {
        id: '332',
        image: require('../../../../images/weather/day/332.png'),
    },
    {
        id: '335',
        image: require('../../../../images/weather/day/335.png'),
    },
    {
        id: '338',
        image: require('../../../../images/weather/day/338.png'),
    },
    {
        id: '350',
        image: require('../../../../images/weather/day/350.png'),
    },
    {
        id: '353',
        image: require('../../../../images/weather/day/353.png'),
    },
    {
        id: '356',
        image: require('../../../../images/weather/day/356.png'),
    },
    {
        id: '359',
        image: require('../../../../images/weather/day/359.png'),
    },
    {
        id: '362',
        image: require('../../../../images/weather/day/362.png'),
    },
    {
        id: '365',
        image: require('../../../../images/weather/day/365.png'),
    },
    {
        id: '368',
        image: require('../../../../images/weather/day/368.png'),
    },
    {
        id: '371',
        image: require('../../../../images/weather/day/371.png'),
    },
    {
        id: '374',
        image: require('../../../../images/weather/day/374.png'),
    },
    {
        id: '377',
        image: require('../../../../images/weather/day/377.png'),
    },
    {
        id: '386',
        image: require('../../../../images/weather/day/386.png'),
    },
    {
        id: '389',
        image: require('../../../../images/weather/day/389.png'),
    },
    {
        id: '392',
        image: require('../../../../images/weather/day/392.png'),
    },
    {
        id: '395',
        image: require('../../../../images/weather/day/395.png'),
    },
];
