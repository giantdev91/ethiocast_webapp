var React = require('react-native');
import {Dimensions} from 'react-native';
import {moderateScale} from '../../../../utils/ScaleUtils';
import {isPad, isPhone} from '../../../../utils/Util';

var {StyleSheet} = React;

var ratio_movie_w = 0;
var ratio_movie_h = 0;
var ratio_channel = 0;
var ratio_general = 0;
var window = Dimensions.get('window');
var {width, height} = window;
var screen_width = Math.max(width, height);
var ratio_series_w = 0;
var ratio_series_h = 0;
var ratio_log0 = 0;

if (screen_width == 1280) {
    ratio_movie_w = 0.48;
    ratio_movie_h = 0.48;
    ratio_channel = 0.5;
    ratio_series_w = 0.5;
    ratio_series_h = 0.5;
    ratio_log0 = 0.3;
    ratio_general = 0.3;
}
if (screen_width == 1920) {
    ratio_movie_w = 0.48;
    ratio_movie_h = 0.48;
    ratio_channel = 0.5;
    ratio_series_w = 0.5;
    ratio_series_h = 0.5;
    ratio_log0 = 0.3;
    ratio_general = 0.3;
}
var extra_size = 0;

module.exports = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        height: 100,
    },
    offlineText: {
        color: '#fff',
        fontSize: 20,
    },
    img_news: {
        flex: 1,
        padding: 5,
        margin: 5,
        justifyContent: 'flex-start',
    },
    banner_view: {
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
    },
    img_banner: {
        width: '100%',
        height: 1000,
        flex: 1,
        flexDirection: 'row',
    },
    view_movies: {
        width: '100%',
        height: '100%',
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    view_movies_img: {
        width: GLOBAL.Landscape_Width / 6.5,
        height: (GLOBAL.Landscape_Width / 6.5) * 1.5,
    },
    view_apps: {
        width: screen_width / 12,
        aspectRatio: 1,
        margin: 5,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    view_apps_img_grid: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        aspectRatio: 1,
    },
    view_grid_tvhome: {
        backgroundColor: 'rgba(0, 0, 0, 0.83)',
        margin: 5,
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },

    view_grid_youtube: {
        width: screen_width / 4 - 20,
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    button_highlight: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        // height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },

    player_channel_icon_catchup: {
        width: moderateScale(GLOBAL.Device_IsPhone ? 35 : 50, ratio_channel),
        height: moderateScale(GLOBAL.Device_IsPhone ? 35 : 50, ratio_channel),
        margin: 5,
    },

    view_movies_big: {
        width: GLOBAL.Landscape_Width / 6.5,
        aspectRatio: 2 / 3,
        margin: 3,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },

    popup_vertical_text: {
        padding: 10,
        // paddingRight: 20,
        width: 300,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
    },

    view_youtube_img: {
        width: screen_width / 4 - 40,
        height: ((screen_width / 4 - 40) / 4) * 3,
        resizeMode: 'contain',
    },

    view_albums_img_big: {
        width: moderateScale(250, ratio_channel),
        height: moderateScale(250, ratio_channel),

        margin: 5,
    },

    menu_vertical_text: {
        flex: 1,
        height: moderateScale(45, ratio_channel),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },

    menu_vertical_icon: {
        flex: 1,
        //height: moderateScale(20, ratio_channel),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    modalWindowMessage: {
        width: getWidth(),
        //  width: '100%',
        height: getHeight(),
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        // opacity:0,
        zIndex: 9999,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    menu_horizontal_icon: {
        height: moderateScale(GLOBAL.Device_IsWebTV ? 100 : 50, ratio_channel),
        width: moderateScale(GLOBAL.Device_IsWebTV ? 100 : 50, ratio_channel),
        alignItems: 'center',
        justifyContent: 'center',
    },
    menu_horizontal_row: {
        height: moderateScale(
            GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV ? 100 : 50,
            ratio_channel,
        ),
        borderRadius: 5,
    },
    menu_horizontal_text: {
        marginTop: -5,
        height: moderateScale(
            GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV ? 100 : 50,
            ratio_channel,
        ),
        justifyContent: 'center',
    },
    channel_list: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
    },

    category_vertical_text: {
        padding: GLOBAL.Device_IsAppleTV ? 20 : 10,
        // paddingRight: 20,

        alignContent: 'flex-start',
        alignItems: 'flex-start',
    },
    menu_text_color: {
        //
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
    },

    menu_text_color_: {
        //
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),

        marginLeft: 15,
        marginRight: 15,
    },
    menu_text_color: {
        //
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),

        marginLeft: 10,
        marginRight: 10,
    },

    view_center: {
        width: '100%',
        height: '100%',
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    view_left: {
        width: '100%',
        height: '100%',
        flex: 1,
        alignContent: 'flex-start',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    view_right: {
        width: '100%',
        height: '100%',
        flex: 1,
        alignContent: 'flex-end',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 15,
    },

    view_center: {
        width: '100%',
        height: '100%',
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    operator_logo_login: {
        width: moderateScale(360, ratio_channel),
        height: moderateScale(50, ratio_channel),
    },

    vertical_banner_right: {
        flex: 1,
        width: moderateScale(190, ratio_general),
        aspectRatio: 1.6 / 6,
        overflow: 'hidden',
        alignItems: 'center',
        alignContent: 'center',
    },

    container: {
        flex: 1,
        alignContent: 'center',
        alignItems: 'center',
    },

    inner_container_left: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inner_container_right: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    container_authentication_: {
        flex: isPhone() ? 2 : 2,
        margin: 5,
        flexWrap: 'wrap',

        flexDirection: isPhone() ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(10, 10, 10, 0.43)',
    },
    container_authentication: {
        flex: 1,
        margin: 5,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(10, 10, 10, 0.43)',
    },

    bt_view: {
        height: '100%',
        // justifyContent: 'center',
        // alignItems: 'center',
    },

    button_small: {
        flex: 1,
        width: 150,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.70)',
        padding: 10,
        margin: 5,
        height: 40,
        borderWidth: 1,
        borderColor: '#333',
    },
    button_small_: {
        flex: 1,
        flexDirection: 'row',
        width: 180,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.70)',
        height: 10,
    },

    wrapper: {
        flexDirection: 'row',
        height: moderateScale(242, ratio_general),
    },

    // text: {
    //     //
    //     margin: 6,
    //     color: '#fff',
    //     fontSize: moderateScale(get_normal_fontsize(), ratio_general),
    //     width: 540
    // },

    player_info_bar_bottom: {
        height: moderateScale(
            GLOBAL.Device_IsWebTV == true ? 175 : 150,
            ratio_channel,
        ),
        backgroundColor: 'rgba(0, 0, 0, 0.83)',
        zIndex: 9998,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        opacity: 1,
    },
    player_info_bar_bottom_movies: {
        height: moderateScale(
            GLOBAL.Device_IsWebTV == true ? 175 : 150,
            ratio_channel,
        ),
        zIndex: 9998,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        //paddingTop: 20,
    },
    player_info_bar_bottom_recordings: {
        height: moderateScale(
            GLOBAL.Device_IsWebTV == true ? 175 : 150,
            ratio_channel,
        ),
        zIndex: 9998,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        opacity: 1,
        //paddingTop: 20,
    },
    player_info_bar_bottom_movies_bottom: {
        height: moderateScale(
            GLOBAL.Device_IsWebTV == true ? 175 : 150,
            ratio_channel,
        ),
        backgroundColor: 'rgba(0, 0, 0, 0.73)',
        flex: 1,
        justifyContent: 'flex-end',
        zIndex: 9998,
        width: '100%',
        position: 'absolute',
        bottom: 1,
        opacity: 1,
    },

    player_info_bar_top: {
        //height: GLOBAL.Device_IsPhone ? (Dimensions.get('window').width / 12) + 10 : (Dimensions.get('window').width / 12) + 5, // moderateScale(90, ratio_channel),
        backgroundColor: 'rgba(0, 0, 0, 0.73)',
        position: 'absolute',
        zIndex: 9999,
        width: '100%',
        top: 0,
        opacity: 1,
    },
    player_info_bar_top_movies: {
        //    height: moderateScale(120, ratio_channel),
        backgroundColor: 'rgba(0, 0, 0, 0.73)',
        position: 'absolute',
        zIndex: 9999,
        width: '100%',
        top: 0,
        opacity: 1,
    },
    player_info_bar_top_youtube: {
        height: moderateScale(30, ratio_channel),
        backgroundColor: 'rgba(0, 0, 0, 0.73)',

        width: Dimensions.get('window').width,
        position: 'absolute',
        top: 0,
        opacity: 0,
    },
    player_info_bar_cacthup: {
        height: Dimensions.get('window').width / 12 + 125, // moderateScale(90, ratio_channel),
        backgroundColor: 'rgba(0, 0, 0, 0.73)',
        position: 'absolute',
        zIndex: 9999,
        width: '100%',
        top: 0,
        opacity: 1,
    },
    player_info_bar_left: {
        width: Math.round(Dimensions.get('window').width / 4),
        position: 'absolute',
        zIndex: 9999,
        height: '100%',
        left: 0,
        opacity: 1,
    },
    modalContent: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: GLOBAL.Device_IsPhone
            ? 225
            : GLOBAL.Device_IsAppleTV
            ? 400
            : 300,
        width: GLOBAL.Device_IsPhone
            ? 320
            : GLOBAL.Device_IsAppleTV
            ? 600
            : 430,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
    },
    modalContentTwoButtons: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: GLOBAL.Device_IsPhone
            ? 225
            : GLOBAL.Device_IsAppleTV
            ? 400
            : 300,
        width: GLOBAL.Device_IsPhone
            ? 320
            : GLOBAL.Device_IsAppleTV
            ? 600
            : 600,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
    },
    modalContentMenu: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: GLOBAL.Device_IsPhone ? 100 : 100,
        width: GLOBAL.Device_IsPhone ? 320 : 430,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
    },
    modalContentEpg: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height:
            GLOBAL.Device_IsTablet || GLOBAL.Device_IsPhone
                ? 220
                : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                ? 230
                : GLOBAL.Device_IsSTB
                ? 230
                : GLOBAL.Device_IsAppleTV
                ? 360
                : 300,
        width:
            GLOBAL.Device_IsTablet || GLOBAL.Device_IsPhone
                ? 580
                : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                ? 640
                : GLOBAL.Device_IsSTB
                ? 640
                : GLOBAL.Device_IsAppleTV
                ? 980
                : 900,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
    },
    modalContentAds: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 300,
        width: 500,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
    },
    modalContentEpgRange: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        width: 520,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
    },
    modalContentGray: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 255,
        width: 400,
    },
    modalContentGrayChildlock: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: GLOBAL.Device_IsPhone ? 250 : 290,
        width: 400,
    },
    modalContentGrayExit: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.93)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 300,
        width: 400,
    },
    modalContentGrayResume: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 150,
        width: 400,
    },
    modalContentBig: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 410,
        width: 800,
        borderWidth: 1,
    },

    modalContentMessage: {
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.93)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 300,
        width: 300,
        borderWidth: 3,
        borderColor: '#333',
    },
    modalWindowBig: {
        width: getWidth_(),
        // width: '100%',
        height: getHeight_(),
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        // opacity:0,
        zIndex: 9999,
        position: 'absolute',
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
    },
    modalWindow: {
        width: getWidth_(),
        height: getHeight_(),
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        // opacity:0,
        zIndex: 9999,
        position: 'absolute',
        // backgroundColor: "rgba(7, 7, 7, 0.63)",
        top: 0,
        left: 0,
        right: 0,
    },
    modalWindow_: {
        width: getWidth(),
        height: getHeight(),
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        // opacity:0,
        zIndex: 9999,
        position: 'absolute',
        // backgroundColor: "rgba(7, 7, 7, 0.63)",
        top: 0,
        left: 0,
        right: 0,
    },
    // modalWindowMessage : {

    //     width: '100%',
    //     height: getHeight(),
    //     flex: 1,
    //     flexDirection: 'row',
    //     justifyContent: 'center',
    //     alignContent: 'center',
    //     alignItems: 'center',
    //     // opacity:0,
    //     zIndex: 9999,
    //     position: 'absolute',
    //     backgroundColor: "rgba(7, 7, 7, 0.63)",
    //     top: 0,
    //     left: 0,
    //     right: 0,
    // },
    modalWindowEPG: {
        width: getWidth(),
        height: getHeight(),
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        // opacity:0,
        zIndex: 9999,
        position: GLOBAL.Device_IsAppleTV == true ? 'relative' : 'absolute',
        backgroundColor:
            GLOBAL.Device_IsAppleTV == true
                ? 'rgba(0, 0, 0, 0)'
                : 'rgba(7, 7, 7, 0.43)',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: GLOBAL.Device_IsAppleTV == true ? 400 : 0,
    },
    modalWindowMessage: {
        width: getWidth(),
        //  width: '100%',
        height: getHeight(),
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        // opacity:0,
        zIndex: 9999,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },

    view_channels_player_left_img: {
        width: moderateScale(50, ratio_channel),
        height: moderateScale(50, ratio_channel),
        margin: 5,
    },

    player_channel_icon: {
        width: moderateScale(
            GLOBAL.Device_IsPhone == true ? 35 : 60,
            ratio_channel,
        ),
        height: moderateScale(
            GLOBAL.Device_IsPhone == true ? 35 : 60,
            ratio_channel,
        ),
        margin: 5,
    },

    player_channel_icon_home: {
        width: moderateScale(60, ratio_channel),
        height: moderateScale(60, ratio_channel),
    },

    player_number: {
        //
        fontSize: moderateScale(25, ratio_channel),
        color: '#fff',
        textAlign: 'center',
        justifyContent: 'center',
    },

    player_name: {
        //
        color: '#fff',
        fontSize: moderateScale(16, ratio_general),
        textAlign: 'left',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
    },

    epg_buttons: {
        //
        height: moderateScale(30, ratio_general),
        color: '#fff',
        fontSize: moderateScale(11, ratio_general),
        textAlign: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },

    player_button_epg: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width:
            GLOBAL.Device_IsWebTV || GLOBAL.Device_IsTablet
                ? 80
                : GLOBAL.Device_IsAppleTV
                ? 140
                : 90,
        height:
            GLOBAL.Device_IsWebTV || GLOBAL.Device_IsTablet
                ? 80
                : GLOBAL.Device_IsAppleTV
                ? 140
                : 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    player_button_ads: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: 90,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    player_button_area_yt: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: (screen_width * 0.95) / 10,
        height: '100%',
        // paddingTop: 30 ,
        // borderRightColor: '#777',
        // borderRightWidth: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    player_button_area_music: {
        // width: (screen_width * 0.95) / 10,
        height: '100%',
        // paddingTop: 30 ,
        // borderRightColor: '#777',
        //  borderRightWidth: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    player_button_area_music_last: {
        width: (screen_width * 0.95) / 10,
        height: '100%',
        // paddingTop: 30 ,

        justifyContent: 'center',
        alignContent: 'center',
    },
    player_button_area_yt_last: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: (screen_width * 0.95) / 10,
        height: '100%',
        // paddingTop: 30 ,

        justifyContent: 'center',
        alignContent: 'center',
    },

    miniepg_button_area: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: 180,
        height: 40,
        borderWidth: 1,
        borderColor: '#333',
        justifyContent: 'center',
        alignContent: 'center',
    },

    modalContentMini: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 200,
        width: 400,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
    },
    close_button_popup: {
        padding: 10,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniepg_button_area_last: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: 180,
        height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },

    player_button_icon: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: 25,
        height: 25,
        margin: 5,
        marginTop: 10,
        marginBottom: 5,
    },
    weather_icon: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: moderateScale(30, ratio_general),
        height: moderateScale(30, ratio_general),
        //flex:1
    },
    epg_button_icon: {
        alignSelf: 'center',
        justifyContent: 'center',
        width:
            GLOBAL.Device_IsAndroidTV ||
            GLOBAL.Device_IsFireTV ||
            GLOBAL.Device_IsSTB
                ? 15
                : 25,
        height:
            GLOBAL.Device_IsAndroidTV ||
            GLOBAL.Device_IsFireTV ||
            GLOBAL.Device_IsSTB
                ? 15
                : 25,
        margin: 5,
    },
    player_button_icon_small: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        width: moderateScale(
            GLOBAL.Device_IsPhone ||
                GLOBAL.Device_IsTablet ||
                GLOBAL.Device_IsAndroidTV ||
                GLOBAL.Device_IsFireTV
                ? 40
                : 55,
            ratio_general,
        ),
        height: moderateScale(
            GLOBAL.Device_IsPhone ||
                GLOBAL.Device_IsTablet ||
                GLOBAL.Device_IsAndroidTV ||
                GLOBAL.Device_IsFireTV
                ? 40
                : 55,
            ratio_general,
        ),
        margin: 5,
    },

    player_button_icon_yt: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: '35%',
        height: '35%',
    },

    player_button_poster_large: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        width: moderateScale(
            GLOBAL.Device_IsPhone
                ? 100
                : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                ? 150
                : GLOBAL.Device_IsSTB
                ? 150
                : GLOBAL.Device_IsTablet
                ? 150
                : GLOBAL.Device_IsAppleTV
                ? 200
                : 250,
            ratio_general,
        ),
        height:
            moderateScale(
                GLOBAL.Device_IsPhone
                    ? 100
                    : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                    ? 150
                    : GLOBAL.Device_IsSTB
                    ? 150
                    : GLOBAL.Device_IsTablet
                    ? 150
                    : GLOBAL.Device_IsAppleTV
                    ? 200
                    : 250,
                ratio_general,
            ) * 1.5,
        margin: 5,
        resizeMode: 'contain',
    },

    player_time: {
        //
        color: '#fff',
        fontSize: moderateScale(10, ratio_general),
        textAlign: 'right',
    },

    player_quad_channels: {
        position: 'absolute',
        zIndex: 9999,
        height: '100%',
        left: 0,
        right: 0,
        opacity: 1,
    },

    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    quadScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
    },
    fullScreenMusic: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        zIndex: -1,
        ///zIndex:0
    },
    fullScreen_Bg: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    fullScreen_message: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
    },

    view_movies_poster_img_: {
        width: moderateScale(
            GLOBAL.Device_IsSmallScreen ? 120 : 200,
            ratio_movie_w,
        ),
        height:
            moderateScale(
                GLOBAL.Device_IsSmallScreen ? 120 : 200,
                ratio_movie_w,
            ) * 1.5,
        alignContent: 'flex-start',
        margin: 10,
        alignItems: 'flex-start',
    },

    text_white_small: {
        //
        color: '#fff',
        // fontSize: get_normal_fontsize(),
        fontSize: moderateScale(16, ratio_general),
    },
    text_white_tiny: {
        //
        color: '#fff',
        // fontSize: get_normal_fontsize(),
        fontSize: moderateScale(10, ratio_general),
    },
    text_red_tiny: {
        color: '#fff',
        // fontSize: get_normal_fontsize(),
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
    },
    text_white_mini: {
        //
        color: '#fff',
        // fontSize: get_normal_fontsize(),
        fontSize: moderateScale(10, ratio_general),
    },
    text_white_medium: {
        //
        color: '#fff',
        // fontSize: 14,
        fontSize: moderateScale(14, ratio_general),
    },
    text_white_large: {
        //
        color: '#fff',
        // fontSize: 25,
        fontSize: moderateScale(get_large_font_size(), ratio_general),
    },
    text_white_xlarge_thin: {
        //
        // fontSize: 50,
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        color: '#fff',
    },
    text_white_medium_thin: {
        //
        // fontSize: 20,
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        color: '#fff',
    },
    text_header: {
        //
        // fontSize: 20,
        fontSize: GLOBAL.Device_IsTablet
            ? moderateScale(get_large_font_size(), ratio_channel)
            : moderateScale(get_normal_fontsize(), ratio_channel),
        color: '#fff',
    },
    text_white_mini_thin: {
        //
        // fontSize: 12,
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        color: '#fff',
    },

    formatRow: {
        flexDirection: 'row',
    },

    fullDimention: {
        flex: 1,
    },

    head_container: {
        flexDirection: 'row',

        // height: hp('10%')
        flex: 6,
    },

    content_container: {
        flex: 40,
        flexDirection: 'row',
    },
    content_container_content: {
        backgroundColor: 'rgba(0, 0, 0, 0.53)',
        margin: 5,
        flexDirection: 'row',
        flex: 40,

        // height: hp('82%'),
        // backgroundColor: 'forestgreen',
    },

    footer_container: {
        // height: hp('8%'),
        backgroundColor: 'rgba(0, 0, 0, 0.80)',
        marginTop: 3,
        flexDirection: 'row',
        flex: 4,
    },
    footer_container_left: {
        // height: hp('8%'),
        //    backgroundColor: 'rgba(0, 0, 0, 0.23)',
        marginTop: 3,
        flexDirection: 'column',
        flex: 4,
        width: '100%',
    },

    text_support: {
        flex: 1,
        color: '#fff',
        fontSize: moderateScale(16, ratio_general),
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },

    related_movies_h1: {
        //fontWeight: '400',
        color: '#bcbcbc',
        fontSize: moderateScale(get_large_font_size(), ratio_general),
        padding: 10,
    },

    channel_information_text_category_: {
        //fontWeight: '400',
        color: '#bcbcbc',
        fontSize: moderateScale(20, ratio_general),

        // height: moderateScale(35, ratio_general),
    },

    channel_information_video: {
        // width: wp('30%'),
        aspectRatio: 249 / 130,
        height: '100%',
    },
    channel_search_container: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        top: 0,
        backgroundColor: '#292828',
        //  width: isPhone() ? wp('50%') : wp('40%'),
        // width: moderateScale(340, ratio_general),
        height: '100%',
        padding: moderateScale(30, ratio_general),
        paddingTop: isPad() ? 50 : moderateScale(30, ratio_general),
        flexDirection: 'column',
    },
    channel_search_textinput: {
        height: isPad() ? 50 : moderateScale(38, ratio_general),
        width: '100%',
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        color: '#fff',
        //
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        marginBottom: moderateScale(20, ratio_general),
    },
    channel_search_button: {
        height: isPad() ? 60 : moderateScale(45, ratio_general),
        backgroundColor: '#636363',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    channel_search_text: {
        //
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        height: isPad() ? 50 : moderateScale(38, ratio_general),
    },

    login_text_: {
        fontSize: moderateScale(16, ratio_channel),
        color: '#fff',
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 10,
    },

    settings_text: {
        color: '#fff',
        margin: 10,
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
    },
    settings_text_: {
        color: '#fff',

        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
    },
    recordings_text: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        // width: isPad() ? 100 : moderateScale(200, ratio_general),
    },
    recordings_text_: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        // width: isPad() ? 50 : moderateScale(100, ratio_general),
    },
});
function getWidth() {
    if (GLOBAL.Device_IsPhone == true || GLOBAL.Device_IsWebTV) {
        return '100%';
    } else {
        return Dimensions.get('window').width;
    }
}
function getHeight() {
    if (GLOBAL.Device_IsPhone == true && GLOBAL.Device_System == 'Apple') {
        //could be this is wrong
        return '100%';
    } else {
        return Dimensions.get('window').height;
    }
}
function getWidth_() {
    if (GLOBAL.Device_IsPhone == true) {
        return '100%';
    } else {
        return Dimensions.get('window').width;
    }
}
function getHeight_() {
    if (GLOBAL.Device_IsPhone == true && GLOBAL.Device_System == 'Apple') {
        //could be this is wrong
        return Dimensions.get('window').height;
    } else {
        return Dimensions.get('window').height;
    }
}
function get_normal_fontsize() {
    if (GLOBAL.Device_IsSmartTV) {
        return 9 + extra_size;
    } else if (GLOBAL.Device_IsWebTV) {
        return 13 + extra_size;
    } else if (GLOBAL.Device_IsAndroidTV) {
        return 12 + extra_size;
    } else if (GLOBAL.Device_IsAppleTV) {
        return 10 + extra_size;
    } else if (GLOBAL.Device_IsTV) {
        return 12 + extra_size;
    } else if (GLOBAL.Device_IsTablet) {
        return 12 + extra_size;
    } else if (GLOBAL.Device_IsPhone) {
        return 9 + extra_size;
    } else if (GLOBAL.Device_IsSTB) {
        return 10 + extra_size;
    } else {
        return 12;
    }
}

function get_large_font_size() {
    if (GLOBAL.Device_IsSTB) {
        return 18 + extra_size;
    } else if (GLOBAL.Device_IsWebTV) {
        return 24 + extra_size;
    } else if (GLOBAL.Device_IsAppleTV) {
        return 20 + extra_size;
    } else if (GLOBAL.Device_IsTV) {
        return 18 + extra_size;
    } else if (GLOBAL.Device_IsTablet) {
        return 18 + extra_size;
    } else if (GLOBAL.Device_IsPhone) {
        return 16 + extra_size;
    } else {
        return 18;
    }
}
