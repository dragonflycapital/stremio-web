const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('stremio-icons/dom');
const { Button, ColorInput } = require('stremio/common');
const styles = require('./styles');

const SUBTITLES_SIZES = [75, 100, 125, 150, 175, 200, 250];
const ORIGIN_PRIORITIES = {
    'EMBEDDED': 1
};
const LANGUAGE_PRIORITIES = {
    'English': 1
};

const comparatorWithPriorities = (priorities) => {
    return (a, b) => {
        const valueA = priorities[a];
        const valueB = priorities[b];
        if (!isNaN(valueA) && !isNaN(valueB)) return valueA - valueB;
        if (!isNaN(valueA)) return -1;
        if (!isNaN(valueB)) return 1;
        return a - b;
    };
};

const SubtitlesPicker = (props) => {
    const languages = React.useMemo(() => {
        return Array.isArray(props.tracks) ?
            props.tracks.reduce((languages, { lang }) => {
                if (!languages.includes(lang)) {
                    languages.push(lang);
                }

                return languages;
            }, [])
            :
            [];
    }, [props.tracks]);
    const selectedLanguage = React.useMemo(() => {
        return Array.isArray(props.tracks) ?
            props.tracks.reduce((selectedLanguage, { id, lang }) => {
                if (id === props.selectedTrackId) {
                    return lang;
                }

                return selectedLanguage;
            }, null)
            :
            null;
    }, [props.tracks, props.selectedTrackId]);
    const tracksForLanguage = React.useMemo(() => {
        return Array.isArray(props.tracks) && typeof selectedLanguage === 'string' ?
            props.tracks.filter(({ lang }) => {
                return lang === selectedLanguage;
            })
            :
            [];
    }, [props.tracks, selectedLanguage]);
    const offsetDisabled = React.useMemo(() => {
        return typeof selectedLanguage !== 'string' ||
            props.offset === null ||
            isNaN(props.offset);
    }, [selectedLanguage, props.offset]);
    const onMouseDown = React.useCallback((event) => {
        event.nativeEvent.subtitlesPickerClosePrevented = true;
    }, []);
    const languageOnClick = React.useCallback((event) => {
        const trackId = Array.isArray(props.tracks) ?
            props.tracks.reduceRight((trackId, track) => {
                if (track.lang === event.currentTarget.dataset.lang) {
                    return track.id;
                }

                return trackId;
            }, null)
            :
            null;
        props.onTrackSelected(trackId);
    }, [props.tracks, props.onTrackSelected]);
    const trackOnClick = React.useCallback((event) => {
        props.onTrackSelected(event.currentTarget.dataset.trackId);
    }, [props.onTrackSelected]);
    const onOffsetButtonClicked = React.useCallback((event) => {
        if (props.offset !== null && !isNaN(props.offset)) {
            const offset = props.offset + parseInt(event.currentTarget.dataset.offset);
            if (typeof props.onOffsetChanged === 'function') {
                props.onOffsetChanged(offset);
            }
        }
    }, [props.offset, props.onOffsetChanged]);
    return (
        <div className={classnames(props.className, styles['subtitles-picker-container'])} onMouseDown={onMouseDown}>
            <div className={styles['languages-container']}>
                <div className={styles['languages-header']}>Languages</div>
                <div className={styles['languages-list']}>
                    <Button title={'Off'} className={classnames(styles['language-option'], { 'selected': selectedLanguage === null })} onClick={languageOnClick}>
                        <div className={styles['language-label']}>Off</div>
                        {
                            typeof selectedLanguage !== 'string' ?
                                <div className={styles['icon']} />
                                :
                                null
                        }
                    </Button>
                    {languages.map((lang, index) => (
                        <Button key={index} title={lang} className={classnames(styles['language-option'], { 'selected': selectedLanguage === lang })} data-lang={lang} onClick={languageOnClick}>
                            <div className={styles['language-label']}>{lang}</div>
                            {
                                selectedLanguage === lang ?
                                    <div className={styles['icon']} />
                                    :
                                    null
                            }
                        </Button>
                    ))}
                </div>
            </div>
            <div className={styles['variants-container']}>
                <div className={styles['variants-header']}>Variants</div>
                {
                    tracksForLanguage.length > 0 ?
                        <div className={styles['variants-list']}>
                            {tracksForLanguage.map((track, index) => (
                                <Button key={index} title={track.origin} className={classnames(styles['variant-option'], { 'selected': track.id === props.selectedTrackId })} data-track-id={track.id} onClick={trackOnClick}>
                                    <div className={styles['variant-label']}>{track.origin}</div>
                                    {
                                        props.selectedTrackId === track.id ?
                                            <div className={styles['icon']} />
                                            :
                                            null
                                    }
                                </Button>
                            ))}
                        </div>
                        :
                        <div className={styles['no-variants-container']}>
                            <div className={styles['no-variants-label']}>
                                Subtitles are disabled
                            </div>
                        </div>
                }
            </div>
            <div className={styles['subtitles-settings-container']}>
                <div className={styles['settings-header']}>Settings</div>
                <div className={styles['option-header']}>Delay</div>
                <div className={styles['option-container']}>
                    <Button className={styles['button-container']}>
                        <Icon className={styles['icon']} icon={'ic_minus'} />
                    </Button>
                    <div className={styles['option-label']} title={'150s'}>150s</div>
                    <Button className={styles['button-container']}>
                        <Icon className={styles['icon']} icon={'ic_plus'} />
                    </Button>
                </div>
                <div className={styles['option-header']}>Size</div>
                <div className={styles['option-container']}>
                    <Button className={styles['button-container']}>
                        <Icon className={styles['icon']} icon={'ic_minus'} />
                    </Button>
                    <div className={styles['option-label']} title={'100%'}>100%</div>
                    <Button className={styles['button-container']}>
                        <Icon className={styles['icon']} icon={'ic_plus'} />
                    </Button>
                </div>
                <div className={classnames(styles['option-header'], { 'disabled': offsetDisabled })}>Vertical position</div>
                <div className={classnames(styles['option-container'], { 'disabled': offsetDisabled })} title={offsetDisabled ? 'Vertical position is not configurable' : null}>
                    <Button className={classnames(styles['button-container'], { 'disabled': offsetDisabled })} data-offset={-1} onClick={onOffsetButtonClicked}>
                        <Icon className={styles['icon']} icon={'ic_minus'} />
                    </Button>
                    <div className={styles['option-label']} title={props.offset !== null && !isNaN(props.offset) ? `${props.offset}%` : null}>
                        {props.offset !== null && !isNaN(props.offset) ? `${props.offset}%` : '--'}
                    </div>
                    <Button className={classnames(styles['button-container'], { 'disabled': offsetDisabled })} data-offset={1} onClick={onOffsetButtonClicked}>
                        <Icon className={styles['icon']} icon={'ic_plus'} />
                    </Button>
                </div>
                <div className={styles['spacing']} />
                <Button className={styles['advanced-button']}>Advanced</Button>
            </div>
        </div>
    );
};

SubtitlesPicker.propTypes = {
    className: PropTypes.string,
    tracks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        lang: PropTypes.string.isRequired,
        origin: PropTypes.string.isRequired
    })),
    selectedTrackId: PropTypes.string,
    offset: PropTypes.number,
    size: PropTypes.number,
    felay: PropTypes.number,
    textColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    outlineColor: PropTypes.string,
    onTrackSelected: PropTypes.func,
    onOffsetChanged: PropTypes.func
};

module.exports = SubtitlesPicker;
