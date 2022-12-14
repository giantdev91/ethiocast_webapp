import React, {PureComponent} from 'react';
import {View} from 'react-native';
import Series_List_Item from './Series_List_item';

class Series_List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const series = this.props.Series;
        return (
            <FlatList
                {...this.props}
                ref={ref => (this.flatList = ref)}
                data={series}
                numColumns={this.props.Columns}
                horizontal={this.props.horizontal != undefined ? true : false}
                removeClippedSubviews={true}
                keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {}}
                renderItem={this.renderItem}
                // onContentSizeChange={() => {
                //     if (stores != undefined) {
                //         try {
                //             if (this.flatList.scrollToIndex && this.state.scrolled == false && stores.length > 0) {
                //                 this.setState({
                //                     scrolled: true
                //                 })
                //                 this.flatList.scrollToIndex({ index: this.props.SubStore != undefined && this.props.SubStore == true ? (GLOBAL.Store_Sub_Selected_Index / columns) : (GLOBAL.Store_Selected_Index / columns), animated: false, viewPosition: 0 });
                //             }
                //         } catch (e) {

                //         }
                //     }
                // }}
            />
        );
    }
    renderItem = ({item, index}) => (
        <View>
            <Series_List_Item
                FromPage={this.props.FromPage}
                Type={this.props.Type}
                Series={item}
                Index={index}
                Width={this.props.Width}
                onPress={this.props.onPress}
            />
        </View>
    );
}

export default Series_List;
