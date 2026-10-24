/**
 * BLOCK: codoc-block
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './style.scss';
import './editor.scss';
import icon from './icon';
//import { ENTER } from '@wordpress/keycodes';
const { ENTER } = wp.keycodes;
const { __ } = wp.i18n; // Import __() from wp.i18n
const { Component } = wp.element;

const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
// WordPress 5.3 以降は wp.blockEditor、それ以前は wp.editor から取得
const {
  InspectorControls,
  RichText
} = wp.blockEditor || wp.editor;

const {
  SelectControl,
  PanelBody,
  ToggleControl,
  CheckboxControl,
  RangeControl,
  TextControl,
  Notice,
} = wp.components;

const { withSelect } = wp.data;

const {
	getDefaultBlockName,
	createBlock,
} = wp.blocks;

const CODOC_URL = OPTIONS.codoc_url;
const CODOC_USER_CODE = OPTIONS.codoc_usercode;
const CODOC_PLUGIN_VERSION = OPTIONS.codoc_plugin_version;
const CODOC_ENTRIES_CLASS = 'codoc-entries';
const CODOC_ACCOUNT_IS_PRO = OPTIONS.codoc_account_is_pro;
const CODOC_CURRENCY_CODE = OPTIONS.codoc_currency_code;
const CODOC_CURRENCY_DECIMAL_PLACES = OPTIONS.codoc_currency_decimal_places;

//import Cookies from 'universal-cookie';
//const cookies = new Cookies();

const CODOC_MAX_LENGTHS = OPTIONS.codoc_max_lengths || {};

// エディタで前回使った設定を localStorage に保存し、新規ブロックの初期値に使う
// (優先順位: 設定画面の Block Default Values -> 前回値 -> 固定値)
const CODOC_LAST_USED_KEY = 'codoc_block_last_used';
const CODOC_LAST_USED_ATTRS = ['showPrice','price','limited','limitedCount','affiliateMode','affiliateRate','showSupport','showPaywalledSupport','showPayWithoutAccountButton','statusLimited','subscriptions'];
function loadLastUsedAttributes() {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(CODOC_LAST_USED_KEY) || 'null');
        return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
        return {};
    }
}
function saveLastUsedAttributes(attributes) {
    try {
        const saved = {};
        CODOC_LAST_USED_ATTRS.forEach((key) => {
            if (attributes[key] !== undefined && attributes[key] !== null) {
                saved[key] = attributes[key];
            }
        });
        window.localStorage.setItem(CODOC_LAST_USED_KEY, JSON.stringify(saved));
    } catch (e) {
        // localStorage が使えない環境では何もしない
    }
}

// codoc ブロックの直前/直後で本文を分割
function splitCodocContent(content) {
    const blockRegex = /<!--\s*wp:codoc\/codoc-block[\s\S]*?<!--\s*\/wp:codoc\/codoc-block\s*-->/;
    const splited = (content || '').split(blockRegex);
    return {
        bodyFree:      splited[0] || '',
        bodyPaywalled: splited.slice(1).join('') || '',
    };
}

function buildLengthErrors(title, bodyFree, bodyPaywalled) {
    const errors = [];
    const total = bodyFree.length + bodyPaywalled.length;
    if (CODOC_MAX_LENGTHS.title && title.length > CODOC_MAX_LENGTHS.title) {
        errors.push(__('Title exceeds the maximum length of', 'codoc') + ' ' + CODOC_MAX_LENGTHS.title + ' (' + title.length + ')');
    }
    if (CODOC_MAX_LENGTHS.body_free && bodyFree.length > CODOC_MAX_LENGTHS.body_free) {
        errors.push(__('Free area exceeds the maximum length of', 'codoc') + ' ' + CODOC_MAX_LENGTHS.body_free + ' (' + bodyFree.length + ')');
    }
    if (CODOC_MAX_LENGTHS.body_paywalled && bodyPaywalled.length > CODOC_MAX_LENGTHS.body_paywalled) {
        errors.push(__('Paid area exceeds the maximum length of', 'codoc') + ' ' + CODOC_MAX_LENGTHS.body_paywalled + ' (' + bodyPaywalled.length + ')');
    }
    if (CODOC_MAX_LENGTHS.body && total > CODOC_MAX_LENGTHS.body) {
        errors.push(__('Total body exceeds the maximum length of', 'codoc') + ' ' + CODOC_MAX_LENGTHS.body + ' (' + total + ')');
    }
    return errors;
}

// codoc ブロック選択時の Inspector サイドバーに警告を表示する
const CodocLengthNotices = withSelect((select) => {
    const editor = select('core/editor');
    return {
        postTitle:   editor ? editor.getEditedPostAttribute('title')   : '',
        postContent: editor ? editor.getEditedPostAttribute('content') : '',
    };
})(({ postTitle, postContent }) => {
    const { bodyFree, bodyPaywalled } = splitCodocContent(postContent);
    const errors = buildLengthErrors(postTitle || '', bodyFree, bodyPaywalled);
    if (errors.length === 0) {
        return null;
    }
    return (
        <Notice status="error" isDismissible={ false }>
            <strong>{ __('codoc length limit exceeded:', 'codoc') }</strong>
            <ul style={{ marginTop: '0.5em', marginBottom: 0 }}>
                { errors.map((e, i) => <li key={i}>{ e }</li>) }
            </ul>
        </Notice>
    );
});

// codoc ブロックを選択していなくても、本文中に存在すればエディタ上部に通知を表示する
(function() {
    if (!wp.data || !wp.data.subscribe) {
        return;
    }
    const NOTICE_ID = 'codoc-length-limit';
    let lastState = '';
    wp.data.subscribe(function() {
        const editor = wp.data.select('core/editor');
        const blockEditor = wp.data.select('core/block-editor') || wp.data.select('core/editor');
        const noticesDispatch = wp.data.dispatch('core/notices');
        if (!editor || !blockEditor || !noticesDispatch) {
            return;
        }
        const blocks = blockEditor.getBlocks ? blockEditor.getBlocks() : [];
        const hasCodocBlock = blocks.some(function(b) { return b && b.name === 'codoc/codoc-block'; });
        if (!hasCodocBlock) {
            if (lastState !== '') {
                noticesDispatch.removeNotice(NOTICE_ID);
                lastState = '';
            }
            return;
        }
        const title   = editor.getEditedPostAttribute('title')   || '';
        const content = editor.getEditedPostAttribute('content') || '';
        const { bodyFree, bodyPaywalled } = splitCodocContent(content);
        const errors = buildLengthErrors(title, bodyFree, bodyPaywalled);
        const state = errors.join('||');
        if (state === lastState) {
            return;
        }
        lastState = state;
        noticesDispatch.removeNotice(NOTICE_ID);
        if (errors.length > 0) {
            noticesDispatch.createNotice(
                'error',
                __('codoc length limit exceeded:', 'codoc') + ' ' + errors.join(' / '),
                { id: NOTICE_ID, isDismissible: false }
            );
        }
    });
})();

// 読者プランのチェックボックス一覧 (選択状態はブロック属性 subscriptions をそのまま使う)
function SubscriptionCheckBoxes( { subscriptions, items, searchTerm, onChange } ) {
    const checked_obj = subscriptions || {};
    const checkedCount = Object.keys(checked_obj).length;
    return (
        <div>
        {items.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#666' }}>
                { searchTerm
                    ? __('No plans found matching your search.','codoc')
                    : __('No reader plans available.','codoc')
                }
            </p>
        ) : (
        <ul>
        {
            items.map((v) => (
                <li key={v.value}>
                <CheckboxControl
                className="check_items"
                label={v.label}
                checked={ !! checked_obj[v.value] }
                onChange={(check) => {
                    // 追加する場合、5個以上は無効
                    if (check && checkedCount >= 5) {
                        return; // これ以上チェックできない
                    }

                    const newChecked = { ...checked_obj };

                    if (check) {
                        newChecked[v.value] = true;
                    } else {
                        delete newChecked[v.value];
                    }

                    onChange(newChecked);
                }}
                />
                </li>
            ))
        }
        </ul>
        )}
        </div>
    );
}

class CodocControls extends Component {
    constructor( props ) {
        super( ...arguments );
        this.subscriptionsFetched = [];
        this.subscriptionSearchTerm = '';
        this.state = {
            searchTerm: '',
            filteredSubscriptions: []
        };
        this.fetchSubscriptions();
        this.handleSearchChange = this.handleSearchChange.bind(this);
    }

    fetchSubscriptions(searchTitle = '') {
        const {
            setAttributes,
            attributes: {
                fetching,
            }
        } = this.props;

        if (fetching) {
            return
        }

        setAttributes( { fetching: true } )
        let url = CODOC_URL + '/api/v1/cms/' + CODOC_USER_CODE + '/subscriptions?without_token=1';

        // Add title parameter if search term exists
        if (searchTitle) {
            url += '&title=' + encodeURIComponent(searchTitle);
        }

        fetch(url)
            .then( res => res.json() )
            .then( res => {
                let list = [];
                if (res.status && res.subscriptions) {
                    for (  var i = 0;  i < res.subscriptions.length;  i++  ) {
                        let info = {
                            value: res.subscriptions[i].code,
                            label: res.subscriptions[i].title,
                            term: res.subscriptions[i].term,
                            price: res.subscriptions[i].price,
                            currency: res.subscriptions[i].currency
                        }
                        list[i] = info
                    }
                }
                if (list.length || searchTitle) {
                    this.subscriptionsFetched = list;
                    this.setState({ filteredSubscriptions: list });
                }
                setAttributes( { fetching: false } )
            })
    }

    handleSearchChange(value) {
        this.setState({ searchTerm: value });

        // Debounce the API call
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.fetchSubscriptions(value);
        }, 500);
    }

	getShowPriceHelp( checked ) {
		return checked ?
			__( 'Enable','codoc' ) :
			__( 'Disable','codoc' );
	}
	getShowSupportHelp( checked ) {
		return checked ?
			__( 'Accept' ,'codoc') :
			__( 'Do not accept' ,'codoc');
	}
	getShowPaywalledSupportHelp( checked ) {
		return checked ?
			__( 'The paid part will be hidden upon access, but will be displayed after tapping "Pay to Read". Viewers can freely specify the amount to purchase based on the content. Please note that there may be cases where it is not purchased.' ,'codoc') :
			__( ' ' );
	}
	getStatusLimitedHelp( checked ) {
		return checked ?
			__( 'Unlisted' ,'codoc') :
			__( 'Published' ,'codoc');
	}
	getShowPayWithoutAccountButtonHelp( checked ) {
		return checked ?
			__( 'Viewers can purchase without a codoc account.' ,'codoc') :
			__( 'Viewers must log in to codoc to purchase.' ,'codoc');
	}

    render() {
        const {
            setAttributes: setBlockAttributes,
            attributes: {
                showPrice,
                price,
                limited,
                limitedCount,

                affiliateMode,
                affiliateRate,

                showSupport,
                showPaywalledSupport,
                showPayWithoutAccountButton,
                statusLimited,
                subscriptions,
            }
        } = this.props;
        // 設定変更のたびに前回値として保存
        const setAttributes = (attrs) => {
            setBlockAttributes(attrs);
            saveLastUsedAttributes(Object.assign({}, this.props.attributes, attrs));
        };

        const toggleShowPrice   = () => setAttributes( { showPrice: ! showPrice } );
        const toggleLimited     = () => setAttributes( { limited: ! limited } );
        const toggleShowPaywalledSupport  = () => setAttributes( { showPaywalledSupport: ! showPaywalledSupport } );
        const toggleStatusLimited  = () => setAttributes( { statusLimited: ! statusLimited } );
        const toggleAffiliateMode  = () => setAttributes( { affiliateMode: ! affiliateMode } );
        const toggleShowSupport = () => setAttributes( { showSupport: ! showSupport } );
        const toggleShowPayWithoutAccountButton = () => setAttributes( { showPayWithoutAccountButton: ! showPayWithoutAccountButton } );

        const affiliateRateOptions = [
            { value: '0.0500', label:'5%' },
            { value: '0.1000', label:'10%' },
            { value: '0.1500', label:'15%' },
            { value: '0.2000', label:'20%' },
            { value: '0.2500', label:'25%' },
            { value: '0.3000', label:'30%' },
            { value: '0.3500', label:'35%' },
            { value: '0.4000', label:'40%' },
            { value: '0.4500', label:'45%' },
            { value: '0.5000', label:'50%' },
        ];

        return(
            <InspectorControls key="CodocControls">

            <CodocLengthNotices />

            <PanelBody>

			<ToggleControl
			label={ __( 'individual sale','codoc' ) }
			checked={ !! showPrice }
            help={ this.getShowPriceHelp }
            onChange={ toggleShowPrice }
			/>

            <div style={{ display: showPrice ? 'initial' : 'none' }}>
			<RangeControl
			label={ __('price','codoc') + ' ' + (CODOC_CURRENCY_DECIMAL_PLACES > 0 ? (price / 100).toFixed(CODOC_CURRENCY_DECIMAL_PLACES) : price) + ' ' + __(CODOC_CURRENCY_CODE) +  __(showPaywalledSupport ? '【' + __('Displayed as the your suggested price','codoc') + '】' : '' ) }
			value={ price }
            initialPosition={ price }
            onChange={ ( value ) => {
                // do validate this
                setAttributes({ price: value });
            }}
			min="100"
			max={ CODOC_ACCOUNT_IS_PRO == 1 ? 100000 : 50000 }
			/><br />
               
            <ToggleControl
			label={ __( 'Pay-what-you-want','codoc' ) }
			checked={ !! showPaywalledSupport }
            help={ this.getShowPaywalledSupportHelp }            
            onChange={ toggleShowPaywalledSupport }
			/>

            <div style={{ display: showPaywalledSupport ? 'none' : 'initial' }}>
            <ToggleControl
			label={ __( 'Limited quantity sale','codoc' ) }
			checked={ !! limited }
            onChange={ toggleLimited }
			/>

            <div style={{ display: limited ? 'initial' : 'none' }}>
			<RangeControl
			label={ __( 'Limited quantity','codoc' ) }
			value={ limitedCount }
            onChange={ ( value ) => {
                // do validate this
                setAttributes({ limitedCount: value });
            }}
            initialPosition={ limitedCount }
			min="0"
			max="100"
			/><br />
            </div>

            <ToggleControl
			label={ __( 'Affiliate','codoc' ) }
			checked={ !! affiliateMode }
            onChange={ toggleAffiliateMode }
			/>

            <div style={{ display: affiliateMode ? 'initial' : 'none' }}>
            <SelectControl
            label={ __( 'Rate' , 'codoc') }
            description={ __( 'You can offer affiliate marketing at a specified rate for purchasers.', 'codoc') }
            options={ affiliateRateOptions }
            value={ affiliateRate }
            onChange={ ( value ) => {
                setAttributes( { affiliateRate: value } );
             }}/><br />
            </div>

            </div>
            </div>

            <div style={{ display: showPaywalledSupport ? 'none' : 'initial' }}>            
			<ToggleControl
			label={ __( 'Tipping', 'codoc') }
			checked={ !! showSupport }
            value="1"
			onChange={ toggleShowSupport }
			help={ this.getShowSupportHelp }
				/>
                </div>

            <div style={{ display: 'initial' }}>
			<ToggleControl
			label={ __( 'Guest purchase', 'codoc') }
			checked={ !! showPayWithoutAccountButton }
            value="1"
			onChange={ toggleShowPayWithoutAccountButton }
			help={ this.getShowPayWithoutAccountButtonHelp }
				/>
                </div>
                
            <div style={{ display: 'initial' }}>            
			<ToggleControl
			label={ __( 'Unlisted','codoc' ) }
			checked={ !! statusLimited }
            value="1"
			onChange={ toggleStatusLimited }
			help={ this.getStatusLimitedHelp }
				/>
            </div>
                
          <div className="codoc-subscription-title">
            <label>
            { __('Reader Plans','codoc') }
            </label>
            <a
            href={ CODOC_URL + '/me/subscriptions'}
            target="_blank" rel="noopener noreferrer" className="codoc-subscription-add"
            >
            { __('Add','codoc') }
            </a>
          </div>

            <TextControl
                label={ __('Search Plans','codoc') }
                value={ this.state.searchTerm }
                onChange={ this.handleSearchChange }
                placeholder={ __('Enter title to search...','codoc') }
            />

            <SubscriptionCheckBoxes
                subscriptions={ subscriptions }
                items={ this.state.filteredSubscriptions }
                searchTerm={ this.state.searchTerm }
                onChange={ ( newChecked ) => setAttributes( { subscriptions: newChecked } ) }
            />


            </PanelBody>
            </InspectorControls>
        );
    }
};

class EditBlockContent extends Component {
	constructor() {
		super( ...arguments );
        // デフォルト値
        const bd = OPTIONS.codoc_block_defaults || {};
        const lu = loadLastUsedAttributes();
        const d = (key, fallback) => bd.hasOwnProperty(key) ? bd[key] : (lu.hasOwnProperty(key) ? lu[key] : fallback);
        this.props.setAttributes({ version: CODOC_PLUGIN_VERSION });
        this.props.setAttributes({ showPrice: this.props.attributes.showPrice == null ? d('showPrice', true) : this.props.attributes.showPrice });
        this.props.setAttributes({ price: this.props.attributes.price == null ? d('price', 500) : this.props.attributes.price });
        this.props.setAttributes({ limited: this.props.attributes.limited == null ? d('limited', false) : this.props.attributes.limited });
        this.props.setAttributes({ limitedCount: this.props.attributes.limitedCount == null ? d('limitedCount', 10) : this.props.attributes.limitedCount });
        this.props.setAttributes({ affiliateMode: this.props.attributes.affiliateMode == null ? d('affiliateMode', false) : this.props.attributes.affiliateMode });
        this.props.setAttributes({ affiliateRate: this.props.attributes.affiliateRate == null ? d('affiliateRate', '0.0500') : this.props.attributes.affiliateRate });
        this.props.setAttributes({ showSupport: this.props.attributes.showSupport == null ? d('showSupport', false) : this.props.attributes.showSupport });
        this.props.setAttributes({ showPaywalledSupport: this.props.attributes.showPaywalledSupport == null ? d('showPaywalledSupport', false) : this.props.attributes.showPaywalledSupport });
        this.props.setAttributes({ statusLimited: this.props.attributes.statusLimited == null ? d('statusLimited', false) : this.props.attributes.statusLimited });
        this.props.setAttributes({ showPayWithoutAccountButton: this.props.attributes.showPayWithoutAccountButton == null ? d('showPayWithoutAccountButton', true) : this.props.attributes.showPayWithoutAccountButton });
        this.props.setAttributes({ subscriptions: this.props.attributes.subscriptions == null ? d('subscriptions', {}) : this.props.attributes.subscriptions });

		this.onChangeInput = this.onChangeInput.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.state =  {
			defaultText: __( 'To continue reading, ...','codoc' ),
		};
	}
	onChangeInput( event ) {
		this.setState( {
			defaultText: '',
		} );

		const value = event.target.value.length === 0 ? undefined : event.target.value;
		this.props.setAttributes( { customText: value } );
	}
	onKeyDown( event ) {
		const { keyCode } = event;
		const { insertBlocksAfter } = this.props;
		if ( keyCode === ENTER ) {
			insertBlocksAfter( [ createBlock( getDefaultBlockName() ) ] );
		}
	}

    render() {
        const {
            attributes: {
                customText,
            },
            setAttributes
        } = this.props;

		const { defaultText } = this.state;
		//const value = customText !== undefined ? customText : defaultText;
        const value = customText  ? customText : defaultText;
        //const value = defaultText;
		const inputLength = value.length + 10;

        return[
            <CodocControls { ...{setAttributes, ...this.props } } />,

            <div className="wp-block-more">
			<input
			type="text"
			value={ value }
			size={ inputLength }
			onChange={ this.onChangeInput }
			onKeyDown={ this.onKeyDown }
			/>
			</div>

        ];
    }
};


registerBlockType( 'codoc/codoc-block', {
    title: __( 'codoc' ,'codoc'),
    description: __( 'The area from this block down is a paid area that only authenticated codoc users can view.','codoc' ),
    icon,
    category: 'layout',
	supports: {
		customClassName: false,
		className: false,
		html: false,
		multiple: false,
	},
    keywords: [
        __( 'codoc Block' ,'codoc'),
        __( 'plugin for codoc' ,'codoc'),
        __( 'codoc-block' ,'codoc'),
    ],
    attributes: {
        showPrice: {
            type: 'boolean',
            default: null,
        },
        price: {
            type: 'number',
            default: null,
        },
        limited: {
            type: 'boolean',
            default: null,
        },
        limitedCount: {
            type: 'number',
            default: null,
        },
        affiliateMode: {
            type: 'boolean',
            default: null,
        },
        affiliateRate: {
            type: 'string',
            default: null,
        },
        showSupport: {
            type: 'boolean',
            default: null,
        },
        showPaywalledSupport: {
            type: 'boolean',
            default: null,
        },
        statusLimited: {
            type: 'boolean',
            default: null,
        },
        showPayWithoutAccountButton: {
            type: 'boolean',
            default: null,
        },
        subscriptions: {
            type: 'object',
            default: null,
        },
        customText: {
            type: 'string',
            default: '',
        },
        version: {
            type: 'string',
            default: null,
        },
    },

    edit: EditBlockContent,

    save: function( props ) {
        const {
            setAttributes,
            attributes: {
                customText,
            }
        } = props;
        return ( // return if link behavior normal
            <div
            data-id='codoc-tag'
            className={ CODOC_ENTRIES_CLASS }
            >
            { customText && !! customText.length && (
                <RichText.Content
                value={ customText }
                />
            )}
            </div>
        )
    },
} );
