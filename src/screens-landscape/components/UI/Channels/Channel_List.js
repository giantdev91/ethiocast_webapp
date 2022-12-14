import React, {PureComponent} from 'react';
import {View} from 'react-native';
import Channel_List_Item_Small from './Channel_List_Item_Small';
import Channel_List_Item_Round from './Channel_List_Item_Round';
import Channel_List_Item_Big from './Channel_List_Item_Big';
import Channel_List_Item_Home_Palladium from './Channel_List_Item_Home_Palladium';
import Channel_Side_List_Palladium from './Channel_Side_List_Palladium';
import Channel_List_Item_M3U from './Channel_List_Item_M3U';
class Channel_List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const channels = this.props.Channels;
        const columns = this.props.Columns;
        const noscroll = this.props.NoScroll;

        if (GLOBAL.Channels_Selected_Index == undefined) {
            GLOBAL.Channels_Selected_Index = 0;
        }
        if (GLOBAL.Channels_Selected_Row == undefined) {
            GLOBAL.Channels_Selected_Row = 0;
        }
        if (channels != undefined) {
            var test = channels.length / columns;
            if (
                !isNaN(test) &&
                test != 0 &&
                this.props.Type != 'Favorite' &&
                this.props.Type != 'Home'
            ) {
                if (
                    this.props.Type != 'TV' &&
                    test < GLOBAL.Channels_Selected_Row
                ) {
                    GLOBAL.Channels_Selected_Row = 0;
                    GLOBAL.Channels_Selected_Index = 0;
                }
                if (
                    this.props.Type == 'TV' &&
                    channels.length < GLOBAL.Channels_Selected_Index
                ) {
                    GLOBAL.Channels_Selected_Row = 0;
                    GLOBAL.Channels_Selected_Index = 0;
                }
            }
        }
        if (GLOBAL.Channels_Selected_Index == -1) {
            GLOBAL.Channels_Selected_Index = 0;
            GLOBAL.Channels_Selected_Row = 0;
        }

        return (
            <FlatList
                {...this.props}
                ref={ref => (this.flatList = ref)}
                data={channels}
                Width={this.props.Width}
                numColumns={columns}
                horizontal={
                    this.props.horizontal != undefined ||
                    this.props.Type == 'HomePalladium' ||
                    (this.props.Type == 'Search' && GLOBAL.Device_IsPhone)
                        ? true
                        : false
                }
                removeClippedSubviews={true}
                keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {}}
                renderItem={this.renderItem}
                onContentSizeChange={() => {
                    if (
                        channels != undefined &&
                        this.props.Type != 'Favorite' &&
                        this.props.Type != 'Home' &&
                        this.props.scrollType != 'Search'
                    ) {
                        try {
                            if (
                                this.flatList.scrollToIndex &&
                                this.state.scrolled == false &&
                                channels.length > 0
                            ) {
                                this.setState({
                                    scrolled: true,
                                });
                                this.flatList.scrollToIndex({
                                    index:
                                        noscroll != undefined
                                            ? 0
                                            : this.props.Type == 'TV'
                                            ? GLOBAL.Channels_Selected_Index
                                            : GLOBAL.Channels_Selected_Row,
                                    animated: false,
                                    viewPosition: 0,
                                });
                            }
                        } catch (e) {}
                    }
                }}
            />
        );
    }
    renderItem = ({item, index}) => (
        <View>
            {RenderIf(this.props.Type == 'Small')(
                <Channel_List_Item_Small
                    key={item.channel_id}
                    Channel={item}
                    Index={index}
                    Width={this.props.Width}
                    Columns={this.props.Columns}
                    ColumnType={this.props.ColumnType}
                />,
            )}
            {RenderIf(this.props.Type == 'Big')(
                <Channel_List_Item_Big
                    ShowPreview={this.props.ShowPreview}
                    FromPage={this.props.FromPage}
                    Player={this.props.Player}
                    onPress={
                        this.props.onPress != undefined
                            ? this.props.onPress
                            : null
                    }
                    onFocusExtra={
                        this.props.onFocusExtra != undefined
                            ? this.props.onFocusExtra
                            : null
                    }
                    key={item.channel_id}
                    Channel={item}
                    Index={index}
                    Width={this.props.Width}
                    Columns={this.props.Columns}
                    ColumnType={this.props.ColumnType}
                />,
            )}
            {RenderIf(this.props.Type == 'TV')(
                <Channel_List_Item_Big
                    ShowPreview={this.props.ShowPreview}
                    FromPage={this.props.FromPage}
                    Player={this.props.Player}
                    onPress={
                        this.props.onPress != undefined
                            ? this.props.onPress
                            : null
                    }
                    onFocusExtra={
                        this.props.onFocusExtra != undefined
                            ? this.props.onFocusExtra
                            : null
                    }
                    key={item.channel_id}
                    Channel={item}
                    Index={index}
                    Width={this.props.Width}
                    Columns={this.props.Columns}
                    ColumnType={this.props.ColumnType}
                />,
            )}
            {RenderIf(this.props.Type == 'Round')(
                <Channel_List_Item_Round
                    ShowPreview={this.props.ShowPreview}
                    FromPage={this.props.FromPage}
                    Player={this.props.Player}
                    onPress={
                        this.props.onPress != undefined
                            ? this.props.onPress
                            : null
                    }
                    onFocusExtra={
                        this.props.onFocusExtra != undefined
                            ? this.props.onFocusExtra
                            : null
                    }
                    key={item.channel_id}
                    Channel={item}
                    Index={index}
                    Width={this.props.Width}
                    Columns={this.props.Columns}
                    ColumnType={this.props.ColumnType}
                />,
            )}
            {RenderIf(this.props.Type == 'M3U')(
                <Channel_List_Item_M3U
                    onPress={item => this.props.onPress(item)}
                    FromPage={this.props.FromPage}
                    key={item.channel_id}
                    Channel={item}
                    Index={index}
                    Width={this.props.Width}
                    Columns={this.props.Columns}
                    ColumnType={this.props.ColumnType}
                />,
            )}
            {RenderIf(this.props.Type == 'HomePalladium')(
                <Channel_List_Item_Home_Palladium
                    ChannelPlayingId={this.props.ChannelPlayingId}
                    key={item.channel_id}
                    Channel={item}
                    Index={index}
                    Width={this.props.Width}
                    Columns={this.props.Columns}
                    ColumnType={this.props.ColumnType}
                    focusChannel={this.props.focusChannel}
                    blurChannel={this.props.blurChannel}
                    selectChannel={this.props.selectChannel}
                />,
            )}
            {RenderIf(this.props.Type == 'SideListPalladium')(
                <Channel_Side_List_Palladium
                    ChannelPlayingId={this.props.ChannelPlayingId}
                    key={item.channel_id}
                    Channel={item}
                    Index={index}
                    Width={this.props.Width}
                    selectChannel={this.props.selectChannel}
                    pressChannel={this.props.pressChannel}
                />,
            )}
        </View>
    );
}

export default Channel_List;
