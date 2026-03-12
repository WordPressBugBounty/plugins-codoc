=== codoc ===
Contributors: codoc
Donate link: https://codoc.jp
Tags: paywall, subscription, membership, tipping, digital downloads
Requires at least: 4.6
Tested up to: 6.8.2
Stable tag: 0.9.58
Requires PHP: 5.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A WordPress plugin for monetizing your website with paid articles, Reader Plans, and tipping.

== Description ==

[codoc](https://codoc.jp) is a simple and powerful WordPress paywall plugin that enables creators to sell paid articles, offer Reader Plans (Subscription / Membership), and accept tips.

Originally built for Japanese creators, codoc is also fully compatible with users in the US/EU.  
Payment is processed via Stripe, and buyers worldwide can purchase using a valid credit card (currency: JPY/USD/EUR).

After setup, the plugin adds a codoc block※ to the post editor.  
※Compatible with both Gutenberg and the Classic Editor (TinyMCE).

### How it works
Content placed **below** the codoc block becomes the paid section and is hidden from non-buyers.  
Content placed **above** remains freely available.

The codoc block:
- displays the purchase interface  
- handles buyer authentication  
- allows per-article settings such as price or Reader Plan availability  
- all revenue/customer management is available on codoc.jp

More details :  
[codoc for WordPress](https://codoc.jp/lp_wp)

Help center :  
[FAQ](https://codoc.jp/docs/faq)

== Features ==

- Article paywall  
- One-time purchases  
- Reader Plans (Subscription / Membership)
- Tipping support  
- Stripe payments (Credit card / Apple Pay / Google Pay / Konibini)  
- Gutenberg & Classic Editor support  
- Featured image support  
- Revenue & customer management via codoc.jp  
- Insert custom HTML before/after codoc tags  
- CSS override support  
- Safe authentication & Stripe-level fraud prevention

== Installation ==

1. Go to **Plugins → Add New** and search for “codoc”.
2. Install and activate the plugin.
3. Go to **Settings → codoc** and log in or register for a codoc account.
4. Continue to the codoc integration page and click **Authenticate**.
5. Return to the codoc settings page and verify that your account shows "**authenticated**".

After setup, search for **codoc** in the block inserter.  
※Classic Editor users will see a codoc button added to the toolbar.

== FAQ ==

= What are the requirements for creators to use codoc? =
Creators must reside in **Japan, the United States, or the EU** and have a bank account in each country.

= Can users outside Supported coutry purchase content? =
Yes. Anyone with a valid credit card can purchase.  
Transactions are processed in **JPY, USD or EUR** .

= Where are article contents stored? =
All content is stored on **both WordPress and codoc**.

= Will publication status sync to codoc? =
Yes.  
If the WordPress article is **published**, it is published on codoc as well.  
Otherwise, it remains **unpublished**.

= What happens to codoc content if the WordPress article is deleted? =
It becomes **unpublished** on codoc.

= How can I preview the article as buyers/non-buyers? =
- As buyer: Click **"Sign in to restore purchase"** and authenticate with your codoc account.  
- As non-buyer: Log out and view the article normally.

= I can see paid content even without purchasing. Why? =
You are logged in as the **codoc creator**, who authored the article.

= Can I use the Classic Editor? =
Yes.  
After integration, a codoc button is added to the toolbar.

If TinyMCE Advanced is installed, enable:  
**"keep paragraph tags in the Classic block and the Classic Editor"**

= Can I use featured images? =
Yes.  
The WordPress featured image is used on codoc.

= Can I customize CSS? =
Yes.  
Specify your custom CSS file in **Settings → codoc**.  
[Base stylesheet](https://codoc.jp/css/paywall.css) 
※HTML output may change without notice.

You can see [sample customized css](https://codoc.jp/me/widgets?mode=theme) on management screen.(sign-in is required)


= Can I change the permalink registered in codoc? =
Permalinks are retrieved via `get_permalink()`.  
If running through reverse proxies or special routing, adjust via codoc’s “Replacement Settings”.

= “This block contains unexpected or invalid content.” appears =
Click **“Attempt Block Recovery”** in the block settings menu.

= Do script tags work? =
Yes.  
External script tags have been supported. (Twitter/Instagram embeds, etc.)

= I want to add buttons at the end of the article =
Blocks added **below** the codoc tag are hidden.  
Use:  
**Settings → codoc → Insert HTML before/after codoc tags**

= Shortcodes are shown as plain text inside paid areas =
Add this to the debug settings:

  { “the_content_filter_priority”: 1000000 }

Increase the value if needed.

== Screenshots ==

1. Paywall section embedded within a WordPress post.

2. Purchase modal supporting one-time payments, Reader Plans, and tips.

3. Tip / Support screen for voluntary contributions.

4. Reader Plan options with pricing and benefits.

5. Unlocked content after successful purchase

6. Post editor settings to enable content sales and set pricing.

7. Classic editor is also supported.

8. Same settings as Gutenberg editor are possible.

9. Plugin settings page with straightforward codoc and Stripe integration

10. Mobile view of the Paywall and purchase interface.

== Changelog ==

= 0.9.51 =

* Support for i18n (internationalization)

= 0.9.3 =

* Added support for limited publication.

= 0.9.13 =

* Added a setting to add attributes to the codoc script tags.

* If a password is specified when posting an article, the article status on codoc will be set as "limited publication".

= 0.9.10 =

* Added support for external service integration.

= 0.9.9 =

* Added support for flexible pricing.

= 0.9.8 =

* Revised the design of the settings page.

* Added functionality to show or hide "Powered By" for likes and codoc in the paywall.

* Added functionality to change the button text in the paywall.

= 0.9.7 =

* Added theme settings.

= 0.9.6 =

* Fixed an issue where the paid part would be displayed without the execution of filters by other plugins.

* Added the option to customize the support button description for the support button auto-insertion.

= 0.9.5 =

* Added an option to automatically insert a support button at the end of the content if the codoc tags are not inserted in the article.

= 0.9.4 =

* Modified to display a "Read More" link when displayed in AMP and redirect to the main site.

= 0.9.3 =

* Fixed a bug where user code and token could not be entered directly.

= 0.9.2 =

* Disabled the codoc button in the Classic Editor (TinyMCE).

= 0.9.1 =

* Fixed a bug where codoc integration was not possible.

* Fixed a bug where authentication could not be canceled.

= 0.9 =

* Refactored program source code.

= 0.8.9 =

* Added the ability to insert HTML before and after codoc tags in the settings page.

= 0.8.8 =

* Fixed an issue causing errors in WordPress versions below 5.

* Fixed an issue where codoc tags did not work in the LP template of the THETHOR theme.

* Changed the attribute position of the cms.js script tag to make the codoc tags work.

= 0.8 =

* Added support for the Classic Editor (TinyMCE).

* Changed the Gutenberg block format accordingly.

= 0.7 =

* Added a settings link to the codoc area in the plugin list.

= 0.6 =

* Added a visual boundary between the free and paid parts in the preview.

= 0.5 =

* Added URL replacement function for registration in codoc.

= 0.4 =

* Minor fixes.

= 0.3 =

* Added codoc block functionality.

= 0.2 =

* Added a setting item for custom CSS path.

= 0.1 =

* Initial release.

== Upgrade Notice ==


`<?php code(); // goes in backticks ?>`
