import React, { Component } from 'react';
import { BackHandler, TVMenuControl, View, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Series_Stores extends Component {
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
            stores = GLOBAL.SeriesStores;
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
            television: '',
            categories: '',
            stores_: stores,
            stores: stores,
            storesSearch: stores,
            firstItem: true,
            sub_store: sub_store,
            width: width,
            columns: columns,
            scrolled: false,
            is_sub_store: false,
        };
        this._loadSeriesFromStore = this._loadSeriesFromStore.bind(this);
        GLOBAL.Season_Selected_Episode_Index = 0;
        GLOBAL.Season_Selected_Episode_Row = 0;
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
                GLOBAL.Series = [];
                GLOBAL.Focus = 'Home';
                Actions.Home();
            } else {
                GLOBAL.Series = [];
                var stores = GLOBAL.SeriesStores;
                this.setState({
                    stores: stores,
                    sub_store: false,
                });
                Actions.Series_Stores({ stores: stores, sub_store: false });
            }
        }
    };
    updateDimensions() {
        Actions.Series_Stores({
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
        //REPORT.set({ type: 14 });
        GLOBAL.Season_Index = 0;

        // if (this.state.stores.length == 1) {
        //     GLOBAL.Store_Sub_Selected_Index = 0;
        //     GLOBAL.Store_Selected_Index = 0;
        //     GLOBAL.Series = this.state.stores[0].series;
        //     Actions.Series_Stores({ 'stores': this.state.stores[0].series, sub_store: true });
        // }

        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.state.sub_store == false) {
                    GLOBAL.Series = [];
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                } else {
                    GLOBAL.Series = [];
                    var stores = GLOBAL.SeriesStores;
                    this.setState({
                        stores: stores,
                        sub_store: false,
                    });
                    Actions.Series_Stores({ stores: stores, sub_store: false });
                }
                return true;
            },
        );
    }

    componentWillUnmount() {
        sendPageReport('Series', this.state.reportStartTime, moment().unix());
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

    _loadSeriesFromStore(item, index) {
        if (item.series != null) {
            GLOBAL.Store_Sub_Selected_Index = 0;
            GLOBAL.Store_Selected_Index = 0;
            GLOBAL.Series = item.series;
            // REPORT.set({ type: 14 });
            Actions.Series_Stores({ stores: item.series, sub_store: true });
        } else {
            var index_ = this.state.stores_.findIndex(s => s.id == item.id);
            if (this.state.sub_store == false) {
                index_ = this.state.stores_.findIndex(
                    s => s.vod_id == item.vod_id,
                );
            }
            if (this.state.sub_store == false) {
                GLOBAL.Store_Selected_Index = index_;
            } else {
                GLOBAL.Store_Sub_Selected_Index = index_;
            }
            GLOBAL.Series_Index = index_;
            if (GLOBAL.Series[GLOBAL.Series_Index].season == undefined) {
                return;
            }
            if (GLOBAL.Series[GLOBAL.Series_Index].season.length != 0) {
                Actions.Series_Details({
                    stores: this.state.stores,
                    sub_store: this.state.sub_store,
                    Season: GLOBAL.Series[GLOBAL.Series_Index].season,
                    fromPage: 'stores',
                });
            }
        }
    }

    getSubText(series) {
        if (series.season != undefined) {
            var episodes = 0;
            series.season.forEach(element => {
                episodes = episodes + element.episodes.length;
            });
            return (
                series.season.length + ' Seasons / ' + episodes + ' Episodes'
            );
        }
        if (series.series != undefined) {
            return series.series.length + ' Series';
        }
    }
    onChangeText = text => {
        if (text != undefined && text != null && text != '') {
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
    };
    render() {
        return (
            <Container
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
                            Type={'Series'}
                            Width={this.state.width}
                            Columns={this.state.columns}
                            getItemLayout={(data, index) => {
                                return {
                                    length: this.state.width * 0.69,
                                    index,
                                    offset: this.state.width * 0.69 * index,
                                };
                            }}
                            SubStore={this.state.sub_store}
                            _loadSeriesFromStore={this._loadSeriesFromStore}
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
