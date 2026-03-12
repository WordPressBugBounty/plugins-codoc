<?php
/**
 * Blocks Initializer
 *
 * Enqueue CSS/JS of all the blocks.
 *
 * @since   1.0.0
 * @package CGB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue Gutenberg block assets for backend editor.
 *
 * @uses {wp-blocks} for block type registration & related functions.
 * @uses {wp-element} for WP Element abstraction — structure of blocks.
 * @uses {wp-i18n} to internationalize the block's text.
 * @uses {wp-editor} for WP editor styles.
 * @since 1.0.0
 */
function wordpress_cgb_block_editor_assets() { // phpcs:ignore
	// Scripts and styles for editor only
	wp_enqueue_script(
		'codoc-block-js', // Handle.
		plugins_url( '/dist/blocks.build.js?ver='  . CODOC_PLUGIN_VERSION, dirname( __FILE__ ) ), // Block.build.js: We register the block here. Built with Webpack.
		array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ), // Dependencies, defined above.
		null, // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	// Pass necessary options to JavaScript
	global $_CODOC;
	$auth_info = get_option(CODOC_AUTHINFO_OPTION_NAME);

	$codoc_settings = get_option(CODOC_SETTINGS_OPTION_NAME);
	$block_defaults_raw = isset($codoc_settings['block_defaults']) ? $codoc_settings['block_defaults'] : '';
	$block_defaults_decoded = json_decode($block_defaults_raw, true);
	$block_defaults = is_array($block_defaults_decoded) ? $block_defaults_decoded : new stdClass();
	wp_localize_script('codoc-block-js', 'OPTIONS', array(
		'codoc_url'      => $_CODOC->get_codoc_url(),
		'codoc_usercode' => get_option(CODOC_USERCODE_OPTION_NAME),
		'codoc_plugin_version' => CODOC_PLUGIN_VERSION,
		'codoc_sdk_path'       => defined('CODOC_SDK_PATH') ? CODOC_SDK_PATH : '/sdk/js/sdk.v1.js',
		'codoc_account_is_pro' => isset($auth_info['account_is_pro']) ? $auth_info['account_is_pro'] : 0,
		'codoc_currency_code' => isset($auth_info['currency_code']) ? $auth_info['currency_code'] : 'yen',
		'codoc_currency_decimal_places' => isset($auth_info['currency_decimal_places']) ? $auth_info['currency_decimal_places'] : 0,
		'codoc_block_defaults' => $block_defaults,
	));

	// Set script translations
	wp_set_script_translations('codoc-block-js', 'codoc', plugin_dir_path( dirname(__FILE__) ) . 'languages');

	// Styles for editor only
	wp_enqueue_style(
		'codoc-block-editor-css', // Handle.
		plugins_url( 'dist/blocks.editor.build.css?ver='  . CODOC_PLUGIN_VERSION, dirname( __FILE__ ) ), // Block editor CSS.
		array( 'wp-edit-blocks' ), // Dependency to include the CSS after it.
		null // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.editor.build.css' ) // Version: File modification time.
	);
}

// Hook: Editor assets.
add_action( 'enqueue_block_editor_assets', 'wordpress_cgb_block_editor_assets' );

/**
 * Enqueue Gutenberg block assets for frontend.
 *
 * @since 1.0.0
 */
function wordpress_cgb_block_frontend_assets() { // phpcs:ignore
	// Styles for frontend
	wp_enqueue_style(
		'codoc-style-css', // Handle.
		plugins_url( 'dist/blocks.style.build.css?ver='  . CODOC_PLUGIN_VERSION, dirname( __FILE__ ) ), // Block style CSS.
		array( 'wp-editor' ), // Dependency to include the CSS after it.
		null // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.style.build.css' ) // Version: File modification time.
	);
}

// Hook: Frontend assets.
add_action( 'enqueue_block_assets', 'wordpress_cgb_block_frontend_assets' );
