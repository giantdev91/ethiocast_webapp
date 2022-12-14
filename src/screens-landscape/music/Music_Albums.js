import React, { Component } from 'react';
import { BackHandler, TVMenuControl, TextInput, Text, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Music_Albums extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        GLOBAL.PIN_SET = false;

        var columns = 0;
        var width = 0;
        var category_width = 0;

        if (GLOBAL.App_Theme == 'Akua') {
            columns = 6;
            width = GLOBAL.COL_6;
        }
        if (GLOBAL.App_Theme == 'Honua') {
            columns = 6;
            width = GLOBAL.COL_REMAINING_6 - 1;
        }
        if (GLOBAL.App_Theme == 'Iridium') {
            category_width = GLOBAL.COL_REMAINING_5;
            columns = 4;
            width =
                GLOBAL.COL_REMAINING_4 - GLOBAL.COL_REMAINING_5 / columns - 3;
        }
        if (GLOBAL.Device_IsPhone) {
            columns = 3;
            width = GLOBAL.COL_3;
        }
        var category = GLOBAL.Album_Categories[0];
        var category_length = '';
        var category_name = '';
        if (category != undefined) {
            category_length = category.albums.length;
            category_name = category.name;
        }

        this.state = {
            searchValue: '',
            reportStartTime: moment().unix(),
            category_width: category_width,
            categories: GLOBAL.Album_Categories,
            parsed: 0,
            fired: 0,
            albums: GLOBAL.Albums,
            albumsSearch: GLOBAL.Albums,
            columns: columns,
            width: width,
            cat_index: 0,
            category_length: category_length,
            category_name: category_name,
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
        Actions.Music_Albums();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (this.state.albums.length == 0) {
            REPORT.set({
                type: 17,
                name: GLOBAL.Album_Categories[0].name,
                id: GLOBAL.Album_Categories[0].id,
            });
        }
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
        sendPageReport('Albums', this.state.reportStartTime, moment().unix());
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }
    openAlbum(album, index) {
        var index_ = this.state.albumsSearch.findIndex(a => a.id == album.id);
        GLOBAL.Albums_Selected_Index = index_;
        Actions.Music_Details({ AlbumIndex: index_ });
    }
    _onPressCategoryChange(item, index) {
        var category = GLOBAL.Album_Categories.find(x => x.id === item.id);
        GLOBAL.Albums = category.albums;
        this.setState({
            albums: category.albums,
            albumsSearch: category.albums,
            category_length: category.albums.length,
            category_name: category.name,
        });
        REPORT.set({
            type: 17,
            name: category.name,
            id: category.id,
            cat_index: index,
        });
    }

    _setFocusOnFirst(index) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
    onChangeText = text => {
        if (text != undefined && text != null && text != '') {
            GLOBAL.Albums_Selected_Index = 999999;
            var albumsNew = this.state.albumsSearch.filter(
                c => c.name.toLowerCase().indexOf(text.toLowerCase()) > -1,
            );
            this.setState({
                albums: albumsNew,
                searchValue: text,
            });
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
                    GLOBAL.Device_IsPhone == true ||
                    GLOBAL.App_Theme != 'Iridium',
                )(
                    <View style={{ flex: 1, flexDirection: 'column' }}>
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
                                horizontal={true}
                                Type={'Albums'}
                                Cats={this.state.categories}
                                onPress={cat =>
                                    this._onPressCategoryChange(cat)
                                }
                                SelectedCategoryName={this.state.category_name}
                                SelectedCategoryLength={
                                    this.state.category_length
                                }
                                FromPage={
                                    this.props.fromPage != 'menu'
                                        ? this.props.fromPage
                                        : 'Home'
                                }
                            />
                        </View>
                        <View
                            style={{
                                flex: 35,
                                marginLeft:
                                    GLOBAL.App_Theme == 'Honua' &&
                                        !GLOBAL.Device_IsPhone
                                        ? 5
                                        : 0,
                                flexDirection: 'column',
                                alignItems:
                                    GLOBAL.App_Theme == 'Honua' ||
                                        this.state.albums.length <
                                        this.state.columns
                                        ? 'flex-start'
                                        : 'center',
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
                            <AlbumList
                                ref={ref => (this.flatList = ref)}
                                Albums={this.state.albums}
                                Width={this.state.width}
                                Columns={this.state.columns}
                                onPress={(album, index) =>
                                    this.openAlbum(album, index)
                                }
                                getItemLayout={(data, index) => {
                                    return {
                                        length:
                                            GLOBAL.ROW_4 + GLOBAL.BUTTON_MARGIN,
                                        index,
                                        offset:
                                            (GLOBAL.ROW_4 +
                                                GLOBAL.BUTTON_MARGIN) *
                                            index,
                                    };
                                }}
                            />
                        </View>
                    </View>,
                )}
                {RenderIf(
                    GLOBAL.Device_IsPhone == false &&
                    GLOBAL.App_Theme == 'Iridium',
                )(
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            marginLeft: 5,
                            marginTop: 5,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'column',
                                backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                width: this.state.category_width,
                                borderTopLeftRadius: 5,
                                borderTopRightRadius: 5,
                            }}
                        >
                            <View style={{ alignItems: 'center' }}>
                                {/* <FontAwesome5 style={[styles.IconsMenuMedium, { color: '#666', paddingVertical: 5 }]} icon={SolidIcons.chevronUp} /> */}
                            </View>
                            <FlatList
                                data={this.state.categories}
                                horizontal={false}
                                numColumns={1}
                                scrollType="category"
                                keyExtractor={item => 'category_' + item.id}
                                renderItem={({ item, index }) => {
                                    if (index == this.state.cat_index) {
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
                                                        item,
                                                        index,
                                                    )
                                                }
                                            >
                                                <View style={{ padding: 5 }}>
                                                    <Text
                                                        style={[
                                                            styles.H5,
                                                            {
                                                                marginLeft: 10,
                                                                marginRight: 10,
                                                                borderBottomColor:
                                                                    GLOBAL.Button_Color,
                                                                borderBottomWidth: 3,
                                                                paddingBottom: 5,
                                                            },
                                                        ]}
                                                    >
                                                        {item.name}
                                                    </Text>
                                                </View>
                                            </TouchableHighlightFocus>
                                        );
                                    } else {
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
                                                        item,
                                                        index,
                                                    )
                                                }
                                            >
                                                <View style={{ padding: 5 }}>
                                                    <Text
                                                        style={[
                                                            styles.H5,
                                                            {
                                                                marginLeft: 10,
                                                                marginRight: 10,
                                                                paddingBottom: 5,
                                                            },
                                                        ]}
                                                    >
                                                        {item.name}
                                                    </Text>
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
                        <View style={{ flex: 35, flexDirection: 'column' }}>
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
                                                        25,
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
                            <View
                                style={{
                                    flex: 35,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <AlbumList
                                    ref={ref => (this.flatList = ref)}
                                    Albums={this.state.albums}
                                    Width={this.state.width}
                                    Columns={this.state.columns}
                                    onPress={(album, index) =>
                                        this.openAlbum(album, index)
                                    }
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
                                />
                            </View>
                        </View>
                    </View>,
                )}
            </Container>
        );
    }
}
