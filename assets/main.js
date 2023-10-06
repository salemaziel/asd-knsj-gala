/* License: MIT */

(() => {

	// Main.
	const on = addEventListener;
	const $ = (q) => document.querySelector(q);
	const $$ = (q) => document.querySelectorAll(q);
	const $body = document.body;
	const $inner = $('.inner');
	const client = ((() => {
		
		const o = {
			browser: 'other',
			browserVersion: 0,
			os: 'other',
			osVersion: 0,
			mobile: false,
			canUse: null,
			flags: {
				lsdUnits: false,
			},
		};
		const ua = navigator.userAgent;
		let a;
		let i;
		
		// browser, browserVersion.
			a = [
				[
					'firefox',
					/Firefox\/([0-9\.]+)/
				],
				[
					'edge',
					/Edge\/([0-9\.]+)/
				],
				[
					'safari',
					/Version\/([0-9\.]+).+Safari/
				],
				[
					'chrome',
					/Chrome\/([0-9\.]+)/
				],
				[
					'chrome',
					/CriOS\/([0-9\.]+)/
				],
				[
					'ie',
					/Trident\/.+rv:([0-9]+)/
				]
			];
		
			for (i=0; i < a.length; i++) {
		
				if (ua.match(a[i][1])) {
		
					o.browser = a[i][0];
					o.browserVersion = parseFloat(RegExp.$1);
		
					break;
		
				}
		
			}
		
		// os, osVersion.
			a = [
				[
					'ios',
					/([0-9_]+) like Mac OS X/,
					(v) => v.replace('_', '.').replace('_', '')
				],
				[
					'ios',
					/CPU like Mac OS X/,
					(v) => 0
				],
				[
					'ios',
					/iPad; CPU/,
					(v) => 0
				],
				[
					'android',
					/Android ([0-9\.]+)/,
					null
				],
				[
					'mac',
					/Macintosh.+Mac OS X ([0-9_]+)/,
					(v) => v.replace('_', '.').replace('_', '')
				],
				[
					'windows',
					/Windows NT ([0-9\.]+)/,
					null
				],
				[
					'undefined',
					/Undefined/,
					null
				]
			];
		
			for (i=0; i < a.length; i++) {
		
				if (ua.match(a[i][1])) {
		
					o.os = a[i][0];
					o.osVersion = parseFloat( a[i][2] ? (a[i][2])(RegExp.$1) : RegExp.$1 );
		
					break;
		
				}
		
			}
		
			// Hack: Detect iPads running iPadOS.
				if (o.os == 'mac'
				&&	('ontouchstart' in window)
				&&	(
		
					// 12.9"
						(screen.width == 1024 && screen.height == 1366)
					// 10.2"
						||	(screen.width == 834 && screen.height == 1112)
					// 9.7"
						||	(screen.width == 810 && screen.height == 1080)
					// Legacy
						||	(screen.width == 768 && screen.height == 1024)
		
				))
					o.os = 'ios';
		
		// mobile.
			o.mobile = (o.os == 'android' || o.os == 'ios');
		
		// canUse.
		const _canUse = document.createElement('div');
		
			o.canUse = (property, value) => {
		
				const style = _canUse.style;
		
				// Property doesn't exist? Can't use it.
					if (!(property in style))
						return false;
		
				// Value provided?
					if (typeof value !== 'undefined') {
		
						// Assign value.
							style[property] = value;
		
						// Value is empty? Can't use it.
							if (style[property] == '')
								return false;
		
					}
		
				return true;
		
			};
		
		// flags.
			o.flags.lsdUnits = o.canUse('width', '100dvw');
		
		return o;
		
	})());
	const trigger = (t) => {
		dispatchEvent(new Event(t));
	};
	const cssRules = (selectorText) => {
		
		const ss = document.styleSheets;
		const a = [];
		var f = (s) => {
		
			const r = s.cssRules;
			let i;
		
			for (i=0; i < r.length; i++) {
		
				if (r[i] instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches)
					(f)(r[i]);
				else if (r[i] instanceof CSSStyleRule && r[i].selectorText == selectorText)
					a.push(r[i]);
		
			}
		
		};
		let x;
		let i;
		
		for (i=0; i < ss.length; i++)
			f(ss[i]);
		
		return a;
		
	};
	const thisHash = () => {
		
		let h = location.hash ? location.hash.substring(1) : null;
		let a;
		
		// Null? Bail.
			if (!h)
				return null;
		
		// Query string? Move before hash.
			if (h.match(/\?/)) {
		
				// Split from hash.
					a = h.split('?');
					h = a[0];
		
				// Update hash.
					history.replaceState(undefined, undefined, `#${h}`);
		
				// Update search.
					window.location.search = a[1];
		
			}
		
		// Prefix with "x" if not a letter.
			if (h.length > 0
			&&	!h.match(/^[a-zA-Z]/))
				h = `x${h}`;
		
		// Convert to lowercase.
			if (typeof h == 'string')
				return h.toLowerCase();
		
		return h;
		
	};
	const scrollToElement = (e, style, duration) => {
		
		let y;
		let cy;
		let dy;
		let start;
		let easing;
		let offset;
		let f;
		
		// Element.
		
			// No element? Assume top of page.
				if (e)
					{
		
					offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset) : 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
		
					switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {
		
						case 'default':
						default:
		
							y = e.offsetTop + offset;
		
							break;
		
						case 'center':
		
							y = e.offsetHeight < window.innerHeight ? e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2) + offset : e.offsetTop - offset;
		
							break;
		
						case 'previous':
		
							y = e.previousElementSibling ? e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset : e.offsetTop + offset;
		
							break;
		
					}
		
				}
				else y = 0;
		
			// Otherwise ...
		
		// Style.
			if (!style)
				style = 'smooth';
		
		// Duration.
			if (!duration)
				duration = 750;
		
		// Instant? Just scroll.
			if (style == 'instant') {
		
				window.scrollTo(0, y);
				return;
		
			}
		
		// Get start, current Y.
			start = Date.now();
			cy = window.scrollY;
			dy = y - cy;
		
		// Set easing.
			switch (style) {
		
				case 'linear':
					easing = (t) => t;
					break;
		
				case 'smooth':
					easing = (t) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
					break;
		
			}
		
		// Scroll.
			f = () => {
		
				const t = Date.now() - start;
		
				// Hit duration? Scroll to y and finish.
					if (t >= duration)
						window.scroll(0, y);
		
				// Otherwise ...
					else {
		
						// Scroll.
							window.scroll(0, cy + (dy * easing(t / duration)));
		
						// Repeat.
							requestAnimationFrame(f);
		
					}
		
			};
		
			f();
		
	};
	const scrollToTop = () => {
		
		// Scroll to top.
			scrollToElement(null);
		
	};
	const loadElements = (parent) => {
		
		let a;
		let e;
		let x;
		let i;
		
		// IFRAMEs.
		
			// Get list of unloaded IFRAMEs.
				a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
		
			// Step through list.
				for (i=0; i < a.length; i++) {
		
					// Load.
						a[i].contentWindow.location.replace(a[i].dataset.src);
		
					// Save initial src.
						a[i].dataset.initialSrc = a[i].dataset.src;
		
					// Mark as loaded.
						a[i].dataset.src = '';
		
				}
		
		// Video.
		
			// Get list of videos (autoplay).
				a = parent.querySelectorAll('video[autoplay]');
		
			// Step through list.
				for (i=0; i < a.length; i++) {
		
					// Play if paused.
						if (a[i].paused)
							a[i].play();
		
				}
		
		// Autofocus.
		
			// Get first element with data-autofocus attribute.
				e = parent.querySelector('[data-autofocus="1"]');
		
			// Determine type.
				x = e ? e.tagName : null;
		
				if (x === 'FORM') {
					
					// Get first input.
					e = e.querySelector('.field input, .field select, .field textarea');
		
					// Found? Focus.
					if (e)
					e.focus();
				}
		
	};
	const unloadElements = (parent) => {
		
		let a;
		let e;
		let x;
		let i;
		
		// IFRAMEs.
		
			// Get list of loaded IFRAMEs.
				a = parent.querySelectorAll('iframe[data-src=""]');
		
			// Step through list.
				for (i=0; i < a.length; i++) {
		
					// Don't unload? Skip.
						if (a[i].dataset.srcUnload === '0')
							continue;
		
					// Mark as unloaded.
		
						// IFRAME was previously loaded by loadElements()? Use initialSrc.
							a[i].dataset.src = 'initialSrc' in a[i].dataset ? a[i].dataset.initialSrc : a[i].src;
		
					// Unload.
						a[i].contentWindow.location.replace('about:blank');
		
				}
		
		// Video.
		
			// Get list of videos.
				a = parent.querySelectorAll('video');
		
			// Step through list.
				for (i=0; i < a.length; i++) {
		
					// Pause if playing.
						if (!a[i].paused)
							a[i].pause();
		
				}
		
		// Autofocus.
		
			// Get focused element.
				e = $(':focus');
		
			// Found? Blur.
				if (e)
					e.blur();
		
		
	};
		
			// Expose scrollToElement.
				window._scrollToTop = scrollToTop;
	
	// "On Load" animation.
		// Set loader timeout.
	const loaderTimeout = setTimeout(() => {
		$body.classList.add('with-loader');
	}, 500);
		
	// Create load handler.
	const loadHandler = () => {
		setTimeout(() => {
		
			// Stop loader.
				clearTimeout(loaderTimeout);
		
			// Unmark as loading.
				$body.classList.remove('is-loading');
		
			// Mark as playing.
				$body.classList.add('is-playing');
		
			// Wait for animation to complete.
				setTimeout(() => {
		
					// Remove loader.
						$body.classList.remove('with-loader');
		
					// Unmark as playing.
						$body.classList.remove('is-playing');
		
					// Mark as ready.
						$body.classList.add('is-ready');
		
				}, 1000);
		
		}, 100);
	};
		
		// Load event.
			on('load', loadHandler);
	
	// Load elements.
		// Load elements (if needed).
			loadElements(document.body);
	
	// Scroll points.
		(() => {
		
			const scrollPointParent = (target) => {
		
				const inner = $('#main > .inner');
		
				while (target && target.parentElement != inner)
					target = target.parentElement;
		
				return target;
		
			};
			const scrollPointSpeed = (scrollPoint) => {
		
				const x = parseInt(scrollPoint.dataset.scrollSpeed);
		
				switch (x) {
		
					case 5:
						return 250;
		
					case 4:
						return 500;
		
					case 3:
						return 750;
		
					case 2:
						return 1000;
		
					case 1:
						return 1250;
		
					default:
						break;
		
				}
		
				return 750;
		
			};
			const doNextScrollPoint = (event) => {
		
				let e;
				let target;
				let id;
		
				// Prevent default.
					event.preventDefault();
					event.stopPropagation();
		
				// Determine parent element.
					e = scrollPointParent(event.target);
		
					if (!e)
						return;
		
				// Find next scroll point.
					while (e?.nextElementSibling) {
		
						e = e.nextElementSibling;
		
						if (e.dataset.scrollId) {
		
							target = e;
							id = e.dataset.scrollId;
							break;
		
						}
		
					}
		
					if (!target
					||	!id)
						return;
		
				// Redirect.
					if (target.dataset.scrollInvisible == '1')
						scrollToElement(target, 'smooth', scrollPointSpeed(target));
					else
						location.href = `#${id}`;
		
			};
			const doPreviousScrollPoint = (e) => {
		
				var e;
				let target;
				let id;
		
				// Prevent default.
					event.preventDefault();
					event.stopPropagation();
		
				// Determine parent element.
					e = scrollPointParent(event.target);
		
					if (!e)
						return;
		
				// Find previous scroll point.
					while (e?.previousElementSibling) {
		
						e = e.previousElementSibling;
		
						if (e.dataset.scrollId) {
		
							target = e;
							id = e.dataset.scrollId;
							break;
		
						}
		
					}
		
					if (!target
					||	!id)
						return;
		
				// Redirect.
					if (target.dataset.scrollInvisible == '1')
						scrollToElement(target, 'smooth', scrollPointSpeed(target));
					else
						location.href = `#${id}`;
		
			};
			const doFirstScrollPoint = (e) => {
		
				var e;
				let target;
				let id;
		
				// Prevent default.
					event.preventDefault();
					event.stopPropagation();
		
				// Determine parent element.
					e = scrollPointParent(event.target);
		
					if (!e)
						return;
		
				// Find first scroll point.
					while (e?.previousElementSibling) {
		
						e = e.previousElementSibling;
		
						if (e.dataset.scrollId) {
		
							target = e;
							id = e.dataset.scrollId;
		
						}
		
					}
		
					if (!target
					||	!id)
						return;
		
				// Redirect.
					if (target.dataset.scrollInvisible == '1')
						scrollToElement(target, 'smooth', scrollPointSpeed(target));
					else
						location.href = `#${id}`;
		
			};
			const doLastScrollPoint = (e) => {
		
				var e;
				let target;
				let id;
		
				// Prevent default.
					event.preventDefault();
					event.stopPropagation();
		
				// Determine parent element.
					e = scrollPointParent(event.target);
		
					if (!e)
						return;
		
				// Find last scroll point.
					while (e?.nextElementSibling) {
		
						e = e.nextElementSibling;
		
						if (e.dataset.scrollId) {
		
							target = e;
							id = e.dataset.scrollId;
		
						}
		
					}
		
					if (!target
					||	!id)
						return;
		
				// Redirect.
					if (target.dataset.scrollInvisible == '1')
						scrollToElement(target, 'smooth', scrollPointSpeed(target));
					else
						location.href = `#${id}`;
		
			};
		
			// Expose doNextScrollPoint, doPreviousScrollPoint, doFirstScrollPoint, doLastScrollPoint.
				window._nextScrollPoint = doNextScrollPoint;
				window._previousScrollPoint = doPreviousScrollPoint;
				window._firstScrollPoint = doFirstScrollPoint;
				window._lastScrollPoint = doLastScrollPoint;
		
			// Override exposed scrollToTop.
				window._scrollToTop = () => {
		
					// Scroll to top.
						scrollToElement(null);
		
					// Scroll point active?
						if (window.location.hash) {
		
							// Reset hash (via new state).
								history.pushState(null, null, '.');
		
						}
		
				};
		
			// Initialize.
		
				// Set scroll restoration to manual.
					if ('scrollRestoration' in history)
						history.scrollRestoration = 'manual';
		
				// Load event.
					on('load', () => {
		
						let initialScrollPoint;
						let h = thisHash();
		
							// Contains invalid characters? Might be a third-party hashbang, so ignore it.
								if (h
								&&	!h.match(/^[a-zA-Z0-9\-]+$/))
									h = null;
		
							// Scroll point.
								initialScrollPoint = $(`[data-scroll-id="${h}"]`);
		
						// Scroll to scroll point (if applicable).
							if (initialScrollPoint)
								scrollToElement(initialScrollPoint, 'instant');
		
					});
		
			// Hashchange event.
				on('hashchange', (event) => {
		
					let scrollPoint;
					let h;
					let pos;
		
					// Determine target.
						h = thisHash();
		
						// Contains invalid characters? Might be a third-party hashbang, so ignore it.
							if (h
							&&	!h.match(/^[a-zA-Z0-9\-]+$/))
								return false;
		
						// Scroll point.
							scrollPoint = $(`[data-scroll-id="${h}"]`);
		
					// Scroll to scroll point (if applicable).
						if (scrollPoint)
							scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
		
					// Otherwise, just scroll to top.
						else
							scrollToElement(null);
		
					// Bail.
						return false;
		
				});
		
				// Hack: Allow hashchange to trigger on click even if the target's href matches the current hash.
					on('click', (event) => {
		
						let t = event.target;
						const tagName = t.tagName.toUpperCase();
						let scrollPoint;
		
						// Find real target.
							switch (tagName) {
		
								case 'IMG':
								case 'SVG':
								case 'USE':
								case 'U':
								case 'STRONG':
								case 'EM':
								case 'CODE':
								case 'S':
								case 'MARK':
								case 'SPAN':
		
									// Find ancestor anchor tag.
										while ( !!(t = t.parentElement) )
											if (t.tagName == 'A')
												break;
		
									// Not found? Bail.
										if (!t)
											return;
		
									break;
		
								default:
									break;
		
							}
		
						// Target is an anchor *and* its href is a hash?
							if (t.tagName == 'A'
							&&	t.getAttribute('href').substr(0, 1) == '#') {
		
								// Hash matches an invisible scroll point?
									if (!!(scrollPoint = $(`[data-scroll-id="${t.hash.substr(1)}"][data-scroll-invisible="1"]`))) {
		
										// Prevent default.
											event.preventDefault();
		
										// Scroll to element.
											scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
		
									}
		
								// Hash matches the current hash?
									else if (t.hash == window.location.hash) {
		
										// Prevent default.
											event.preventDefault();
		
										// Replace state with '#'.
											history.replaceState(undefined, undefined, '#');
		
										// Replace location with target hash.
											location.replace(t.hash);
		
									}
		
							}
		
					});
		
		})();
	
	// Browser hacks.
		// Init.
	let style;
	let sheet;
	let rule;
		
			// Create <style> element.
				style = document.createElement('style');
				style.appendChild(document.createTextNode(''));
				document.head.appendChild(style);
		
			// Get sheet.
				sheet = style.sheet;
		
		// Mobile.
			if (client.mobile) {
		
				// Prevent overscrolling on Safari/other mobile browsers.
				// 'vh' units don't factor in the heights of various browser UI elements so our page ends up being
				// a lot taller than it needs to be (resulting in overscroll and issues with vertical centering).
					(() => {
		
						// Lsd units available?
							if (client.flags.lsdUnits) {
		
								document.documentElement.style.setProperty('--viewport-height', '100svh');
								document.documentElement.style.setProperty('--background-height', '100lvh');
		
							}
		
						// Otherwise, use innerHeight hack.
							else {
		
								const f = () => {
									document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
									document.documentElement.style.setProperty('--background-height', `${window.innerHeight + 250}px`);
								};
		
								on('load', f);
								on('orientationchange', () => {
		
									// Update after brief delay.
										setTimeout(() => {
											(f)();
										}, 100);
		
								});
		
							}
		
					})();
		
			}
		
		// Android.
			if (client.os == 'android') {
		
				// Prevent background "jump" when address bar shrinks.
				// Specifically, this fix forces the background pseudoelement to a fixed height based on the physical
				// screen size instead of relying on "vh" (which is subject to change when the scrollbar shrinks/grows).
					(() => {
		
						// Insert and get rule.
							sheet.insertRule('body::after { }', 0);
							rule = sheet.cssRules[0];
		
						// Event.
						const f = () => {
							rule.style.cssText = `height: ${Math.max(screen.width, screen.height)}px`;
						};
		
							on('load', f);
							on('orientationchange', f);
							on('touchmove', f);
		
					})();
		
				// Apply "is-touch" class to body.
					$body.classList.add('is-touch');
		
			}
		
		// iOS.
			else if (client.os == 'ios') {
		
				// <=11: Prevent white bar below background when address bar shrinks.
				// For some reason, simply forcing GPU acceleration on the background pseudoelement fixes this.
					if (client.osVersion <= 11)
						(() => {
		
							// Insert and get rule.
								sheet.insertRule('body::after { }', 0);
								rule = sheet.cssRules[0];
		
							// Set rule.
								rule.style.cssText = '-webkit-transform: scale(1.0)';
		
						})();
		
				// <=11: Prevent white bar below background when form inputs are focused.
				// Fixed-position elements seem to lose their fixed-ness when this happens, which is a problem
				// because our backgrounds fall into this category.
					if (client.osVersion <= 11)
						(() => {
		
							// Insert and get rule.
								sheet.insertRule('body.ios-focus-fix::before { }', 0);
								rule = sheet.cssRules[0];
		
							// Set rule.
								rule.style.cssText = 'height: calc(100% + 60px)';
		
							// Add event listeners.
								on('focus', (event) => {
									$body.classList.add('ios-focus-fix');
								}, true);
		
								on('blur', (event) => {
									$body.classList.remove('ios-focus-fix');
								}, true);
		
						})();
		
				// Apply "is-touch" class to body.
					$body.classList.add('is-touch');
		
			}
	
	// Scroll events.
		var scrollEvents = {
		
			/**
			 * Items.
			 * @var {array}
			 */
			items: [],
		
			/**
			 * Adds an event.
			 * @param {object} o Options.
			 */
			add(o) {
		
				this.items.push({
					element: o.element,
					triggerElement: (('triggerElement' in o && o.triggerElement) ? o.triggerElement : o.element),
					enter: ('enter' in o ? o.enter : null),
					leave: ('leave' in o ? o.leave : null),
					mode: ('mode' in o ? o.mode : 4),
					threshold: ('threshold' in o ? o.threshold : 0.25),
					offset: ('offset' in o ? o.offset : 0),
					initialState: ('initialState' in o ? o.initialState : null),
					state: false,
				});
		
			},
		
			/**
			 * Handler.
			 */
			handler() {
		
				let height;
				let top;
				let bottom;
				let scrollPad;
		
				// Determine values.
					if (client.os == 'ios') {
		
						height = document.documentElement.clientHeight;
						top = document.body.scrollTop + window.scrollY;
						bottom = top + height;
						scrollPad = 125;
		
					}
					else {
		
						height = document.documentElement.clientHeight;
						top = document.documentElement.scrollTop;
						bottom = top + height;
						scrollPad = 0;
		
					}
		
				// Step through items.
					scrollEvents.items.forEach((item) => {
		
						let elementTop;
						let elementBottom;
						let viewportTop;
						let viewportBottom;
						let bcr;
						let pad;
						let state;
						let a;
						let b;
		
						// No enter/leave handlers? Bail.
							if (!item.enter
							&&	!item.leave)
								return true;
		
						// No trigger element? Bail.
							if (!item.triggerElement)
								return true;
		
						// Trigger element not visible?
							if (item.triggerElement.offsetParent === null) {
		
								// Current state is active *and* leave handler exists?
									if (item.state == true
									&&	item.leave) {
		
										// Reset state to false.
											item.state = false;
		
										// Call it.
											(item.leave).apply(item.element);
		
										// No enter handler? Unbind leave handler (so we don't check this element again).
											if (!item.enter)
												item.leave = null;
		
									}
		
								// Bail.
									return true;
		
							}
		
						// Get element position.
							bcr = item.triggerElement.getBoundingClientRect();
							elementTop = top + Math.floor(bcr.top);
							elementBottom = elementTop + bcr.height;
		
						// Determine state.
		
							// Initial state exists?
								if (item.initialState === null) {
		
									switch (item.mode) {
		
										// Element falls within viewport.
											case 1:
											default:
		
												// State.
													state = (bottom > (elementTop - item.offset) && top < (elementBottom + item.offset));
		
												break;
		
										// Viewport midpoint falls within element.
											case 2:
		
												// Midpoint.
													a = (top + (height * 0.5));
		
												// State.
													state = (a > (elementTop - item.offset) && a < (elementBottom + item.offset));
		
												break;
		
										// Viewport midsection falls within element.
											case 3:
		
												// Upper limit (25%-).
													a = top + (height * (item.threshold));
		
													if (a - (height * 0.375) <= 0)
														a = 0;
		
												// Lower limit (-75%).
													b = top + (height * (1 - item.threshold));
		
													if (b + (height * 0.375) >= document.body.scrollHeight - scrollPad)
														b = document.body.scrollHeight + scrollPad;
		
												// State.
													state = (b > (elementTop - item.offset) && a < (elementBottom + item.offset));
		
												break;
		
										// Viewport intersects with element.
											case 4:
		
												// Calculate pad, viewport top, viewport bottom.
													pad = height * item.threshold;
													viewportTop = (top + pad);
													viewportBottom = (bottom - pad);
		
												// Compensate for elements at the very top or bottom of the page.
													if (Math.floor(top) <= pad)
														viewportTop = top;
		
													if (Math.ceil(bottom) >= (document.body.scrollHeight - pad))
														viewportBottom = bottom;
		
												// Element is smaller than viewport?
													state =	(viewportBottom - viewportTop) >= (elementBottom - elementTop) ? (
															(elementTop >= viewportTop && elementBottom <= viewportBottom)
														||	(elementTop >= viewportTop && elementTop <= viewportBottom)
														||	(elementBottom >= viewportTop && elementBottom <= viewportBottom)
													) : (
															(viewportTop >= elementTop && viewportBottom <= elementBottom)
														||	(elementTop >= viewportTop && elementTop <= viewportBottom)
														||	(elementBottom >= viewportTop && elementBottom <= viewportBottom)
													);
		
												break;
		
									}
		
								}
								else {
		
									// Use it for this check.
										state = item.initialState;
		
									// Clear it.
										item.initialState = null;
		
								}
		
							// Otherwise, determine state from mode/position.
		
						// State changed?
							if (state != item.state) {
		
								// Update state.
									item.state = state;
		
								// Call handler.
									if (item.state) {
		
										// Enter handler exists?
											if (item.enter) {
		
												// Call it.
													(item.enter).apply(item.element);
		
												// No leave handler? Unbind enter handler (so we don't check this element again).
													if (!item.leave)
														item.enter = null;
		
											}
		
									}
									else {
		
										// Leave handler exists?
											if (item.leave) {
		
												// Call it.
													(item.leave).apply(item.element);
		
												// No enter handler? Unbind leave handler (so we don't check this element again).
													if (!item.enter)
														item.leave = null;
		
											}
		
									}
		
							}
		
					});
		
			},
		
			/**
			 * Initializes scroll events.
			 */
			init() {
		
				// Bind handler to events.
					on('load', this.handler);
					on('resize', this.handler);
					on('scroll', this.handler);
		
				// Do initial handler call.
					(this.handler)();
		
			}
		};
		
		// Initialize.
			scrollEvents.init();
	
	// Scroll tracking.
	const scrollTracking = {
		
		/**
			* Elements.
			* @var {array}
			*/
		elements: [],
		
		/**
			* Adds element(s) to track.
			* @param {string} selector Selector.
			*/
		add(selector) {
		
			// Step through selector.
				$$(selector).forEach((e) => {
		
					// Add element.
						this.elements.push(e);
		
				});
		
		},
		
		/**
			* Resize handler.
			*/
		resizeHandler() {
		
			// Step through tracked elements.
				this.elements.forEach((e) => {
		
					// Update "element-top" variable.
						e.style.setProperty('--element-top', e.offsetTop);
		
				});
		
		},
		
		/**
			* Scroll handler.
			*/
		scrollHandler() {
		
			// Update "scroll-y" variable.
				document.documentElement.style.setProperty('--scroll-y', window.scrollY);
		
		},
		
		/**
			* Initializes scroll tracking.
			*/
		init() {
		
			// Scroll handler.
		
				// Bind to scroll event.
					on('scroll', () => {
						this.scrollHandler();
					});
		
				// Bind to load event.
					on('load', () => {
						this.scrollHandler();
					});
		
				// Do initial call.
					this.scrollHandler();
		
			// Resize handler.
		
				// Bind to resize event.
					on('resize', () => {
						this.resizeHandler();
					});
		
				// Bind to load event.
					on('load', () => {
						this.resizeHandler();
					});
		
				// Do initial call.
					this.resizeHandler();
		
			// Create ResizeObserver on body.
			// This ensures both handlers are called if the body length changes in any way.
				const x = new ResizeObserver((entries) => {
		
					// Call scroll handler.
						this.scrollHandler();
		
					// Call resize handler.
						this.resizeHandler();
		
				});
		
				x.observe($body);
		
		}
		
	};
		
		scrollTracking.init();
	
	// "On Visible" animation.
	const onvisible = {
		
		/**
			* Effects.
			* @var {object}
			*/
		effects: {
			'blur-in': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'filter ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity) {
					this.style.opacity = 0;
					this.style.filter = `blur(${0.25 * intensity}rem)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.filter = 'none';
				},
			},
			'zoom-in': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity, alt) {
					this.style.opacity = 0;
					this.style.transform = `scale(${1 - ((alt ? 0.25 : 0.05) * intensity)})`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'zoom-out': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity, alt) {
					this.style.opacity = 0;
					this.style.transform = `scale(${1 + ((alt ? 0.25 : 0.05) * intensity)})`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'slide-left': {
				transition(speed, delay) {
					return `transform ${speed}s ease${delay ? ` ${delay}s` : ''}`;
				},
				rewind() {
					this.style.transform = 'translateX(100vw)';
				},
				play() {
					this.style.transform = 'none';
				},
			},
			'slide-right': {
				transition(speed, delay) {
					return `transform ${speed}s ease${delay ? ` ${delay}s` : ''}`;
				},
				rewind() {
					this.style.transform = 'translateX(-100vw)';
				},
				play() {
					this.style.transform = 'none';
				},
			},
			'flip-forward': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity, alt) {
					this.style.opacity = 0;
					this.style.transformOrigin = '50% 50%';
					this.style.transform = `perspective(1000px) rotateX(${(alt ? 45 : 15) * intensity}deg)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'flip-backward': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity, alt) {
					this.style.opacity = 0;
					this.style.transformOrigin = '50% 50%';
					this.style.transform = `perspective(1000px) rotateX(${(alt ? -45 : -15) * intensity}deg)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'flip-left': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity, alt) {
					this.style.opacity = 0;
					this.style.transformOrigin = '50% 50%';
					this.style.transform = `perspective(1000px) rotateY(${(alt ? 45 : 15) * intensity}deg)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'flip-right': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity, alt) {
					this.style.opacity = 0;
					this.style.transformOrigin = '50% 50%';
					this.style.transform = `perspective(1000px) rotateY(${(alt ? -45 : -15) * intensity}deg)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'tilt-left': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity, alt) {
					this.style.opacity = 0;
					this.style.transform = `rotate(${(alt ? 45 : 5) * intensity}deg)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'tilt-right': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity, alt) {
					this.style.opacity = 0;
					this.style.transform = `rotate(${(alt ? -45 : -5) * intensity}deg)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'fade-right': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity) {
					this.style.opacity = 0;
					this.style.transform = `translateX(${-1.5 * intensity}rem)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'fade-left': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity) {
					this.style.opacity = 0;
					this.style.transform = `translateX(${1.5 * intensity}rem)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'fade-down': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity) {
					this.style.opacity = 0;
					this.style.transform = `translateY(${-1.5 * intensity}rem)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'fade-up': {
				transition(speed, delay) {
					return  `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'transform ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity) {
					this.style.opacity = 0;
					this.style.transform = `translateY(${1.5 * intensity}rem)`;
				},
				play() {
					this.style.opacity = 1;
					this.style.transform = 'none';
				},
			},
			'fade-in': {
				transition(speed, delay) {
					return `opacity ${speed}s ease${delay ? ` ${delay}s` : ''}`;
				},
				rewind() {
					this.style.opacity = 0;
				},
				play() {
					this.style.opacity = 1;
				},
			},
			'fade-in-background': {
				custom: true,
				transition(speed, delay) {
		
					this.style.setProperty('--onvisible-speed', `${speed}s`);
		
					if (delay)
						this.style.setProperty('--onvisible-delay', `${delay}s`);
		
				},
				rewind() {
					this.style.removeProperty('--onvisible-background-color');
				},
				play() {
					this.style.setProperty('--onvisible-background-color', 'rgba(0,0,0,0.001)');
				},
			},
			'zoom-in-image': {
				target: 'img',
				transition(speed, delay) {
					return `transform ${speed}s ease${delay ? ` ${delay}s` : ''}`;
				},
				rewind() {
					this.style.transform = 'scale(1)';
				},
				play(intensity) {
					this.style.transform = `scale(${1 + (0.1 * intensity)})`;
				},
			},
			'zoom-out-image': {
				target: 'img',
				transition(speed, delay) {
					return `transform ${speed}s ease${delay ? ` ${delay}s` : ''}`;
				},
				rewind(intensity) {
					this.style.transform = `scale(${1 + (0.1 * intensity)})`;
				},
				play() {
					this.style.transform = 'none';
				},
			},
			'focus-image': {
				target: 'img',
				transition(speed, delay) {
					return  `transform ${speed}s ease${delay ? ` ${delay}s` : ''}, ` +
							'filter ' + speed + 's ease' + (delay ? ` ${delay}s` : '');
				},
				rewind(intensity) {
					this.style.transform = `scale(${1 + (0.05 * intensity)})`;
					this.style.filter = `blur(${0.25 * intensity}rem)`;
				},
				play(intensity) {
					this.style.transform = 'none';
					this.style.filter = 'none';
				},
			},
		},
		
		/**
			* Regex.
			* @var {RegExp}
			*/
		regex: new RegExp('([a-zA-Z0-9\.\,\-\_\"\'\?\!\:\;\#\@\#$\%\&\(\)\{\}]+)', 'g'),
		
		/**
			* Adds one or more animatable elements.
			* @param {string} selector Selector.
			* @param {object} settings Settings.
			*/
		add(selector, settings) {
		const style = settings.style in this.effects ? settings.style : 'fade';
			const speed = parseInt('speed' in settings ? settings.speed : 1000) / 1000;
			const intensity = ((parseInt('intensity' in settings ? settings.intensity : 5) / 10) * 1.75) + 0.25;
			const delay = parseInt('delay' in settings ? settings.delay : 0) / 1000;
			const replay = 'replay' in settings ? settings.replay : false;
			const stagger = 'stagger' in settings ? (parseInt(settings.stagger) >= 0 ? (parseInt(settings.stagger) / 1000) : false) : false;
			const staggerOrder = 'staggerOrder' in settings ? settings.staggerOrder : 'default';
			const staggerSelector = 'staggerSelector' in settings ? settings.staggerSelector : null;
			const threshold = parseInt('threshold' in settings ? settings.threshold : 3);
			const state = 'state' in settings ? settings.state : null;
			const effect = this.effects[style];
			let scrollEventThreshold;
		
			// Determine scroll event threshold.
				switch (threshold) {
		
					case 1:
						scrollEventThreshold = 0;
						break;
		
					case 2:
						scrollEventThreshold = 0.125;
						break;
		
					default:
					case 3:
						scrollEventThreshold = 0.25;
						break;
		
					case 4:
						scrollEventThreshold = 0.375;
						break;
		
					case 5:
						scrollEventThreshold = 0.475;
						break;
		
				}
		
			// Step through selected elements.
				$$(selector).forEach((e) => {
		
					let children;
					let enter;
					let leave;
					let targetElement;
					let triggerElement;
		
					// Stagger in use, and stagger selector is "all children"? Expand text nodes.
						if (stagger !== false
						&&	staggerSelector == ':scope > *')
							this.expandTextNodes(e);
		
					// Get children.
						children = (stagger !== false && staggerSelector) ? e.querySelectorAll(staggerSelector) : null;
		
					// Define handlers.
						enter = function(staggerDelay=0) {
		
							let _this = this;
							let transitionOrig;
		
							// Target provided? Use it instead of element.
								if (effect.target)
									_this = this.querySelector(effect.target);
		
							// Not a custom effect?
								if (!effect.custom) {
		
									// Save original transition.
										transitionOrig = _this.style.transition;
		
									// Apply temporary styles.
										_this.style.setProperty('backface-visibility', 'hidden');
		
									// Apply transition.
										_this.style.transition = effect.transition(speed, delay + staggerDelay);
		
								}
		
							// Otherwise, call custom transition handler.
								else
									effect.transition.apply(_this, [speed, delay + staggerDelay]);
		
							// Play.
								effect.play.apply(_this, [intensity, !!children]);
		
							// Not a custom effect?
								if (!effect.custom)
									setTimeout(() => {
		
										// Remove temporary styles.
											_this.style.removeProperty('backface-visibility');
		
										// Restore original transition.
											_this.style.transition = transitionOrig;
		
									}, (speed + delay + staggerDelay) * 1000 * 2);
		
						};
		
						leave = function() {
		
							let _this = this;
							let transitionOrig;
		
							// Target provided? Use it instead of element.
								if (effect.target)
									_this = this.querySelector(effect.target);
		
							// Not a custom effect?
								if (!effect.custom) {
		
									// Save original transition.
										transitionOrig = _this.style.transition;
		
									// Apply temporary styles.
										_this.style.setProperty('backface-visibility', 'hidden');
		
									// Apply transition.
										_this.style.transition = effect.transition(speed);
		
								}
		
							// Otherwise, call custom transition handler.
								else
									effect.transition.apply(_this, [speed]);
		
							// Rewind.
								effect.rewind.apply(_this, [intensity, !!children]);
		
							// Not a custom effect?
								if (!effect.custom)
									setTimeout(() => {
		
										// Remove temporary styles.
											_this.style.removeProperty('backface-visibility');
		
										// Restore original transition.
											_this.style.transition = transitionOrig;
		
									}, speed * 1000 * 2);
		
						};
		
					// Initial rewind.
		
						// Determine target element.
							targetElement = effect.target ? e.querySelector(effect.target) : e;
		
						// Children? Rewind each individually.
							if (children)
								children.forEach((targetElement) => {
									effect.rewind.apply(targetElement, [intensity, true]);
								});
		
						// Otherwise. just rewind element.
							else
								effect.rewind.apply(targetElement, [intensity]);
		
					// Determine trigger element.
						triggerElement = e;
		
						// Has a parent?
							if (e.parentNode) {
		
								// Parent is an onvisible trigger? Use it.
									if (e.parentNode.dataset.onvisibleTrigger)
										triggerElement = e.parentNode;
		
								// Otherwise, has a grandparent?
									else if (e.parentNode.parentNode?.dataset.onvisibleTrigger) triggerElement = e.parentNode.parentNode;
		
							}
		
					// Add scroll event.
						scrollEvents.add({
							element: e,
							triggerElement,
							initialState: state,
							threshold: scrollEventThreshold,
							enter: children ? () => {
		
								let staggerDelay = 0;
								const childHandler = (e) => {
		
									// Apply enter handler.
										enter.apply(e, [staggerDelay]);
		
									// Increment stagger delay.
										staggerDelay += stagger;
		
								};
								let a;
		
								// Default stagger order?
									if (staggerOrder == 'default') {
		
										// Apply child handler to children.
											children.forEach(childHandler);
		
									}
		
								// Otherwise ...
									else {
		
										// Convert children to an array.
											a = Array.from(children);
		
										// Sort array based on stagger order.
											switch (staggerOrder) {
		
												case 'reverse':
		
													// Reverse array.
														a.reverse();
		
													break;
		
												case 'random':
		
													// Randomly sort array.
														a.sort(() => Math.random() - 0.5);
		
													break;
		
											}
		
										// Apply child handler to array.
											a.forEach(childHandler);
		
									}
		
							} : enter,
							leave: (replay ? (children ? () => {
		
								// Step through children.
									children.forEach((e) => {
		
										// Apply leave handler.
											leave.apply(e);
		
									});
		
							} : leave) : null),
						});
		
				});
		
		},
		
		/**
			* Expand text nodes within an element into <text-node> elements.
			* @param {DOMElement} e Element.
			*/
		expandTextNodes(e) {
		
			let s;
			let i;
			let w;
			let x;
		
			// Step through child nodes.
				for (i = 0; i < e.childNodes.length; i++) {
		
					// Get child node.
						x = e.childNodes[i];
		
					// Not a text node? Skip.
						if (x.nodeType != Node.TEXT_NODE)
							continue;
		
					// Get node value.
						s = x.nodeValue;
		
					// Convert to <text-node>.
						s = s.replace(
							this.regex,
							(x, a) => `<text-node>${a}</text-node>`
						);
		
					// Update.
		
						// Create wrapper.
							w = document.createElement('text-node');
		
						// Populate with processed text.
						// This converts our processed text into a series of new text and element nodes.
							w.innerHTML = s;
		
						// Replace original element with wrapper.
							x.replaceWith(w);
		
						// Step through wrapper's children.
							while (w.childNodes.length > 0) {
		
								// Move child after wrapper.
									w.parentNode.insertBefore(
										w.childNodes[0],
										w
									);
		
							}
		
						// Remove wrapper (now that it's no longer needed).
							w.parentNode.removeChild(w);
		
					}
		
		},
		
	};
	
	// Initialize scroll tracking.
		scrollTracking.add('.container.style1');
	
	// Initialize "On Visible" animations.
		onvisible.add('h1.style2, h2.style2, h3.style2, p.style2', { style: 'fade-left', speed: 1000, intensity: 0, threshold: 3, delay: 0, replay: false });
		onvisible.add('h1.style1, h2.style1, h3.style1, p.style1', { style: 'fade-left', speed: 1000, intensity: 2, threshold: 3, delay: 0, replay: false });
		onvisible.add('h1.style3, h2.style3, h3.style3, p.style3', { style: 'fade-left', speed: 1000, intensity: 4, threshold: 3, delay: 0, replay: false });
		onvisible.add('.buttons.style1', { style: 'fade-up', speed: 1000, intensity: 1, threshold: 3, delay: 0, replay: false });
		onvisible.add('.icons.style1', { style: 'fade-up', speed: 1000, intensity: 1, threshold: 3, delay: 0, replay: false });
		onvisible.add('.container.style1', { style: 'fade-in-background', speed: 1000, intensity: 5, threshold: 3, delay: 0, replay: false });
		onvisible.add('.container.style1 > .wrapper > .inner', { style: 'fade-in', speed: 1000, intensity: 0, threshold: 3, delay: 0, replay: false });
		onvisible.add('.container.style2 > .wrapper > .inner', { style: 'fade-up', speed: 1000, intensity: 0, threshold: 3, delay: 0, replay: false });
		onvisible.add('#text24', { style: 'fade-left', speed: 1000, intensity: 2, threshold: 3, delay: 0, replay: false });
		onvisible.add('#text25', { style: 'fade-left', speed: 1000, intensity: 4, threshold: 3, delay: 0, replay: false });
		onvisible.add('#text16', { style: 'fade-left', speed: 1000, intensity: 2, threshold: 3, delay: 0, replay: false });

})();