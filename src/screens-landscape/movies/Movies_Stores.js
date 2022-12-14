import React, { Component } from 'react';
import { BackHandler, TVMenuControl, View, TextInput, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Movies_Stores extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        var stores = [];
        var sub_store =
            this.props.sub_store != undefined ? this.props.sub_store : false;
        if (this.props.stores != undefined) {
            stores = this.props.stores;
        } else {
            stores = GLOBAL.MovieStores;
        }

        var columns = 3;
        var width = 0;

        if (GLOBAL.App_Theme == 'Akua') {
            width = GLOBAL.COL_3;
        }
        if (GLOBAL.App_Theme == 'Honua') {
            width = GLOBAL.COL_REMAINING_3;
        }
        if (GLOBAL.App_Theme == 'Iridium') {
            width = GLOBAL.COL_REMAINING_3;
        }
        if (GLOBAL.Device_IsPhone) {
            columns = 1;
            width = GLOBAL.COL_1;
        }

        this.state = {
            searchValue: '',
            reportStartTime: moment().unix(),
            stores_: stores,
            stores: stores,
            storesSearch: stores,
            fromPage: 'Stores',
            row_width: 0,
            sub_store: sub_store,
            width: width,
            columns: columns,
            scrolled: false,
        };
        this._loadMoviesFromStore = this._loadMoviesFromStore.bind(this);
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
            if (this.state.sub_store == false) {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            } else {
                this.setState({
                    stores: GLOBAL.MovieStores,
                    sub_store: false,
                });
            }
        }
    };
    updateDimensions() {
        Actions.Movies_Stores({
            fromPage: this.state.fromPage,
            stores: this.state.stores,
            sub_store: this.state.sub_store,
        });
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        //REPORT.set({ type: 9 });
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.state.sub_store == false) {
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                } else {
                    GLOBAL.Store_Sub_Selected_Index = 0;
                    this.setState({
                        stores: GLOBAL.MovieStores,
                        sub_store: false,
                    });
                    Actions.Movies_Stores({
                        fromPage: this.state.fromPage,
                        stores: this.state.stores,
                        sub_store: this.state.sub_store,
                    });
                }
                return true;
            },
        );

        if (this.state.stores.length == 1) {
            if (this.state.stores[0].substores != undefined) {
                if (this.state.stores[0].substores.length == 0) {
                    this._loadMoviesFromStore(this.state.stores[0], 0, true);
                }
            }
        }
    }
    componentWillUnmount() {
        sendPageReport(
            'Movie Stores',
            this.state.reportStartTime,
            moment().unix(),
        );
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
    _loadMoviesFromStore(item, index, continueLoading) {
        if (item.substores.length != 0) {
            GLOBAL.Store_Sub_Selected_Index = 0;
            GLOBAL.Store_Selected_Index = index;
            GLOBAL.Stores_Sub = item.substores;
            this.setState({
                stores: GLOBAL.Stores_Sub,
                sub_store: true,
            });
            Actions.Movies_Stores({
                fromPage: this.state.fromPage,
                stores: GLOBAL.Stores_Sub,
                sub_store: true,
            });
        } else {
            var index_ = this.state.storesSearch.findIndex(
                s => s.vod_id == item.vod_id,
            );
            if (this.state.sub_store != true) {
                GLOBAL.Store_Selected_Index = index_;
            } else {
                GLOBAL.Store_Sub_Selected_Index = index_;
            }
            GLOBAL.Movie_Selected_Category_ID = 1;
            GLOBAL.Movie_Selected_Row = 0;
            GLOBAL.Tag_Selected_Row = 0;
            GLOBAL.Movie_Selected = null;
            Actions.Movies_Categories({
                Selected_VodID: item.vod_id,
                fromPage: continueLoading ? 'Home' : this.state.fromPage,
                stores: this.state.stores,
                sub_store: this.state.sub_store,
                skippedStore: continueLoading ? true : false,
            });
        }
    }
    getScrollIndex() {
        if (this.state.sub_store == true) {
            return this.state.stores.length / 3 >
                GLOBAL.Store_Sub_Selected_Index
                ? GLOBAL.Store_Sub_Selected_Index
                : 0;
        } else {
            return this.state.stores.length / 3 > GLOBAL.Store_Selected_Index
                ? GLOBAL.Store_Selected_Index
                : 0;
        }
    }

    getSubText(store) {
        if (store.genres != undefined) {
            var movies = 0;
            store.genres.forEach(element => {
                movies = movies + element.movies.length;
            });
            return store.genres.length + ' Categories / ' + movies + ' Movies';
        }
    }
    onChangeText = text => {
        if (text != undefined && text != null && text != '') {
            if (this.state.storesSearch.length > 0) {
                GLOBAL.Store_Sub_Selected_Index = 999999;
                GLOBAL.Store_Selected_Index = 999999;
                var storesNew = this.state.storesSearch.filter(
                    c => c.name.toLowerCase().indexOf(text.toLowerCase()) > -1,
                );
                this.setState({
                    stores: storesNew,
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
                {!GLOBAL.Device_IsSmartTV && (
                    <View
                        style={{
                            width: GLOBAL.COL_REMAINING_1,
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
                                        width: GLOBAL.COL_REMAINING_10 - 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
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
                                        padding: GLOBAL.Device_IsWebTV ? 9 : 0,
                                        marginRight: 40,
                                        alignItems: 'center',
                                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
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
                                            { color: '#fff', paddingLeft: 10 },
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
                                        underlineColorAndroid={'transparent'}
                                        placeholder={LANG.getTranslation(
                                            'filter',
                                        )}
                                        //style={[styles.H2, { width: GLOBAL.COL_REMAINING_1 - (GLOBAL.App_Theme == 'Honua' ? 165 : GLOBAL.Device_IsAppleTV ? 280 : 150), color: '#fff', marginHorizontal: 10, height: GLOBAL.Device_IsAppleTV ? 50 : null }]}>
                                        style={[styles.H2, { width: '100%' }]}
                                    ></TextInput>
                                </View>
                            </TouchableHighlightFocus>
                        </View>
                    </View>
                )}
                <View style={styles.content_container}>
                    <View
                        style={{
                            flex: 1,
                            paddingTop: GLOBAL.Device_IsTablet ? 5 : 0,
                            flexDirection: 'column',
                        }}
                    >
                        <StoreList
                            Stores={this.state.stores}
                            Type={'Movies'}
                            Width={this.state.width}
                            Columns={this.state.columns}
                            _loadMoviesFromStore={this._loadMoviesFromStore}
                        />
                    </View>
                </View>
            </Container>
        );
    }
    _setFocusOnFirst(index) {
        if (this.state.sub_store == true) {
            if (
                GLOBAL.Store_Sub_Selected_Index == index &&
                GLOBAL.Device_IsTV == true
            ) {
                return index === GLOBAL.Store_Sub_Selected_Index;
            }
        } else {
            if (
                GLOBAL.Store_Selected_Index == index &&
                GLOBAL.Device_IsTV == true
            ) {
                return index === GLOBAL.Store_Selected_Index;
            }
        }
        return false;
    }
}
