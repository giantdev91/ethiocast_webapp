import React, { Component } from 'react';
import { Text, View, TVMenuControl, Platform, BackHandler } from 'react-native';
import TimerMixin from 'react-timer-mixin';
import UserAvatar from 'react-native-user-avatar';
import { Actions } from 'react-native-router-flux';
import { sendPageReport } from '../../reporting/reporting';
export default class Profiles extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            reportStartTime: moment().unix(),
            profiles: [],
            profile_id: GLOBAL.ProfileID,
            deleting: false,
            profile_exist: false,
            show_childlock: false,
            profile_pin: ' ',
            profile: [],
            parentaltype: '',
            index: 0,
            show_exit_app: false,
            wrongCode: false,
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV) {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            if (GLOBAL.AppIsLauncher == true) {
                return;
            }

            if (this.state.show_childlock == true) {
                this.setState({
                    show_childlock: false,
                });
            } else if (this.state.show_exit_app == false) {
                this.setState({
                    show_exit_app: true,
                });
                this.starExitTimer();
                event.preventDefault();
            } else {
                if (GLOBAL.Device_Type == '_SmartTV_LG') {
                    webOS.platformBack();
                } else if (GLOBAL.Device_Type == '_SmartTV_Tizen') {
                    window.tizen.application.getCurrentApplication().exit();
                } else {
                    BackHandler.exitApp();
                }
                return true;
            }
        }
    };
    starExitTimer() {
        TimerMixin.clearTimeout(this.exittimer);
        this.exittimer = TimerMixin.setTimeout(() => {
            this.setState({
                show_exit_app: false,
            });
        }, 2000);
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            document.addEventListener('keydown', this.backButton, false);
        }
        if (
            GLOBAL.Device_System == 'Android' ||
            (GLOBAL.Device_System == 'Apple' &&
                GLOBAL.Device_IsAppleTV == false)
        ) {
            const config = new Configuration(
                'd0ee703ffcc7d40d8a61d204eea9ad0a',
            );
            const report = new Report(config, error => {
                report.addMetadata(
                    'User: ' + GLOBAL.UserID + ' - ' + GLOBAL.Pass,
                    'IMS: ' + GLOBAL.IMS,
                    'Service: ' + GLOBAL.CMS + ' - ' + GLOBAL.CRM,
                );
            });
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
                if (this.state.show_childlock == true) {
                    this.setState({
                        show_childlock: false,
                    });
                } else if (this.state.show_exit_app == false) {
                    this.setState({
                        show_exit_app: true,
                    });
                    this.starExitTimer();
                    return true;
                } else {
                    UTILS.closeAppAndLogout();
                    BackHandler.exitApp();
                    return true;
                }
            },
        );
        this.getProfiles();
    }
    componentWillUnmount() {
        sendPageReport('Profiles', this.state.reportStartTime, moment().unix());
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        TimerMixin.clearTimeout(this.exittimer);
        Actions.pop();
        this.setState = (state, callback) => {
            return;
        };
    }
    toAlphaNumeric(input) {
        if (input != null) {
            input = input.toString().replace(/\s/g, '');
            return input.toString().replace(/[^A-Za-z0-9]/g, '');
        } else {
            return '';
        }
    }
    normalizeProfile() {
        var profiles = GLOBAL.Profiles;
        profiles.forEach(profile => {
            if (profile.data == undefined) {
                var data = {
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
                };
                GLOBAL.Profiles.find(u => u.id == profile.id).data = data;
            } else {
                if (profile.data.settings.childlock == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.childlock = '0000';
                }
                if (profile.data.settings.video_quality == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.video_quality = GLOBAL.Device_IsPhone
                            ? 'HIGH'
                            : 'LOW';
                }
                if (profile.data.settings.audio == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.audio = '';
                }
                if (profile.data.settings.text == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.text = '';
                }
                if (profile.data.settings.screen == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.screen = '';
                }
                if (profile.data.settings.clock == undefined) {
                    var clock = {
                        Clock_Type: '24h',
                        Clock_Setting: 'HH:mm',
                    };
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.clock.push(clock);
                }
                if (profile.data.settings.toggle == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.toggle = '';
                }
                if (profile.data.content.movies == undefined) {
                    var movies = {
                        movies: {
                            progress: [],
                            favorites: [],
                        },
                    };
                    GLOBAL.Profiles.find(u => u.id == profile.id).data.push(
                        movies,
                    );
                }
                if (profile.data.content.series == undefined) {
                    var series = {
                        series: {
                            progress: [],
                            favorites: [],
                        },
                    };
                    GLOBAL.Profiles.find(u => u.id == profile.id).data.push(
                        series,
                    );
                }
                if (profile.data.content.television == undefined) {
                    var television = {
                        television: {
                            favorites: [],
                            locked: [],
                            grouplock: [],
                            progress: [],
                        },
                    };
                    GLOBAL.Profiles.find(u => u.id == profile.id).data.push(
                        television,
                    );
                }
            }
        });
    }
    getProfiles() {
        DAL.getProfile(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            this.toAlphaNumeric(GLOBAL.UserID) + '.' + GLOBAL.Pass + '.profile',
        ).then(profiles => {
            if (profiles.profile == undefined) {
                if (GLOBAL.Profiles.length > 0) {
                    this.normalizeProfile();
                    var newProfiles = GLOBAL.Profiles.filter(
                        p => p.name != LANG.getTranslation('add_profile'),
                    );
                    DAL.setProfile(
                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                        this.toAlphaNumeric(GLOBAL.UserID) +
                        '.' +
                        GLOBAL.Pass +
                        '.profile',
                        newProfiles,
                    );
                    var addProfile = {
                        id: 0,
                        name: LANG.getTranslation('add_profile'),
                        recommendations: [],
                        mode: 'regular',
                        avatar: '',
                    };
                    GLOBAL.Profiles = newProfiles;
                    GLOBAL.Profiles.push(addProfile);
                    this.setState({
                        profiles: GLOBAL.Profiles,
                    });
                }
            } else {
                GLOBAL.Profiles = profiles.profile;
                var addProfile = {
                    id: 0,
                    name: LANG.getTranslation('add_profile'),
                    recommendations: [],
                    mode: 'regular',
                    avatar: '',
                };
                GLOBAL.Profiles.push(addProfile);
                this.setState({
                    profiles: GLOBAL.Profiles,
                });
            }
            if (GLOBAL.UserInterface.general.enable_profiles == false) {
                this.loadProfile(this.state.profiles[0]);
            }
        });
    }
    checkProfile(profile) {
        if (profile.profile_lock == true) {
            this.setState({
                show_childlock: true,
                parentaltype: '',
                profile_pin: profile.data.settings.childlock,
                profile: profile,
            });
        } else {
            this.loadProfile(profile);
        }
    }

    loadProfile(profile) {
        if (profile == undefined) {
            Actions.Profiles();
        } else {
            GLOBAL.Favorite_Channels = [];
            if (profile.name == LANG.getTranslation('add_profile')) {
                this.createProfile();
            } else {
                GLOBAL.SearchChannels_ = [];
                GLOBAL.SearchMovies_ = [];
                GLOBAL.SearchSeries_ = [];
                GLOBAL.EPG_Search_Channels = [];
                GLOBAL.EPG_Search_EPG = [];

                GLOBAL.Selected_Profile = profile;
                GLOBAL.ProfileID = profile.id;

                GLOBAL.Profile_Lock = UTILS.getProfile('profile_lock', 0, 0);
                GLOBAL.Age_Rating = UTILS.getProfile('age_rating', 0, 0);

                GLOBAL.Kids_Mode = 'no kids mode';

                var PIN = UTILS.getProfile('settings_childlock', 0, 0);
                if (PIN) {
                    GLOBAL.PIN = PIN;
                } else {
                    GLOBAL.PIN = '0000';
                }

                var CLOCK = UTILS.getProfile('settings_clock', 0, 0);
                if (CLOCK) {
                    GLOBAL.Clock_Setting = CLOCK.Clock_Setting;
                    GLOBAL.Clock_Type = CLOCK.Clock_Type;
                    GLOBAL.Clock_Not_Set == true;
                }

                var TOGGLE = UTILS.getProfile('settings_toggle', 0, 0);
                if (TOGGLE) {
                    GLOBAL.Channel_Toggle = TOGGLE;
                }

                var SCREEN = UTILS.getProfile('settings_screen', 0, 0);
                if (SCREEN) {
                    GLOBAL.Screen_Size = SCREEN;
                }

                var OFFSET = UTILS.getProfile('settings_offset', 0, 0);
                if (OFFSET) {
                    GLOBAL.Catchup_DVR_Offset = OFFSET;
                }

                var TEXT = UTILS.getProfile('settings_text', 0, 0);
                if (TEXT) {
                    GLOBAL.Selected_TextTrack = TEXT;
                }

                var AUDIO = UTILS.getProfile('settings_audio', 0, 0);
                if (AUDIO) {
                    GLOBAL.Selected_AudioTrack = AUDIO;
                }

                var VIDEOQUALITY = UTILS.getProfile(
                    'settings_video_quality',
                    0,
                    0,
                );
                if (VIDEOQUALITY == null) {
                    VIDEOQUALITY = 'HIGH';
                }
                GLOBAL.Video_Quality_Setting = VIDEOQUALITY;

                // var Childlock_Channels = UTILS.getProfile('television_locked', 0, 0);
                // if (Childlock_Channels) { GLOBAL.Childlock_Channels = Childlock_Channels }

                var Recordings = UTILS.getProfile(
                    'television_recordings',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );
                if (Recordings == undefined) {
                    UTILS.storeProfile(
                        'television_recordings',
                        0,
                        0,
                        0,
                        0,
                        GLOBAL.Recordings,
                        '',
                    );
                } else {
                    GLOBAL.Recordings == Recordings;
                }

                GLOBAL.Channels = GLOBAL.Channels.filter(f => f.id != 0);

                var favoriteChannels = UTILS.getProfile(
                    'television_favorites',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );
                favoriteChannels.forEach(channel => {
                    var check = UTILS.checkChannelFavorites(channel.channel_id);
                    if (check == true) {
                        var channelNew = UTILS.getChannelFavorite(
                            channel.channel_id,
                        );
                        GLOBAL.Favorite_Channels.push(channelNew);
                    }
                });
                var favorites = {
                    id: 0,
                    name: LANG.getTranslation('favorites'),
                    position: 100000000,
                    channels: GLOBAL.Favorite_Channels,
                };
                GLOBAL.Channels.splice(1, 0, favorites);

                GLOBAL.Favorite_Movies = UTILS.getProfile(
                    'movie_favorites',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );
                GLOBAL.Favorite_Series = UTILS.getProfile(
                    'series_favorites',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );
                GLOBAL.Favorite_Education = UTILS.getProfile(
                    'education_favorites',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );

                //GLOBAL.Rented_Movies = UTILS.getProfile('movie_rentals', 0, 0, 0, 0, [], '');

                GLOBAL.Focus = 'Home';
                GLOBAL.ShowMenu = true;
                if (GLOBAL.DirectToTelevision == true) {
                    GLOBAL.Focus = 'Television';
                    (GLOBAL.Channel = UTILS.getChannel(
                        GLOBAL.Channels_Selected[0].channel_id,
                    )),
                        Actions.Player({ fromPage: 'Home' });
                } else {
                    this.openHome();
                }
            }
        }
    }
    openHome() {
        if (Platform.OS == 'android') {
            clear.clearAppCache(() => {
                var DefaultMenu = GLOBAL.UserInterface.general.start_screen;
                switch (DefaultMenu) {
                    case 'Home':
                        GLOBAL.Focus = 'Home';
                        Actions.Home();
                        break;
                    case 'Channels':
                        GLOBAL.Focus = 'Channels';
                        Actions.Channels();
                        break;
                    case 'TV Guide':
                        GLOBAL.Focus = 'TV Guide';
                        Actions.EPG();
                        break;
                    case 'Television':
                        GLOBAL.Focus = 'Television';
                        if (GLOBAL.Channels_Selected.length > 0) {
                            GLOBAL.Channel = UTILS.getChannel(
                                GLOBAL.Channels_Selected[0].channel_id,
                            );
                            Actions.Player({ fromPage: 'Home' });
                        }
                        break;
                    case 'Movies':
                        GLOBAL.Focus = 'Movies';
                        Actions.Movies_Stores();
                        break;
                    case 'Series':
                        GLOBAL.Focus = 'Series';
                        Actions.Series_Stores();
                        break;
                    case 'Music':
                        GLOBAL.Focus = 'Music';
                        Actions.Music_Albums();
                        break;
                    case 'Apps':
                        GLOBAL.Focus = 'Apps';
                        Actions.MarketPlace();
                        break;
                }
            });
        } else {
            var DefaultMenu = GLOBAL.UserInterface.general.start_screen;
            //DefaultMenu = 'Channels'
            switch (DefaultMenu) {
                case 'Home':
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                    break;
                case 'Channels':
                    GLOBAL.Focus = 'Channels';
                    Actions.Channels();
                    break;
                case 'TV Guide':
                    GLOBAL.Focus = 'TV Guide';
                    Actions.EPG();
                    break;
                case 'Television':
                    GLOBAL.Focus = 'Television';
                    if (GLOBAL.Channels_Selected.length > 0) {
                        GLOBAL.Channel = UTILS.getChannel(
                            GLOBAL.Channels_Selected[0].channel_id,
                        );
                        Actions.Player({ fromPage: 'Home' });
                    }
                    break;
                case 'Movies':
                    GLOBAL.Focus = 'Movies';
                    Actions.Movies_Stores();
                    break;
                case 'Series':
                    GLOBAL.Focus = 'Series';
                    Actions.Series_Stores();
                    break;
                case 'Music':
                    GLOBAL.Focus = 'Music';
                    Actions.Music_Albums();
                    break;
                case 'Apps':
                    GLOBAL.Focus = 'Apps';
                    Actions.MarketPlace();
                    break;
            }
        }
    }
    createProfile() {
        Actions.CreateProfile();
    }
    editProfile(item, index) {
        if (item.profile_lock == true) {
            GLOBAL.Selected_Profile = item;
            GLOBAL.ProfileID = item.id;
            var item = GLOBAL.Profiles.find(p => p.id == GLOBAL.ProfileID);
            this.setState({
                show_childlock: true,
                parentaltype: 'Edit',
                profile_pin: item.data.settings.childlock,
                profile: item,
                index: index,
            });
        } else {
            GLOBAL.Selected_Profile = item;
            GLOBAL.ProfileID = item.id;
            GLOBAL.Profile_Lock = UTILS.getProfile('profile_lock', 0, 0);
            GLOBAL.Age_Rating = UTILS.getProfile('age_rating', 0, 0);
            item = GLOBAL.Profiles.find(p => p.id == GLOBAL.ProfileID);
            Actions.EditProfile({ profile: item, index: index });
        }
    }
    openMessages() {
        GLOBAL.Focus = 'MessagesVia';
        Actions.Messages();
    }
    deleteProfile(item) {
        if (GLOBAL.Profiles.length > 2) {
            this.setState({
                deleting: true,
            });
            var delProfiles = GLOBAL.Profiles.filter(p => p.id != item.id);
            GLOBAL.Profiles = delProfiles;
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
    }
    _childlockValidate() {
        if (this.state.profile_pin + '' == this.state.childlock + '') {
            this.setState({
                show_childlock: false,
            });
            if (this.state.parentaltype == 'Edit') {
                GLOBAL.Selected_Profile = this.state.profile;
                GLOBAL.ProfileID = this.state.profile.id;
                GLOBAL.Profile_Lock = UTILS.getProfile('profile_lock', 0, 0);
                GLOBAL.Age_Rating = UTILS.getProfile('age_rating', 0, 0);
                var item = GLOBAL.Profiles.find(p => p.id == GLOBAL.ProfileID);
                Actions.EditProfile({ profile: item, index: this.state.index });
            } else if (this.state.parentaltype == 'Add') {
                Actions.CreateProfile();
            } else {
                this.loadProfile(this.state.profile);
            }
        } else {
            this.setState({
                wrongCode: true,
            });
        }
    }
    getProfile(item, index) {
        if (item.name == '') {
            return null;
        }
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    margin: 20,
                    height: GLOBAL.Device_IsAppleTV ? 330 : 220,
                }}
            >
                <View
                    style={{
                        flex: 6,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <TouchableHighlightFocus
                            BorderRadius={100}
                            style={{
                                width: GLOBAL.Device_IsAppleTV ? 170 : 130,
                                height: GLOBAL.Device_IsAppleTV ? 170 : 130,
                                borderRadius: 100,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                            hasTVPreferredFocus={this._setFocusOnFirst(index)}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this.checkProfile(item)}
                            isTVSelectable={true}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {RenderIf(
                                        item.name ==
                                        LANG.getTranslation('add_profile'),
                                    )(
                                        <UserAvatar
                                            size={
                                                GLOBAL.Device_IsAppleTV
                                                    ? 150
                                                    : 100
                                            }
                                            name={LANG.getTranslation(
                                                'add_profile',
                                            )}
                                            src={GLOBAL.USER_PROFILE_DEFAULT_AVATAR_URL}
                                            color="#555"
                                        />,
                                    )}
                                    {RenderIf(
                                        item.name !=
                                        LANG.getTranslation('add_profile'),
                                    )(
                                        <UserAvatar
                                            size={
                                                GLOBAL.Device_IsAppleTV
                                                    ? 150
                                                    : 100
                                            }
                                            name={item.name
                                                .split(' ')
                                                .slice(0, 2)
                                                .join('+')}
                                        />,
                                    )}
                                </View>
                            </View>
                        </TouchableHighlightFocus>
                        <View
                            style={{
                                paddingTop: 10,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {RenderIf(
                                item.name != LANG.getTranslation('add_profile'),
                            )(
                                <Text
                                    numberOfLines={1}
                                    style={[styles.Standard, styles.Shadow]}
                                >
                                    {item.name}
                                </Text>,
                            )}
                            {RenderIf(
                                item.name == LANG.getTranslation('add_profile'),
                            )(
                                <Text style={[styles.Standard, styles.Shadow]}>
                                    {LANG.getTranslation('add_profile')}
                                </Text>,
                            )}
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        flex: 2,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        padding: 10,
                    }}
                >
                    {RenderIf(item.name != LANG.getTranslation('add_profile'))(
                        <View
                            style={{
                                flex: 2,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                height: 50,
                            }}
                        >
                            <ButtonCircle
                                underlayColor={GLOBAL.Button_Color}
                                Icon={"edit"}
                                onPress={() => this.editProfile(item, index)}
                            ></ButtonCircle>
                            {RenderIf(this.state.profiles.length > 1)(
                                <ButtonCircle
                                    underlayColor={GLOBAL.Button_Color}
                                    Icon={"trash"}
                                    onPress={() => this.deleteProfile(item)}
                                ></ButtonCircle>,
                            )}
                        </View>,
                    )}
                    {RenderIf(item.name == LANG.getTranslation('add_profile'))(
                        <View
                            style={{
                                flex: 2,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                height: 50,
                            }}
                        ></View>,
                    )}
                </View>
            </View>
        );
    }
    _setFocusOnFirst(index) {
        if (GLOBAL.Device_IsTV == true && !this.firstInitFocus) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
    focusChildlock = () => {
        if (GLOBAL.Device_IsTV == true) {
            if (this.childlock_ != null && this.childlock_ != undefined) {
                this.childlock_.focus();
            }
        }
    };
    _childlockClosePopup() {
        this.setState({
            show_childlock: false,
        });
    }
    handleInputCode = text => {
        if (text.length < 5) {
            this.setState({ code: text, wrongCode: false });
        }
        if (text.length == 4) {
            if (GLOBAL.PIN + '' == text + '') {
                this.setState(
                    {
                        show_childlock: false,
                        wrongCode: false,
                    },
                    () => {
                        if (this.state.parentaltype == 'Edit') {
                            GLOBAL.Selected_Profile = this.state.profile;
                            GLOBAL.ProfileID = this.state.profile.id;
                            GLOBAL.Profile_Lock = UTILS.getProfile(
                                'profile_lock',
                                0,
                                0,
                            );
                            GLOBAL.Age_Rating = UTILS.getProfile(
                                'age_rating',
                                0,
                                0,
                            );
                            var item = GLOBAL.Profiles.find(
                                p => p.id == GLOBAL.ProfileID,
                            );
                            Actions.EditProfile({
                                profile: item,
                                index: this.state.index,
                            });
                        } else {
                            //continue
                            this.loadProfile(this.state.profile);
                        }
                    },
                );
            } else {
                this.setState({
                    wrongCode: true,
                });
            }
        }
    };
    render() {
        return (
            <Container needs_notch={true} hide_menu={true} hide_header={true}>
                {RenderIf(this.state.show_exit_app)(
                    <Modal
                        Title={LANG.getTranslation('exit_app')}
                        Centered={true}
                        TextHeader={LANG.getTranslation('exit_app_click_again')}
                        TextMain={LANG.getTranslation('exit_app_close')}
                    ></Modal>,
                )}

                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
                        margin: 10,
                        borderRadius: 5,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View
                                style={{
                                    flex: 2,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={[
                                        styles.H2,
                                        styles.Shadow,
                                        styles.Bold,
                                    ]}
                                >
                                    {LANG.getTranslation(
                                        'selecttheprofileyouwanttouse',
                                    )}
                                </Text>
                                <Text
                                    numberOfLines={2}
                                    style={[
                                        styles.Subtext,
                                        styles.Shadow,
                                        styles.Width_80_Percent,
                                        styles.CenterText,
                                    ]}
                                >
                                    {LANG.getTranslation('wittheprofile')}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                borderRadius: 5,
                                flex: 5,
                                justifyContent: 'center',
                                margin: 10,
                                padding: 5,
                                backgroundColor: 'rgba(0, 0, 0, 0.20)',
                                width: GLOBAL.Device_Width - 40,
                            }}
                        >
                            {RenderIf(this.state.show_childlock == true)(
                                <View
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
                                    }}
                                >
                                    <Parental_Keyboard
                                        WrongCode={this.state.wrongCode}
                                        onChangeText={this.handleInputCode}
                                    ></Parental_Keyboard>
                                </View>,
                            )}

                            {RenderIf(
                                this.state.profiles.length > 0 &&
                                !this.state.deleting &&
                                this.state.show_childlock == false &&
                                GLOBAL.UserInterface.general
                                    .enable_profiles == true,
                            )(
                                <View style={{ flex: 1 }}>
                                    <FlatList
                                        data={this.state.profiles}
                                        horizontal={false}
                                        numColumns={4}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        renderItem={({ item, index }) =>
                                            this.getProfile(item, index)
                                        }
                                    />
                                </View>,
                            )}
                            {RenderIf(this.state.profiles == 0)(
                                <View
                                    style={{
                                        borderRadius: 5,
                                        flex: 1,
                                        margin: 10,
                                    }}
                                >
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
                                        <Loader
                                            size={'large'}
                                            color={'#e0e0e0'}
                                        />
                                        <Text style={styles.text_white_medium}>
                                            {LANG.getTranslation(
                                                'loadingprofile',
                                            )}
                                        </Text>
                                    </View>
                                </View>,
                            )}
                            {RenderIf(this.state.deleting)(
                                <View
                                    style={{
                                        borderRadius: 5,
                                        flex: 1,
                                        margin: 10,
                                    }}
                                >
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
                                        <Loader
                                            size={'large'}
                                            color={'#e0e0e0'}
                                        />
                                        <Text style={styles.text_white_medium}>
                                            {LANG.getTranslation(
                                                'deleting_profile',
                                            )}
                                        </Text>
                                    </View>
                                </View>,
                            )}
                        </View>
                    </View>
                </View>
            </Container>
        );
    }
}
