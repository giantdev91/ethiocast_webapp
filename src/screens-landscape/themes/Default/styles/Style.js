var React = require('react-native');

import { Dimensions } from 'react-native';
import { moderateScale } from '../../../../utils/ScaleUtils';
import { colors, dimens } from '../../../../utils/Constants';
import { isPad, isPhone } from '../../../../utils/Util';

import EStyleSheet from 'react-native-extended-stylesheet';

var { StyleSheet } = React;

var ratio_movie_w = 0;
var ratio_movie_h = 0;
var ratio_channel = 0;
var ratio_general = 0;
var window = Dimensions.get('window');
var { width, height } = window;
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

export default EStyleSheet.create({
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
        // flexDirection: 'row',
        // width: moderateScale(90, ratio_movie_w),
        // width: wp('20%'),
        // height: hp('10%'),
        // height: '00%',//moderateScale(60, ratio_movie_h) * 1.5,
        padding: 5,
        margin: 5,
        //resizeMode: 'contain',
        justifyContent: 'flex-start',
    },
    container_news: {
        flex: 1,
        backgroundColor: 'rgba(10, 10, 10, 0.53)',
        flexDirection: isPhone() ? 'row' : 'column',
    },
    banner_view: {
        width: '100%',
        height: '100%',
        // backgroundColor: 'rgba(10, 10, 10, 0.43)',
        flex: 1,

        alignContent: 'center',
        justifyContent: 'center',
    },
    img_banner: {
        flex: 1,
        flexDirection: 'row',
        height: '100%',
    },
    view_movies: {
        width: '100%',
        height: '100%',
        // backgroundColor: 'rgba(10, 10, 10, 0.43)',
        flex: 1,
        // marginLeft: 2,
        alignContent: 'center',
        justifyContent: 'center',
    },
    view_movies_img: {
        width: screen_width / 6.5,
        height: (screen_width / 6.5) * 1.5,
    },
    view_movies_img_: {
        width: moderateScale(160, ratio_movie_w),
        height: moderateScale(240, ratio_movie_h),
    },
    view_series: {
        width: '100%',
        height: '100%',
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    view_series_img: {
        flex: 1,
        //flexDirection: 'row',
        //  height: moderateScale(160, ratio_channel),
        // width: wp('8%'),
        aspectRatio: 1,
        // // height: wp('8%'),
        //  height: undefined,
        width: '100%',
        // padding: 0,
        //  margin: 0,
        resizeMode: 'cover',
    },
    view_series_img_: {
        flex: 1,
        flexDirection: 'row',
        // width: moderateScale(160, ratio_movie_w),
        // width: wp('8%'),
        aspectRatio: 1,
        // height: wp('8%'),
        height: moderateScale(130, ratio_movie_h),
        width: moderateScale(130, ratio_movie_h),
        padding: 0,
        margin: 5,
        resizeMode: 'contain',
    },

    view_series: {
        width: '100%',
        height: '100%',
        // backgroundColor: 'rgba(10, 10, 10, 0.43)',
        //marginLeft: 2,
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    // : {
    //     width: '100%',
    //     height: '100%',
    //   //  backgroundColor: 'rgba(10, 10, 10, 0.43)',
    //     marginLeft: 5,
    //     flex: 1,
    //     alignContent: 'center',
    //     justifyContent: 'center',
    // },
    view_apps: {
        // width: moderateScale(50, ratio_channel),
        // height: moderateScale(50, ratio_channel),
        width: screen_width / 12,
        aspectRatio: 1,
        //  backgroundColor: 'rgba(10, 10, 10, 0.43)',
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
    view_channels_img: {
        // flex: 1,
        // flexDirection: 'row',
        // width: wp('8%'),
        // // height: wp('8%'),
        // aspectRatio: 1,
        width: 100,
        height: 100,
        aspectRatio: 1,
    },
    view_channels_img_grid: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        aspectRatio: 1,
        // width: moderateScale(45, ratio_channel),
        // height: moderateScale(45, ratio_channel),
        //padding: 5,
        margin: 5,
        resizeMode: 'contain',
    },
    view_grid_tvs: {
        width: screen_width / 13.9 - 6,
        aspectRatio: 1,
        //  backgroundColor: 'rgba(10, 10, 10, 0.43)',
        margin: 10,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    view_tvs_img_grid: {
        width: screen_width / 15.9 - 6,
        height: screen_width / 15.9 - 6,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    view_tvs_img_grid_small: {
        width: 40,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    view_grid_albums: {
        width: '100%',
        height: '100%',
        //   backgroundColor: 'rgba(10, 10, 10, 0.43)',
        margin: 3,
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    view_grid_tvhome: {
        height: 200,
        backgroundColor: 'rgba(10, 10, 10, 0.43)',
        margin: 5,

        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    view_albums_img: {
        flex: 1,
        flexDirection: 'row',
        width: moderateScale(120, ratio_channel),
        height: moderateScale(120, ratio_channel),
        //padding: 5,
        //margin: 5,
        resizeMode: 'contain',
    },
    view_stores: {
        // width: '100%',
        // height: '100%',
        //marginLeft: 2,
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
    },
    view_stores_series: {
        // width: moderateScale(180, ratio_series_w),
        // height: moderateScale(170, ratio_series_h) / 3,
        width: screen_width / 6 - 0,
        height: screen_width / 6 - 0,
        flex: 1,
        //   backgroundColor: 'rgba(10, 10, 10, 0.43)',
        margin: 0,
        alignContent: 'center',
        justifyContent: 'center',
    },
    view_stores_img: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        aspectRatio: getRatio(),
    },

    view_grid: {
        width: moderateScale(50, ratio_channel),
        height: moderateScale(50, ratio_channel),
        //  backgroundColor: 'rgba(10, 10, 10, 0.43)',
        flex: 1,
        margin: 3,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    view_grid_youtube: {
        width: screen_width / 4 - 20,
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    view_epg: {
        backgroundColor: 'rgba(10, 10, 10, 0.63)',
        height: moderateScale(50, ratio_channel),

        margin: 3,
        alignContent: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    view_epg_list_name: {
        padding: 5,
        alignContent: 'flex-start',
        justifyContent: 'center',
        height: moderateScale(50, ratio_channel),
        width: moderateScale(80, ratio_channel),
    },
    view_epg_list_number: {
        height: moderateScale(50, ratio_channel),
        padding: 10,
        alignContent: 'flex-start',
        justifyContent: 'center',

        width: moderateScale(40, ratio_channel),
    },
    modal_epg: {
        backgroundColor: 'rgba(10, 10, 10, 0.43)',

        margin: 1,
        padding: 10,
        alignContent: 'center',
        justifyContent: 'center',
        height: 400,
        width: 300,
    },
    highlight_epg: {
        height: '100%',
        width: '100%',
        padding: 20,
    },
    button_highlight: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    view_epg_channel: {
        height: moderateScale(50, ratio_channel),
        backgroundColor: '#222',
        width: moderateScale(50, ratio_channel),

        alignContent: 'flex-start',
        justifyContent: 'center',

        marginTop: 1,
        marginBottom: 1,
    },
    // epg_header_text: {

    //     color: '#fff',
    //     fontSize: moderateScale(6, ratio_channel),
    //     overflow: 'hidden',
    // },
    // epg_body_text: {

    //     color: '#fff',
    //     fontSize: moderateScale(10, ratio_channel),
    //     overflow: 'hidden',
    // },

    view_series_grid: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(10, 10, 10, 0.43)',
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    view_movies_big_home: {
        flex: 1,
        width: '100%',
        aspectRatio: 2 / 3,
        margin: 2,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    view_channels_home: {
        flex: 1,
        width: '100%',
        aspectRatio: 1 / 1,
        margin: 2,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        resizeMode: 'stretch',
    },
    view_movies_big: {
        width: GLOBAL.Landscape_Width / 6.5,
        aspectRatio: 2 / 3,
        margin: 3,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    view_movies_img_big: {
        width: '100%',
        height: '100%',
        margin: 5,
        resizeMode: 'contain',
    },

    view_youtube_img: {
        width: screen_width / 4 - 40,
        height: ((screen_width / 4 - 40) / 4) * 3,
        resizeMode: 'contain',
    },
    view_youtube_img_smalll: {
        width: moderateScale(65, ratio_channel),
        height: moderateScale(50, ratio_channel),
        margin: 5,
    },
    view_albums_img_big: {
        width: moderateScale(150, ratio_channel),
        height: moderateScale(150, ratio_channel),

        margin: 5,
    },
    view_channels_epg_img: {
        width: moderateScale(40, ratio_channel),
        height: moderateScale(40, ratio_channel),
        margin: 5,
    },
    menu_vertical_text: {
        flex: 1,
        height: moderateScale(40, ratio_channel),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        alignSelf: 'center',
    },
    menu_vertical_text__: {
        flex: 1,
        height: moderateScale(
            GLOBAL.Device_IsTV == true
                ? 30
                : GLOBAL.Device_IsWebTV || GLOBAL.Device_IsTablet == true
                    ? 60
                    : 20,
            ratio_channel,
        ),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    menu_vertical_text_: {
        height: moderateScale(30, ratio_channel),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    menu_horizontal_text: {
        height: moderateScale(40, ratio_channel),
        justifyContent: 'center',
    },
    menu_vertical_icon: {
        flex: 1,
        //height: moderateScale(40, ratio_channel),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        alignSelf: 'center',
        marginLeft: 10,
        marginRight: 10,
    },
    menu_vertical_icon_: {
        flex: 1,
        height: moderateScale(40, ratio_channel),
        width: moderateScale(40, ratio_channel),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',

        paddingTop: -10,
    },
    menu_horizontal_icon: {
        height: moderateScale(40, ratio_channel),
        width: moderateScale(40, ratio_channel),
        alignItems: 'center',
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
    settings_vertical_text: {
        height: moderateScale(40, ratio_channel),
        flex: 1,
    },
    channel_category_menu_container: {
        height: isPad() ? 48 : moderateScale(30, ratio_general),
        justifyContent: 'center',
    },
    category_vertical_text: {
        padding: 20,
        // paddingRight: 20,

        alignContent: 'flex-start',
        alignItems: 'flex-start',
    },
    close_button_popup: {
        padding: 10,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menu_text_color: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
    },
    menu_text_color_support: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    menu_text_color_: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),

        marginLeft: 15,
        marginRight: 15,
    },
    menu_text_color: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),

        marginLeft: 10,
        marginRight: 10,
    },
    category_vertical_text_menu: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
    },
    menu_text_color_h1: {
        color: '#fff',
        fontSize: moderateScale(get_large_font_size(), ratio_channel),
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
    view_right_top: {
        width: '100%',
        height: '100%',
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    view_center: {
        width: '100%',
        height: '100%',
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    operator_logo: {
        width: moderateScale(130, ratio_channel),
        height: GLOBAL.Device_IsWebTV
            ? moderateScale(25, ratio_channel)
            : '100%', //,
        padding: 5,
    },
    operator_logo_login: {
        width: moderateScale(270, ratio_channel),
        height: moderateScale(75, ratio_channel),
    },
    vertical_banner_left: {
        flex: 1,
        width: moderateScale(95, ratio_general),
        height: '100%',
        overflow: 'hidden',
        alignItems: 'center',
        alignContent: 'center',
    },
    vertical_banner_right: {
        flex: 1,
        width: moderateScale(190, ratio_general),
        aspectRatio: 1.6 / 6,
        overflow: 'hidden',
        alignItems: 'center',
        alignContent: 'center',
    },
    grid_list: {
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    center_image_view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    img: {
        padding: 20,
    },
    elements: {
        // flex: 1,
        // flexDirection:'row'
    },
    container: {
        flex: 1,
        alignContent: 'center',
        alignItems: 'center',
    },
    inner_container: {
        // flex:1,
        // alignItems: 'center',
    },
    inner_container_left: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center',
        //width:GLOBAL.Device_IsPhone ? '100%' : screen_width / 2
        width: '100%',
    },
    inner_container_right: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center',
        // width:GLOBAL.Device_IsPhone ? '100%' : screen_width / 2
        width: '100%',
        height: '100%',
    },
    container_authentication_: {
        flex: isPhone() ? 2 : 2,
        margin: 10,
        flexWrap: 'wrap',

        flexDirection: isPhone() ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(10, 10, 10, 0.43)',
    },
    container_authentication: {
        flex: 1,
        margin: 10,
        //flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        // backgroundColor: 'rgba(10, 10, 10, 0.43)',
    },
    container_dataloader: {
        flex: 1,
        margin: 20,
        padding: 40,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(10, 10, 10, 0.43)',
    },
    bt_view: {
        height: '100%',
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    bt_view_authentication: {
        backgroundColor: '#222',
        justifyContent: 'center',
    },
    bt_text: {
        backgroundColor: 'transparent',
        color: '#fff',
        paddingLeft: 5,
        overflow: 'hidden',
    },
    bt_container: {
        borderRadius: 3,
        backgroundColor: 'red',
    },
    input_search: {
        fontSize: moderateScale(get_medium_fontsize(), ratio_general),
        textAlign: 'left',
        lineHeight: 22,
        color: '#fff',
    },
    input: {
        margin: 5,
        padding: 10,
        fontSize: moderateScale(get_medium_fontsize(), ratio_general),
        textAlign: 'left',
        borderBottomColor: '#fff',
        color: '#fff',
        width: '100%',
        borderBottomWidth: 1,
    },
    input_childlock: {
        margin: 5,
        fontSize: moderateScale(get_medium_fontsize(), ratio_general),
        textAlign: 'left',
        color: '#fff',
        borderColor: '#000',
        borderBottomWidth: 1,
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
    button_wide_: {
        flex: 1,
        flexDirection: 'row',
        width: 370,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.70)',
        height: 10,
    },
    center_element: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    wrapper: {
        flexDirection: 'row',
        height: moderateScale(242, ratio_general),
    },
    head: {
        height: 50,
        backgroundColor: 'rgba(10, 10, 10, 0.83)',
        width: 12960,

        borderRightColor: '#fff',

        // marginTop: 3,
        marginTop: 5,
    },
    slot: {
        width: 480,
    },
    text: {
        margin: 6,
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        width: 540,
    },
    row: {
        flexDirection: 'row',
    },
    player_info_bar_bottom: {
        height: moderateScale(150, ratio_channel),
        backgroundColor: 'rgba(0, 0, 0, 0.73)',
        zIndex: 9998,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        opacity: 1,
    },
    player_info_bar_bottom_movies: {
        height: moderateScale(300, ratio_channel),
        zIndex: 9998,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        //paddingTop: 20,
    },
    player_info_bar_bottom_recordings: {
        height: moderateScale(200, ratio_channel),
        zIndex: 9998,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        opacity: 1,
        //paddingTop: 20,
    },
    player_info_bar_bottom_movies_bottom: {
        height: moderateScale(150, ratio_channel),
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
        height: GLOBAL.Device_IsPhone
            ? Dimensions.get('window').width / 12 + 10
            : Dimensions.get('window').width / 12 + 5, // moderateScale(90, ratio_channel),
        backgroundColor: 'rgba(0, 0, 0, 0.73)',
        position: 'absolute',
        zIndex: 9999,
        width: '100%',
        top: 0,
        opacity: 1,
    },
    player_info_bar_top_movies: {
        height: moderateScale(140, ratio_channel),
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
        height: Dimensions.get('window').width / 12 + 90, // moderateScale(90, ratio_channel),
        backgroundColor: 'rgba(0, 0, 0, 0.73)',
        position: 'absolute',
        zIndex: 9999,
        width: '100%',
        top: 0,
        opacity: 1,
    },

    player_info_bar_left: {
        position: 'absolute',
        zIndex: 9999,
        height: '100%',
        left: 0,
        opacity: 1,
    },
    player_quad_channels: {
        height: 500,
        width: 400,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 300,
        width: 430,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
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
    modalContentEpg: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 220,
        width: 650,
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
        height: 290,
        width: 400,
    },
    modalContentBig: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 420,
        width: 800,
        borderWidth: 1,
    },

    modalContentMessage: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        height: 300,
        width: 300,
        borderWidth: 3,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
    modalWindowBig: {
        width: getWidth(),
        //width: '100%',
        height: getHeight(),
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
        backgroundColor: 'rgba(7, 7, 7, 0.63)',
        top: 0,
        left: 0,
        right: 0,
    },
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
    modalWindowEPG: {
        width: getWidth(),
        height: getHeight(),
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        // opacity:0,
        zIndex: 9999,
        marginTop: 400,
        // backgroundColor:"rgba(7, 7, 7, 0.43)",

        left: 0,
        right: 0,
    },
    modalContentEpg_: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.73)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 220,
        width: 650,
        borderWidth: 1,
        borderRightColor: '#222',
        borderTopColor: '#222',
        borderLeftColor: '#222',
        borderBottomColor: '#222',
    },
    modalWindowMessage: {
        width: getWidth(),
        height: getHeight(),
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        // opacity:0,
        zIndex: 9999,
        position: 'absolute',
    },
    view_channels_player_left_img: {
        width: moderateScale(25, ratio_channel),
        height: moderateScale(25, ratio_channel),
        margin: 5,
    },
    view_player_channels: {
        width: moderateScale(200, ratio_channel),
        height: moderateScale(80, ratio_channel),
    },
    player_channel_icon: {
        width: moderateScale(60, ratio_channel),
        height: moderateScale(60, ratio_channel),
        margin: 5,
    },
    player_channel_icon_home: {
        width: moderateScale(40, ratio_channel),
        height: moderateScale(40, ratio_channel),
        margin: 5,
    },
    epg_channel_icon: {
        width: moderateScale(50, ratio_channel),
        height: moderateScale(50, ratio_channel),
        margin: 5,
    },
    player_movie_poster: {
        width: moderateScale(60, ratio_movie_w),
        height: moderateScale(60, ratio_movie_h) * 1.5,
        margin: 5,
    },
    player_number: {
        fontSize: moderateScale(25, ratio_channel),
        color: '#fff',
        textAlign: 'center',
        justifyContent: 'center',
    },
    catchup_name: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textAlign: 'left',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
        width: 180,
    },
    player_name: {
        color: '#fff',
        fontSize: moderateScale(get_medium_fontsize(), ratio_general),
        textAlign: 'left',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
    },
    player_desc: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textAlign: 'left',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
        paddingTop: 8,
    },
    miniepg_buttons: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textAlign: 'center',
        justifyContent: 'center',
    },

    player_buttons: {
        //height: moderateScale(30, ratio_general),
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textAlign: 'center',
        justifyContent: 'center',
    },
    epg_buttons: {
        height: moderateScale(30, ratio_general),
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textAlign: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    player_button_area: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: screen_width / 13,
        height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
    },
    player_button_area_catchup: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: screen_width / 11,
        height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
    },
    player_button_area_movies_series: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: screen_width / 8,
        height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
    },
    player_button_epg: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: 90,
        height: 90,
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
        width: (screen_width * 0.95) / 10,
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
    settings_button_area: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: 380,
        height: 50,
        borderWidth: 1,
        borderColor: '#000',
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
    miniepg_button_area_: {
        //  backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: 180,
        height: 55,

        justifyContent: 'center',
        alignContent: 'center',
    },
    miniepg_button_area_last: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: 180,
        height: 40,
        justifyContent: 'center',
        alignContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    player_infographic_area: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignContent: 'center',
    },
    player_button_infographic: {
        alignSelf: 'flex-end',
        alignContent: 'flex-end',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: '60%',
        height: '60%',
        margin: 5,
        marginTop: 10,
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
        width: moderateScale(50, ratio_general),
        height: moderateScale(50, ratio_general),
        flex: 1,
    },
    epg_button_icon: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: 35,
        height: 35,
        margin: 5,
        marginTop: 10,
        marginBottom: 5,
    },

    player_button_icon_yt: {
        alignSelf: 'center',
        justifyContent: 'center',
        // width:'25%',
        // height:'25%',
    },
    player_button_icon_big: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: '50%',
        height: '50%',
        margin: 5,
        marginTop: 10,
    },
    player_button_icon_medium: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        width: moderateScale(50, ratio_general),
        height: moderateScale(50, ratio_general),
        margin: 5,
    },
    player_button_poster_medium: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        width: moderateScale(50, ratio_general),
        height: moderateScale(50, ratio_general) * 1.5,
        margin: 5,
    },
    player_button_poster_large: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        width: moderateScale(150, ratio_general),
        height: moderateScale(150, ratio_general) * 1.5,
        margin: 5,
        resizeMode: 'contain',
    },
    player_button_icon_small: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        width: moderateScale(40, ratio_general),
        height: moderateScale(40, ratio_general),
        margin: 5,
    },
    player_button_icon_medium: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        width: moderateScale(100, ratio_general),
        height: moderateScale(100, ratio_general),
        margin: 5,
    },
    player_button_area_last: {
        backgroundColor: 'rgba(7, 7, 7, 0.43)',
        width: (screen_width * 0.9) / 10,
        height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    catchup_time: {
        color: '#666',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textAlign: 'left',
        paddingLeft: 10,
    },
    player_time: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textAlign: 'right',
    },
    catchup_prog: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textAlign: 'left',
        width: 250,
        paddingLeft: 10,
    },
    player: {
        position: 'absolute',
        zIndex: 0,
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
        ///zIndex:0
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
    widtheightcentercenter: {
        width: '100%',
        height: '100%',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerProgressCompleted: {
        height: 5,
        backgroundColor: '#cccccc',
    },
    innerProgressRemaining: {
        height: 5,
        backgroundColor: 'red',
    },

    h1: {
        fontSize: 35,
        color: '#fff',
    },

    view_movies_poster_img: {
        width: moderateScale(isPad() ? 300 : 150, ratio_movie_w),
        height: moderateScale(isPad() ? 300 : 150, ratio_movie_h) * 1.5,

        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
    },
    view_movies_poster_img_: {
        width: moderateScale(140, ratio_movie_w),
        height: moderateScale(140, ratio_movie_w) * 1.5,
        alignContent: 'flex-start',
        margin: 10,
        alignItems: 'flex-start',
    },
    view_movies_poster_img_s: {
        // width: moderateScale(isPad() ? 412.5 : 206, ratio_movie_w),
        // height: moderateScale(isPad() ? 225 : 112.5, ratio_movie_h) * 1.5,
        margin: 20,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        resizeMode: 'contain',
    },
    text_white_small: {
        color: '#fff',
        // fontSize: get_normal_fontsize(),
        fontSize: moderateScale(get_medium_fontsize(), ratio_general),
    },
    text_white_tiny: {
        color: '#fff',
        // fontSize: get_normal_fontsize(),
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
    },
    text_red_tiny: {
        color: '#fff',
        // fontSize: get_normal_fontsize(),
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
    },
    text_white_mini: {
        color: '#fff',
        // fontSize: get_normal_fontsize(),
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
    },
    text_white_medium: {
        color: '#fff',
        // fontSize: 14,
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
    },
    text_white_large: {
        color: '#fff',
        // fontSize: 25,
        fontSize: moderateScale(get_large_font_size(), ratio_general),
    },
    text_white_xlarge_thin: {
        // fontSize: 50,
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        color: '#fff',
    },
    text_white_medium_thin: {
        // fontSize: 20,
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        color: '#fff',
    },
    text_header: {
        // fontSize: 20,
        fontSize: GLOBAL.Device_IsTablet
            ? moderateScale(get_large_font_size(), ratio_channel)
            : moderateScale(get_normal_fontsize(), ratio_channel),
        color: '#fff',
    },
    text_white_mini_thin: {
        // fontSize: 12,
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        color: '#fff',
    },
    loader_percentage: {
        fontSize: 35,
        color: '#fff',
        alignSelf: 'center',
    },
    player_time_current: {
        // fontSize: 38,
        fontSize: moderateScale(get_large_font_size(), ratio_channel),
        color: '#fff',
        textAlign: 'right',
        justifyContent: 'flex-end',
    },
    font_size_super_mini: {
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        color: '#fff',
    },
    formatRow: {
        flexDirection: 'row',
    },
    verticalLine: {
        width: '100%',
        height: dimens.lineWidth,
        backgroundColor: colors.backgroundColor,
    },
    horizontalLine: {
        width: dimens.lineWidth,
        height: '100%',
        backgroundColor: 'black',
    },
    fullDimention: {
        flex: 1,
    },
    fullWidth: {
        width: '100%',
    },
    fullHeight: {
        height: '100%',
    },
    formatCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: colors.baseColor
    },
    head_container: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.80)',
        // height: hp('10%')
        flex: 6,
    },
    head_container_transparent: {
        flexDirection: 'row',
        //backgroundColor: 'rgba(10, 10, 10, 0.80)',
        // height: hp('10%')
        flex: 6,
    },
    menu_horizontal_row: {
        height: moderateScale(60, ratio_channel),
    },
    content_container: {
        marginTop: 3,
        flex: 40,
        flexDirection: 'row',
    },
    content_container_content: {
        backgroundColor: 'rgba(0, 0, 0, 0.53)',
        margin: 15,
        flexDirection: 'row',
        flex: 40,

        // height: hp('82%'),
        // backgroundColor: 'forestgreen',
    },
    content_container_content_movies: {
        backgroundColor: 'rgba(0, 0, 0, 0.53)',
        margin: 15,
        flexDirection: 'row',
        flex: 40,
        height: '100%',

        // height: hp('82%'),
        // backgroundColor: 'forestgreen',
    },
    content_container_content_recommendation: {
        backgroundColor: 'rgba(0, 0, 0, 0.73)',
        marginLeft: 15,
        marginRight: 15,
        flexDirection: 'column',
        flex: 50,
        // height: hp('82%'),
        // backgroundColor: 'forestgreen',
    },
    content_container_content_mobile: {
        backgroundColor: 'rgba(0, 0, 0, 0.53)',
        margin: 15,
        flexDirection: 'column',
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
        backgroundColor: 'rgba(0, 0, 0, 0.33)',
        marginTop: 3,
        flexDirection: 'row',
        flex: 4,
    },
    text_support: {
        flex: 1,
        color: '#fff',
        fontSize: moderateScale(get_medium_fontsize(), ratio_general),
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        lineHeight: moderateScale(get_medium_fontsize(), ratio_general),
    },
    channel_information_container: {
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        //   height: hp('20%'),
        // width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: isPad() ? moderateScale(0, ratio_movie_w) : 0,
        marginRight: isPad() ? moderateScale(0, ratio_movie_w) : 0,
        paddingLeft: isPad() ? moderateScale(0, ratio_movie_w) : 0,
        paddingRight: isPad() ? moderateScale(0, ratio_movie_w) : 0,
        paddingTop: isPad() ? moderateScale(0, ratio_movie_w) : 0,
        paddingBottom: isPad() ? moderateScale(5, ratio_movie_w) : 5,
        marginBottom: 3,
        marginTop: 3,
    },
    // channel_information_image: {
    //     width: wp('8%'),
    //     aspectRatio: 1,
    //     resizeMode: 'stretch',
    //     margin: isPad() ? moderateScale(15, ratio_movie_w) : 10,
    // },
    channel_information_text_name: {
        fontWeight: '400',
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        textTransform: 'uppercase',
    },
    related_movies_h1: {
        //fontWeight: '400',
        color: '#bcbcbc',
        fontSize: moderateScale(get_large_font_size(), ratio_general),
        padding: 10,
    },
    related_movies_h2: {
        //fontWeight: '400',
        color: '#bcbcbc',
        fontSize: moderateScale(get_medium_fontsize(), ratio_general),
        paddingBottom: 10,
        paddingTop: 10,
    },
    channel_information_catchup: {
        //fontWeight: '400',
        color: '#bcbcbc',
        fontSize: moderateScale(get_large_font_size(), ratio_general),
        paddingLeft: 10,
    },
    channel_information_text_category_: {
        //fontWeight: '400',
        color: '#bcbcbc',
        fontSize: moderateScale(get_large_font_size(), ratio_general),

        //height: moderateScale(35, ratio_general),
    },
    channel_information_text_info: {
        //fontWeight: '400',
        color: '#e74c3c',
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
    },
    channel_information_video: {
        // width: wp('30%'),
        aspectRatio: 249 / 130,
        height: '100%',
        backgroundColor: 'black',
    },
    channel_search_container: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        top: 0,
        backgroundColor: '#292828',
        // width: isPhone() ? wp('50%') : wp('40%'),
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
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        height: isPad() ? 50 : moderateScale(38, ratio_general),
    },
    language_button: {
        backgroundColor: 'rgba(10, 10, 10, 0.40)',
        width: 200,
        margin: 5,
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    login_button: {
        backgroundColor: 'rgba(10, 10, 10, 0.40)',
        width: '70%',
        margin: 5,
    },
    modalContentGrayExit: {
        padding: 10,
        backgroundColor: 'rgba(7, 7, 7, 0.93)',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: 200,
        width: 300,
    },
    social_button_full: {
        backgroundColor: 'rgba(0, 0, 0, 0.40)',
        width: 300,
        height: GLOBAL.Device_IsAppleTV ? 75 : 55,
        margin: 5,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    social_button: {
        backgroundColor: 'rgba(10, 10, 10, 0.70)',
        width: moderateScale(200, ratio_channel),
        height: 55,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    social_text: {
        fontSize: moderateScale(get_medium_fontsize(), ratio_channel),
        color: '#fff',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    login_button_: {
        backgroundColor: 'rgba(10, 10, 10, 0.40)',
        width: '70%',
        margin: 5,
    },
    editdelete_button: {
        backgroundColor: 'rgba(10, 10, 10, 0.40)',
        width: 70,
        height: 50,
        margin: 5,
    },
    accounttype_button: {
        backgroundColor: 'rgba(10, 10, 10, 0.40)',
        width: '100%',
        margin: 5,
    },
    lang_button_: {
        backgroundColor: 'rgba(10, 10, 10, 0.40)',
        width: '100%',
        margin: 5,
    },
    language_text: {
        backgroundColor: 'rgba(10, 10, 10, 0.40)',
        margin: 5,
    },
    login_text: {
        fontSize: moderateScale(get_medium_fontsize(), ratio_channel),
        color: '#fff',
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 10,
    },
    login_text_: {
        fontSize: moderateScale(get_medium_fontsize(), ratio_channel),
        color: '#fff',
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 10,
    },
    tv_guide_text_extra: {
        fontSize: moderateScale(get_normal_fontsize(), ratio_general),
        color: '#fff',
        //fontWeight: '500'
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
        //width: isPad() ? 50 : moderateScale(100, ratio_general),
    },
    recordings_text_d: {
        color: '#fff',
        fontSize: moderateScale(get_normal_fontsize(), ratio_channel),
        // width: isPad() ? 75 : moderateScale(150, ratio_general),
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 20 / 2,
        position: 'absolute',
        left: 0,
        top: 0,
    },
});
function getWidth() {
    if (GLOBAL.Device_IsPhone == true) {
        return '100%';
    } else {
        return Dimensions.get('window').width;
    }
}
function getHeight() {
    if (GLOBAL.Device_IsPhone == true) {
        return '100%';
    } else {
        return '100%'; //Dimensions.get('window').height
    }
}
function getRatio() {
    // if(GLOBAL.HasService == true && GLOBAL.Package.indexOf('.userinterface.tv') < 1){
    //     return 1
    // }else{
    return 3 / 1;
    // }
}

function get_normal_fontsize() {
    if (GLOBAL.Device_IsWebTV) {
        return 13 + extra_size;
    } else if (GLOBAL.Device_IsAppleTV) {
        return 10 + extra_size;
    } else if (GLOBAL.Device_IsAndroidTV) {
        return 12 + extra_size;
    } else if (GLOBAL.Device_IsSmartTV) {
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
function get_medium_fontsize() {
    if (GLOBAL.Device_IsSmartTV) {
        return 8 + extra_size;
    } else if (GLOBAL.Device_IsWebTV) {
        return 13 + extra_size;
    } else if (GLOBAL.Device_IsAppleTV) {
        return 10 + extra_size;
    } else if (GLOBAL.Device_IsTV) {
        return 12 + extra_size;
    } else if (GLOBAL.Device_IsTablet) {
        return 16 + extra_size;
    } else if (GLOBAL.Device_IsPhone) {
        return 14 + extra_size;
    } else if (GLOBAL.Device_IsAndroidTV) {
        return 16 + extra_size;
    } else if (GLOBAL.Device_IsSTB) {
        return 12 + extra_size;
    } else {
        return 16;
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
EStyleSheet.build({
    // always call EStyleSheet.build() even if you don't use global variables!
    $textColor: '#0275d8',
});
