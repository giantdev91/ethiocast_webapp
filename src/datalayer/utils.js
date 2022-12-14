import dal from './dal_web';

import {Actions} from 'react-native-router-flux';

var GLOBALModule = require('../datalayer/global');
var GLOBAL = GLOBALModule.default;

class UTILS {
    lightOrDark(color) {
        // Check the format of the color, HEX or RGB?
        if (color.match(/^rgb/)) {
            // If HEX --> store the red, forestgreen, blue values in separate variables
            color = color.match(
                /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/,
            );

            r = color[1];
            g = color[2];
            b = color[3];
        } else {
            // If RGB --> Convert it to HEX: http://gist.github.com/983661
            color = +(
                '0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&')
            );

            r = color >> 16;
            g = (color >> 8) & 255;
            b = color & 255;
        }

        // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
        hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

        // Using the HSP value, determine whether the color is light or dark
        if (hsp > 127.5) {
            return 'light';
        } else {
            return 'dark';
        }
    }
    async storeJson(key, value) {
        try {
            return await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {}
    }
    async retrieveJson(key) {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
                return JSON.parse(value);
            }
        } catch (error) {}
    }
    checkProfile() {
        if (GLOBAL.UI_Profile == null) {
            GLOBAL.UI_Profile = [];
            return false;
        } else if (
            GLOBAL.UI_Profile.find(u => u.profile_id == GLOBAL.ProfileID) ==
            undefined
        ) {
            return false;
        } else {
            return true;
        }
    }
    getData(type, id, id_) {
        var test = this.checkProfile();
        if (test == false) {
            this.createStorageProfile(GLOBAL.ProfileID, true, type, id, id_);
        } else {
            var ui_profile = GLOBAL.UI_Profile.find(
                u => u.profile_id == GLOBAL.ProfileID,
            ).data;
            switch (type) {
                case 'movie_progress':
                    var movie = ui_profile.content.movies.progress.find(
                        m => m.id == id,
                    );
                    if (!movie) {
                        return null;
                    } else {
                        return movie.data;
                    }
                    break;
                case 'movie_progresses':
                    return ui_profile.content.movies.progress;
                    break;
                case 'series_progress':
                    var episode = ui_profile.content.series.progress.find(
                        m => m.id == id && m.episode == id_,
                    );
                    if (!episode) {
                        return null;
                    } else {
                        return episode.data;
                    }
                    break;
                case 'series_progresses':
                    return ui_profile.content.series.progress;
                    break;
                case 'television_favorites':
                    return ui_profile.content.television.favorites;
                    break;
                case 'television_locked':
                    return ui_profile.content.television.locked;
                    break;
                case 'settings_childlock':
                    var childlock = ui_profile.settings.childlock;
                    if (!childlock) {
                        return null;
                    } else {
                        return childlock;
                    }
                    break;
                case 'settings_audio':
                    var audio = ui_profile.settings.audio;
                    if (audio) {
                        return null;
                    } else {
                        return audio;
                    }
                    break;
                case 'settings_text':
                    var text = ui_profile.settings.text;
                    if (!text) {
                        return null;
                    } else {
                        return text;
                    }
                    break;
                case 'settings_screen':
                    var screen = ui_profile.settings.screen;
                    if (screen) {
                        return null;
                    } else {
                        return screen;
                    }
                    break;
                case 'settings_video_quality':
                    var quality = ui_profile.settings.video_quality;
                    if (quality) {
                        return null;
                    } else {
                        return quality;
                    }
                    break;
                case 'settings_clock':
                    var clock = ui_profile.settings.clock;
                    if (clock) {
                        return null;
                    } else {
                        return clock;
                    }
                    break;
                case 'settings_toggle':
                    var toggle = ui_profile.settings.toggle;
                    if (!toggle) {
                        return null;
                    } else {
                        return toggle;
                    }
            }
        }
    }
    storeData(type, id, id_, total, position, object, value, name) {
        var ui_profile = GLOBAL.UI_Profile.find(
            u => u.profile_id == GLOBAL.ProfileID,
        ).data;
        switch (type) {
            case 'movie_progress':
                var movie_new = {
                    id: id,
                    cover: value,
                    name: name,
                    data: {
                        total: total,
                        position: position,
                    },
                };
                var movie = ui_profile.content.movies.progress.find(
                    m => m.id == id,
                );
                if (movie) {
                    movie.data.total = total;
                    movie.data.position = position;
                } else {
                    ui_profile.content.movies.progress.splice(0, 0, movie_new);
                }
                break;
            case 'series_progress':
                var episode_new = {
                    id: id,
                    cover: value,
                    name: name,
                    episode: id_,
                    data: {
                        total: total,
                        position: position,
                    },
                };
                var episode = ui_profile.content.movies.progress.find(
                    m => m.id == id && m.episode == id_,
                );
                if (episode) {
                    episode.data.total = total;
                    episode.data.position = position;
                } else {
                    ui_profile.content.series.progress.splice(
                        0,
                        0,
                        episode_new,
                    );
                }
                break;
            case 'television_favorites':
                ui_profile.content.television.favorites = object;
                break;
            case 'television_locked':
                ui_profile.content.television.locked = object;
                break;
            case 'settings_childlock':
                ui_profile.settings.childlock = value;
                break;
            case 'settings_video_quality':
                ui_profile.settings.video_quality = value;
                break;
            case 'settings_audio':
                ui_profile.settings.audio = value;
                break;
            case 'settings_text':
                ui_profile.settings.text = value;
                break;
            case 'settings_screen':
                ui_profile.settings.screen = value;
                break;
            case 'settings_clock':
                ui_profile.settings.clock.push(object);
                break;
            case 'settings_toggle':
                ui_profile.settings.toggle = value;
                break;
        }
        GLOBAL.UI_Profile.data = ui_profile;
        this.storeJson('UI_Profile', GLOBAL.UI_Profile);
    }
    toAlphaNumeric(input) {
        if (input != null) {
            input = input.toString().replace(/\s/g, '');
            return input.toString().replace(/[^A-Za-z0-9]/g, '');
        } else {
            return '';
        }
    }
    //new profile methods
    getProfile(type, id, id_) {
        switch (type) {
            case 'age_rating':
                if (GLOBAL.Selected_Profile.age_rating != undefined) {
                    return GLOBAL.Selected_Profile.age_rating;
                } else {
                    GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID)[
                        'age_rating'
                    ] = 'ALL';
                    var newProfiles = GLOBAL.Profiles.filter(
                        p => p.name != 'Add Profile',
                    );
                    DAL.setProfile(
                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                        this.toAlphaNumeric(GLOBAL.UserID) +
                            '.' +
                            this.toAlphaNumeric(GLOBAL.Pass) +
                            '.profile',
                        newProfiles,
                    ).then(result => {});
                    return 'ALL';
                }
                break;
            case 'profile_lock':
                if (GLOBAL.Selected_Profile.profile_lock != undefined) {
                    return GLOBAL.Selected_Profile.profile_lock;
                } else {
                    GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID)[
                        'profile_lock'
                    ] = false;
                    var newProfiles = GLOBAL.Profiles.filter(
                        p => p.name != 'Add Profile',
                    );
                    DAL.setProfile(
                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                        this.toAlphaNumeric(GLOBAL.UserID) +
                            '.' +
                            this.toAlphaNumeric(GLOBAL.Pass) +
                            '.profile',
                        newProfiles,
                    ).then(result => {});
                    return false;
                }
                break;
            case 'movie_progress':
                try {
                    var movie =
                        GLOBAL.Selected_Profile.data.content.movies.progress.find(
                            m => m.id == id,
                        );
                    if (!movie) {
                        return null;
                    } else {
                        return movie.data;
                    }
                } catch (e) {
                    return null;
                }
                break;
            case 'movie_progresses':
                return GLOBAL.Selected_Profile.data.content.movies.progress;
                break;
            case 'movie_favorites':
                return GLOBAL.Selected_Profile.data.content.movies.favorites;
                break;
            case 'series_progress':
                var episode =
                    GLOBAL.Selected_Profile.data.content.series.progress.find(
                        m => m.id == id && m.episode == id_,
                    );
                if (!episode) {
                    return null;
                } else {
                    return episode.data;
                }
                break;
            case 'education_progress':
                var episode =
                    GLOBAL.Selected_Profile.data.content.education.progress.find(
                        m => m.id == id && m.lesson == id_,
                    );
                if (!episode) {
                    return null;
                } else {
                    return episode.data;
                }
                break;
            case 'series_watching':
                var watching =
                    GLOBAL.Selected_Profile.data.content.series.watching;
                if (watching != undefined) {
                    return GLOBAL.Selected_Profile.data.content.series.watching.find(
                        m => m.serie_id == id,
                    );
                } else {
                    return undefined;
                }
                break;
            case 'recordings_progress':
                var recording = GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.recordings;
                if (recording != undefined) {
                    return GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content.recordings.find(m => m.recording_id == id);
                } else {
                    return null;
                }
                break;
            case 'series_progresses':
                return GLOBAL.Selected_Profile.data.content.series.progress;
                break;
            case 'series_favorites':
                return GLOBAL.Selected_Profile.data.content.series.favorites;
                break;
            case 'education_progresses':
                return GLOBAL.Selected_Profile.data.content.education.progress;
                break;
            case 'movie_rentals':
                if (
                    GLOBAL.Selected_Profile.data.content.movies.rented !=
                    undefined
                ) {
                    return GLOBAL.Selected_Profile.data.content.movies.rented;
                } else {
                    var rented = [];
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content.movies['rented'] = rented;
                    var newProfiles = GLOBAL.Profiles.filter(
                        p => p.name != 'Add Profile',
                    );
                    DAL.setProfile(
                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                        this.toAlphaNumeric(GLOBAL.UserID) +
                            '.' +
                            this.toAlphaNumeric(GLOBAL.Pass) +
                            '.profile',
                        newProfiles,
                    ).then(result => {});
                    return [];
                }
                break;
            case 'education_favorites':
                if (
                    GLOBAL.Selected_Profile.data.content.education != undefined
                ) {
                    return GLOBAL.Selected_Profile.data.content.education
                        .favorites;
                } else {
                    var education = {
                        favorites: [],
                        progress: [],
                        finished: [],
                    };
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content['education'] = education;
                    var newProfiles = GLOBAL.Profiles.filter(
                        p => p.name != 'Add Profile',
                    );
                    DAL.setProfile(
                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                        this.toAlphaNumeric(GLOBAL.UserID) +
                            '.' +
                            this.toAlphaNumeric(GLOBAL.Pass) +
                            '.profile',
                        newProfiles,
                    ).then(result => {});
                    return [];
                }
                break;
            case 'education_finished':
                return GLOBAL.Selected_Profile.data.content.education.finished;
                break;
            case 'television_favorites':
                if (
                    GLOBAL.Selected_Profile.data.content.television == undefined
                ) {
                    return [];
                } else {
                    return GLOBAL.Selected_Profile.data.content.television
                        .favorites;
                }
                break;
            case 'television_recordings':
                if (
                    GLOBAL.Selected_Profile.data.content.television == undefined
                ) {
                    return [];
                } else {
                    return GLOBAL.Selected_Profile.data.content.television
                        .recordings;
                }
                break;
            case 'television_locked':
                return GLOBAL.Selected_Profile.data.content.television.locked;
                break;
            case 'television_progresses':
                return GLOBAL.Selected_Profile.data.content.television.progress;
                break;
            case 'settings_childlock':
                try {
                    var childlock =
                        GLOBAL.Selected_Profile.data.settings.childlock;
                    if (!childlock) {
                        return null;
                    } else {
                        return childlock;
                    }
                } catch (e) {
                    return null;
                }
                break;
            case 'settings_audio':
                try {
                    var audio = GLOBAL.Selected_Profile.data.settings.audio;
                    if (!audio) {
                        return null;
                    } else {
                        return audio;
                    }
                } catch (e) {
                    return null;
                }
                break;
            case 'settings_text':
                try {
                    var text = GLOBAL.Selected_Profile.data.settings.text;
                    if (!text) {
                        return null;
                    } else {
                        return text;
                    }
                } catch (e) {
                    return null;
                }
                break;
            case 'settings_screen':
                try {
                    var screen = GLOBAL.Selected_Profile.data.settings.screen;
                    if (!screen) {
                        return null;
                    } else {
                        return screen;
                    }
                } catch (e) {
                    return null;
                }
                break;
            case 'settings_offset':
                try {
                    var offset = GLOBAL.Selected_Profile.data.settings.offset;
                    if (!offset) {
                        return 5;
                    } else {
                        return offset;
                    }
                } catch (e) {
                    return 5;
                }
                break;
            case 'settings_video_quality':
                try {
                    var quality =
                        GLOBAL.Selected_Profile.data.settings.video_quality;
                    if (!quality) {
                        return null;
                    } else {
                        return quality;
                    }
                } catch (e) {
                    return null;
                }
                break;
            case 'settings_clock':
                try {
                    var clock = GLOBAL.Selected_Profile.data.settings.clock;
                    if (!clock) {
                        return null;
                    } else {
                        return clock;
                    }
                } catch (e) {
                    return null;
                }
                break;
            case 'settings_toggle':
                try {
                    var toggle = GLOBAL.Selected_Profile.data.settings.toggle;
                    if (!toggle) {
                        return null;
                    } else {
                        return toggle;
                    }
                } catch (e) {
                    return null;
                }
        }
    }
    storeProfile(type, id, id_, total, position, object, value, name) {
        switch (type) {
            case 'age_rating':
                GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID).age_rating =
                    value;
                break;
            case 'profile_lock':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).profile_lock = value;
                break;
            case 'movie_progress':
                var movie_new = {
                    id: id,
                    cover: value,
                    name: name,
                    data: {
                        total: total,
                        position: position,
                    },
                };
                var movie = GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.movies.progress.find(m => m.id == id);
                if (movie) {
                    movie.data.total = total;
                    movie.data.position = position;
                } else {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content.movies.progress.splice(0, 0, movie_new);
                }
                if (
                    GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID).data
                        .content.movies.progress.length > 50
                ) {
                }
                break;
            case 'movie_favorites':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.movies.favorites = object;
                break;
            case 'series_progress':
                var episode_new = {
                    id: id,
                    cover: value,
                    name: name,
                    episode: id_,
                    data: {
                        total: total,
                        position: position,
                    },
                };
                var episode = GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.series.progress.find(
                    m => m.id == id && m.episode == id_,
                );
                if (episode) {
                    episode.data.total = total;
                    episode.data.position = position;
                } else {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content.series.progress.splice(0, 0, episode_new);
                }
                //store watching status
                if (object != undefined) {
                    var watching = [
                        {
                            serie_id: object.id,
                            season_id: id,
                            index: id_,
                            duration: total,
                            current: position,
                        },
                    ];
                    if (
                        GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID).data
                            .content.series.watching == undefined
                    ) {
                        GLOBAL.Profiles.find(
                            u => u.id == GLOBAL.ProfileID,
                        ).data.content.series['watching'] = watching;
                    } else {
                        var watch = GLOBAL.Profiles.find(
                            u => u.id == GLOBAL.ProfileID,
                        ).data.content.series.watching.find(
                            m => m.serie_id == object.id,
                        );
                        if (watch != undefined) {
                            watch.total = total;
                            watch.position = position;
                            watch.index = id_;
                            watch.season_id = id;
                        } else {
                            GLOBAL.Profiles.find(
                                u => u.id == GLOBAL.ProfileID,
                            ).data.content.series.watching.splice(
                                0,
                                0,
                                watching,
                            );
                        }
                    }
                }
                break;
            case 'education_progress':
                var lesson_new = {
                    id: id,
                    cover: value,
                    name: name,
                    lesson: id_,
                    data: {
                        total: total,
                        position: position,
                    },
                };
                var lesson = GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.education.progress.find(
                    m => m.id == id && m.episode == id_,
                );
                if (lesson) {
                    lesson.data.total = total;
                    lesson.data.position = position;
                } else {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content.education.progress.splice(0, 0, lesson_new);
                }
                break;
            case 'education_favorites':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.education.favorites = object;
                break;
            case 'education_finished':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.education.finished = object;
                break;
            case 'series_favorites':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.series.favorites = object;
                break;
            case 'television_progress':
                var program = GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.television.progress.find(
                    m => m.channel_id == id,
                );
                if (program) {
                    program = object;
                } else {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content.television.progress.splice(0, 0, object);
                }
                if (
                    GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID).data
                        .content.television.progress.length > 50
                ) {
                    //   GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID).data.content.television.splice(0,)
                }
                break;
            case 'recordings_progress':
                var progress = [
                    {
                        recording_id: id,
                        duration: total,
                        current: position,
                    },
                ];
                if (
                    GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID).data
                        .content.recordings == undefined
                ) {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content['recordings'] = progress;
                } else {
                    var progress_ = GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.content.recordings.find(m => m.recording_id == id);
                    if (progress_) {
                        progress_.total = total;
                        progress_.position = position;
                    } else {
                        GLOBAL.Profiles.find(
                            u => u.id == GLOBAL.ProfileID,
                        ).data.content.recordings.splice(0, 0, watching);
                    }
                }
                break;
            case 'television_favorites':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.television.favorites = object;
                break;
            case 'television_recordings':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.television.recordings = object;
                break;
            case 'television_locked':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.content.television.locked = object;
                break;
            case 'settings_childlock':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.settings.childlock = value;
                break;
            case 'settings_video_quality':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.settings.video_quality = value;
                break;
            case 'settings_audio':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.settings.audio = value;
                break;
            case 'settings_text':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.settings.text = value;
                break;
            case 'settings_screen':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.settings.screen = value;
                break;
            case 'settings_offset':
                if (
                    GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID).data
                        .settings.offset == undefined
                ) {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.settings['offset'] = value;
                } else {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.settings.offset = value;
                }
                break;
            case 'settings_clock':
                if (
                    GLOBAL.Profiles.find(u => u.id == GLOBAL.ProfileID).data
                        .settings.clock == undefined
                ) {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.settings['clock'] = object;
                } else {
                    GLOBAL.Profiles.find(
                        u => u.id == GLOBAL.ProfileID,
                    ).data.settings.clock = object;
                }
                break;
            case 'settings_toggle':
                GLOBAL.Profiles.find(
                    u => u.id == GLOBAL.ProfileID,
                ).data.settings.toggle = value;
                break;
        }
        var newProfiles = GLOBAL.Profiles.filter(p => p.name != 'Add Profile');
        DAL.setProfile(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            this.toAlphaNumeric(GLOBAL.UserID) +
                '.' +
                this.toAlphaNumeric(GLOBAL.Pass) +
                '.profile',
            newProfiles,
        ).then(result => {});
    }
    //end new profile methods

    getCurrentProgram(channel_id) {
        var epg_ = GLOBAL.EPG.find(e => e.id == channel_id);
        if (epg_ != undefined && epg_ != null) {
            epg_ = epg_.epgdata;
            var program;
            program = epg_.find(
                element =>
                    element.s <= moment().unix() &&
                    element.e >= moment().unix(),
            );
            if (program != undefined) {
                return program;
            } else {
                program = {
                    n: 'N/A',
                    s: moment().startOf('hour').unix(),
                    e: moment().endOf('hour').unix() + 60,
                    d: 'N/A',
                    age_rating: '',
                    category: '',
                };
                return program;
            }
        } else {
            var program = {
                n: 'N/A',
                s: moment().startOf('hour').unix(),
                e: moment().endOf('hour').unix() + 60,
                d: 'N/A',
                age_rating: '',
                category: '',
            };
            return program;
        }
    }
    getCurrentProgramIndex(channel_id) {
        var epg_ = GLOBAL.EPG.find(e => e.id == channel_id);
        if (epg_ != undefined && epg_ != null) {
            epg_ = epg_.epgdata;
            var index = epg_.findIndex(
                element =>
                    element.s <= moment().unix() &&
                    element.e >= moment().unix(),
            );
            return index;
        } else {
            return 0;
        }
    }
    getChannelIndex(channel_id) {
        if (GLOBAL.Channels_Selected == undefined) {
            GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
        }
        var index = GLOBAL.Channels_Selected.findIndex(
            ch => ch.channel_id == channel_id,
        );
        return index;
    }
    getCurrentEpg(channel_id) {
        var epg = GLOBAL.EPG.find(e => e.id == channel_id);
        //what if no epg
        if (epg != undefined) {
            return epg.epgdata;
        }
    }
    getCategoryIndex(category_id) {
        if (GLOBAL.Channels_Selected == undefined) {
            GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
            GLOBAL.Channels_Selected_Category_ID = GLOBAL.Channels[0].id;
        }
        var index = GLOBAL.Channels.findIndex(c => c.id == category_id);
        if (index == undefined || index == null) {
            index = 0;
        }
        return index;
    }
    getChannel(channel_id) {
        if (GLOBAL.Channels_Selected == undefined) {
            GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
            GLOBAL.Channels_Selected_Category_ID = GLOBAL.Channels[0].id;
            GLOBAL.Channels_Selected_Category_Index = this.getCategoryIndex(
                GLOBAL.Channels_Selected_Category_ID,
            );
        }
        if (GLOBAL.Channels_Selected.length > 0) {
            var channel = GLOBAL.Channels_Selected.find(
                ch => ch.channel_id == channel_id,
            );
            if (channel == undefined) {
                this.getChannelSelected(channel_id);
                return GLOBAL.Channel;
            } else {
                return channel;
            }
        }
    }
    getChannelById(channel_id) {
        var categories = GLOBAL.Channels;
        var channelOut = null;
        categories.some(category => {
            if (category.id != 0) {
                var channels = category.channels;
                var channel = channels.find(ch => ch.channel_id == channel_id);
                if (channel != undefined) {
                    channelOut = channel;
                }
            }
        });
        return channelOut;
    }
    getChannelFavorite(channel_id) {
        var categories = GLOBAL.Channels;
        var channelOut = null;
        categories.some(category => {
            if (category.id != 0) {
                var channels = category.channels;
                var channel = channels.find(ch => ch.channel_id == channel_id);
                if (channel != undefined) {
                    channelOut = channel;
                }
            }
        });
        return channelOut;
    }
    checkChannelFavorites(channel_id) {
        var categories = GLOBAL.Channels;
        var exists = false;
        categories.forEach(category => {
            if (category.id != 0) {
                var channels = category.channels;
                var channel = channels.find(ch => ch.channel_id == channel_id);
                if (channel != undefined) {
                    exists = true;
                }
            }
        });
        return exists;
    }

    getChannelSelected(channel_id) {
        var categories = GLOBAL.Channels;
        categories.some(category => {
            if (category.id != 0) {
                var channels = category.channels;
                var channel = channels.find(ch => ch.channel_id == channel_id);
                if (channel != undefined) {
                    GLOBAL.Channels_Selected = category.channels;
                    GLOBAL.Channel = channel;
                }
            }
        });
    }
    getChannelSelectedByName(channel_name) {
        var channelOut = '';
        var categories = GLOBAL.Channels;
        categories.forEach(category => {
            if (category.id != 0) {
                var channels = category.channels;
                var channel = channels.find(ch => ch.name == channel_name);
                if (channel != undefined) {
                    channelOut = channel;
                }
            }
        });
        return channelOut;
    }
    getCatchupChannels() {
        GLOBAL.Channels_Catchup = [];
        var categories = GLOBAL.Channels;
        categories.forEach(category => {
            var channels = category.channels;
            if (channels != undefined) {
                channels.forEach(channel => {
                    if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
                        var test = GLOBAL.Channels_Catchup.find(
                            ch => ch.channel_id == channel.channel_id,
                        );
                        if (test == undefined) {
                            GLOBAL.Channels_Catchup.push(channel);
                        }
                    }
                });
            }
        });
        return GLOBAL.Channels_Catchup;
    }
    getFavoriteChannel(channel_id) {
        var channel = GLOBAL.Favorite_Channels.find(
            ch => ch.channel_id == channel_id,
        );
        if (channel != undefined) {
            return true;
        } else {
            return false;
        }
    }
    getHomeChannelsMixedFavorites(channels) {
        var favo = GLOBAL.Favorite_Channels.sort(
            (a, b) => a.channel_number - b.channel_number,
        );
        var fav = [];
        favo.forEach(f => {
            f['favorite'] = true;
            fav.push(f);
        });
        var all = fav.concat(channels);
        return all;
    }
    getHomeMoviesMixedFavorites(movies) {
        var favo = GLOBAL.Favorite_Movies;
        var fav = [];
        favo.forEach(f => {
            f['favorite'] = true;
            fav.push(f);
        });
        var all = fav.concat(movies);
        return all;
    }
    getHomeSeriesMixedFavorites(series) {
        var favo = GLOBAL.Favorite_Series;
        var fav = [];
        favo.forEach(f => {
            f['favorite'] = true;
            fav.push(f);
        });
        var all = fav.concat(series);
        return all;
    }
    getCatchupChannel(channel_id) {
        var channel = GLOBAL.Channels_Selected.find(
            ch => ch.channel_id == channel_id,
        );
        if (channel != undefined) {
            if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    getRecording(s, e, n) {
        var recording = GLOBAL.Recordings.find(
            re => re.s == s && re.e == e && re.program_name == n,
        );
        if (recording != undefined) {
            return true;
        } else {
            return false;
        }
    }
    getRecordingInfo(s, e, n) {
        var recording = GLOBAL.Recordings.find(
            re => re.s == s && re.e == e && re.program_name == n,
        );
        if (recording != undefined) {
            return recording;
        } else {
            return null;
        }
    }
    setPositionAndRow(index) {
        if (GLOBAL.Channel_Toggle == 'Toggle View') {
            GLOBAL.Channels_Selected_Row = Math.floor(
                index / (GLOBAL.Device_IsPhone ? 4 : 10),
            );
            GLOBAL.Channels_Selected_Index = index;
        } else {
            GLOBAL.Channels_Selected_Row = Math.floor(
                index /
                    (GLOBAL.Device_IsPhone
                        ? 1
                        : GLOBAL.Device_FormFactor == 'WEB'
                        ? 4
                        : 3),
            );
            GLOBAL.Channels_Selected_Index = index;
        }
    }
    toAlphaNumeric(input) {
        if (input == '' || input == undefined || input == null) {
            return '';
        }
        input = input.toString().replace(/\s/g, '');
        return input.toString().replace(/[^A-Za-z0-9]/g, '');
    }
    closeAppAndLogout() {
        DAL.getDevices(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            this.toAlphaNumeric(GLOBAL.UserID) +
                '.' +
                this.toAlphaNumeric(GLOBAL.Pass),
        ).then(devices => {
            if (devices.devices != undefined && devices.devices != '') {
                var today = moment().utc().unix();
                var devicesLeft = devices.devices.filter(
                    element => element.uuid != GLOBAL.Device_UniqueID,
                );
                var devicesNotToOld = devicesLeft.filter(d => d.valid > today);
                DAL.setDevices(
                    GLOBAL.IMS + '.' + GLOBAL.CRM,
                    this.toAlphaNumeric(GLOBAL.UserID) +
                        '.' +
                        this.toAlphaNumeric(GLOBAL.Pass),
                    devicesNotToOld,
                ).then(() => {
                    GLOBAL.Focus = 'Logout';
                    if (GLOBAL.HasService) {
                        GLOBAL.Logo =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Login.contact.logo;
                        GLOBAL.Background =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Login.contact.background;
                        GLOBAL.Support = GLOBAL.Settings_Login.contact.text;
                    } else {
                        GLOBAL.Logo =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Gui.contact.logo;
                        GLOBAL.Background =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Gui.contact.background;
                        GLOBAL.Support = GLOBAL.Settings_Gui.contact.text;
                    }
                    GLOBAL.App_Theme = 'Default';
                    Actions.Languages();
                });
            }
        });
    }
    logOutUser() {
        GLOBAL.Focus = 'Logout';
        GLOBAL.AutoLogin = false;
        if (GLOBAL.UserID == 'lgapptest' || GLOBAL.UserID == 'tizenapptest') {
            GLOBAL.UserID = '';
            GLOBAL.Pass = '';
            GLOBAL.ServiceID = '';
            UTILS.storeJson('UserID', '');
            UTILS.storeJson('Pass', '');
            UTILS.storeJson('ServiceID', '');
        }
        GLOBAL.App_Theme = 'Default';
        this.storeJson('AutoLogin', false);
        if (GLOBAL.HasService == true) {
            GLOBAL.Logo =
                GLOBAL.HTTPvsHTTPS +
                GLOBAL.Settings_Services_Login.contact.logo
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Background =
                GLOBAL.HTTPvsHTTPS +
                GLOBAL.Settings_Services_Login.contact.background
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Support = GLOBAL.Settings_Services_Login.contact.text;
            Actions.Services();
        } else {
            GLOBAL.Logo =
                GLOBAL.HTTPvsHTTPS +
                GLOBAL.Settings_Services_Login.contact.logo
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Background =
                GLOBAL.HTTPvsHTTPS +
                GLOBAL.Settings_Services_Login.contact.background
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Support = GLOBAL.Settings_Services_Login.contact.text;
            Actions.Authentication();
        }
    }
    refreshUserData() {
        if (GLOBAL.UserID == '') {
            return;
        }
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/customers/' +
            this.toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
            '/' +
            this.toAlphaNumeric(GLOBAL.Pass) +
            '.json';
        DAL.getJson(path).then(data => {
            if (data != undefined) {
                var user = JSON.parse(data);
                var expiring = moment(
                    new Date(user.account.datetime_expired),
                ).format('X');
                var current = moment().format('X');
                var expireTime = expiring - current;
                GLOBAL.User = user;
                GLOBAL.User_Currency = user.customer.currency;

                if (user.account.account_status == 'Disabled') {
                    this.logOutUser();
                } else if (
                    user.account.account_status == 'Expired' ||
                    expireTime < 3600
                ) {
                    this.logOutUser();
                } else {
                    const date = moment().format('DD_MM_YYYY');
                    GLOBAL.Login_Check_Date = date;
                    GLOBAL.Staging = user.account.staging;
                    GLOBAL.ProductID = user.products.productid;
                    GLOBAL.ResellerID = user.account.resellerid;
                    GLOBAL.Recordings = user.recordings;
                    GLOBAL.Storage_Total = user.storage.total;
                    GLOBAL.Storage_Used = user.storage.used;
                    GLOBAL.Storage_Hours = user.storage.total_hours;
                    //GLOBAL.PPV = user.payperview;
                    GLOBAL.Wallet_Credits = user.customer.walletbalance;
                    GLOBAL.Rented_Movies = user.payperview.movies;
                    var messages = user.messages;
                    if (messages != undefined) {
                        messages.forEach(message_ => {
                            var messagesNew = GLOBAL.Messages.find(
                                m =>
                                    m.id == message_.id &&
                                    m.tz == message_.time,
                            );
                            if (messagesNew == undefined) {
                                var new_message = {
                                    id: message_.id,
                                    tz: Number(message_.time),
                                    read: false,
                                    deleted: false,
                                    message: message_.message,
                                    title: message_.message,
                                    image: '',
                                };
                                GLOBAL.Messages.splice(0, 0, new_message);
                            }
                        });
                    }
                    var qty = GLOBAL.Messages.filter(m => m.read == false);
                    GLOBAL.Messages_QTY = qty.length;
                    this.storeJson('Messages', GLOBAL.Messages);
                }
            }
        });
    }
    checkMenuExists(menu) {
        var exist = false;
        GLOBAL.show_log && console.log('check menu exist called');
        var test = GLOBAL.Menu.find(m => m.name == menu);
        if (test != undefined) {
            exist = true;
        }
        return exist;
    }
    getFontExtra(extraBig) {
        if (
            GLOBAL.Device_IsSmartTV &&
            GLOBAL.Device_Manufacturer == 'Samsung Tizen'
        ) {
            return extraBig ? 12 : 10;
        } else if (GLOBAL.Device_IsWebTV) {
            return extraBig ? 6 : 5;
        } else if (GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV) {
            return extraBig ? 1 : -1;
        } else if (GLOBAL.Device_IsAppleTV) {
            return extraBig ? 14 : 12;
        } else if (GLOBAL.Device_IsTablet || GLOBAL.Device_System == 'Apple') {
            return extraBig ? 1 : 0;
        } else if (GLOBAL.Device_IsPhone) {
            return extraBig ? -1 : -2;
        } else {
            return extraBig ? 2 : 1;
        }
    }
}
const utils = new UTILS();
export default utils;
