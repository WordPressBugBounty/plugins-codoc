<?php
/*
Plugin Name: codoc
Plugin URI:  https://plugins.svn.wordpress.org/codoc/
Description: A WordPress plugin for monetizing websites by enabling paid articles, subscriptions(memberships), and tipping.
Author:      codoc.jp
Author URI:  https://codoc.jp
Version:     0.9.60
License:     GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: codoc
*/

defined( 'ABSPATH' ) || exit;

const CODOC_PLUGIN_VERSION        = '0.9.60';
const CODOC_URL                   = 'https://codoc.jp';
const CODOC_USERCODE_OPTION_NAME  = 'codoc_usercode';
const CODOC_AUTHINFO_OPTION_NAME  = 'codoc_authinfo';//認証時データ
const CODOC_TOKEN_OPTION_NAME     = 'codoc_token';   //API用トークン
const CODOC_SETTINGS_OPTION_NAME  = 'codoc_settings';//その他設定値(JSON)
const CODOC_SDK_PATH              = '/sdk/js/sdk.v1';
const CODOC_SUPPORT_ENTRYCODE_OPTION_NAME = 'codoc_support_entrycode';

// API側のバリデーションと合わせる文字数上限 (codocブロックが存在する記事にのみ適用)
const CODOC_MAX_TITLE_LENGTH          = 100;
const CODOC_MAX_BODY_FREE_LENGTH      = 1000000;
const CODOC_MAX_BODY_PAYWALLED_LENGTH = 1000000;
const CODOC_MAX_BODY_LENGTH           = 1500000;
const CODOC_MAX_BINDED_URL_LENGTH     = 255;

if ( version_compare( PHP_VERSION, '5.4', '<' ) )
{
    exit( sprintf( 'The codoc Paywall plugin requires PHP 5.4 or higher. You’re using %s.', PHP_VERSION ) );
}

require_once(plugin_dir_path( __FILE__ ) .'class-codoc.php');
// グローバル変数
$_CODOC = new Codoc;
