/*

Colorpicker:
	Event Handlers:
		* Create
		* Open
		* Close
		* Resize
		* Save
		* Quit
		* Change (Start, While, End)
		also allow custom event handlers for each event
	Methods:
		things the colorpicker actually does
		* Show
		* Hide
		* ChangeColor
		* SelectColor
		* UpdateColors
		* UpdateLinePositions
	Color Conversions:
		a handful of helper functions to convert color formats
		* HSVtoRGB/RGBtoHSV
		* HSVtoHSL/HSLtoHSV
		* HSVtoHex/HextoHSV
	Message Processing

*/


$.fn.extend({
	colorpicker: function(cmd, args) {
		var $this = this;

		// event handlers

		function onCreate() {
			$this.addClass('colorpicker-hidden');
			$this.data('colorpicker-menuMode', 0);
			$this.data('colorpicker-blockClose', false);
			$this.data('colorpicker-args', args);

			// set default arguments
			if (args === undefined) {
				args = {};
			}

			if (args.onChange === undefined) {
				args.onChange = function() {};
			}

			if (args.onSubmit === undefined) {
				args.onSubmit = function() {};
			}

			if (args.onOpen === undefined) {
				args.onOpen = function() {};
			}

			if (args.onClose === undefined) {
				args.onClose = function() {};
			}

			if (args.showPreview === undefined) {
				args.showPreview = true;
			}

			if (args.defaultOpen === undefined) {
				args.defaultOpen = true;
			}

			if (args.outputType === undefined) {
				args.outputType = 'rgb';
			}

			// create the persistent data/state for the colorpicker
			$this.data('colorpicker-isOpen', false);
			$this.data('colorpicker-HSVCurr', {h:0, s:1, v:1});
			$this.data('colorpicker-HSVPerm', {h:0, s:1, v:1});

			// create the divs needed for the colorpicker
			var $menu = $this.append('<div class="colorpicker"></div>').children('.colorpicker');
			$this.data('colorpicker', $menu);
			$menu.mousedown(function() {
				return false;
			});
			$menu.on('remove', function() {
				onDestroy();
			});

			var $svPicker = $menu.append('<div class="sv-picker"></div>').children('.sv-picker');
			$svPicker.append('<div class="background"></div>');
			$svPicker.append('<div class="gradient"></div>');
			$svPicker.append('<div class="h sline"></div>');
			$svPicker.append('<div class="v sline"></div>');
			$svPicker.append('<div class="h line"></div>');
			$svPicker.append('<div class="v line"></div>');
			$this.data('colorpicker-svPicker', $svPicker);
			$svPicker.mousedown(onDragStart);

			var $hPicker = $menu.append('<div class="h-picker"></div>').children('.h-picker');
			$hPicker.append('<div class="gradient"></div>');
			$hPicker.append('<div class="h sline"></div>');
			$hPicker.append('<div class="h line"></div>');
			$this.data('colorpicker-hPicker', $hPicker);
			$hPicker.mousedown(onDragStart);

			var $preview = $menu.append('<div class="preview"></div>').children('.preview');
			$preview.append('<div class="background"></div>');
			$this.data('colorpicker-preview', $preview);

			var $save = $menu.append('<div class="mbutton msubmit">Save</div>').children('.mbutton');
			$save.click(function() {
				onSubmit();
				onClose();
			});

			var $exit = $menu.append('<div class="mbutton mcancel">Exit</div>').children('.mbutton');
			$exit.click(onClose);

			$(document).on('mousemove.colorpicker', onDragChange);
			$(document).on('mouseup.colorpicker', onDragEnd);

			if (!args.showPreview) {
				$preview.hide();
			}

			$menu.click(function(e) {
				e.stopPropagation();
			});

			$menu.mousedown(function(e) {
				$this.data('colorpicker-blockClose', true);
				//e.stopPropagation();
			});

			$menu.mouseup(function(e) {
				$this.data('colorpicker-blockClose', false);
				//e.stopPropagation();
			});

			topSpace = $this.height() + 4;
			$menu.css({top: topSpace});

			$(window).resize(onWindowResize);

			if (args.defaultOpen) {
				$(document).on('click.colorpicker', function(e) {
					if ($this.hasClass('colorpicker-visible') && !$this.data('colorpicker-blockClose')) {
						onClose();
					} else {
						$this.data('colorpicker-blockClose', false);
					}
				});

				$this.click(function(e) {
					if (!$this.hasClass('colorpicker-visible')) {
						$this.data('colorpicker-blockClose', true);
						onOpen();
					}
				});

				$menu.click(function(e) {
					e.stopPropagation();
				});
			}
		}

		function onOpen() {
			$this.addClass('colorpicker-visible');
			$this.removeClass('colorpicker-hidden');

			updateLines(true);
			updateColors(true);

			args.onOpen();
			onWindowResize();
		}

		function onClose() {
			var hsv = $this.data('colorpicker-HSVPerm');
			$this.data('colorpicker-HSVCurr', {
				h: hsv.h,
				s: hsv.s,
				v: hsv.v
			});

			$this.addClass('colorpicker-hidden');
			$this.removeClass('colorpicker-visible');

			args.onClose();
		}

		function onSubmit() {			
			var hsv = $this.data('colorpicker-HSVCurr');
			$this.data('colorpicker-HSVPerm', {
				h: hsv.h,
				s: hsv.s,
				v: hsv.v
			});

			var color = outputValue(args.outputType);
			args.onSubmit(color);
		}

		function onWindowResize() {
			var $menu = $this.children('.colorpicker');
			//var distFromEdge = $(window).width() - ($menu.outerWidth() + $this.offset().left);
			//var maxRightOffset = $menu.outerWidth() - $this.outerWidth();

			//var offsetX = Math.min(Math.max(0, -1 * distFromEdge + 10), maxRightOffset) - $this.offset().left;
			//var offsetY = $this.offset().top + $this.height() + 2;
			var offsetX = $this.offset().left - $this.offsetParent().offset().left;
			var offsetY = $this.offset().top  - $this.offsetParent().offset().top;

			var parentW = $this.outerWidth();
			var parentH = $this.outerHeight();

			var thisW = $this.children('.colorpicker').outerWidth();
			var thisH = $this.children('.colorpicker').outerHeight();

			$menu.css({left: offsetX - thisW + parentW, top: offsetY + parentH + 10});
		}

		function onDragStart(e) {
			$(this).css({zIndex: 2});

			if ($(this).hasClass('sv-picker')) {
				$this.data('colorpicker-menuMode', 1);
			} else if ($(this).hasClass('h-picker')) {
				$this.data('colorpicker-menuMode', 2);
			}

			selectColor($(this), e);
			updateLines(false);
			updateColors(false);
		}

		function onDragChange(e) {
			e.stopPropagation();

			var currMenu = $this.data('colorpicker-menuMode');
			var $currMenuObj = undefined;

			switch (currMenu) {
			case 1:
				$currMenuObj = $this.children('.colorpicker').children('.sv-picker');
				break;
			case 2:
				$currMenuObj = $this.children('.colorpicker').children('.h-picker');
				break;
			default:
				return;
			}

			selectColor($currMenuObj, e);
			updateLines(false);
			updateColors(false);

			var hsv = $this.data('colorpicker-HSVPerm');
		}

		function onDragEnd() {
			$this.data('colorpicker-menuMode', 0);
		}

		function onDestroy() {
			$(document).unbind('click.colorpicker');
			$(document).unbind('mousemove.colorpicker');
			$(document).unbind('mouseup.colorpicker');
		}

		function changeColor(color) {
			var hsv;
			if (typeof color === 'string') {
				hsv = HextoHSV(color);
			} else if (color.r !== undefined) {
				hsv = RGBtoHSV(color);
			} else {
				hsv = color;
			}

			$this.data('colorpicker-HSVCurr', {
				h: hsv.h,
				s: hsv.s,
				v: hsv.v
			});
			$this.data('colorpicker-HSVPerm', {
				h: hsv.h,
				s: hsv.s,
				v: hsv.v
			});
		}

		function selectColor($menu, e) {
			var hsv = $this.data('colorpicker-HSVCurr');

			if ($menu.hasClass('sv-picker')) {
				var vPos = Math.max(1, Math.min(e.pageY - $menu.offset().top, $menu.height() - 1)) - 1;
				hsv.v = 1 - (vPos / ($menu.height() - 2));

				var hPos = Math.max(1, Math.min(e.pageX - $menu.offset().left, $menu.width() - 1)) - 1;
				hsv.s = hPos / ($menu.width() - 2);
			} else if ($menu.hasClass('h-picker')) {
				var vPos = Math.max(1, Math.min(e.pageY - $menu.offset().top, $menu.height() - 1)) - 1;
				hsv.h = vPos / ($menu.height() - 2);
			}
		}

		function updateLines(firstOpen) {
			var hsv;
			if (firstOpen) {
				hsv = $this.data('colorpicker-HSVPerm');
			} else {
				hsv = $this.data('colorpicker-HSVCurr');
			}

			var $hl = $this.data('colorpicker-hPicker').children('.h');
			var $sl = $this.data('colorpicker-svPicker').children('.v');
			var $vl = $this.data('colorpicker-svPicker').children('.h');

			var hlPos = hsv.h * ($hl.parent().height() - 3) + 1;
			var slPos = hsv.s * ($sl.parent().width() - 3) + 1;
			var vlPos = (1 - hsv.v) * ($vl.parent().height() - 3) + 1;

			$hl.css({top:  hlPos});
			$sl.css({left: slPos});
			$vl.css({top:  vlPos});
		}

		function updateColors(firstOpen) {
			var oldHSV;
			if (firstOpen) {
				oldHSV = $this.data('colorpicker-HSVPerm');
			} else {
				oldHSV = $this.data('colorpicker-HSVCurr');
			}

			svHSV = HSVtoRGB(oldHSV.h, 1, 1);
			svRGB = 'rgb(' + svHSV.r + ', ' + svHSV.g + ', ' + svHSV.b + ')';
			bkg = $this.data('colorpicker-svPicker').children('.background');
			bkg.css({backgroundColor: svRGB});

			prHSV = HSVtoRGB(oldHSV.h, oldHSV.s, oldHSV.v);
			prRGB = 'rgb(' + prHSV.r + ', ' + prHSV.g + ', ' + prHSV.b + ')';
			previewBkg = $this.data('colorpicker-preview').children('.background');
			previewBkg.css({backgroundColor: prRGB});

			lnHSV = undefined;
			if (Math.sqrt(Math.pow(oldHSV.s , 2) + Math.pow(1 - oldHSV.v , 2)) < 0.2) {
				x = oldHSV.s + 0.0001; // the + 0.0001 prevents divide-by-zero errors
				y = 1 - oldHSV.v + 0.0001;
				t = Math.atan(x / y);
				x = 0.2 * Math.sin(t);
				y = 1 - (0.2 * Math.cos(t));
				lnHSV = HSVtoRGB(oldHSV.h, x, y);
			} else {
				lnHSV = HSVtoRGB(oldHSV.h, oldHSV.s, oldHSV.v);
			}

			lnRGB = 'rgb(' + lnHSV.r + ', ' + lnHSV.g + ', ' + lnHSV.b + ')';
			preview = $this.data('colorpicker-preview');
			preview.css({borderColor: lnRGB});
		}

		function HSVtoRGB(h, s, v) {
			var r, g, b, i, f, p, q, t;

			i = Math.floor(h * 6);
			f = h * 6 - i;
			p = v * (1 - s);
			q = v * (1 - f * s);
			t = v * (1 - (1 - f) * s);
			switch (i % 6) {
				case 0: r = v, g = t, b = p; break;
				case 1: r = q, g = v, b = p; break;
				case 2: r = p, g = v, b = t; break;
				case 3: r = p, g = q, b = v; break;
				case 4: r = t, g = p, b = v; break;
				case 5: r = v, g = p, b = q; break;
			}
			return {
				r: Math.floor(r * 255),
				g: Math.floor(g * 255),
				b: Math.floor(b * 255)
			};
		}

		function HSVtoHex(h, s, v) {
			var rgb, r, g, b;

			rgb = HSVtoRGB(h, s, v);
			r = rgb.r.toString(16);
			g = rgb.g.toString(16);
			b = rgb.b.toString(16);

			if (r.length === 1) {
				r = '0' + r;
			}

			if (g.length === 1) {
				g = '0' + g;
			}

			if (b.length === 1) {
				b = '0' + b;
			}

			return '#' + r + g + b;
		}

		function RGBtoHSV(r, g, b) {
			r /= 255;
			g /= 255;
			b /= 255;

			var min = Math.min(r, Math.min(g, b));
			var max = Math.max(r, Math.max(g, b));
			var dif = (max - min === 0) ? (0.0001) : (max - min);
			var hsv = {}

			switch (max) {
			case r:
				hsv.h = ((g - b) / dif) % 6;
				break;
			case g:
				hsv.h = ((b - r) / dif) + 2;
				break;
			case b:
				hsv.h = ((r - g) / dif) + 4;
				break;
			}

			hsv.h /= 6;
			hsv.s = dif / max;
			hsv.v = max;

			return hsv;
		}

		function HextoHSV(hex) {
			var rgb = {};

			if (hex.length === 4) {
				var r = parseInt(hex.substring(1, 2), 16);
				var g = parseInt(hex.substring(2, 3), 16);
				var b = parseInt(hex.substring(3, 4), 16);
				rgb.r = r * r + r;
				rgb.g = g * g + g;
				rgb.b = b * b + b;
			} else if (hex.length === 7) {
				rgb.r = parseInt(hex.substring(1, 3), 16);
				rgb.g = parseInt(hex.substring(3, 5), 16);
				rgb.b = parseInt(hex.substring(5, 7), 16);
			} else {
				rgb.r = 255;
				rgb.g = 0;
				rgb.b = 0;
			}

			return RGBtoHSV(rgb.r, rgb.g, rgb.b);
		}

		function outputValue(output) {
			var hsv = $this.data('colorpicker-HSVCurr');
			var out;

			switch (output) {

			case 'rgb':
				var rgb = HSVtoRGB(hsv.h, hsv.s, hsv.v);
				out = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
				break;

			case 'hex':
				out = HSVtoHex(hsv.h, hsv.s, hsv.v);
				break;

			case 'rgb-obj':
				out = HSVtoRGB(hsv.h, hsv.s, hsv.v);
				break;

			case 'hsv-obj':
				out = hsv;
				break;

			default:
				out = hsv;
				break;
			}

			return out;
		}

		switch (cmd) {

		case 'create':
			onCreate();
			break;

		case 'open':
			args = $this.data('colorpicker-args');
			onOpen();
			break;

		case 'close':
			args = $this.data('colorpicker-args');
			onClose();
			break;

		case 'setcolor':
			color = args;
			args = $this.data('colorpicker-args');
			changeColor(color);
			updateColors(false);
			break;

		}
	}
});
