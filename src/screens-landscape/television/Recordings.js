import React, { Component } from 'react';
import {
    View,
    Image,
    Text,
    BackHandler,
    TVMenuControl,
    FlatList,
    TextInput,
} from 'react-native';
//import moment from "moment";
import { Actions } from 'react-native-router-flux';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import TimerMixin from 'react-timer-mixin';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Recordings extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        GLOBAL.Recording_Selected_Index = 0;
        this.state = {
            searchValue: '',
            reportStartTime: moment().unix(),
            recordings: [],
            recordingsSearch: [],
            rowHeight: 0,
            rowWidth: 0,
            progress: 0,
            hours_used: 0 + 'h ' + 0 + 'm',
            quantity_recordings: 0,
            gb_free: 0,
            loading: true,
            id: 0,
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (this.state.searchValue.length > 0) {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            GLOBAL.Focus = 'Home';
            Actions.Home();
        }
    };
    updateDimensions() {
        Actions.Recordings();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        REPORT.set({ type: 7 });
        this.getAccessToken();
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                GLOBAL.Focus = 'Home';
                Actions.Home();
                return true;
            },
        );
    }
    componentWillUnmount() {
        sendPageReport(
            'Recordings',
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
        if (GLOBAL.Device_IsTV && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }
    toAlphaNumeric(input) {
        input = input.toString().replace(/\s/g, '');
        return input.toString().replace(/[^A-Za-z0-9]/g, '');
    }
    getAccessToken(id) {
        var path =
            '/' +
            GLOBAL.IMS +
            '/customers/' +
            this.toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
            '/' +
            this.toAlphaNumeric(GLOBAL.Pass) +
            '.json?id=' +
            id;
        DAL.getUserHash(path)
            .then(data => {
                DAL.getUserToken(data.CID)
                    .then(token => {
                        GLOBAL.USER_TOKEN = token.CID;
                        this.getUser(token.CID, id);
                    })
                    .catch(error => { });
            })
            .catch(error => { });
    }

    getUser(token, id) {
        var path =
            '/' +
            GLOBAL.IMS +
            '/customers/' +
            this.toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
            '/' +
            this.toAlphaNumeric(GLOBAL.Pass) +
            '.json';
        DAL.getDataToken(path, token)
            .then(data => {
                DAL.getData(data.CID)
                    .then(user => {
                        user = JSON.parse(user);
                        GLOBAL.User = user;
                        GLOBAL.Recordings = user.recordings;
                        GLOBAL.Storage_Total = user.storage.total;
                        GLOBAL.Storage_Used = user.storage.used;
                        GLOBAL.Storage_Hours = user.storage.total_hours;
                        //GLOBAL.PPV = user.payperview;
                        GLOBAL.Wallet_Credits = user.customer.walletbalance;
                        var progress = Math.round(
                            (GLOBAL.Storage_Used / GLOBAL.Storage_Total) * 100,
                        );
                        var free = GLOBAL.Storage_Total - GLOBAL.Storage_Used;
                        var hrs = 0;
                        var mins = 0;
                        if (GLOBAL.Storage_Hours) {
                            var time =
                                GLOBAL.Storage_Hours.toString().split('.');
                            hrs = time[0];
                            if (time.length > 1) {
                                var mins_ = Math.round(time[1] * 60);
                                mins = Math.round(mins_) / 10;
                            }
                        }
                        if (
                            this.state.quantity_recordings ==
                            GLOBAL.Recordings.length &&
                            user.recordings.length != 0
                        ) {
                            TimerMixin.clearTimeout(this.timer3);
                            this.timer3 = TimerMixin.setTimeout(() => {
                                this.getAccessToken(id);
                            }, 500);
                        } else {
                            this.setState({
                                recordings: GLOBAL.Recordings,
                                recordingsSearch: GLOBAL.Recordings,
                                quantity_recordings: GLOBAL.Recordings.length,
                                progress: progress,
                                hours_used: Math.floor(GLOBAL.Storage_Used), //hrs + 'h ' + mins.toFixed(0) + 'm',
                                gb_free: Math.floor(free),
                                loading: false,
                                id: id,
                            });
                        }
                    })
                    .catch(error => {
                        TimerMixin.clearTimeout(this.timer3);
                        this.timer3 = TimerMixin.setTimeout(() => {
                            this.getAccessToken(id);
                        }, 500);
                    });
            })
            .catch(error => { });
    }
    _onPressStartRecording(item) {
        var isRecordingStored = UTILS.getProfile(
            'recordings_progress',
            item.id,
            0,
        );
        var askResume = false;
        var askResumeTime = 0;
        if (isRecordingStored != null) {
            askResume = true;
            askResumeTime = Number(isRecordingStored.position);
        }
        var position = '0';
        if (isRecordingStored != null) {
            var percentageVideo =
                isRecordingStored.position / isRecordingStored.total;
            position = percentageVideo * 100;
        }
        if (position > 95) {
            askResume = false;
        }
        GLOBAL.Is_Trailer = false;
        GLOBAL.Recording = item;
        Actions.Player_Recordings({
            askResume: askResume,
            askResumeTime: askResumeTime,
        });
    }
    _onPressDeleteRecording(pvr) {
        DAL.deleteRecording(pvr.pvr_id).then(messages => {
            var newRecs = this.state.recordings.filter(
                r => r.pvr_id != pvr.pvr_id,
            );
            var showLength = (pvr.ut_end - pvr.ut_start) / 3600;
            GLOBAL.Storage_Used = GLOBAL.Storage_Used - showLength;
            GLOBAL.Storage_Hours = this.state.gb_free + showLength;
            var progress = Math.round(
                (GLOBAL.Storage_Used / GLOBAL.Storage_Total) * 100,
            );

            this.setState({
                recordings: newRecs,
                recordingsSearch: newRecs,
                hours_used: Math.floor(GLOBAL.Storage_Used),
                gb_free: Math.floor(GLOBAL.Storage_Hours),
                progress: progress,
            });
        });
    }
    _setFocusOnFirst(index) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
    getTime(s) {
        return moment.unix(s).format('DD MMMM YYYY hh:mm A');
    }
    getTimeMobile(s, e) {
        if (GLOBAL.Device_IsPhone) {
            return (
                moment.unix(s).format('DD MMMM YYYY hh:mm A') +
                ' - ' +
                moment.unix(e).format('hh:mm A')
            );
        } else {
            return (
                moment.unix(s).format('DD MMMM YYYY hh:mm A') +
                ' - ' +
                moment.unix(e).format('hh:mm A')
            );
        }
    }
    _getItemLayout = (data, index) => ({ length: 75, offset: 75 * index, index });
    onRowLayout = event => {
        if (this.state.rowHeight != 0) return;
        let height = event.nativeEvent.layout.height;
        let width = event.nativeEvent.layout.width;
        this.setState({
            rowHeight: height,
            rowWidth: width,
        });
    };
    getCurrentImage = (url, start) => {
        var splitUrl = url.toString().split('/');
        var timePart = moment.unix(start).format('/YYYY/MM/DD/hh/mm/ss');
        // var image = splitUrl[0] + "//" + splitUrl[2] + "/" + splitUrl[3] + timePart + "-preview.jpg";
        var image =
            splitUrl[0] +
            '//' +
            splitUrl[2] +
            '/' +
            splitUrl[3] +
            '/' +
            start +
            '-preview.jpg';
        return image;
    };
    getRecordings(item, index) {
        var image = this.getCurrentImage(item.url, item.ut_start);
        return (
            <View
                style={{
                    marginHorizontal: 5,
                    flexDirection: 'column',
                    width: GLOBAL.COL_REMAINING_3 - 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.40)',
                    marginBottom: 10,
                    borderRadius: 5,
                }}
            >
                <View>
                    <View
                        style={{
                            backgroundColor: '#000',
                            width: GLOBAL.COL_REMAINING_3 - 13,
                            height: ((GLOBAL.COL_REMAINING_3 - 5) / 16) * 9,
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                        }}
                    >
                        {image != '' && image != null && (
                            <Image
                                source={{ uri: image }}
                                style={{
                                    backgroundColor: '#111',
                                    borderRadius: 2,
                                    width: GLOBAL.COL_REMAINING_3 - 23,
                                    height:
                                        ((GLOBAL.COL_REMAINING_3 - 23) / 16) *
                                        9,
                                    margin: 5,
                                }}
                            />
                        )}
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            top: 15,
                            left: 15,
                            flexDirection: 'row',
                            alignSelf: 'flex-start',
                            justifyContent: 'flex-start',
                        }}
                    >
                        <Image
                            source={{
                                uri: GLOBAL.ImageUrlCMS + item.channel_icon,
                            }}
                            style={{
                                height:
                                    GLOBAL.COL_REMAINING_10 -
                                    (GLOBAL.Device_IsWebTV ? 80 : 40),
                                width:
                                    GLOBAL.COL_REMAINING_10 -
                                    (GLOBAL.Device_IsWebTV ? 80 : 40),
                            }}
                        />
                    </View>
                </View>
                <View
                    style={{
                        margin: 10,
                        borderRadius: 5,
                        flex: 1,
                        flexDirection: 'column',
                    }}
                >
                    <Text numberOfLines={1} style={[styles.H3, styles.Bold]}>
                        {item.channel_name}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[styles.Medium, styles.Bold]}
                    >
                        {decodeURIComponent(item.program_name)}
                    </Text>
                    <Text numberOfLines={1} style={styles.Medium}>
                        {moment.unix(item.ut_start).format('DD MMMM YYYY')}
                    </Text>
                    <Text numberOfLines={1} style={styles.Medium}>
                        {moment.unix(item.ut_start).format('hh:mm A') +
                            ' - ' +
                            moment.unix(item.ut_end).format('hh:mm A')}
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            marginLeft: -5,
                            marginTop: 10,
                        }}
                    >
                        {RenderIf(item.ut_end < moment().unix())(
                            <ButtonSmall
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={this._setFocusOnFirst(
                                    index,
                                )}
                                onPress={() =>
                                    this._onPressStartRecording(item)
                                }
                                Text={LANG.getTranslation('play')}
                            />,
                        )}
                        <ButtonSmall
                            Padding={0}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this._onPressDeleteRecording(item)}
                            Text={LANG.getTranslation('delete')}
                        />
                    </View>
                </View>
            </View>
        );
    }
    _setFocusOnFirst(index) {
        if (
            !this.firstInitFocus &&
            GLOBAL.Device_IsTV == true &&
            GLOBAL.Recording_Selected_Index == index
        ) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
    onChangeText = text => {
        if (text != undefined && text != null && text != '') {
            GLOBAL.Recordings_Selected_Index = 999999;
            var recordingsNew = this.state.recordingsSearch.filter(
                c =>
                    c.program_name.toLowerCase().indexOf(text.toLowerCase()) >
                    -1,
            );
            this.setState({
                recordings: recordingsNew,
                searchValue: text,
            });
        }
    };
    render() {
        if (this.state.loading) {
            return (
                <Container
                    needs_notch={true}
                    hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                    hide_menu={GLOBAL.App_Theme == 'Honua' ? false : true}
                >
                    <View
                        style={[
                            {
                                backgroundColor: 'rgba(0, 0, 0, 0.20)',
                                margin: 5,
                                flexDirection: 'row',
                                flex: 40,
                                marginTop: GLOBAL.App_Theme == 'Honua' ? 4 : 0,
                                marginLeft: GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                                borderTopLeftRadius:
                                    GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                            },
                        ]}
                    >
                        <Loader size={'large'} color={'#e0e0e0'} />
                    </View>
                </Container>
            );
        }
        return (
            <Container
                needs_notch={true}
                hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                hide_menu={
                    GLOBAL.App_Theme == 'Honua' || GLOBAL.App_Theme == 'Iridium'
                        ? false
                        : GLOBAL.App_Theme == 'Akua' &&
                            !GLOBAL.Device_IsTablet &&
                            !GLOBAL.Device_IsPhone &&
                            !GLOBAL.Device_IsWebTV &&
                            GLOBAL.Device_IsSmartTV
                            ? true
                            : false
                }
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
                        marginTop: GLOBAL.App_Theme == 'Honua' ? 4 : 0,
                        marginLeft: GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                        borderTopLeftRadius:
                            GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                    }}
                >
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        {!GLOBAL.Device_IsSmartTV && (
                            <View
                                style={{
                                    width:
                                        GLOBAL.COL_REMAINING_1 -
                                        (GLOBAL.App_Theme == 'Honua' ? 5 : 0),
                                    flexDirection: 'row',
                                    height: 65,
                                }}
                            >
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <TouchableHighlightFocus
                                        focusable={true}
                                        touchableGetPressRectOffset={50}
                                        Padding={0}
                                        Margin={0}
                                        BorderRadius={5}
                                        onPress={() => {
                                            this.onChangeText('');
                                            this.searchbar.clear();
                                        }}
                                    >
                                        <View
                                            style={{
                                                width:
                                                    GLOBAL.COL_REMAINING_10 - 5,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.20)',
                                                flexDirection: 'row',
                                                borderColor: '#222',
                                                borderWidth: 3,
                                                marginHorizontal: 0,
                                                borderRadius: 5,
                                                marginVertical: 0,
                                            }}
                                        >
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    { color: '#fff', margin: 12 },
                                                ]}
                                                // icon={SolidIcons.trash}
                                                name="trash"
                                            />
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>
                                <View style={{ flex: 9, flexDirection: 'row' }}>
                                    <TouchableHighlightFocus
                                        Padding={0}
                                        Margin={0}
                                        BorderRadius={5}
                                        onPress={() => this.searchbar.focus()}
                                    >
                                        <View
                                            style={{
                                                padding: GLOBAL.Device_IsWebTV
                                                    ? 9
                                                    : 0,
                                                marginRight: 40,
                                                alignItems: 'center',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.20)',
                                                flexDirection: 'row',
                                                borderColor: '#222',
                                                borderWidth: 3,
                                                marginHorizontal: 0,
                                                borderRadius: 5,
                                                marginVertical: 0,
                                            }}
                                        >
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    {
                                                        color: '#fff',
                                                        paddingLeft: 10,
                                                    },
                                                ]}
                                                // icon={SolidIcons.search}
                                                name="search"
                                            />
                                            <TextInput
                                                onChangeText={text =>
                                                    this.onChangeText(text)
                                                }
                                                ref={searchbar =>
                                                    (this.searchbar = searchbar)
                                                }
                                                selectionColor={'#000'}
                                                placeholderTextColor={'#fff'}
                                                underlineColorAndroid={
                                                    'transparent'
                                                }
                                                placeholder={LANG.getTranslation(
                                                    'filter',
                                                )}
                                                //style={[styles.H2, { width: GLOBAL.COL_REMAINING_1 - (GLOBAL.App_Theme == 'Honua' ? 165 : GLOBAL.Device_IsAppleTV ? 280 : 150), color: '#fff', marginHorizontal: 10, height: GLOBAL.Device_IsAppleTV ? 50 : null }]}>
                                                style={[
                                                    styles.H2,
                                                    { width: '100%' },
                                                ]}
                                            ></TextInput>
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>
                            </View>
                        )}
                        <View
                            style={{
                                flex: 9,
                                flexDirection: 'row',
                                paddingTop: 10,
                            }}
                        >
                            <FlatList
                                data={this.state.recordings}
                                horizontal={false}
                                numColumns={3}
                                keyExtractor={(item, index) =>
                                    'category_' + index.toString()
                                }
                                renderItem={({ item, index }) => {
                                    return this.getRecordings(item, index);
                                }}
                            />
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.70)',
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text
                                    style={[styles.Standard, { marginLeft: 30 }]}
                                >
                                    {this.state.quantity_recordings}{' '}
                                    {LANG.getTranslation('recordings')}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={styles.Standard}>
                                    {LANG.getTranslation('used')}{' '}
                                    {this.state.hours_used}{' '}
                                    {LANG.getTranslation('hours')}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={styles.Standard}>
                                    {LANG.getTranslation('free')}{' '}
                                    {this.state.gb_free}{' '}
                                    {LANG.getTranslation('hours')}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 2,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: '#111',
                                        paddingRight: 20,
                                        width:
                                            GLOBAL.Device_IsTV == true &&
                                                GLOBAL.App_Theme != 'Honua'
                                                ? 350
                                                : 150,
                                    }}
                                >
                                    <ProgressBarAnimated
                                        width={
                                            GLOBAL.Device_IsTV == true &&
                                                GLOBAL.App_Theme != 'Honua'
                                                ? 350
                                                : 200
                                        }
                                        height={
                                            GLOBAL.Device_IsPhone == true
                                                ? 20
                                                : 30
                                        }
                                        backgroundColor={'#222'}
                                        borderColor={'#222'}
                                        radius={0}
                                        borderRadius={0}
                                        borderWidth={0}
                                        value={this.state.progress}
                                        number={0}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Container>
        );
    }
}
