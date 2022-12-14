import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import TimerMixin from 'react-timer-mixin';
import UTILS from '../../../datalayer/utils';
import STYLE from '../../../styling/style';

export default class UPDATE extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};

        this.state = {
            show_modal: false,
            popup_loader: false,
            type: '',
            id: 0,
            extra_style: {},
        };
    }
    componentDidMount() {
        if (GLOBAL.Focus == 'Outside') {
            return;
        } else {
            TimerMixin.clearTimeout(this.timer1);
            this.timer1 = TimerMixin.setTimeout(() => {
                if (GLOBAL.Connected_Internet == true) {
                    this.getUpdates();
                }
            }, 2000);
        }
    }
    componentWillUnmount() {
        GLOBAL.Message_Center_Shown = false;
        TimerMixin.clearTimeout(this.timer1);
    }
    getUpdates() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.User.products.productid +
            '_update.json';
        DAL.getJson(path)
            .then(data => {
                if (data != undefined) {
                    if (
                        GLOBAL.UI_LoadedTZ <
                        Math.round(moment().format('x') / 1000)
                    ) {
                        var test = GLOBAL.Updates.find(
                            u => u.time == data.time,
                        );
                        if (test == null) {
                            GLOBAL.Updates.push({time: data.time});
                            UTILS.storeJson('Updates', GLOBAL.Updates);
                            if (data.channel == true) {
                                this.getChannelData(data);
                            } else if (data.movie == true) {
                                this.getMovieData(data);
                            } else if (data.serie == true) {
                                this.getSeriesData(0);
                            }
                        }
                    }
                }
            })
            .catch(error => {
                this.setState({
                    show_modal: false,
                    extra_style: {},
                });
            });
    }
    getMetroData() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_metro_v2.json';
        DAL.getJson(path)
            .then(data => {
                GLOBAL.Metro = data;
                this.setState({
                    show_modal: false,
                    extra_style: {},
                    type: LANG.getTranslation('home'),
                });
            })
            .catch(error => {
                this.setState({
                    show_modal: false,
                    extra_style: {},
                });
            });
    }
    getMovieData(data) {
        GLOBAL.MovieStores = [];
        this.setState({
            show_modal: true,
            type: LANG.getTranslation('movies'),
            //extra_style: {width:'100%', height: '100%', backgroundColor: 'rgba(7, 7, 7, 0.43)'},
        });
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_product_movies_v2.json';
        DAL.getJson(path)
            .then(result => {
                var data = result;
                if (data != undefined) {
                    GLOBAL.MovieStores = data.vodstore;
                }
                if (data.serie == true) {
                    GLOBAL.SeriesStores = [];
                    this.getSeriesData(0);
                } else {
                    this.getMetroData();
                }
            })
            .catch(error => {
                if (data.serie == true) {
                    GLOBAL.SeriesStores = [];
                    this.getSeriesData(0);
                } else {
                    this.getMetroData();
                }
            });
    }
    getSeriesData(index) {
        this.setState({
            show_modal: true,
            type: LANG.getTranslation('series'),
            //extra_style: {width:'100%', height: '100%', backgroundColor: 'rgba(7, 7, 7, 0.43)'},
        });
        var stores = GLOBAL.Product.SeriesStores;
        if (stores.length > 0) {
            if (stores[index] != undefined) {
                this.getSeriesStores(
                    stores[index].PackageID,
                    index,
                    stores.length,
                );
            } else {
                this.getMetroData();
            }
        } else {
            this.getMetroData();
        }
    }
    getSeriesStores(storeId, index, maxstores) {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CMS +
            '/' +
            storeId +
            '_series_stores_v2.json';
        DAL.getJson(path)
            .then(result => {
                var data = result;
                if (data.seriestore && data.seriestore.length > 0) {
                    data.seriestore.forEach(item => {
                        GLOBAL.SeriesStores.push(item);
                    });
                }
                index = index + 1;
                if (index == maxstores) {
                    this.getMetroData();
                } else {
                    this.getSeriesData(index);
                }
            })
            .catch(error => {
                this.getMetroData();
            });
    }

    getChannelData(data) {
        GLOBAL.Channels_Categories = [];
        GLOBAL.Channels = [];
        this.setState({
            show_modal: true,
            type: LANG.getTranslation('channels'),
            //extra_style: {width:'100%', height: '100%', backgroundColor: 'rgba(7, 7, 7, 0.43)'},
        });
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_product_channels_v2.json';
        DAL.getJson(path)
            .then(result => {
                var data = result;
                GLOBAL.Channels = data.tv;
                GLOBAL.Channels_Selected = data.tv[0].channels;

                if (data.movie == true) {
                    this.getMovieData(data);
                } else if (data.serie == true) {
                    this.getSeriesData(0);
                } else {
                    this.getMetroData();
                }
            })
            .catch(error => {
                if (data.movie == true) {
                    this.getMovieData(data);
                } else if (data.serie == true) {
                    this.getSeriesData(0);
                } else {
                    this.getMetroData();
                }
            });
    }

    render() {
        return (
            <View style={[styles.fullScreen_message_]}>
                {RenderIf(this.state.show_modal == true)(
                    <View
                        ref={ref => {
                            this.recording = ref;
                        }}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999,
                            position: 'absolute',
                            right: 0,
                            top: 0,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: 'green',
                                margin: 20,
                                padding: 2,
                                borderRadius: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 12,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: 20,
                                }}
                            >
                                <ActivityIndicator size={30} color={'#fff'} />
                                <Text style={[styles.Standard]}>
                                    {LANG.getTranslation('updating')}{' '}
                                    {this.state.type}
                                </Text>
                            </View>
                        </View>
                    </View>,
                )}
            </View>
        );
    }
}
