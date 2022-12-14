import React, {PureComponent} from 'react';
import {View} from 'react-native';
import EPG_List_Item from './EPG_List_Item';

class EPG_List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const epg = this.props.EPG;
        if (GLOBAL.EPG_Selected_Row == undefined) {
            GLOBAL.EPG_Selected_Row = 0;
        }

        return (
            <FlatList
                {...this.props}
                ref={ref => (this.flatList = ref)}
                data={epg}
                numColumns={1}
                horizontal={false}
                removeClippedSubviews={true}
                keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {}}
                renderItem={this.renderItem}
                onContentSizeChange={() => {
                    if (epg != undefined) {
                        // if (this.flatList.scrollToIndex && this.state.scrolled == false && epg.length > 0) {
                        //     this.setState({
                        //         scrolled: true
                        //     })
                        // commented due to problem only scroll once
                        if (
                            GLOBAL.EPG_Selected_Row > 0 &&
                            epg.length > 0 &&
                            GLOBAL.EPG_Selected_Row < epg.length
                        ) {
                            this.flatList.scrollToIndex({
                                index: GLOBAL.EPG_Selected_Row,
                                animated: false,
                                viewPosition: 0,
                            });
                        }
                        //}
                    }
                }}
            />
        );
    }
    renderItem = ({item, index}) => (
        <EPG_List_Item
            key={item.id}
            Program={item}
            Index={index}
            Width={this.props.Width}
            Channel={this.props.Channel}
            _startCatchupFromChannelMenu={
                this.props._startCatchupFromChannelMenu
            }
            startChannelById={this.props.startChannelById}
            recordProgram={this.props.recordProgram}
            CurrentProgram={this.props.CurrentProgram}
            RecordRequest={this.props.RecordRequest}
            Record={this.props.Record}
        />
    );
}

export default EPG_List;
