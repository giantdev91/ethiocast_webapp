import React, { PureComponent } from 'react';
import { BackHandler, TVMenuControl, View, Text, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import CategoryList from '../components/UI/Categories/Category_List';
import { sendPageReport } from '../../reporting/reporting';
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const SORT_TYPE_NAME = 'ABC';
const SORT_TYPE_CHANNEL_NUMBER = '123';
const CHANNEL_TYPE_NAME = 'Toggle View';
export default class Channels extends PureComponent {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        const sortType = '123';
        GLOBAL.PIN_SET = false;

        var width_big = 0;
        var width_small = 0;
        var columns_small = 0;
        var columns_big = 0;
        var category_width = 0;

        if (GLOBAL.App_Theme == 'Akua') {
            width_big = GLOBAL.COL_10 * 3.33;
            width_small = GLOBAL.COL_10;
            columns_small = 10;
            columns_big = 3;
        }

        if (GLOBAL.App_Theme == 'Honua') {
            width_big = GLOBAL.COL_REMAINING_3 - 2;
            width_small = GLOBAL.COL_REMAINING_8;
            columns_small = 8;
            columns_big = 3;
        }

        if (GLOBAL.App_Theme == 'Iridium') {
            category_width = GLOBAL.COL_REMAINING_5;
            columns_small = 7;
            columns_big = 2;
            width_big =
                GLOBAL.COL_REMAINING_2 -
                GLOBAL.COL_REMAINING_5 / columns_big -
                4;
            width_small =
                GLOBAL.COL_REMAINING_7 - GLOBAL.COL_REMAINING_5 / columns_small;
        }
        if (GLOBAL.Device_IsPhone) {
            columns_big = 1;
            width_big = GLOBAL.COL_1;

            width_small = GLOBAL.COL_4;
            columns_small = 4;
        }
        this.state = {
            searchValue: '',
            reportStartTime: moment().unix(),
            width_small: width_small,
            height: GLOBAL.ROW_10,
            columns_big: columns_big,
            width_big: width_big,
            category_width: category_width,
            columns_small: columns_small,
            television: '',
            channels: [],
            channelsSearch: [],
            categories: [],
            firstItem: true,
            show_chanel_information: false,
            sortType: '123',
            channelType: GLOBAL.Channel_Toggle,
            doSearch: false,
            channelSelected: null,
            videoUrl: '',
            videoType: '',
            drmUrl: '',
            drmKeyServerUrl: '',
            numeric_number: '',
            show_numeric: false,
            category_name: '',
            category_length: 0,
            numeric_color: 'rgba(10, 10, 10, 0.83)',
            toggleType: 'Channel View',
            scrolled: false,
            scrolled_: false,
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
        Actions.Channels();
    }
    componentDidMount() {
        var channels = this.getChannels(
            SORT_TYPE_CHANNEL_NUMBER,
            GLOBAL.Channels_Selected,
        );
        var categories = this.getCategories();
        var cat_name = '';
        var cat_length = '';
        if (
            GLOBAL.Channels.find(
                x => x.id == GLOBAL.Channels_Selected_Category_ID,
            ) != undefined
        ) {
            cat_name = GLOBAL.Channels.find(
                x => x.id == GLOBAL.Channels_Selected_Category_ID,
            ).name;
            cat_length = GLOBAL.Channels.find(
                x => x.id == GLOBAL.Channels_Selected_Category_ID,
            ).channels.length;
        }
        this.setState({
            channels: channels,
            channelsSearch: channels,
            categories: categories,
            category_name: cat_name,
            category_length: cat_length,
        });
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        REPORT.set({ type: 2 });
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
        sendPageReport('Channels', this.state.reportStartTime, moment().unix());
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            TimerMixin.clearTimeout(this.numericTimer);
            KeyEvent.removeKeyDownListener();
        }
        TimerMixin.clearTimeout(this.runningTimer);
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        Actions.pop();
    }
    changeSortType() {
        var { sortType } = this.state;
        if (sortType == 'ABC') {
            sortType = '123';
        } else {
            sortType = 'ABC';
        }
        const channels = this.getChannels(sortType, GLOBAL.Channels_Selected);
        this.setState({ sortType, channels });
    }
    getCategories() {
        var categories = [];
        if (
            GLOBAL.App_Theme != 'Honua' &&
            !GLOBAL.Device_IsPhone &&
            !GLOBAL.Device_IsWebTV &&
            !GLOBAL.Device_IsSmartTV
        ) {
            categories.push({
                custom_type: 'back',
            });
        }
        categories.push({
            custom_type: 'sort',
        });
        categories.push({
            custom_type: 'toggle',
        });
        categories.push({
            custom_type: 'search',
        });

        GLOBAL.Channels.forEach((category, index) => {
            categories.push(category);
        });
        return categories;
    }
    getChannels(sortType, channels) {
        if (channels == undefined) {
            return;
        }
        var filtered = channels.filter(function (el) {
            return el != null;
        });
        var originalChannels = filtered;
        originalChannels.sort((channel1, channel2) => {
            if (sortType == 'ABC') {
                const aName = channel1.name;
                const bName = channel2.name;
                if (aName < bName) return -1;
                if (aName > bName) return 1;
                return 0;
            } else {
                if (channel1.channel_number > channel2.channel_number) return 1;
                if (channel1.channel_number < channel2.channel_number)
                    return -1;
                return 0;
            }
        });

        GLOBAL.Channels_Selected = originalChannels;
        return originalChannels;
    }
    _onPressCategoryChange(id) {
        var category = GLOBAL.Channels.find(x => x.id == id);
        if (id == -1) {
            this.changeSortType();
        } else if (id == -2) {
            this._onToggleView();
        } else if (category != undefined) {
            if (category.channels.length > 0) {
                GLOBAL.Channels_Selected = category.channels;
                GLOBAL.Channel_Index = 0;
                GLOBAL.Channels_Selected_Row = 0;
                GLOBAL.Channels_Selected_Index = 0;
                GLOBAL.Channels_Selected_Category_ID = category.id;
                GLOBAL.Channels_Selected_Category_Index =
                    UTILS.getCategoryIndex(
                        GLOBAL.Channels_Selected_Category_ID,
                    );
                this.setState({
                    channels: this.getChannels(
                        this.state.sortType,
                        GLOBAL.Channels_Selected,
                    ),
                    channelsSearch: this.getChannels(
                        this.state.sortType,
                        GLOBAL.Channels_Selected,
                    ),
                    category: GLOBAL.Channels.find(
                        x => x.id == GLOBAL.Channels_Selected_Category_ID,
                    ),
                    category_name: GLOBAL.Channels.find(
                        x => x.id == GLOBAL.Channels_Selected_Category_ID,
                    ).name,
                    category_length: GLOBAL.Channels.find(
                        x => x.id == GLOBAL.Channels_Selected_Category_ID,
                    ).channels.length,
                });
            } else {
                this.setState({
                    channels: [],
                });
                GLOBAL.Channel_Index = 0;
                GLOBAL.Channels_Selected_Row = 0;
                GLOBAL.Channels_Selected_Index = 0;
            }
        } else {
            this.setState({
                channels: [],
            });
            GLOBAL.Channel_Index = 0;
            GLOBAL.Channels_Selected_Row = 0;
            GLOBAL.Channels_Selected_Index = 0;
        }
    }
    _onPressSort() {
        this.changeSortType();
    }
    _onPressSearch() {
        this.setState({ doSearch: true });
    }
    _onToggleView() {
        GLOBAL.Channels_Selected_Index = 0;
        GLOBAL.Channels_Selected_Row = 0;
        if (this.state.channelType == 'Toggle View') {
            this.setState({
                channelType: 'Channel View',
                toggleType: 'Full View',
            });
            GLOBAL.Channel_Toggle = 'Channel View';
            UTILS.storeProfile(
                'settings_toggle',
                0,
                0,
                0,
                0,
                [],
                GLOBAL.Channel_Toggle,
            );
        } else if (this.state.channelType == 'Channel View') {
            this.setState({
                channelType: 'Toggle View',
                toggleType: 'Channel View',
            });
            GLOBAL.Channel_Toggle = 'Toggle View';
            UTILS.storeProfile(
                'settings_toggle',
                0,
                0,
                0,
                0,
                [],
                GLOBAL.Channel_Toggle,
            );
        }
    }
    onChangeText = text => {
        if (text != undefined && text != null && text != '') {
            if (this.state.channelsSearch != undefined) {
                GLOBAL.Channels_Selected_Index = 999999;
                var channelsNew = this.state.channelsSearch.filter(
                    c => c.name.toLowerCase().indexOf(text.toLowerCase()) > -1,
                );
                this.setState({
                    channels: channelsNew,
                    searchValue: text,
                });
            }
        }
    };
    render() {
        return (
            <Container
                needs_notch={true}
                hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                hide_menu={
                    GLOBAL.App_Theme == 'Akua' &&
                        !GLOBAL.Device_IsTablet &&
                        !GLOBAL.Device_IsPhone &&
                        !GLOBAL.Device_IsWebTV &&
                        GLOBAL.Device_IsSmartTV
                        ? true
                        : false
                }
            >
                {RenderIf(
                    GLOBAL.Device_IsTV == true && this.state.show_numeric,
                )(
                    <View
                        ref={ref => {
                            this.numeric = ref;
                        }}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            width: 250,
                            height: 100,
                            backgroundColor: this.state.numeric_color,
                            position: 'absolute',
                            right: 10,
                            top: 10,
                            zIndex: 10000,
                        }}
                    >
                        <Text style={styles.Huge}>
                            {this.state.numeric_number}
                        </Text>
                    </View>,
                )}
                {RenderIf(
                    (GLOBAL.App_Theme != 'Rhodium' &&
                        GLOBAL.App_Theme != 'Iridium') ||
                    GLOBAL.Device_IsPhone == true,
                )(
                    <View
                        style={[
                            {
                                marginTop:
                                    GLOBAL.App_Theme == 'Honua' &&
                                        !GLOBAL.Device_IsPhone
                                        ? 4
                                        : 0,
                                marginLeft:
                                    GLOBAL.App_Theme == 'Honua' &&
                                        !GLOBAL.Device_IsPhone
                                        ? 5
                                        : 0,
                            },
                        ]}
                    >
                        <CategoryList
                            SortText={this.state.sortType}
                            ToggleText={this.state.toggleType}
                            horizontal={true}
                            Type={'Channels'}
                            Cats={this.state.categories}
                            onPress={cat => this._onPressCategoryChange(cat)}
                            SelectedCategoryName={this.state.category_name}
                            SelectedCategoryLength={this.state.category_length}
                            getItemLayout={(data, index) => {
                                return {
                                    length: GLOBAL.COL_7,
                                    index,
                                    offset: GLOBAL.COL_7 * index,
                                };
                            }}
                            FromPage={
                                this.props.fromPage != 'menu'
                                    ? this.props.fromPage
                                    : 'Home'
                            }
                        />
                    </View>,
                )}
                <View
                    style={{
                        flex: 35,
                        flexDirection: 'column',
                        marginLeft:
                            GLOBAL.App_Theme == 'Honua' &&
                                !GLOBAL.Device_IsPhone
                                ? 5
                                : 0,
                    }}
                >
                    {RenderIf(
                        (GLOBAL.App_Theme != 'Rhodium' &&
                            GLOBAL.App_Theme != 'Iridium') ||
                        GLOBAL.Device_IsPhone == true,
                    )(
                        <View
                            style={{
                                flex: 35,
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                            }}
                        >
                            {!GLOBAL.Device_IsSmartTV && (
                                <View
                                    style={{
                                        width:
                                            GLOBAL.COL_REMAINING_1 -
                                            (GLOBAL.App_Theme == 'Honua'
                                                ? 5
                                                : 0),
                                        flexDirection: 'row',
                                        height: 65,
                                    }}
                                >
                                    <View
                                        style={{ flex: 1, flexDirection: 'row' }}
                                    >
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
                                                        GLOBAL.COL_REMAINING_10 -
                                                        5,
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
                                                        {
                                                            color: '#fff',
                                                            margin: 12,
                                                        },
                                                    ]}
                                                    // icon={SolidIcons.trash}
                                                    name="trash"
                                                />
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>
                                    <View
                                        style={{ flex: 9, flexDirection: 'row' }}
                                    >
                                        <TouchableHighlightFocus
                                            Padding={0}
                                            Margin={0}
                                            BorderRadius={5}
                                            onPress={() =>
                                                this.searchbar.focus()
                                            }
                                        >
                                            <View
                                                style={{
                                                    padding:
                                                        GLOBAL.Device_IsWebTV
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
                                                    (this.searchbar =
                                                        searchbar)
                                                    }
                                                    selectionColor={'#000'}
                                                    placeholderTextColor={
                                                        '#fff'
                                                    }
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
                            {RenderIf(this.state.channelType == 'Toggle View')(
                                <ChannelList
                                    ref={ref => (this.flatList = ref)}
                                    Channels={this.state.channels}
                                    Width={this.state.width_small}
                                    Type={'Small'}
                                    ColumnType={this.state.channelType}
                                    Columns={this.state.columns_small}
                                    getItemLayout={(data, index) => {
                                        return {
                                            length:
                                                GLOBAL.ROW_4 +
                                                GLOBAL.BUTTON_MARGIN,
                                            index,
                                            offset:
                                                (GLOBAL.ROW_4 +
                                                    GLOBAL.BUTTON_MARGIN) *
                                                index,
                                        };
                                    }}
                                />,
                            )}
                            {RenderIf(this.state.channelType == 'Channel View')(
                                <ChannelList
                                    FromPage={'Channels'}
                                    Channels={this.state.channels}
                                    Width={this.state.width_big}
                                    Type={'Big'}
                                    ColumnType={this.state.channelType}
                                    Columns={this.state.columns_big}
                                    getItemLayout={(data, index) => {
                                        return {
                                            length: GLOBAL.ROW_5 - 5,
                                            index,
                                            offset: (GLOBAL.ROW_5 - 5) * index,
                                        };
                                    }}
                                />,
                            )}
                        </View>,
                    )}
                    {RenderIf(GLOBAL.App_Theme == 'Rhodium')(
                        <View style={{ paddingTop: 50, paddingLeft: 50 }}>
                            {/* Rails for the channels that are being watched */}

                            {/* Rails for the other categories */}
                            <Rails Categories={GLOBAL.Channels} />
                        </View>,
                    )}
                    {RenderIf(
                        GLOBAL.App_Theme == 'Iridium' &&
                        GLOBAL.Device_IsPhone == false,
                    )(
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                paddingTop: 5,
                            }}
                        >
                            <View
                                style={{
                                    marginLeft: 5,
                                    flexDirection: 'column',
                                    backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                    width: this.state.category_width,
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                }}
                            >
                                <View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View
                                            style={{
                                                backgroundColor: '#000',
                                                borderRadius: 5,
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width:
                                                    this.state.category_width /
                                                    2,
                                                height:
                                                    this.state.category_width /
                                                    3,
                                                borderRadius: 5,
                                                marginVertical: 5,
                                                marginLeft: 5,
                                                marginRight: 5,
                                            }}
                                        >
                                            {this.renderButtonSort_()}
                                        </View>
                                        <View
                                            style={{
                                                backgroundColor: '#000',
                                                borderRadius: 5,
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width:
                                                    this.state.category_width /
                                                    2,
                                                height:
                                                    this.state.category_width /
                                                    3,
                                                borderRadius: 5,
                                                marginVertical: 5,
                                                marginRight: 5,
                                            }}
                                        >
                                            {this.renderButtonToggle_()}
                                        </View>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    {/* <FontAwesome5 style={[styles.IconsMenuMedium, { color: '#666', paddingVertical: 5 }]} icon={SolidIcons.chevronUp} /> */}
                                </View>
                                <FlatList
                                    ref={ref => (this.catlist = ref)}
                                    data={this.state.categories}
                                    horizontal={false}
                                    numColumns={1}
                                    scrollType="category"
                                    extraData={this.state.channels}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({ item, index }) => {
                                        if (
                                            item.id ==
                                            GLOBAL.Channels_Selected_Category_ID &&
                                            item.channels != undefined
                                        ) {
                                            return (
                                                <TouchableHighlightFocus
                                                    BorderRadius={5}
                                                    style={{
                                                        borderRadius: 5,
                                                        margin: 5,
                                                    }}
                                                    key={index}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this._onPressCategoryChange(
                                                            item.id,
                                                        )
                                                    }
                                                >
                                                    <View>
                                                        <View
                                                            style={{ padding: 5 }}
                                                        >
                                                            <View>
                                                                <Text
                                                                    numberOfLines={
                                                                        1
                                                                    }
                                                                    style={[
                                                                        styles.H5,
                                                                        {
                                                                            color: '#fff',
                                                                        },
                                                                    ]}
                                                                >
                                                                    {item.name}
                                                                </Text>
                                                                <Text
                                                                    style={[
                                                                        styles.Small,
                                                                        {
                                                                            borderBottomColor:
                                                                                GLOBAL.Button_Color,
                                                                            borderBottomWidth: 3,
                                                                            paddingBottom: 5,
                                                                            color: '#fff',
                                                                        },
                                                                    ]}
                                                                >
                                                                    {item.channels ==
                                                                        undefined
                                                                        ? 0
                                                                        : item
                                                                            .channels
                                                                            .length}{' '}
                                                                    {LANG.getTranslation(
                                                                        'channels',
                                                                    )}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableHighlightFocus>
                                            );
                                        } else if (item.channels != undefined) {
                                            return (
                                                <TouchableHighlightFocus
                                                    BorderRadius={5}
                                                    style={{
                                                        borderRadius: 5,
                                                        margin: 5,
                                                    }}
                                                    key={index}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this._onPressCategoryChange(
                                                            item.id,
                                                        )
                                                    }
                                                >
                                                    <View style={{ padding: 5 }}>
                                                        <View>
                                                            <Text
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                style={[
                                                                    styles.H5,
                                                                    {},
                                                                ]}
                                                            >
                                                                {item.name}
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.Small,
                                                                    {},
                                                                ]}
                                                            >
                                                                {item.channels ==
                                                                    undefined
                                                                    ? 0
                                                                    : item
                                                                        .channels
                                                                        .length}{' '}
                                                                {LANG.getTranslation(
                                                                    'channels',
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlightFocus>
                                            );
                                        }
                                    }}
                                />
                                <View style={{ alignItems: 'center' }}>
                                    {/* <FontAwesome5 style={[styles.IconsMenuMedium, { color: '#666', paddingVertical: 5 }]} icon={SolidIcons.chevronDown} /> */}
                                </View>
                            </View>
                            <View style={{ flex: 4, alignItems: 'center' }}>
                                {!GLOBAL.Device_IsSmartTV && (
                                    <View
                                        style={{
                                            width:
                                                GLOBAL.COL_REMAINING_1 -
                                                GLOBAL.COL_REMAINING_5 -
                                                10,
                                            flexDirection: 'row',
                                            height: 65,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                            }}
                                        >
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
                                                            GLOBAL.COL_REMAINING_10 -
                                                            25,
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
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
                                                                margin: 12,
                                                            },
                                                        ]}
                                                        // icon={SolidIcons.trash}
                                                        name="trash"
                                                    />
                                                </View>
                                            </TouchableHighlightFocus>
                                        </View>
                                        <View
                                            style={{
                                                flex: 9,
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <TouchableHighlightFocus
                                                Padding={0}
                                                Margin={0}
                                                BorderRadius={5}
                                                onPress={() =>
                                                    this.searchbar.focus()
                                                }
                                            >
                                                <View
                                                    style={{
                                                        padding:
                                                            GLOBAL.Device_IsWebTV
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
                                                            this.onChangeText(
                                                                text,
                                                            )
                                                        }
                                                        ref={searchbar =>
                                                        (this.searchbar =
                                                            searchbar)
                                                        }
                                                        selectionColor={'#000'}
                                                        placeholderTextColor={
                                                            '#fff'
                                                        }
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
                                {RenderIf(
                                    this.state.channelType == 'Toggle View',
                                )(
                                    <ChannelList
                                        ref={ref => (this.flatList = ref)}
                                        Channels={this.state.channels}
                                        Width={this.state.width_small}
                                        Type={'Small'}
                                        ColumnType={this.state.channelType}
                                        Columns={this.state.columns_small}
                                        getItemLayout={(data, index) => {
                                            return {
                                                length:
                                                    GLOBAL.ROW_4 +
                                                    GLOBAL.BUTTON_MARGIN,
                                                index,
                                                offset:
                                                    (GLOBAL.ROW_4 +
                                                        GLOBAL.BUTTON_MARGIN) *
                                                    index,
                                            };
                                        }}
                                    />,
                                )}
                                {RenderIf(
                                    this.state.channelType == 'Channel View',
                                )(
                                    <ChannelList
                                        Channels={this.state.channels}
                                        Width={this.state.width_big}
                                        Type={'Big'}
                                        ColumnType={this.state.channelType}
                                        Columns={this.state.columns_big}
                                        getItemLayout={(data, index) => {
                                            return {
                                                length: GLOBAL.ROW_5 - 5,
                                                index,
                                                offset:
                                                    (GLOBAL.ROW_5 - 5) * index,
                                            };
                                        }}
                                    />,
                                )}
                            </View>
                        </View>,
                    )}
                </View>
            </Container>
        );
    }
    renderCategory(item, index) {
        if (item.custom_type && item.custom_type === 'sort') {
            if (GLOBAL.UserInterface.channel.enable_sorting_channels == true) {
                return this.renderButtonSort(index);
            }
        } else if (item.custom_type && item.custom_type === 'toggle') {
            if (GLOBAL.UserInterface.channel.enable_toggle_channels == true) {
                return this.renderButtonToggle(index);
            }
        } else {
            return (
                <TouchableHighlightFocus
                    key={index}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressCategoryChange(item.id)}
                >
                    <View style={[styles.menu_vertical_text]}>
                        <View>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.H5,
                                    { marginLeft: 10, marginRight: 20 },
                                ]}
                            >
                                {item.name}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Small,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                    },
                                ]}
                            >
                                {item.channels == undefined
                                    ? 0
                                    : item.channels.length}{' '}
                                {LANG.getTranslation('channels')}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }

    renderButtonToggle_(index) {
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                style={{ borderRadius: 5 }}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onToggleView()}
            >
                <View
                    style={{
                        borderRadius: 5,
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height:
                            (GLOBAL.Device_IsWebTV &&
                                !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 150
                                : 75,
                        width:
                            (GLOBAL.Device_IsWebTV &&
                                !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 150
                                : 75,
                    }}
                >
                    <Text numberOfLines={1} style={[styles.Medium, {}]}>
                        {LANG.getTranslation('toggle_view')}
                    </Text>
                    <Text numberOfLines={1} style={[styles.Small, {}]}>
                        {this.state.toggleType}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
    renderButtonSort_(index) {
        const { sortType } = this.state;
        const icon = sortType === SORT_TYPE_NAME ? '123' : 'ABC';
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                style={{ borderRadius: 5 }}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onPressSort()}
            >
                <View
                    style={{
                        borderRadius: 5,
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height:
                            (GLOBAL.Device_IsWebTV &&
                                !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 150
                                : 75,
                        width:
                            (GLOBAL.Device_IsWebTV &&
                                !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 150
                                : 75,
                    }}
                >
                    <Text numberOfLines={1} style={[styles.Medium, {}]}>
                        {LANG.getTranslation('sorting')}
                    </Text>
                    <Text numberOfLines={1} style={[styles.Small, {}]}>
                        {icon}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
}
