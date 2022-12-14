import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableHighlight,
    TextInput,
    BackHandler,
    TVMenuControl,
    KeyboardAvoidingView,
    Image,
    ScrollView,
    Platform,
} from 'react-native';
import UserAvatar from 'react-native-user-avatar';
import { Actions } from 'react-native-router-flux';
import decode from 'unescape';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class CreateProfile extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };

        (GLOBAL.Account_Type = [
            {
                name: LANG.getTranslation('kids_account'),
                value: 'kids mode',
                checked: false,
            },
            {
                name: LANG.getTranslation('regular_account'),
                value: 'regular',
                checked: true,
            },
        ]),
            (GLOBAL.Profile_Locks = [
                {
                    name: LANG.getTranslation('not_locked'),
                    value: 'not_locked',
                    checked: true,
                },
                {
                    name: LANG.getTranslation('locked'),
                    value: 'locked',
                    checked: false,
                },
            ]),
            (GLOBAL.Focus = 'Outside');
        this.state = {
            reportStartTime: moment().unix(),
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            support: decode(GLOBAL.Support),
            name:
                this.props.Value != undefined && this.props.Value != ''
                    ? this.props.Value
                    : '',
            loading: false,
            mode: '',
            id: 0, //kids vs regular
            ratings: GLOBAL.Profile_Ratings,
            locked: GLOBAL.Profile_Locks,
            accounts: GLOBAL.Account_Type,
            next: false,
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            if (GLOBAL.Device_IsWebTV == false) {
                Actions.Profiles();
            }
        }
    };
    updateDimensions() {
        if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
            return;
        }
        Actions.CreateProfile();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
            setTimeout(function () {
                var viewheight = $(window).height();
                var viewwidth = $(window).width();
                var viewport = $('meta[name=viewport]');
                viewport.attr(
                    'content',
                    'height=' +
                    viewheight +
                    'px, width=' +
                    viewwidth +
                    'px, initial-scale=1.0',
                );
            }, 300);
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (GLOBAL.Device_IsWebTV == false) {
                    GLOBAL.Focus = 'Home';
                    Actions.Profiles();
                }
                return true;
            },
        );
    }

    componentWillUnmount() {
        sendPageReport(
            'Add Profile',
            this.state.reportStartTime,
            moment().unix(),
        );
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        Actions.pop();
    }
    focusName = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.profilename.focus();
        }
    };
    backToProfiles() {
        Actions.Profiles();
    }
    setRating(index) {
        GLOBAL.Profile_Ratings.forEach(element => {
            element.checked = false;
        });
        GLOBAL.Profile_Ratings[index].checked = true;
        this.setState({
            ratings: GLOBAL.Profile_Ratings,
        });
    }
    setLocked(index) {
        GLOBAL.Profile_Locks.forEach(element => {
            element.checked = false;
        });
        GLOBAL.Profile_Locks[index].checked = true;
        this.setState({
            locked: GLOBAL.Profile_Locks,
        });
    }
    setAccount(index) {
        GLOBAL.Account_Type.forEach(element => {
            element.checked = false;
        });
        GLOBAL.Account_Type[index].checked = true;
        this.setState({
            accounts: GLOBAL.Account_Type,
        });
    }
    handleInputName = text => {
        this.setState({ name: text });
    };
    changeProfileType() {
        if (this.state.mode == 'regular') {
            this.setState({
                profiletype: LANG.getTranslation('kids_account'),
                mode: 'kids',
            });
        } else {
            this.setState({
                profiletype: LANG.getTranslation('regular_account'),
                mode: 'regular',
            });
        }
    }
    createProfile() {
        this.setState({
            loading: true,
        });
        var newProfile = {
            data: {
                content: {
                    movies: {
                        favorites: [],
                        progress: [],
                    },
                    series: {
                        favorites: [],
                        progress: [],
                    },
                    education: {
                        favorites: [],
                        progress: [],
                        finished: [],
                    },
                    television: {
                        favorites: [],
                        locked: [],
                        progress: [],
                        grouplock: [],
                    },
                },
                settings: {
                    childlock: '0000',
                    clock: {
                        Clock_Type: '24h',
                        Clock_Setting: 'HH:mm',
                    },
                    audio: '',
                    text: '',
                    screen: '',
                    video_quality: GLOBAL.Device_IsPhone ? 'HIGH' : 'LOW',
                    toggle: '',
                },
            },
            recommendations: [],
            name: this.state.name,
            mode:
                this.state.accounts.find(l => l.checked == true).name ==
                    LANG.getTranslation('regular_account')
                    ? 'regular'
                    : 'kids mode',
            age_rating: this.state.ratings.find(r => r.checked == true).rating,
            profile_lock:
                this.state.locked.find(l => l.checked == true).name ==
                    LANG.getTranslation('locked')
                    ? true
                    : false,
            avatar: '',
            id: Math.floor(Math.random() * 1000),
        };
        GLOBAL.Profiles.push(newProfile);

        var newProfiles = GLOBAL.Profiles.filter(
            p => p.name != LANG.getTranslation('add_profile'),
        );
        DAL.setProfile(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            UTILS.toAlphaNumeric(GLOBAL.UserID) +
            '.' +
            GLOBAL.Pass +
            '.profile',
            newProfiles,
        ).then(result => {
            Actions.Profiles();
        });
    }
    showProfilePage() {
        return (
            <View
                style={[
                    {
                        flex: 1,
                        margin: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
                        borderRadius: 5,
                    },
                ]}
            >
                {RenderIf(!GLOBAL.Device_IsPhone)(
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View
                                style={{
                                    flex: 2,
                                    flexDirection: 'row',
                                    paddingTop: 20,
                                }}
                            >
                                <View
                                    style={{
                                        borderRadius: 5,
                                        flex: 1,
                                        flexDirection: 'column',
                                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
                                        marginLeft: 20,
                                    }}
                                >
                                    <View style={{ flex: 1, paddingBottom: 20 }}>
                                        <Text
                                            style={[
                                                styles.Standard,
                                                styles.Shadow,
                                                { padding: 20 },
                                            ]}
                                        >
                                            {LANG.getTranslation(
                                                'your_profile_name',
                                            )}
                                        </Text>
                                    </View>

                                    <View style={{ flex: 2 }}>
                                        <Text
                                            style={[
                                                styles.Standard,
                                                styles.Shadow,
                                                { padding: 20 },
                                            ]}
                                        >
                                            {LANG.getTranslation(
                                                'select_age_rating',
                                            )}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 2 }}>
                                        <Text
                                            style={[
                                                styles.Standard,
                                                styles.Shadow,
                                                { padding: 20 },
                                            ]}
                                        >
                                            {LANG.getTranslation(
                                                'lock_account_parental_control',
                                            )}
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 2,
                                        flexDirection: 'column',
                                        paddingLeft: 20,
                                        paddingRight: 20,
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            paddingBottom: 10,
                                            alignSelf: 'flex-start',
                                        }}
                                    >
                                        {RenderIf(
                                            (GLOBAL.Device_IsWebTV == true &&
                                                GLOBAL.Device_IsSmartTV ==
                                                false) ||
                                            GLOBAL.Device_IsPhone ||
                                            GLOBAL.Device_IsTablet,
                                        )(
                                            <View style={{ flex: 1 }}>
                                                <TouchableHighlight
                                                    style={{
                                                        height: 60,
                                                        width: 210,
                                                    }}
                                                    hasTVPreferredFocus={true}
                                                    onPress={this.focusName}
                                                    underlayColor="rgba(0, 0, 0, 0.70)"
                                                >
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                'row',
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                width: 50,
                                                                height: 50,
                                                                justifyContent:
                                                                    'center',
                                                                alignItems:
                                                                    'center',
                                                                margin: 6,
                                                            }}
                                                        >
                                                            <FontAwesome5
                                                                style={[
                                                                    styles.IconsMenu,
                                                                ]}
                                                                // icon={
                                                                //     SolidIcons.lock
                                                                // }
                                                                name="lock"
                                                            />
                                                        </View>
                                                        <View
                                                            style={{
                                                                borderColor:
                                                                    GLOBAL.Device_IsWebTV ||
                                                                        GLOBAL.Device_IsTablet
                                                                        ? '#fff'
                                                                        : 'transparent',
                                                                borderWidth: 2,
                                                            }}
                                                        >
                                                            <TextInput
                                                                ref={profilename =>
                                                                (this.profilename =
                                                                    profilename)
                                                                }
                                                                style={[
                                                                    styles.Input,
                                                                    {
                                                                        width: 300,
                                                                        height: 50,
                                                                    },
                                                                ]}
                                                                value={
                                                                    this.state
                                                                        .name
                                                                }
                                                                selection={
                                                                    this.state
                                                                        .selection
                                                                }
                                                                placeholder={
                                                                    'Enter your profile name'
                                                                }
                                                                underlineColorAndroid="rgba(0,0,0,0)"
                                                                placeholderTextColor="#fff"
                                                                selectionColor="#000"
                                                                onChangeText={text =>
                                                                    this.setState(
                                                                        {
                                                                            name: text,
                                                                        },
                                                                    )
                                                                }
                                                                keyboardAppearance={
                                                                    'dark'
                                                                }
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                            </View>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsSmartTV ||
                                            GLOBAL.Device_IsAppleTV ||
                                            GLOBAL.Device_IsSTB ||
                                            GLOBAL.Device_IsFireTV ||
                                            GLOBAL.Device_IsAndroidTV,
                                        )(
                                            <View style={{ flex: 1 }}>
                                                <TouchableHighlightFocus
                                                    BorderRadius={5}
                                                    style={{
                                                        height: GLOBAL.Device_IsSmartTV
                                                            ? 80
                                                            : GLOBAL.Device_IsAppleTV
                                                                ? 118
                                                                : 60,
                                                        borderRadius: 5,
                                                    }}
                                                    hasTVPreferredFocus={true}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        Actions.Auth_Keyboard({
                                                            PlaceHolder:
                                                                LANG.getTranslation(
                                                                    'your_profile_name',
                                                                ),
                                                            Value: this.state
                                                                .name,
                                                            profile:
                                                                this.props
                                                                    .profile,
                                                            index: this.props
                                                                .index,
                                                        })
                                                    }
                                                >
                                                    <View
                                                        style={[
                                                            styles.InputFake,
                                                            GLOBAL.Device_IsAppleTV
                                                                ? styles.InputFakeApple
                                                                : styles.InputFake,
                                                        ]}
                                                    >
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                flexDirection:
                                                                    'row',
                                                                alignItems:
                                                                    'center',
                                                                alignContent:
                                                                    'flex-start',
                                                                width: 240,
                                                            }}
                                                        >
                                                            <FontAwesome5
                                                                style={[
                                                                    styles.IconsMenu,
                                                                    {
                                                                        padding: 10,
                                                                    },
                                                                ]}
                                                                // icon={
                                                                //     SolidIcons.user
                                                                // }
                                                                name="user"
                                                            />
                                                            <Text
                                                                style={[
                                                                    styles.Standard,
                                                                    {
                                                                        justifyContent:
                                                                            'flex-start',
                                                                    },
                                                                ]}
                                                            >
                                                                {
                                                                    this.state
                                                                        .name
                                                                }
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlightFocus>
                                            </View>,
                                        )}
                                    </View>
                                    {/* <View style={{ flex: 2 }}>
                      <FlatList
                        ref={ref => (this.accountlist = ref)}
                        data={this.state.accounts}
                        style={{ paddingBottom: 5 }}
                        horizontal={true}
                        scrollType="no-scroll"
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) =>
                          <RadioButton Width={140} underlayColor={GLOBAL.Button_Color} hasTVPreferredFocus={false} onPress={() => this.setAccount(index)} Text={item.name} Check={item.checked} />
                        } />
                    </View> */}
                                    <View style={{ flex: 2 }}>
                                        <FlatList
                                            ref={ref => (this.ratinglist = ref)}
                                            data={this.state.ratings}
                                            style={{ paddingBottom: 5 }}
                                            horizontal={true}
                                            Width={60}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            renderItem={({ item, index }) => (
                                                <RadioButton
                                                    Width={60}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    hasTVPreferredFocus={false}
                                                    onPress={() =>
                                                        this.setRating(index)
                                                    }
                                                    Text={item.rating}
                                                    Check={item.checked}
                                                />
                                            )}
                                        />
                                    </View>
                                    <View style={{ flex: 2 }}>
                                        <FlatList
                                            ref={ref => (this.locklist = ref)}
                                            data={this.state.locked}
                                            Width={60}
                                            horizontal={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            renderItem={({ item, index }) => (
                                                <RadioButton
                                                    Width={60}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    hasTVPreferredFocus={false}
                                                    onPress={() =>
                                                        this.setLocked(index)
                                                    }
                                                    Text={item.name}
                                                    Check={item.checked}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.20)',
                                flexDirection: 'row',
                                justifyContent: GLOBAL.Device_IsAppleTV
                                    ? 'center'
                                    : 'flex-end',
                                alignContent: 'flex-end',
                                alignItems: 'flex-end',
                                margin: 20,
                                borderRadius: 5,
                            }}
                        >
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this.backToProfiles()}
                                Text={LANG.getTranslation('back')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this.createProfile()}
                                Text={LANG.getTranslation('submit')}
                            />
                        </View>
                    </View>,
                )}
            </View>
        );
    }
    render() {
        return (
            <Container needs_notch={true} hide_menu={true} hide_header={true}>
                {RenderIf(this.state.loading)(
                    <View style={{ flex: 1 }}>
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Loader size={'large'} color={'#e0e0e0'} />
                        </View>
                    </View>,
                )}
                {RenderIf(!this.state.loading)(
                    <View style={{ flex: 1 }}>{this.showProfilePage()}</View>,
                )}
            </Container>
        );
    }
}
