import React, { Component } from 'react';
import {
    BackHandler,
    TVMenuControl,
    View,
    Image,
    TextInput,
    Text,
    ScrollView,
    ImageBackground,
    Dimensions,
} from 'react-native';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Actions } from 'react-native-router-flux';
import { sendPageReport } from '../../reporting/reporting';
export default class Search extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        GLOBAL.SearchInput = '';

        var channel_width = 0;
        var movie_width = 0;
        var series_width = 0;

        channel_width = GLOBAL.COL_REMAINING_3;
        movie_width = GLOBAL.COL_REMAINING_3 / 2;
        series_width = GLOBAL.COL_REMAINING_3;

        this.state = {
            reportStartTime: moment().unix(),
            channel_width: channel_width,
            series_width: series_width,
            searchTerm: GLOBAL.SearchInput,
            channels: [],
            movies: [],
            series: [],
            music: [],
            apps: [],
            channels_search: [],
            movies_search: [],
            series_search: [],
            music_search: [],
            apps_search: [],
            loaded: false,
            seriesRowHeight: 0,
            movieRowHeight: 0,
            channelRowHeight: 0,
            inputRowWidth: 0,
            term: '',
            allData: [],
            movie_width: movie_width,
        };
    }
    onChangeText = value => {
        this.setState({ term: value });
        this.searchContent(value);
    };
    getSearchContent() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.User.products.productid +
            '_search.json';

        DAL.getJson(path).then(data => {
            var allData = [];
            if (data != null) {
                GLOBAL.SearchMovies = data.filter(c => c.type == 'Movie');
                GLOBAL.SearchSeries = data.filter(c => c.type == 'Serie');
                GLOBAL.SearchChannels = data.filter(c => c.type == 'Channel');
                GLOBAL.SearchChannels = GLOBAL.SearchChannels.concat(
                    GLOBAL.SearchChannelsExtra,
                );
            }
            this.setState({
                movies: GLOBAL.SearchMovies,
                channels: GLOBAL.SearchChannels,
                series: GLOBAL.SearchSeries,
                channels_search: GLOBAL.SearchChannels_,
                movies_search: GLOBAL.SearchMovies_,
                series_search: GLOBAL.SearchSeries_,
            });
        });
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
            if (this.props.fromPage == 'Channels') {
                Actions.Channels();
            } else if (this.props.fromPage == 'Movies') {
                Actions.Movies_Categories({
                    fromPage: 'Search',
                    stores: this.props.Stores,
                });
            } else {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            }
        }
    };
    updateDimensions() {
        if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
            return;
        }
        Actions.SearchBox();
    }

    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            if (GLOBAL.Device_IsSmartTV) {
                document.addEventListener('keydown', this.backButton, false);
            }
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
        this.getSearchContent();
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.props.fromPage == 'Channels') {
                    Actions.Channels();
                } else if (this.props.fromPage == 'Movies') {
                    Actions.Movies_Categories({
                        fromPage: 'Search',
                        stores: this.props.stores,
                    });
                } else {
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                }
                return true;
            },
        );
    }
    componentWillUnmount() {
        sendPageReport('Search', this.state.reportStartTime, moment().unix());
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }

    searchContent(searchTerm) {
        GLOBAL.SearchInput = searchTerm;
        try {
            if (searchTerm.length < 2) {
                GLOBAL.SearchChannels_ = [];
                GLOBAL.SearchMovies_ = [];
                GLOBAL.SearchSeries_ = [];
                this.setState({
                    channels_search: GLOBAL.SearchChannels_,
                    movies_search: GLOBAL.SearchMovies_,
                    series_search: GLOBAL.SearchSeries_,
                });
            } else {
                searchTerm = searchTerm.toLowerCase();
                if (GLOBAL.SearchChannels.length > 0) {
                    GLOBAL.SearchChannels_ = GLOBAL.SearchChannels.filter(
                        c => c.name.toLowerCase().indexOf(searchTerm) > -1,
                    );
                }
                if (GLOBAL.SearchMovies.length > 0) {
                    GLOBAL.SearchMovies_ = GLOBAL.SearchMovies.filter(
                        c => c.name.toLowerCase().indexOf(searchTerm) > -1,
                    );
                }
                if (GLOBAL.SearchSeries.length > 0) {
                    GLOBAL.SearchSeries_ = GLOBAL.SearchSeries.filter(
                        c => c.name.toLowerCase().indexOf(searchTerm) > -1,
                    );
                }
                this.setState({
                    channels_search: GLOBAL.SearchChannels_,
                    movies_search: GLOBAL.SearchMovies_,
                    series_search: GLOBAL.SearchSeries_,
                });
            }
        } catch (error) { }
    }
    _startSelectedChannel(item, index) {
        GLOBAL.Channel = UTILS.getChannel(item.id);
        Actions.Player({ fromPage: 'Search' });
    }
    openMovie(item, index) {
        GLOBAL.Selected_MovieIndex = index;
        Actions.Movies_Details({ MovieIndex: item.id, fromPage: 'search' });
    }
    openSeries(series, index) {
        Actions.Series_Details({ SeasonIndex: index, fromPage: 'search' });
    }
    render() {
        return (
            <Container
                needs_notch={true}
                hide_header={true}
                hide_menu={
                    GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV
                        ? false
                        : true
                }
            >
                <View style={{ flexDirection: 'column', flex: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Keyboard
                            BackPage={() => Actions.Home()}
                            EnableBackButton={true}
                            OldSearch={GLOBAL.SearchInput}
                            Width={GLOBAL.COL_1 - 20}
                            Margin={10}
                            Icon={"search"}
                            PlaceHolder={LANG.getTranslation(
                                'search_movies_series_channels',
                            )}
                            Submit={this.onChangeText}
                            LiveReload={true}
                        />
                    </View>
                    {RenderIf(!GLOBAL.Device_IsPhone)(
                        <View style={{ flex: 1 }}>
                            {RenderIf(
                                this.state.movies_search.length > 0 ||
                                this.state.channels_search.length > 0 ||
                                this.state.series_search.length > 0,
                            )(
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        marginTop: GLOBAL.Device_IsTablet
                                            ? 0
                                            : 10,
                                        marginHorizontal: 10,
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.H2,
                                                styles.Shadow,
                                                {
                                                    padding: 10,
                                                    paddingBottom: 10,
                                                },
                                            ]}
                                        >
                                            {LANG.getTranslation('movies')}
                                            {RenderIf(!GLOBAL.Device_IsSmartTV)(
                                                <Text
                                                    style={[
                                                        styles.Standard,
                                                        styles.Shadow,
                                                    ]}
                                                >
                                                    {' '}
                                                    (
                                                    {
                                                        this.state.movies_search
                                                            .length
                                                    }
                                                    )
                                                </Text>,
                                            )}
                                        </Text>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <MovieList
                                                FromPage={'Search'}
                                                Movies={
                                                    this.state.movies_search
                                                }
                                                Type={'Movies'}
                                                Width={
                                                    this.state.movie_width - 10
                                                }
                                                Columns={2}
                                                getItemLayout={(
                                                    data,
                                                    index,
                                                ) => {
                                                    return {
                                                        length: this.state
                                                            .movies_width,
                                                        index,
                                                        offset:
                                                            this.state
                                                                .movies_width *
                                                            index,
                                                    };
                                                }}
                                                onPress={(movie, index) =>
                                                    this.openMovie(movie, index)
                                                }
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.H2,
                                                styles.Shadow,
                                                {
                                                    padding: 10,
                                                    paddingBottom: 10,
                                                },
                                            ]}
                                        >
                                            {LANG.getTranslation('series')}
                                            {RenderIf(!GLOBAL.Device_IsSmartTV)(
                                                <Text
                                                    style={[
                                                        styles.Standard,
                                                        styles.Shadow,
                                                    ]}
                                                >
                                                    {' '}
                                                    (
                                                    {
                                                        this.state.series_search
                                                            .length
                                                    }
                                                    )
                                                </Text>,
                                            )}
                                        </Text>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <SeriesList
                                                FromPage={'Home'}
                                                Series={
                                                    this.state.series_search
                                                }
                                                Type={'Search'}
                                                Width={
                                                    this.state.series_width - 10
                                                }
                                                Columns={1}
                                                getItemLayout={(
                                                    data,
                                                    index,
                                                ) => {
                                                    return {
                                                        length: this.state
                                                            .series_width,
                                                        index,
                                                        offset:
                                                            this.state
                                                                .series_width *
                                                            index,
                                                    };
                                                }}
                                                onPress={(series, index) =>
                                                    this.openSeries(
                                                        series,
                                                        index,
                                                    )
                                                }
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.H2,
                                                styles.Shadow,
                                                {
                                                    padding: 10,
                                                    paddingBottom: 10,
                                                },
                                            ]}
                                        >
                                            {LANG.getTranslation('channels')}
                                            {RenderIf(!GLOBAL.Device_IsSmartTV)(
                                                <Text
                                                    style={[
                                                        styles.Standard,
                                                        styles.Shadow,
                                                    ]}
                                                >
                                                    {' '}
                                                    (
                                                    {
                                                        this.state
                                                            .channels_search
                                                            .length
                                                    }
                                                    )
                                                </Text>,
                                            )}
                                        </Text>
                                        <View style={{ flex: 1 }}>
                                            <ChannelList
                                                FromPage={'Search'}
                                                Channels={
                                                    this.state.channels_search
                                                }
                                                Width={
                                                    this.state.channel_width - 8
                                                }
                                                Type={'Big'}
                                                scrollType="Search"
                                                ColumnType={
                                                    this.state.channelType
                                                }
                                                Columns={1}
                                                onPress={(channel, index) =>
                                                    this._startSelectedChannel(
                                                        channel,
                                                        index,
                                                    )
                                                }
                                                getItemLayout={(
                                                    data,
                                                    index,
                                                ) => {
                                                    return {
                                                        length: this.state
                                                            .channel_width,
                                                        index,
                                                        offset:
                                                            this.state
                                                                .channel_width *
                                                            index,
                                                    };
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>,
                            )}
                        </View>,
                    )}
                </View>
            </Container>
        );
    }
}
