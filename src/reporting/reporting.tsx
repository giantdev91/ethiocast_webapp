var GLOBALModule = require('../datalayer/global');
var GLOBAL = GLOBALModule.default;

function getCustomer() {
    return {
        user_id: GLOBAL.UserID,
        pass: GLOBAL.Pass,
        service_id: GLOBAL.ServiceID,
        device: {
            os: GLOBAL.Device_OS_Version,
            model: GLOBAL.Device_Model,
            manufacturer: GLOBAL.Device_Manufacturer,
            type: GLOBAL.Device_FormFactor,
            uuid: GLOBAL.Device_UniqueID,
        },
        network: {
            ip: GLOBAL.Network_IpAddress,
            type: GLOBAL.Network_Type,
            name: GLOBAL.Network_Name,
            isp: GLOBAL.Network_ISP,
            asn: GLOBAL.Network_ASN,
            proxy: GLOBAL.Network_IsVPN,
            vpn: GLOBAL.Network_IsProxy,
        },
        app: {
            version: GLOBAL.App_Version,
            template: GLOBAL.App_Theme,
        },
        location: {
            zip: GLOBAL.Location_ZIP,
            city: GLOBAL.Location_City,
            state: GLOBAL.Location_State,
            country: GLOBAL.Location_Country,
            latitude: GLOBAL.Location_Latitude,
            longitude: GLOBAL.Location_Longitude,
            timezone: GLOBAL.Location_Timezone,
        },
    };
}
export function sendChannelReport(
    id,
    number,
    name,
    icon,
    start,
    end,
    pr_start,
    pr_end,
    pr_name,
) {
    var Channel = {
        icon: icon,
        id: id,
        name: name,
        number: number,
        t_end: start,
        t_start: end,
        pr_end: pr_end,
        pr_start: pr_start,
        pr_name: pr_name,
        customer: getCustomer(),
    };
    (async () => {
        sendContentReport(Channel, 'Channel');
    })();
}
export function sendCatchupTVReport(
    id,
    number,
    name,
    icon,
    start,
    end,
    pr_start,
    pr_end,
    pr_name,
) {
    var CatchupTV = {
        icon: icon,
        id: id,
        name: name,
        number: number,
        t_end: start,
        t_start: end,
        pr_end: pr_end,
        pr_start: pr_start,
        pr_name: pr_name,
        customer: getCustomer(),
    };
    (async () => {
        sendContentReport(CatchupTV, 'CatchupTV');
    })();
}
export function sendRecordingReport(
    id,
    number,
    name,
    icon,
    start,
    end,
    pr_start,
    pr_end,
    pr_name,
) {
    var Recording = {
        icon: icon,
        id: id,
        name: name,
        number: number,
        t_end: start,
        t_start: end,
        pr_end: pr_end,
        pr_start: pr_start,
        pr_name: pr_name,
        customer: getCustomer(),
    };
    (async () => {
        sendContentReport(Recording, 'Recordings');
    })();
}
export function sendMovieReport(id, name, poster, start, end) {
    var Movie = {
        name: name,
        id: id,
        poster: poster,
        t_start: start,
        t_end: end,
        customer: getCustomer(),
    };
    (async () => {
        sendContentReport(Movie, 'Movies');
    })();
}
export function sendSeriesReport(
    series_name,
    series_id,
    season_name,
    season_id,
    episode_name,
    episode_id,
    season_poster,
    episode_poster,
    start,
    end,
) {
    var Series = {
        series: series_name,
        series_id: series_id,
        season: season_name,
        season_id: season_id,
        episode: episode_name,
        episode_id: episode_id,
        episode_poster: episode_poster,
        season_poster: season_poster,
        t_start: start,
        t_end: end,
        customer: getCustomer(),
    };
    (async () => {
        sendContentReport(Series, 'Series');
    })();
}
export function sendEducationReport(
    year_name,
    year_id,
    course_name,
    course_id,
    lesson_name,
    lesson_id,
    course_poster,
    lesson_poster,
    start,
    end,
) {
    var Education = {
        year: year_name,
        year_id: year_id,
        course: course_name,
        course_id: course_id,
        lesson: lesson_name,
        lesson_id: lesson_id,
        lesson_poster: lesson_poster,
        course_poster: course_poster,
        t_start: start,
        t_end: end,
        customer: getCustomer(),
    };
    (async () => {
        sendContentReport(Education, 'Education');
    })();
}
export function sendMusicReport(
    album_name,
    album_id,
    song_name,
    song_id,
    album_poster,
    start,
    end,
) {
    var Music = {
        album: album_name,
        album_id: album_id,
        song: song_name,
        song_id: song_id,
        album_poster: album_poster,
        t_end: start,
        t_start: end,
        customer: getCustomer(),
    };
    (async () => {
        sendContentReport(Music, 'Music');
    })();
}
export function sendAppReport(name, icon, time) {
    var App = {
        name: name,
        time: time,
        icon: icon,
        customer: getCustomer(),
    };
    (async () => {
        sendContentReport(App, 'Apps');
    })();
}
export function sendActionReport(action, page, time, value) {
    var Action = {
        action: action,
        page: page,
        time: time,
        value: value,
        customer: getCustomer(),
    };
    (async () => {
        sendUsageReport(Action, 'Actions');
    })();
}
export function sendSearchReport(time, value) {
    var Search = {
        time: time,
        value: value,
        customer: getCustomer(),
    };
    (async () => {
        sendUsageReport(Search, 'Search');
    })();
}
export function sendErrorReport(time, value, name, type) {
    var Error = {
        time: time,
        value: value,
        name: name,
        type: type,
        customer: getCustomer(),
    };
    (async () => {
        sendUsageReport(Error, 'Error');
    })();
}
export function sendPageReport(page, start, end) {
    var Page = {
        page: page,
        t_start: start,
        t_end: end,
        customer: getCustomer(),
    };
    (async () => {
        sendUsageReport(Page, 'Pages');
    })();
}
const sendContentReport = async (report, type) => {
    var finalReport = {
        ims: {
            operator: GLOBAL.IMS,
            crm: GLOBAL.CRM,
            cms: GLOBAL.CMS,
            type: type,
        },
        report: report,
    };
    const rep = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalReport),
    };
    try {
        GLOBAL.show_log && console.log(
            'send content report: ',
            GLOBAL.REPORTING_CONTENT_URL,
        );
        const fetchResponse = await fetch(
            GLOBAL.REPORTING_CONTENT_URL,
            rep,
        );
        const data = await fetchResponse.json();
        return true;
    } catch (e) {
        return false;
    }
};
const sendUsageReport = async (report, type) => {
    var finalReport = {
        ims: {
            operator: GLOBAL.IMS,
            crm: GLOBAL.CRM,
            cms: GLOBAL.CMS,
            type: type,
        },
        report: report,
    };
    const rep = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalReport),
    };
    try {
        GLOBAL.show_log && console.log(
            'send usage report: ',
            GLOBAL.REPORTING_ADD_URL,
        );
        // const fetchResponse = await fetch(
        //     GLOBAL.REPORTING_ADD_URL,
        //     rep,
        // );
        // const data = await fetchResponse.json();
        return true;
    } catch (e) {
        return false;
    }
};
