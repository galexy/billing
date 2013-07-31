!function ($) {
  'use strict';
  var Affix = function (element, options) {
    this.options = $.extend({}, $.fn.affix.defaults, options);
    this.$window = $(window).on('scroll.affix.data-api', $.proxy(this.checkPosition, this)).on('click.affix.data-api', $.proxy(function () {
      setTimeout($.proxy(this.checkPosition, this), 1);
    }, this));
    this.$element = $(element);
    this.checkPosition();
  };
  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible'))
      return;
    var scrollHeight = $(document).height(), scrollTop = this.$window.scrollTop(), position = this.$element.offset(), offset = this.options.offset, offsetBottom = offset.bottom, offsetTop = offset.top, reset = 'affix affix-top affix-bottom', affix;
    if (typeof offset != 'object')
      offsetBottom = offsetTop = offset;
    if (typeof offsetTop == 'function')
      offsetTop = offset.top();
    if (typeof offsetBottom == 'function')
      offsetBottom = offset.bottom();
    affix = this.unpin != null && scrollTop + this.unpin <= position.top ? false : offsetBottom != null && position.top + this.$element.height() >= scrollHeight - offsetBottom ? 'bottom' : offsetTop != null && scrollTop <= offsetTop ? 'top' : false;
    if (this.affixed === affix)
      return;
    this.affixed = affix;
    this.unpin = affix == 'bottom' ? position.top - scrollTop : null;
    this.$element.removeClass(reset).addClass('affix' + (affix ? '-' + affix : ''));
  };
  var old = $.fn.affix;
  $.fn.affix = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('affix'), options = typeof option == 'object' && option;
      if (!data)
        $this.data('affix', data = new Affix(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.affix.Constructor = Affix;
  $.fn.affix.defaults = { offset: 0 };
  $.fn.affix.noConflict = function () {
    $.fn.affix = old;
    return this;
  };
  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this), data = $spy.data();
      data.offset = data.offset || {};
      data.offsetBottom && (data.offset.bottom = data.offsetBottom);
      data.offsetTop && (data.offset.top = data.offsetTop);
      $spy.affix(data);
    });
  });
}(window.jQuery);
!function ($) {
  'use strict';
  var dismiss = '[data-dismiss="alert"]', Alert = function (el) {
      $(el).on('click', dismiss, this.close);
    };
  Alert.prototype.close = function (e) {
    var $this = $(this), selector = $this.attr('data-target'), $parent;
    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
    }
    $parent = $(selector);
    e && e.preventDefault();
    $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent());
    $parent.trigger(e = $.Event('close'));
    if (e.isDefaultPrevented())
      return;
    $parent.removeClass('in');
    function removeElement() {
      $parent.trigger('closed').remove();
    }
    $.support.transition && $parent.hasClass('fade') ? $parent.on($.support.transition.end, removeElement) : removeElement();
  };
  var old = $.fn.alert;
  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('alert');
      if (!data)
        $this.data('alert', data = new Alert(this));
      if (typeof option == 'string')
        data[option].call($this);
    });
  };
  $.fn.alert.Constructor = Alert;
  $.fn.alert.noConflict = function () {
    $.fn.alert = old;
    return this;
  };
  $(document).on('click.alert.data-api', dismiss, Alert.prototype.close);
}(window.jQuery);
!function ($) {
  'use strict';
  var toggle = '[data-toggle=dropdown]', Dropdown = function (element) {
      var $el = $(element).on('click.dropdown.data-api', this.toggle);
      $('html').on('click.dropdown.data-api', function () {
        $el.parent().removeClass('open');
      });
    };
  Dropdown.prototype = {
    constructor: Dropdown,
    toggle: function (e) {
      var $this = $(this), $parent, isActive;
      if ($this.is('.disabled, :disabled'))
        return;
      $parent = getParent($this);
      isActive = $parent.hasClass('open');
      clearMenus();
      if (!isActive) {
        if ('ontouchstart' in document.documentElement) {
          $('<div class="dropdown-backdrop"/>').insertBefore($(this)).on('click', clearMenus);
        }
        $parent.toggleClass('open');
      }
      $this.focus();
      return false;
    },
    keydown: function (e) {
      var $this, $items, $active, $parent, isActive, index;
      if (!/(38|40|27)/.test(e.keyCode))
        return;
      $this = $(this);
      e.preventDefault();
      e.stopPropagation();
      if ($this.is('.disabled, :disabled'))
        return;
      $parent = getParent($this);
      isActive = $parent.hasClass('open');
      if (!isActive || isActive && e.keyCode == 27) {
        if (e.which == 27)
          $parent.find(toggle).focus();
        return $this.click();
      }
      $items = $('[role=menu] li:not(.divider):visible a', $parent);
      if (!$items.length)
        return;
      index = $items.index($items.filter(':focus'));
      if (e.keyCode == 38 && index > 0)
        index--;
      if (e.keyCode == 40 && index < $items.length - 1)
        index++;
      if (!~index)
        index = 0;
      $items.eq(index).focus();
    }
  };
  function clearMenus() {
    $('.dropdown-backdrop').remove();
    $(toggle).each(function () {
      getParent($(this)).removeClass('open');
    });
  }
  function getParent($this) {
    var selector = $this.attr('data-target'), $parent;
    if (!selector) {
      selector = $this.attr('href');
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '');
    }
    $parent = selector && $(selector);
    if (!$parent || !$parent.length)
      $parent = $this.parent();
    return $parent;
  }
  var old = $.fn.dropdown;
  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('dropdown');
      if (!data)
        $this.data('dropdown', data = new Dropdown(this));
      if (typeof option == 'string')
        data[option].call($this);
    });
  };
  $.fn.dropdown.Constructor = Dropdown;
  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old;
    return this;
  };
  $(document).on('click.dropdown.data-api', clearMenus).on('click.dropdown.data-api', '.dropdown form', function (e) {
    e.stopPropagation();
  }).on('click.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.dropdown.data-api', toggle + ', [role=menu]', Dropdown.prototype.keydown);
}(window.jQuery);
!function ($) {
  'use strict';
  var Tooltip = function (element, options) {
    this.init('tooltip', element, options);
  };
  Tooltip.prototype = {
    constructor: Tooltip,
    init: function (type, element, options) {
      var eventIn, eventOut, triggers, trigger, i;
      this.type = type;
      this.$element = $(element);
      this.options = this.getOptions(options);
      this.enabled = true;
      triggers = this.options.trigger.split(' ');
      for (i = triggers.length; i--;) {
        trigger = triggers[i];
        if (trigger == 'click') {
          this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
        } else if (trigger != 'manual') {
          eventIn = trigger == 'hover' ? 'mouseenter' : 'focus';
          eventOut = trigger == 'hover' ? 'mouseleave' : 'blur';
          this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
          this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
        }
      }
      this.options.selector ? this._options = $.extend({}, this.options, {
        trigger: 'manual',
        selector: ''
      }) : this.fixTitle();
    },
    getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options);
      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay,
          hide: options.delay
        };
      }
      return options;
    },
    enter: function (e) {
      var defaults = $.fn[this.type].defaults, options = {}, self;
      this._options && $.each(this._options, function (key, value) {
        if (defaults[key] != value)
          options[key] = value;
      }, this);
      self = $(e.currentTarget)[this.type](options).data(this.type);
      if (!self.options.delay || !self.options.delay.show)
        return self.show();
      clearTimeout(this.timeout);
      self.hoverState = 'in';
      this.timeout = setTimeout(function () {
        if (self.hoverState == 'in')
          self.show();
      }, self.options.delay.show);
    },
    leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type);
      if (this.timeout)
        clearTimeout(this.timeout);
      if (!self.options.delay || !self.options.delay.hide)
        return self.hide();
      self.hoverState = 'out';
      this.timeout = setTimeout(function () {
        if (self.hoverState == 'out')
          self.hide();
      }, self.options.delay.hide);
    },
    show: function () {
      var $tip, pos, actualWidth, actualHeight, placement, tp, e = $.Event('show');
      if (this.hasContent() && this.enabled) {
        this.$element.trigger(e);
        if (e.isDefaultPrevented())
          return;
        $tip = this.tip();
        this.setContent();
        if (this.options.animation) {
          $tip.addClass('fade');
        }
        placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
        $tip.detach().css({
          top: 0,
          left: 0,
          display: 'block'
        });
        this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
        pos = this.getPosition();
        actualWidth = $tip[0].offsetWidth;
        actualHeight = $tip[0].offsetHeight;
        switch (placement) {
        case 'bottom':
          tp = {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - actualWidth / 2
          };
          break;
        case 'top':
          tp = {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2 - actualWidth / 2
          };
          break;
        case 'left':
          tp = {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left - actualWidth
          };
          break;
        case 'right':
          tp = {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left + pos.width
          };
          break;
        }
        this.applyPlacement(tp, placement);
        this.$element.trigger('shown');
      }
    },
    applyPlacement: function (offset, placement) {
      var $tip = this.tip(), width = $tip[0].offsetWidth, height = $tip[0].offsetHeight, actualWidth, actualHeight, delta, replace;
      $tip.offset(offset).addClass(placement).addClass('in');
      actualWidth = $tip[0].offsetWidth;
      actualHeight = $tip[0].offsetHeight;
      if (placement == 'top' && actualHeight != height) {
        offset.top = offset.top + height - actualHeight;
        replace = true;
      }
      if (placement == 'bottom' || placement == 'top') {
        delta = 0;
        if (offset.left < 0) {
          delta = offset.left * -2;
          offset.left = 0;
          $tip.offset(offset);
          actualWidth = $tip[0].offsetWidth;
          actualHeight = $tip[0].offsetHeight;
        }
        this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
      } else {
        this.replaceArrow(actualHeight - height, actualHeight, 'top');
      }
      if (replace)
        $tip.offset(offset);
    },
    replaceArrow: function (delta, dimension, position) {
      this.arrow().css(position, delta ? 50 * (1 - delta / dimension) + '%' : '');
    },
    setContent: function () {
      var $tip = this.tip(), title = this.getTitle();
      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
      $tip.removeClass('fade in top bottom left right');
    },
    hide: function () {
      var that = this, $tip = this.tip(), e = $.Event('hide');
      this.$element.trigger(e);
      if (e.isDefaultPrevented())
        return;
      $tip.removeClass('in');
      function removeWithAnimation() {
        var timeout = setTimeout(function () {
            $tip.off($.support.transition.end).detach();
          }, 500);
        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout);
          $tip.detach();
        });
      }
      $.support.transition && this.$tip.hasClass('fade') ? removeWithAnimation() : $tip.detach();
      this.$element.trigger('hidden');
      return this;
    },
    fixTitle: function () {
      var $e = this.$element;
      if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
      }
    },
    hasContent: function () {
      return this.getTitle();
    },
    getPosition: function () {
      var el = this.$element[0];
      return $.extend({}, typeof el.getBoundingClientRect == 'function' ? el.getBoundingClientRect() : {
        width: el.offsetWidth,
        height: el.offsetHeight
      }, this.$element.offset());
    },
    getTitle: function () {
      var title, $e = this.$element, o = this.options;
      title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);
      return title;
    },
    tip: function () {
      return this.$tip = this.$tip || $(this.options.template);
    },
    arrow: function () {
      return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow');
    },
    validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide();
        this.$element = null;
        this.options = null;
      }
    },
    enable: function () {
      this.enabled = true;
    },
    disable: function () {
      this.enabled = false;
    },
    toggleEnabled: function () {
      this.enabled = !this.enabled;
    },
    toggle: function (e) {
      var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this;
      self.tip().hasClass('in') ? self.hide() : self.show();
    },
    destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type);
    }
  };
  var old = $.fn.tooltip;
  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('tooltip'), options = typeof option == 'object' && option;
      if (!data)
        $this.data('tooltip', data = new Tooltip(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.tooltip.Constructor = Tooltip;
  $.fn.tooltip.defaults = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false
  };
  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };
}(window.jQuery);
!function ($) {
  'use strict';
  var Modal = function (element, options) {
    this.options = options;
    this.$element = $(element).delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this));
    this.options.remote && this.$element.find('.modal-body').load(this.options.remote);
  };
  Modal.prototype = {
    constructor: Modal,
    toggle: function () {
      return this[!this.isShown ? 'show' : 'hide']();
    },
    show: function () {
      var that = this, e = $.Event('show');
      this.$element.trigger(e);
      if (this.isShown || e.isDefaultPrevented())
        return;
      this.isShown = true;
      this.escape();
      this.backdrop(function () {
        var transition = $.support.transition && that.$element.hasClass('fade');
        if (!that.$element.parent().length) {
          that.$element.appendTo(document.body);
        }
        that.$element.show();
        if (transition) {
          that.$element[0].offsetWidth;
        }
        that.$element.addClass('in').attr('aria-hidden', false);
        that.enforceFocus();
        transition ? that.$element.one($.support.transition.end, function () {
          that.$element.focus().trigger('shown');
        }) : that.$element.focus().trigger('shown');
      });
    },
    hide: function (e) {
      e && e.preventDefault();
      var that = this;
      e = $.Event('hide');
      this.$element.trigger(e);
      if (!this.isShown || e.isDefaultPrevented())
        return;
      this.isShown = false;
      this.escape();
      $(document).off('focusin.modal');
      this.$element.removeClass('in').attr('aria-hidden', true);
      $.support.transition && this.$element.hasClass('fade') ? this.hideWithTransition() : this.hideModal();
    },
    enforceFocus: function () {
      var that = this;
      $(document).on('focusin.modal', function (e) {
        if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
          that.$element.focus();
        }
      });
    },
    escape: function () {
      var that = this;
      if (this.isShown && this.options.keyboard) {
        this.$element.on('keyup.dismiss.modal', function (e) {
          e.which == 27 && that.hide();
        });
      } else if (!this.isShown) {
        this.$element.off('keyup.dismiss.modal');
      }
    },
    hideWithTransition: function () {
      var that = this, timeout = setTimeout(function () {
          that.$element.off($.support.transition.end);
          that.hideModal();
        }, 500);
      this.$element.one($.support.transition.end, function () {
        clearTimeout(timeout);
        that.hideModal();
      });
    },
    hideModal: function () {
      var that = this;
      this.$element.hide();
      this.backdrop(function () {
        that.removeBackdrop();
        that.$element.trigger('hidden');
      });
    },
    removeBackdrop: function () {
      this.$backdrop && this.$backdrop.remove();
      this.$backdrop = null;
    },
    backdrop: function (callback) {
      var that = this, animate = this.$element.hasClass('fade') ? 'fade' : '';
      if (this.isShown && this.options.backdrop) {
        var doAnimate = $.support.transition && animate;
        this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body);
        this.$backdrop.click(this.options.backdrop == 'static' ? $.proxy(this.$element[0].focus, this.$element[0]) : $.proxy(this.hide, this));
        if (doAnimate)
          this.$backdrop[0].offsetWidth;
        this.$backdrop.addClass('in');
        if (!callback)
          return;
        doAnimate ? this.$backdrop.one($.support.transition.end, callback) : callback();
      } else if (!this.isShown && this.$backdrop) {
        this.$backdrop.removeClass('in');
        $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one($.support.transition.end, callback) : callback();
      } else if (callback) {
        callback();
      }
    }
  };
  var old = $.fn.modal;
  $.fn.modal = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('modal'), options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option);
      if (!data)
        $this.data('modal', data = new Modal(this, options));
      if (typeof option == 'string')
        data[option]();
      else if (options.show)
        data.show();
    });
  };
  $.fn.modal.defaults = {
    backdrop: true,
    keyboard: true,
    show: true
  };
  $.fn.modal.Constructor = Modal;
  $.fn.modal.noConflict = function () {
    $.fn.modal = old;
    return this;
  };
  $(document).on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this), href = $this.attr('href'), $target = $($this.attr('data-target') || href && href.replace(/.*(?=#[^\s]+$)/, '')), option = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());
    e.preventDefault();
    $target.modal(option).one('hide', function () {
      $this.focus();
    });
  });
}(window.jQuery);
!function ($) {
  'use strict';
  $(function () {
    $.support.transition = function () {
      var transitionEnd = function () {
          var el = document.createElement('bootstrap'), transEndEventNames = {
              'WebkitTransition': 'webkitTransitionEnd',
              'MozTransition': 'transitionend',
              'OTransition': 'oTransitionEnd otransitionend',
              'transition': 'transitionend'
            }, name;
          for (name in transEndEventNames) {
            if (el.style[name] !== undefined) {
              return transEndEventNames[name];
            }
          }
        }();
      return transitionEnd && { end: transitionEnd };
    }();
  });
}(window.jQuery);
!function ($) {
  'use strict';
  var Button = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, $.fn.button.defaults, options);
  };
  Button.prototype.setState = function (state) {
    var d = 'disabled', $el = this.$element, data = $el.data(), val = $el.is('input') ? 'val' : 'html';
    state = state + 'Text';
    data.resetText || $el.data('resetText', $el[val]());
    $el[val](data[state] || this.options[state]);
    setTimeout(function () {
      state == 'loadingText' ? $el.addClass(d).attr(d, d) : $el.removeClass(d).removeAttr(d);
    }, 0);
  };
  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons-radio"]');
    $parent && $parent.find('.active').removeClass('active');
    this.$element.toggleClass('active');
  };
  var old = $.fn.button;
  $.fn.button = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('button'), options = typeof option == 'object' && option;
      if (!data)
        $this.data('button', data = new Button(this, options));
      if (option == 'toggle')
        data.toggle();
      else if (option)
        data.setState(option);
    });
  };
  $.fn.button.defaults = { loadingText: 'loading...' };
  $.fn.button.Constructor = Button;
  $.fn.button.noConflict = function () {
    $.fn.button = old;
    return this;
  };
  $(document).on('click.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target);
    if (!$btn.hasClass('btn'))
      $btn = $btn.closest('.btn');
    $btn.button('toggle');
  });
}(window.jQuery);
!function ($) {
  'use strict';
  var Popover = function (element, options) {
    this.init('popover', element, options);
  };
  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {
    constructor: Popover,
    setContent: function () {
      var $tip = this.tip(), title = this.getTitle(), content = this.getContent();
      $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
      $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content);
      $tip.removeClass('fade top bottom left right in');
    },
    hasContent: function () {
      return this.getTitle() || this.getContent();
    },
    getContent: function () {
      var content, $e = this.$element, o = this.options;
      content = (typeof o.content == 'function' ? o.content.call($e[0]) : o.content) || $e.attr('data-content');
      return content;
    },
    tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template);
      }
      return this.$tip;
    },
    destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type);
    }
  });
  var old = $.fn.popover;
  $.fn.popover = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('popover'), options = typeof option == 'object' && option;
      if (!data)
        $this.data('popover', data = new Popover(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.popover.Constructor = Popover;
  $.fn.popover.defaults = $.extend({}, $.fn.tooltip.defaults, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  });
  $.fn.popover.noConflict = function () {
    $.fn.popover = old;
    return this;
  };
}(window.jQuery);
!function ($) {
  'use strict';
  var Typeahead = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, $.fn.typeahead.defaults, options);
    this.matcher = this.options.matcher || this.matcher;
    this.sorter = this.options.sorter || this.sorter;
    this.highlighter = this.options.highlighter || this.highlighter;
    this.updater = this.options.updater || this.updater;
    this.source = this.options.source;
    this.$menu = $(this.options.menu);
    this.shown = false;
    this.listen();
  };
  Typeahead.prototype = {
    constructor: Typeahead,
    select: function () {
      var val = this.$menu.find('.active').attr('data-value');
      this.$element.val(this.updater(val)).change();
      return this.hide();
    },
    updater: function (item) {
      return item;
    },
    show: function () {
      var pos = $.extend({}, this.$element.position(), { height: this.$element[0].offsetHeight });
      this.$menu.insertAfter(this.$element).css({
        top: pos.top + pos.height,
        left: pos.left
      }).show();
      this.shown = true;
      return this;
    },
    hide: function () {
      this.$menu.hide();
      this.shown = false;
      return this;
    },
    lookup: function (event) {
      var items;
      this.query = this.$element.val();
      if (!this.query || this.query.length < this.options.minLength) {
        return this.shown ? this.hide() : this;
      }
      items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
      return items ? this.process(items) : this;
    },
    process: function (items) {
      var that = this;
      items = $.grep(items, function (item) {
        return that.matcher(item);
      });
      items = this.sorter(items);
      if (!items.length) {
        return this.shown ? this.hide() : this;
      }
      return this.render(items.slice(0, this.options.items)).show();
    },
    matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase());
    },
    sorter: function (items) {
      var beginswith = [], caseSensitive = [], caseInsensitive = [], item;
      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase()))
          beginswith.push(item);
        else if (~item.indexOf(this.query))
          caseSensitive.push(item);
        else
          caseInsensitive.push(item);
      }
      return beginswith.concat(caseSensitive, caseInsensitive);
    },
    highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>';
      });
    },
    render: function (items) {
      var that = this;
      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item);
        i.find('a').html(that.highlighter(item));
        return i[0];
      });
      items.first().addClass('active');
      this.$menu.html(items);
      return this;
    },
    next: function (event) {
      var active = this.$menu.find('.active').removeClass('active'), next = active.next();
      if (!next.length) {
        next = $(this.$menu.find('li')[0]);
      }
      next.addClass('active');
    },
    prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active'), prev = active.prev();
      if (!prev.length) {
        prev = this.$menu.find('li').last();
      }
      prev.addClass('active');
    },
    listen: function () {
      this.$element.on('focus', $.proxy(this.focus, this)).on('blur', $.proxy(this.blur, this)).on('keypress', $.proxy(this.keypress, this)).on('keyup', $.proxy(this.keyup, this));
      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this));
      }
      this.$menu.on('click', $.proxy(this.click, this)).on('mouseenter', 'li', $.proxy(this.mouseenter, this)).on('mouseleave', 'li', $.proxy(this.mouseleave, this));
    },
    eventSupported: function (eventName) {
      var isSupported = eventName in this.$element;
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;');
        isSupported = typeof this.$element[eventName] === 'function';
      }
      return isSupported;
    },
    move: function (e) {
      if (!this.shown)
        return;
      switch (e.keyCode) {
      case 9:
      case 13:
      case 27:
        e.preventDefault();
        break;
      case 38:
        e.preventDefault();
        this.prev();
        break;
      case 40:
        e.preventDefault();
        this.next();
        break;
      }
      e.stopPropagation();
    },
    keydown: function (e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [
        40,
        38,
        9,
        13,
        27
      ]);
      this.move(e);
    },
    keypress: function (e) {
      if (this.suppressKeyPressRepeat)
        return;
      this.move(e);
    },
    keyup: function (e) {
      switch (e.keyCode) {
      case 40:
      case 38:
      case 16:
      case 17:
      case 18:
        break;
      case 9:
      case 13:
        if (!this.shown)
          return;
        this.select();
        break;
      case 27:
        if (!this.shown)
          return;
        this.hide();
        break;
      default:
        this.lookup();
      }
      e.stopPropagation();
      e.preventDefault();
    },
    focus: function (e) {
      this.focused = true;
    },
    blur: function (e) {
      this.focused = false;
      if (!this.mousedover && this.shown)
        this.hide();
    },
    click: function (e) {
      e.stopPropagation();
      e.preventDefault();
      this.select();
      this.$element.focus();
    },
    mouseenter: function (e) {
      this.mousedover = true;
      this.$menu.find('.active').removeClass('active');
      $(e.currentTarget).addClass('active');
    },
    mouseleave: function (e) {
      this.mousedover = false;
      if (!this.focused && this.shown)
        this.hide();
    }
  };
  var old = $.fn.typeahead;
  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('typeahead'), options = typeof option == 'object' && option;
      if (!data)
        $this.data('typeahead', data = new Typeahead(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.typeahead.defaults = {
    source: [],
    items: 8,
    menu: '<ul class="typeahead dropdown-menu"></ul>',
    item: '<li><a href="#"></a></li>',
    minLength: 1
  };
  $.fn.typeahead.Constructor = Typeahead;
  $.fn.typeahead.noConflict = function () {
    $.fn.typeahead = old;
    return this;
  };
  $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
    var $this = $(this);
    if ($this.data('typeahead'))
      return;
    $this.typeahead($this.data());
  });
}(window.jQuery);
!function ($) {
  'use strict';
  var Carousel = function (element, options) {
    this.$element = $(element);
    this.$indicators = this.$element.find('.carousel-indicators');
    this.options = options;
    this.options.pause == 'hover' && this.$element.on('mouseenter', $.proxy(this.pause, this)).on('mouseleave', $.proxy(this.cycle, this));
  };
  Carousel.prototype = {
    cycle: function (e) {
      if (!e)
        this.paused = false;
      if (this.interval)
        clearInterval(this.interval);
      this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
      return this;
    },
    getActiveIndex: function () {
      this.$active = this.$element.find('.item.active');
      this.$items = this.$active.parent().children();
      return this.$items.index(this.$active);
    },
    to: function (pos) {
      var activeIndex = this.getActiveIndex(), that = this;
      if (pos > this.$items.length - 1 || pos < 0)
        return;
      if (this.sliding) {
        return this.$element.one('slid', function () {
          that.to(pos);
        });
      }
      if (activeIndex == pos) {
        return this.pause().cycle();
      }
      return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
    },
    pause: function (e) {
      if (!e)
        this.paused = true;
      if (this.$element.find('.next, .prev').length && $.support.transition.end) {
        this.$element.trigger($.support.transition.end);
        this.cycle(true);
      }
      clearInterval(this.interval);
      this.interval = null;
      return this;
    },
    next: function () {
      if (this.sliding)
        return;
      return this.slide('next');
    },
    prev: function () {
      if (this.sliding)
        return;
      return this.slide('prev');
    },
    slide: function (type, next) {
      var $active = this.$element.find('.item.active'), $next = next || $active[type](), isCycling = this.interval, direction = type == 'next' ? 'left' : 'right', fallback = type == 'next' ? 'first' : 'last', that = this, e;
      this.sliding = true;
      isCycling && this.pause();
      $next = $next.length ? $next : this.$element.find('.item')[fallback]();
      e = $.Event('slide', {
        relatedTarget: $next[0],
        direction: direction
      });
      if ($next.hasClass('active'))
        return;
      if (this.$indicators.length) {
        this.$indicators.find('.active').removeClass('active');
        this.$element.one('slid', function () {
          var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
          $nextIndicator && $nextIndicator.addClass('active');
        });
      }
      if ($.support.transition && this.$element.hasClass('slide')) {
        this.$element.trigger(e);
        if (e.isDefaultPrevented())
          return;
        $next.addClass(type);
        $next[0].offsetWidth;
        $active.addClass(direction);
        $next.addClass(direction);
        this.$element.one($.support.transition.end, function () {
          $next.removeClass([
            type,
            direction
          ].join(' ')).addClass('active');
          $active.removeClass([
            'active',
            direction
          ].join(' '));
          that.sliding = false;
          setTimeout(function () {
            that.$element.trigger('slid');
          }, 0);
        });
      } else {
        this.$element.trigger(e);
        if (e.isDefaultPrevented())
          return;
        $active.removeClass('active');
        $next.addClass('active');
        this.sliding = false;
        this.$element.trigger('slid');
      }
      isCycling && this.cycle();
      return this;
    }
  };
  var old = $.fn.carousel;
  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('carousel'), options = $.extend({}, $.fn.carousel.defaults, typeof option == 'object' && option), action = typeof option == 'string' ? option : options.slide;
      if (!data)
        $this.data('carousel', data = new Carousel(this, options));
      if (typeof option == 'number')
        data.to(option);
      else if (action)
        data[action]();
      else if (options.interval)
        data.pause().cycle();
    });
  };
  $.fn.carousel.defaults = {
    interval: 5000,
    pause: 'hover'
  };
  $.fn.carousel.Constructor = Carousel;
  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old;
    return this;
  };
  $(document).on('click.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this = $(this), href, $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')), options = $.extend({}, $target.data(), $this.data()), slideIndex;
    $target.carousel(options);
    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('carousel').pause().to(slideIndex).cycle();
    }
    e.preventDefault();
  });
}(window.jQuery);
!function ($) {
  'use strict';
  function ScrollSpy(element, options) {
    var process = $.proxy(this.process, this), $element = $(element).is('body') ? $(window) : $(element), href;
    this.options = $.extend({}, $.fn.scrollspy.defaults, options);
    this.$scrollElement = $element.on('scroll.scroll-spy.data-api', process);
    this.selector = (this.options.target || (href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') || '') + ' .nav li > a';
    this.$body = $('body');
    this.refresh();
    this.process();
  }
  ScrollSpy.prototype = {
    constructor: ScrollSpy,
    refresh: function () {
      var self = this, $targets;
      this.offsets = $([]);
      this.targets = $([]);
      $targets = this.$body.find(this.selector).map(function () {
        var $el = $(this), href = $el.data('target') || $el.attr('href'), $href = /^#\w/.test(href) && $(href);
        return $href && $href.length && [[
            $href.position().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()),
            href
          ]] || null;
      }).sort(function (a, b) {
        return a[0] - b[0];
      }).each(function () {
        self.offsets.push(this[0]);
        self.targets.push(this[1]);
      });
    },
    process: function () {
      var scrollTop = this.$scrollElement.scrollTop() + this.options.offset, scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight, maxScroll = scrollHeight - this.$scrollElement.height(), offsets = this.offsets, targets = this.targets, activeTarget = this.activeTarget, i;
      if (scrollTop >= maxScroll) {
        return activeTarget != (i = targets.last()[0]) && this.activate(i);
      }
      for (i = offsets.length; i--;) {
        activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i]);
      }
    },
    activate: function (target) {
      var active, selector;
      this.activeTarget = target;
      $(this.selector).parent('.active').removeClass('active');
      selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
      active = $(selector).parent('li').addClass('active');
      if (active.parent('.dropdown-menu').length) {
        active = active.closest('li.dropdown').addClass('active');
      }
      active.trigger('activate');
    }
  };
  var old = $.fn.scrollspy;
  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('scrollspy'), options = typeof option == 'object' && option;
      if (!data)
        $this.data('scrollspy', data = new ScrollSpy(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.scrollspy.Constructor = ScrollSpy;
  $.fn.scrollspy.defaults = { offset: 10 };
  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old;
    return this;
  };
  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this);
      $spy.scrollspy($spy.data());
    });
  });
}(window.jQuery);
!function ($) {
  'use strict';
  var Collapse = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, $.fn.collapse.defaults, options);
    if (this.options.parent) {
      this.$parent = $(this.options.parent);
    }
    this.options.toggle && this.toggle();
  };
  Collapse.prototype = {
    constructor: Collapse,
    dimension: function () {
      var hasWidth = this.$element.hasClass('width');
      return hasWidth ? 'width' : 'height';
    },
    show: function () {
      var dimension, scroll, actives, hasData;
      if (this.transitioning || this.$element.hasClass('in'))
        return;
      dimension = this.dimension();
      scroll = $.camelCase([
        'scroll',
        dimension
      ].join('-'));
      actives = this.$parent && this.$parent.find('> .accordion-group > .in');
      if (actives && actives.length) {
        hasData = actives.data('collapse');
        if (hasData && hasData.transitioning)
          return;
        actives.collapse('hide');
        hasData || actives.data('collapse', null);
      }
      this.$element[dimension](0);
      this.transition('addClass', $.Event('show'), 'shown');
      $.support.transition && this.$element[dimension](this.$element[0][scroll]);
    },
    hide: function () {
      var dimension;
      if (this.transitioning || !this.$element.hasClass('in'))
        return;
      dimension = this.dimension();
      this.reset(this.$element[dimension]());
      this.transition('removeClass', $.Event('hide'), 'hidden');
      this.$element[dimension](0);
    },
    reset: function (size) {
      var dimension = this.dimension();
      this.$element.removeClass('collapse')[dimension](size || 'auto')[0].offsetWidth;
      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse');
      return this;
    },
    transition: function (method, startEvent, completeEvent) {
      var that = this, complete = function () {
          if (startEvent.type == 'show')
            that.reset();
          that.transitioning = 0;
          that.$element.trigger(completeEvent);
        };
      this.$element.trigger(startEvent);
      if (startEvent.isDefaultPrevented())
        return;
      this.transitioning = 1;
      this.$element[method]('in');
      $.support.transition && this.$element.hasClass('collapse') ? this.$element.one($.support.transition.end, complete) : complete();
    },
    toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']();
    }
  };
  var old = $.fn.collapse;
  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('collapse'), options = $.extend({}, $.fn.collapse.defaults, $this.data(), typeof option == 'object' && option);
      if (!data)
        $this.data('collapse', data = new Collapse(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.collapse.defaults = { toggle: true };
  $.fn.collapse.Constructor = Collapse;
  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old;
    return this;
  };
  $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href, target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''), option = $(target).data('collapse') ? 'toggle' : $this.data();
    $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed');
    $(target).collapse(option);
  });
}(window.jQuery);
!function ($) {
  'use strict';
  var Tab = function (element) {
    this.element = $(element);
  };
  Tab.prototype = {
    constructor: Tab,
    show: function () {
      var $this = this.element, $ul = $this.closest('ul:not(.dropdown-menu)'), selector = $this.attr('data-target'), previous, $target, e;
      if (!selector) {
        selector = $this.attr('href');
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
      }
      if ($this.parent('li').hasClass('active'))
        return;
      previous = $ul.find('.active:last a')[0];
      e = $.Event('show', { relatedTarget: previous });
      $this.trigger(e);
      if (e.isDefaultPrevented())
        return;
      $target = $(selector);
      this.activate($this.parent('li'), $ul);
      this.activate($target, $target.parent(), function () {
        $this.trigger({
          type: 'shown',
          relatedTarget: previous
        });
      });
    },
    activate: function (element, container, callback) {
      var $active = container.find('> .active'), transition = callback && $.support.transition && $active.hasClass('fade');
      function next() {
        $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active');
        element.addClass('active');
        if (transition) {
          element[0].offsetWidth;
          element.addClass('in');
        } else {
          element.removeClass('fade');
        }
        if (element.parent('.dropdown-menu')) {
          element.closest('li.dropdown').addClass('active');
        }
        callback && callback();
      }
      transition ? $active.one($.support.transition.end, next) : next();
      $active.removeClass('in');
    }
  };
  var old = $.fn.tab;
  $.fn.tab = function (option) {
    return this.each(function () {
      var $this = $(this), data = $this.data('tab');
      if (!data)
        $this.data('tab', data = new Tab(this));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.tab.Constructor = Tab;
  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this;
  };
  $(document).on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
}(window.jQuery);
angular.module('ui.bootstrap', [
  'ui.bootstrap.tpls',
  'ui.bootstrap.transition',
  'ui.bootstrap.collapse',
  'ui.bootstrap.accordion',
  'ui.bootstrap.alert',
  'ui.bootstrap.buttons',
  'ui.bootstrap.carousel',
  'ui.bootstrap.datepicker',
  'ui.bootstrap.dialog',
  'ui.bootstrap.dropdownToggle',
  'ui.bootstrap.modal',
  'ui.bootstrap.pagination',
  'ui.bootstrap.position',
  'ui.bootstrap.tooltip',
  'ui.bootstrap.popover',
  'ui.bootstrap.progressbar',
  'ui.bootstrap.rating',
  'ui.bootstrap.tabs',
  'ui.bootstrap.timepicker',
  'ui.bootstrap.typeahead'
]);
angular.module('ui.bootstrap.tpls', [
  'template/accordion/accordion-group.html',
  'template/accordion/accordion.html',
  'template/alert/alert.html',
  'template/carousel/carousel.html',
  'template/carousel/slide.html',
  'template/datepicker/datepicker.html',
  'template/dialog/message.html',
  'template/pagination/pager.html',
  'template/pagination/pagination.html',
  'template/tooltip/tooltip-html-unsafe-popup.html',
  'template/tooltip/tooltip-popup.html',
  'template/popover/popover.html',
  'template/progressbar/bar.html',
  'template/progressbar/progress.html',
  'template/rating/rating.html',
  'template/tabs/tab.html',
  'template/tabs/tabset.html',
  'template/timepicker/timepicker.html',
  'template/typeahead/typeahead.html'
]);
angular.module('ui.bootstrap.transition', []).factory('$transition', [
  '$q',
  '$timeout',
  '$rootScope',
  function ($q, $timeout, $rootScope) {
    var $transition = function (element, trigger, options) {
      options = options || {};
      var deferred = $q.defer();
      var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];
      var transitionEndHandler = function (event) {
        $rootScope.$apply(function () {
          element.unbind(endEventName, transitionEndHandler);
          deferred.resolve(element);
        });
      };
      if (endEventName) {
        element.bind(endEventName, transitionEndHandler);
      }
      $timeout(function () {
        if (angular.isString(trigger)) {
          element.addClass(trigger);
        } else if (angular.isFunction(trigger)) {
          trigger(element);
        } else if (angular.isObject(trigger)) {
          element.css(trigger);
        }
        if (!endEventName) {
          deferred.resolve(element);
        }
      });
      deferred.promise.cancel = function () {
        if (endEventName) {
          element.unbind(endEventName, transitionEndHandler);
        }
        deferred.reject('Transition cancelled');
      };
      return deferred.promise;
    };
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
      };
    var animationEndEventNames = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
      };
    function findEndEventName(endEventNames) {
      for (var name in endEventNames) {
        if (transElement.style[name] !== undefined) {
          return endEventNames[name];
        }
      }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
  }
]);
angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition']).directive('collapse', [
  '$transition',
  function ($transition) {
    var fixUpHeight = function (scope, element, height) {
      element.removeClass('collapse');
      element.css({ height: height });
      var x = element[0].offsetWidth;
      element.addClass('collapse');
    };
    return {
      link: function (scope, element, attrs) {
        var isCollapsed;
        var initialAnimSkip = true;
        scope.$watch(function () {
          return element[0].scrollHeight;
        }, function (value) {
          if (element[0].scrollHeight !== 0) {
            if (!isCollapsed) {
              if (initialAnimSkip) {
                fixUpHeight(scope, element, element[0].scrollHeight + 'px');
              } else {
                fixUpHeight(scope, element, 'auto');
              }
            }
          }
        });
        scope.$watch(attrs.collapse, function (value) {
          if (value) {
            collapse();
          } else {
            expand();
          }
        });
        var currentTransition;
        var doTransition = function (change) {
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = $transition(element, change);
          currentTransition.then(function () {
            currentTransition = undefined;
          }, function () {
            currentTransition = undefined;
          });
          return currentTransition;
        };
        var expand = function () {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            if (!isCollapsed) {
              fixUpHeight(scope, element, 'auto');
            }
          } else {
            doTransition({ height: element[0].scrollHeight + 'px' }).then(function () {
              if (!isCollapsed) {
                fixUpHeight(scope, element, 'auto');
              }
            });
          }
          isCollapsed = false;
        };
        var collapse = function () {
          isCollapsed = true;
          if (initialAnimSkip) {
            initialAnimSkip = false;
            fixUpHeight(scope, element, 0);
          } else {
            fixUpHeight(scope, element, element[0].scrollHeight + 'px');
            doTransition({ 'height': '0' });
          }
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse']).constant('accordionConfig', { closeOthers: true }).controller('AccordionController', [
  '$scope',
  '$attrs',
  'accordionConfig',
  function ($scope, $attrs, accordionConfig) {
    this.groups = [];
    this.closeOthers = function (openGroup) {
      var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
      if (closeOthers) {
        angular.forEach(this.groups, function (group) {
          if (group !== openGroup) {
            group.isOpen = false;
          }
        });
      }
    };
    this.addGroup = function (groupScope) {
      var that = this;
      this.groups.push(groupScope);
      groupScope.$on('$destroy', function (event) {
        that.removeGroup(groupScope);
      });
    };
    this.removeGroup = function (group) {
      var index = this.groups.indexOf(group);
      if (index !== -1) {
        this.groups.splice(this.groups.indexOf(group), 1);
      }
    };
  }
]).directive('accordion', function () {
  return {
    restrict: 'EA',
    controller: 'AccordionController',
    transclude: true,
    replace: false,
    templateUrl: 'template/accordion/accordion.html'
  };
}).directive('accordionGroup', [
  '$parse',
  '$transition',
  '$timeout',
  function ($parse, $transition, $timeout) {
    return {
      require: '^accordion',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/accordion/accordion-group.html',
      scope: { heading: '@' },
      controller: [
        '$scope',
        function ($scope) {
          this.setHeading = function (element) {
            this.heading = element;
          };
        }
      ],
      link: function (scope, element, attrs, accordionCtrl) {
        var getIsOpen, setIsOpen;
        accordionCtrl.addGroup(scope);
        scope.isOpen = false;
        if (attrs.isOpen) {
          getIsOpen = $parse(attrs.isOpen);
          setIsOpen = getIsOpen.assign;
          scope.$watch(function watchIsOpen() {
            return getIsOpen(scope.$parent);
          }, function updateOpen(value) {
            scope.isOpen = value;
          });
          scope.isOpen = getIsOpen ? getIsOpen(scope.$parent) : false;
        }
        scope.$watch('isOpen', function (value) {
          if (value) {
            accordionCtrl.closeOthers(scope);
          }
          if (setIsOpen) {
            setIsOpen(scope.$parent, value);
          }
        });
      }
    };
  }
]).directive('accordionHeading', function () {
  return {
    restrict: 'EA',
    transclude: true,
    template: '',
    replace: true,
    require: '^accordionGroup',
    compile: function (element, attr, transclude) {
      return function link(scope, element, attr, accordionGroupCtrl) {
        accordionGroupCtrl.setHeading(transclude(scope, function () {
        }));
      };
    }
  };
}).directive('accordionTransclude', function () {
  return {
    require: '^accordionGroup',
    link: function (scope, element, attr, controller) {
      scope.$watch(function () {
        return controller[attr.accordionTransclude];
      }, function (heading) {
        if (heading) {
          element.html('');
          element.append(heading);
        }
      });
    }
  };
});
angular.module('ui.bootstrap.alert', []).directive('alert', function () {
  return {
    restrict: 'EA',
    templateUrl: 'template/alert/alert.html',
    transclude: true,
    replace: true,
    scope: {
      type: '=',
      close: '&'
    },
    link: function (scope, iElement, iAttrs, controller) {
      scope.closeable = 'close' in iAttrs;
    }
  };
});
angular.module('ui.bootstrap.buttons', []).constant('buttonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
}).directive('btnRadio', [
  'buttonConfig',
  function (buttonConfig) {
    var activeClass = buttonConfig.activeClass || 'active';
    var toggleEvent = buttonConfig.toggleEvent || 'click';
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        ngModelCtrl.$render = function () {
          element.toggleClass(activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
        };
        element.bind(toggleEvent, function () {
          if (!element.hasClass(activeClass)) {
            scope.$apply(function () {
              ngModelCtrl.$setViewValue(scope.$eval(attrs.btnRadio));
              ngModelCtrl.$render();
            });
          }
        });
      }
    };
  }
]).directive('btnCheckbox', [
  'buttonConfig',
  function (buttonConfig) {
    var activeClass = buttonConfig.activeClass || 'active';
    var toggleEvent = buttonConfig.toggleEvent || 'click';
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        var trueValue = scope.$eval(attrs.btnCheckboxTrue);
        var falseValue = scope.$eval(attrs.btnCheckboxFalse);
        trueValue = angular.isDefined(trueValue) ? trueValue : true;
        falseValue = angular.isDefined(falseValue) ? falseValue : false;
        ngModelCtrl.$render = function () {
          element.toggleClass(activeClass, angular.equals(ngModelCtrl.$modelValue, trueValue));
        };
        element.bind(toggleEvent, function () {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(element.hasClass(activeClass) ? falseValue : trueValue);
            ngModelCtrl.$render();
          });
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition']).controller('CarouselController', [
  '$scope',
  '$timeout',
  '$transition',
  '$q',
  function ($scope, $timeout, $transition, $q) {
    var self = this, slides = self.slides = [], currentIndex = -1, currentTimeout, isPlaying;
    self.currentSlide = null;
    self.select = function (nextSlide, direction) {
      var nextIndex = slides.indexOf(nextSlide);
      if (direction === undefined) {
        direction = nextIndex > currentIndex ? 'next' : 'prev';
      }
      if (nextSlide && nextSlide !== self.currentSlide) {
        if ($scope.$currentTransition) {
          $scope.$currentTransition.cancel();
          $timeout(goNext);
        } else {
          goNext();
        }
      }
      function goNext() {
        if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
          nextSlide.$element.addClass(direction);
          nextSlide.$element[0].offsetWidth = nextSlide.$element[0].offsetWidth;
          angular.forEach(slides, function (slide) {
            angular.extend(slide, {
              direction: '',
              entering: false,
              leaving: false,
              active: false
            });
          });
          angular.extend(nextSlide, {
            direction: direction,
            active: true,
            entering: true
          });
          angular.extend(self.currentSlide || {}, {
            direction: direction,
            leaving: true
          });
          $scope.$currentTransition = $transition(nextSlide.$element, {});
          (function (next, current) {
            $scope.$currentTransition.then(function () {
              transitionDone(next, current);
            }, function () {
              transitionDone(next, current);
            });
          }(nextSlide, self.currentSlide));
        } else {
          transitionDone(nextSlide, self.currentSlide);
        }
        self.currentSlide = nextSlide;
        currentIndex = nextIndex;
        restartTimer();
      }
      function transitionDone(next, current) {
        angular.extend(next, {
          direction: '',
          active: true,
          leaving: false,
          entering: false
        });
        angular.extend(current || {}, {
          direction: '',
          active: false,
          leaving: false,
          entering: false
        });
        $scope.$currentTransition = null;
      }
    };
    self.indexOfSlide = function (slide) {
      return slides.indexOf(slide);
    };
    $scope.next = function () {
      var newIndex = (currentIndex + 1) % slides.length;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'next');
      }
    };
    $scope.prev = function () {
      var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'prev');
      }
    };
    $scope.select = function (slide) {
      self.select(slide);
    };
    $scope.isActive = function (slide) {
      return self.currentSlide === slide;
    };
    $scope.slides = function () {
      return slides;
    };
    $scope.$watch('interval', restartTimer);
    function restartTimer() {
      if (currentTimeout) {
        $timeout.cancel(currentTimeout);
      }
      function go() {
        if (isPlaying) {
          $scope.next();
          restartTimer();
        } else {
          $scope.pause();
        }
      }
      var interval = +$scope.interval;
      if (!isNaN(interval) && interval >= 0) {
        currentTimeout = $timeout(go, interval);
      }
    }
    $scope.play = function () {
      if (!isPlaying) {
        isPlaying = true;
        restartTimer();
      }
    };
    $scope.pause = function () {
      if (!$scope.noPause) {
        isPlaying = false;
        if (currentTimeout) {
          $timeout.cancel(currentTimeout);
        }
      }
    };
    self.addSlide = function (slide, element) {
      slide.$element = element;
      slides.push(slide);
      if (slides.length === 1 || slide.active) {
        self.select(slides[slides.length - 1]);
        if (slides.length == 1) {
          $scope.play();
        }
      } else {
        slide.active = false;
      }
    };
    self.removeSlide = function (slide) {
      var index = slides.indexOf(slide);
      slides.splice(index, 1);
      if (slides.length > 0 && slide.active) {
        if (index >= slides.length) {
          self.select(slides[index - 1]);
        } else {
          self.select(slides[index]);
        }
      } else if (currentIndex > index) {
        currentIndex--;
      }
    };
  }
]).directive('carousel', [function () {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'CarouselController',
      require: 'carousel',
      templateUrl: 'template/carousel/carousel.html',
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '='
      }
    };
  }]).directive('slide', [
  '$parse',
  function ($parse) {
    return {
      require: '^carousel',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/carousel/slide.html',
      scope: {},
      link: function (scope, element, attrs, carouselCtrl) {
        if (attrs.active) {
          var getActive = $parse(attrs.active);
          var setActive = getActive.assign;
          var lastValue = scope.active = getActive(scope.$parent);
          scope.$watch(function parentActiveWatch() {
            var parentActive = getActive(scope.$parent);
            if (parentActive !== scope.active) {
              if (parentActive !== lastValue) {
                lastValue = scope.active = parentActive;
              } else {
                setActive(scope.$parent, parentActive = lastValue = scope.active);
              }
            }
            return parentActive;
          });
        }
        carouselCtrl.addSlide(scope, element);
        scope.$on('$destroy', function () {
          carouselCtrl.removeSlide(scope);
        });
        scope.$watch('active', function (active) {
          if (active) {
            carouselCtrl.select(scope);
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.datepicker', []).constant('datepickerConfig', {
  dayFormat: 'dd',
  monthFormat: 'MMMM',
  yearFormat: 'yyyy',
  dayHeaderFormat: 'EEE',
  dayTitleFormat: 'MMMM yyyy',
  monthTitleFormat: 'yyyy',
  showWeeks: true,
  startingDay: 0,
  yearRange: 20
}).directive('datepicker', [
  'dateFilter',
  '$parse',
  'datepickerConfig',
  function (dateFilter, $parse, datepickerConfig) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        model: '=ngModel',
        dateDisabled: '&'
      },
      templateUrl: 'template/datepicker/datepicker.html',
      link: function (scope, element, attrs) {
        scope.mode = 'day';
        var selected = new Date(), showWeeks, minDate, maxDate, format = {};
        format.day = angular.isDefined(attrs.dayFormat) ? scope.$eval(attrs.dayFormat) : datepickerConfig.dayFormat;
        format.month = angular.isDefined(attrs.monthFormat) ? scope.$eval(attrs.monthFormat) : datepickerConfig.monthFormat;
        format.year = angular.isDefined(attrs.yearFormat) ? scope.$eval(attrs.yearFormat) : datepickerConfig.yearFormat;
        format.dayHeader = angular.isDefined(attrs.dayHeaderFormat) ? scope.$eval(attrs.dayHeaderFormat) : datepickerConfig.dayHeaderFormat;
        format.dayTitle = angular.isDefined(attrs.dayTitleFormat) ? scope.$eval(attrs.dayTitleFormat) : datepickerConfig.dayTitleFormat;
        format.monthTitle = angular.isDefined(attrs.monthTitleFormat) ? scope.$eval(attrs.monthTitleFormat) : datepickerConfig.monthTitleFormat;
        var startingDay = angular.isDefined(attrs.startingDay) ? scope.$eval(attrs.startingDay) : datepickerConfig.startingDay;
        var yearRange = angular.isDefined(attrs.yearRange) ? scope.$eval(attrs.yearRange) : datepickerConfig.yearRange;
        if (attrs.showWeeks) {
          scope.$parent.$watch($parse(attrs.showWeeks), function (value) {
            showWeeks = !!value;
            updateShowWeekNumbers();
          });
        } else {
          showWeeks = datepickerConfig.showWeeks;
          updateShowWeekNumbers();
        }
        if (attrs.min) {
          scope.$parent.$watch($parse(attrs.min), function (value) {
            minDate = new Date(value);
            refill();
          });
        }
        if (attrs.max) {
          scope.$parent.$watch($parse(attrs.max), function (value) {
            maxDate = new Date(value);
            refill();
          });
        }
        function updateCalendar(rows, labels, title) {
          scope.rows = rows;
          scope.labels = labels;
          scope.title = title;
        }
        function updateShowWeekNumbers() {
          scope.showWeekNumbers = scope.mode === 'day' && showWeeks;
        }
        function compare(date1, date2) {
          if (scope.mode === 'year') {
            return date2.getFullYear() - date1.getFullYear();
          } else if (scope.mode === 'month') {
            return new Date(date2.getFullYear(), date2.getMonth()) - new Date(date1.getFullYear(), date1.getMonth());
          } else if (scope.mode === 'day') {
            return new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()) - new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
          }
        }
        function isDisabled(date) {
          return minDate && compare(date, minDate) > 0 || maxDate && compare(date, maxDate) < 0 || scope.dateDisabled && scope.dateDisabled({
            date: date,
            mode: scope.mode
          });
        }
        var split = function (a, size) {
          var arrays = [];
          while (a.length > 0) {
            arrays.push(a.splice(0, size));
          }
          return arrays;
        };
        var getDaysInMonth = function (year, month) {
          return new Date(year, month + 1, 0).getDate();
        };
        var fill = {
            day: function () {
              var days = [], labels = [], lastDate = null;
              function addDays(dt, n, isCurrentMonth) {
                for (var i = 0; i < n; i++) {
                  days.push({
                    date: new Date(dt),
                    isCurrent: isCurrentMonth,
                    isSelected: isSelected(dt),
                    label: dateFilter(dt, format.day),
                    disabled: isDisabled(dt)
                  });
                  dt.setDate(dt.getDate() + 1);
                }
                lastDate = dt;
              }
              var d = new Date(selected);
              d.setDate(1);
              var difference = startingDay - d.getDay();
              var numDisplayedFromPreviousMonth = difference > 0 ? 7 - difference : -difference;
              if (numDisplayedFromPreviousMonth > 0) {
                d.setDate(-numDisplayedFromPreviousMonth + 1);
                addDays(d, numDisplayedFromPreviousMonth, false);
              }
              addDays(lastDate || d, getDaysInMonth(selected.getFullYear(), selected.getMonth()), true);
              addDays(lastDate, (7 - days.length % 7) % 7, false);
              for (i = 0; i < 7; i++) {
                labels.push(dateFilter(days[i].date, format.dayHeader));
              }
              updateCalendar(split(days, 7), labels, dateFilter(selected, format.dayTitle));
            },
            month: function () {
              var months = [], i = 0, year = selected.getFullYear();
              while (i < 12) {
                var dt = new Date(year, i++, 1);
                months.push({
                  date: dt,
                  isCurrent: true,
                  isSelected: isSelected(dt),
                  label: dateFilter(dt, format.month),
                  disabled: isDisabled(dt)
                });
              }
              updateCalendar(split(months, 3), [], dateFilter(selected, format.monthTitle));
            },
            year: function () {
              var years = [], year = parseInt((selected.getFullYear() - 1) / yearRange, 10) * yearRange + 1;
              for (var i = 0; i < yearRange; i++) {
                var dt = new Date(year + i, 0, 1);
                years.push({
                  date: dt,
                  isCurrent: true,
                  isSelected: isSelected(dt),
                  label: dateFilter(dt, format.year),
                  disabled: isDisabled(dt)
                });
              }
              var title = years[0].label + ' - ' + years[years.length - 1].label;
              updateCalendar(split(years, 5), [], title);
            }
          };
        var refill = function () {
          fill[scope.mode]();
        };
        var isSelected = function (dt) {
          if (scope.model && scope.model.getFullYear() === dt.getFullYear()) {
            if (scope.mode === 'year') {
              return true;
            }
            if (scope.model.getMonth() === dt.getMonth()) {
              return scope.mode === 'month' || scope.mode === 'day' && scope.model.getDate() === dt.getDate();
            }
          }
          return false;
        };
        scope.$watch('model', function (dt, olddt) {
          if (angular.isDate(dt)) {
            selected = angular.copy(dt);
          }
          if (!angular.equals(dt, olddt)) {
            refill();
          }
        });
        scope.$watch('mode', function () {
          updateShowWeekNumbers();
          refill();
        });
        scope.select = function (dt) {
          selected = new Date(dt);
          if (scope.mode === 'year') {
            scope.mode = 'month';
            selected.setFullYear(dt.getFullYear());
          } else if (scope.mode === 'month') {
            scope.mode = 'day';
            selected.setMonth(dt.getMonth());
          } else if (scope.mode === 'day') {
            scope.model = new Date(selected);
          }
        };
        scope.move = function (step) {
          if (scope.mode === 'day') {
            selected.setMonth(selected.getMonth() + step);
          } else if (scope.mode === 'month') {
            selected.setFullYear(selected.getFullYear() + step);
          } else if (scope.mode === 'year') {
            selected.setFullYear(selected.getFullYear() + step * yearRange);
          }
          refill();
        };
        scope.toggleMode = function () {
          scope.mode = scope.mode === 'day' ? 'month' : scope.mode === 'month' ? 'year' : 'day';
        };
        scope.getWeekNumber = function (row) {
          if (scope.mode !== 'day' || !scope.showWeekNumbers || row.length !== 7) {
            return;
          }
          var index = startingDay > 4 ? 11 - startingDay : 4 - startingDay;
          var d = new Date(row[index].date);
          d.setHours(0, 0, 0);
          return Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
        };
      }
    };
  }
]);
var dialogModule = angular.module('ui.bootstrap.dialog', ['ui.bootstrap.transition']);
dialogModule.controller('MessageBoxController', [
  '$scope',
  'dialog',
  'model',
  function ($scope, dialog, model) {
    $scope.title = model.title;
    $scope.message = model.message;
    $scope.buttons = model.buttons;
    $scope.close = function (res) {
      dialog.close(res);
    };
  }
]);
dialogModule.provider('$dialog', function () {
  var defaults = {
      backdrop: true,
      dialogClass: 'modal',
      backdropClass: 'modal-backdrop',
      transitionClass: 'fade',
      triggerClass: 'in',
      resolve: {},
      backdropFade: false,
      dialogFade: false,
      keyboard: true,
      backdropClick: true
    };
  var globalOptions = {};
  var activeBackdrops = { value: 0 };
  this.options = function (value) {
    globalOptions = value;
  };
  this.$get = [
    '$http',
    '$document',
    '$compile',
    '$rootScope',
    '$controller',
    '$templateCache',
    '$q',
    '$transition',
    '$injector',
    function ($http, $document, $compile, $rootScope, $controller, $templateCache, $q, $transition, $injector) {
      var body = $document.find('body');
      function createElement(clazz) {
        var el = angular.element('<div>');
        el.addClass(clazz);
        return el;
      }
      function Dialog(opts) {
        var self = this, options = this.options = angular.extend({}, defaults, globalOptions, opts);
        this._open = false;
        this.backdropEl = createElement(options.backdropClass);
        if (options.backdropFade) {
          this.backdropEl.addClass(options.transitionClass);
          this.backdropEl.removeClass(options.triggerClass);
        }
        this.modalEl = createElement(options.dialogClass);
        if (options.dialogFade) {
          this.modalEl.addClass(options.transitionClass);
          this.modalEl.removeClass(options.triggerClass);
        }
        this.handledEscapeKey = function (e) {
          if (e.which === 27) {
            self.close();
            e.preventDefault();
            self.$scope.$apply();
          }
        };
        this.handleBackDropClick = function (e) {
          self.close();
          e.preventDefault();
          self.$scope.$apply();
        };
        this.handleLocationChange = function () {
          self.close();
        };
      }
      Dialog.prototype.isOpen = function () {
        return this._open;
      };
      Dialog.prototype.open = function (templateUrl, controller) {
        var self = this, options = this.options;
        if (templateUrl) {
          options.templateUrl = templateUrl;
        }
        if (controller) {
          options.controller = controller;
        }
        if (!(options.template || options.templateUrl)) {
          throw new Error('Dialog.open expected template or templateUrl, neither found. Use options or open method to specify them.');
        }
        this._loadResolves().then(function (locals) {
          var $scope = locals.$scope = self.$scope = locals.$scope ? locals.$scope : $rootScope.$new();
          self.modalEl.html(locals.$template);
          if (self.options.controller) {
            var ctrl = $controller(self.options.controller, locals);
            self.modalEl.children().data('ngControllerController', ctrl);
          }
          $compile(self.modalEl)($scope);
          self._addElementsToDom();
          setTimeout(function () {
            if (self.options.dialogFade) {
              self.modalEl.addClass(self.options.triggerClass);
            }
            if (self.options.backdropFade) {
              self.backdropEl.addClass(self.options.triggerClass);
            }
          });
          self._bindEvents();
        });
        this.deferred = $q.defer();
        return this.deferred.promise;
      };
      Dialog.prototype.close = function (result) {
        var self = this;
        var fadingElements = this._getFadingElements();
        if (fadingElements.length > 0) {
          for (var i = fadingElements.length - 1; i >= 0; i--) {
            $transition(fadingElements[i], removeTriggerClass).then(onCloseComplete);
          }
          return;
        }
        this._onCloseComplete(result);
        function removeTriggerClass(el) {
          el.removeClass(self.options.triggerClass);
        }
        function onCloseComplete() {
          if (self._open) {
            self._onCloseComplete(result);
          }
        }
      };
      Dialog.prototype._getFadingElements = function () {
        var elements = [];
        if (this.options.dialogFade) {
          elements.push(this.modalEl);
        }
        if (this.options.backdropFade) {
          elements.push(this.backdropEl);
        }
        return elements;
      };
      Dialog.prototype._bindEvents = function () {
        if (this.options.keyboard) {
          body.bind('keydown', this.handledEscapeKey);
        }
        if (this.options.backdrop && this.options.backdropClick) {
          this.backdropEl.bind('click', this.handleBackDropClick);
        }
      };
      Dialog.prototype._unbindEvents = function () {
        if (this.options.keyboard) {
          body.unbind('keydown', this.handledEscapeKey);
        }
        if (this.options.backdrop && this.options.backdropClick) {
          this.backdropEl.unbind('click', this.handleBackDropClick);
        }
      };
      Dialog.prototype._onCloseComplete = function (result) {
        this._removeElementsFromDom();
        this._unbindEvents();
        this.deferred.resolve(result);
      };
      Dialog.prototype._addElementsToDom = function () {
        body.append(this.modalEl);
        if (this.options.backdrop) {
          if (activeBackdrops.value === 0) {
            body.append(this.backdropEl);
          }
          activeBackdrops.value++;
        }
        this._open = true;
      };
      Dialog.prototype._removeElementsFromDom = function () {
        this.modalEl.remove();
        if (this.options.backdrop) {
          activeBackdrops.value--;
          if (activeBackdrops.value === 0) {
            this.backdropEl.remove();
          }
        }
        this._open = false;
      };
      Dialog.prototype._loadResolves = function () {
        var values = [], keys = [], templatePromise, self = this;
        if (this.options.template) {
          templatePromise = $q.when(this.options.template);
        } else if (this.options.templateUrl) {
          templatePromise = $http.get(this.options.templateUrl, { cache: $templateCache }).then(function (response) {
            return response.data;
          });
        }
        angular.forEach(this.options.resolve || [], function (value, key) {
          keys.push(key);
          values.push(angular.isString(value) ? $injector.get(value) : $injector.invoke(value));
        });
        keys.push('$template');
        values.push(templatePromise);
        return $q.all(values).then(function (values) {
          var locals = {};
          angular.forEach(values, function (value, index) {
            locals[keys[index]] = value;
          });
          locals.dialog = self;
          return locals;
        });
      };
      return {
        dialog: function (opts) {
          return new Dialog(opts);
        },
        messageBox: function (title, message, buttons) {
          return new Dialog({
            templateUrl: 'template/dialog/message.html',
            controller: 'MessageBoxController',
            resolve: {
              model: function () {
                return {
                  title: title,
                  message: message,
                  buttons: buttons
                };
              }
            }
          });
        }
      };
    }
  ];
});
angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', [
  '$document',
  '$location',
  function ($document, $location) {
    var openElement = null, closeMenu = angular.noop;
    return {
      restrict: 'CA',
      link: function (scope, element, attrs) {
        scope.$watch('$location.path', function () {
          closeMenu();
        });
        element.parent().bind('click', function () {
          closeMenu();
        });
        element.bind('click', function (event) {
          var elementWasOpen = element === openElement;
          event.preventDefault();
          event.stopPropagation();
          if (!!openElement) {
            closeMenu();
          }
          if (!elementWasOpen) {
            element.parent().addClass('open');
            openElement = element;
            closeMenu = function (event) {
              if (event) {
                event.preventDefault();
                event.stopPropagation();
              }
              $document.unbind('click', closeMenu);
              element.parent().removeClass('open');
              closeMenu = angular.noop;
              openElement = null;
            };
            $document.bind('click', closeMenu);
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.modal', ['ui.bootstrap.dialog']).directive('modal', [
  '$parse',
  '$dialog',
  function ($parse, $dialog) {
    return {
      restrict: 'EA',
      terminal: true,
      link: function (scope, elm, attrs) {
        var opts = angular.extend({}, scope.$eval(attrs.uiOptions || attrs.bsOptions || attrs.options));
        var shownExpr = attrs.modal || attrs.show;
        var setClosed;
        opts = angular.extend(opts, {
          template: elm.html(),
          resolve: {
            $scope: function () {
              return scope;
            }
          }
        });
        var dialog = $dialog.dialog(opts);
        elm.remove();
        if (attrs.close) {
          setClosed = function () {
            $parse(attrs.close)(scope);
          };
        } else {
          setClosed = function () {
            if (angular.isFunction($parse(shownExpr).assign)) {
              $parse(shownExpr).assign(scope, false);
            }
          };
        }
        scope.$watch(shownExpr, function (isShown, oldShown) {
          if (isShown) {
            dialog.open().then(function () {
              setClosed();
            });
          } else {
            if (dialog.isOpen()) {
              dialog.close();
            }
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.pagination', []).controller('PaginationController', [
  '$scope',
  function (scope) {
    scope.noPrevious = function () {
      return scope.currentPage === 1;
    };
    scope.noNext = function () {
      return scope.currentPage === scope.numPages;
    };
    scope.isActive = function (page) {
      return scope.currentPage === page;
    };
    scope.selectPage = function (page) {
      if (!scope.isActive(page) && page > 0 && page <= scope.numPages) {
        scope.currentPage = page;
        scope.onSelectPage({ page: page });
      }
    };
  }
]).constant('paginationConfig', {
  boundaryLinks: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: true
}).directive('pagination', [
  'paginationConfig',
  function (paginationConfig) {
    return {
      restrict: 'EA',
      scope: {
        numPages: '=',
        currentPage: '=',
        maxSize: '=',
        onSelectPage: '&'
      },
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pagination.html',
      replace: true,
      link: function (scope, element, attrs) {
        var boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks;
        var directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$eval(attrs.directionLinks) : paginationConfig.directionLinks;
        var firstText = angular.isDefined(attrs.firstText) ? scope.$parent.$eval(attrs.firstText) : paginationConfig.firstText;
        var previousText = angular.isDefined(attrs.previousText) ? scope.$parent.$eval(attrs.previousText) : paginationConfig.previousText;
        var nextText = angular.isDefined(attrs.nextText) ? scope.$parent.$eval(attrs.nextText) : paginationConfig.nextText;
        var lastText = angular.isDefined(attrs.lastText) ? scope.$parent.$eval(attrs.lastText) : paginationConfig.lastText;
        var rotate = angular.isDefined(attrs.rotate) ? scope.$eval(attrs.rotate) : paginationConfig.rotate;
        function makePage(number, text, isActive, isDisabled) {
          return {
            number: number,
            text: text,
            active: isActive,
            disabled: isDisabled
          };
        }
        scope.$watch('numPages + currentPage + maxSize', function () {
          scope.pages = [];
          var startPage = 1, endPage = scope.numPages;
          var isMaxSized = angular.isDefined(scope.maxSize) && scope.maxSize < scope.numPages;
          if (isMaxSized) {
            if (rotate) {
              startPage = Math.max(scope.currentPage - Math.floor(scope.maxSize / 2), 1);
              endPage = startPage + scope.maxSize - 1;
              if (endPage > scope.numPages) {
                endPage = scope.numPages;
                startPage = endPage - scope.maxSize + 1;
              }
            } else {
              startPage = (Math.ceil(scope.currentPage / scope.maxSize) - 1) * scope.maxSize + 1;
              endPage = Math.min(startPage + scope.maxSize - 1, scope.numPages);
            }
          }
          for (var number = startPage; number <= endPage; number++) {
            var page = makePage(number, number, scope.isActive(number), false);
            scope.pages.push(page);
          }
          if (isMaxSized && !rotate) {
            if (startPage > 1) {
              var previousPageSet = makePage(startPage - 1, '...', false, false);
              scope.pages.unshift(previousPageSet);
            }
            if (endPage < scope.numPages) {
              var nextPageSet = makePage(endPage + 1, '...', false, false);
              scope.pages.push(nextPageSet);
            }
          }
          if (directionLinks) {
            var previousPage = makePage(scope.currentPage - 1, previousText, false, scope.noPrevious());
            scope.pages.unshift(previousPage);
            var nextPage = makePage(scope.currentPage + 1, nextText, false, scope.noNext());
            scope.pages.push(nextPage);
          }
          if (boundaryLinks) {
            var firstPage = makePage(1, firstText, false, scope.noPrevious());
            scope.pages.unshift(firstPage);
            var lastPage = makePage(scope.numPages, lastText, false, scope.noNext());
            scope.pages.push(lastPage);
          }
          if (scope.currentPage > scope.numPages) {
            scope.selectPage(scope.numPages);
          }
        });
      }
    };
  }
]).constant('pagerConfig', {
  previousText: '\xab Previous',
  nextText: 'Next \xbb',
  align: true
}).directive('pager', [
  'pagerConfig',
  function (config) {
    return {
      restrict: 'EA',
      scope: {
        numPages: '=',
        currentPage: '=',
        onSelectPage: '&'
      },
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pager.html',
      replace: true,
      link: function (scope, element, attrs, paginationCtrl) {
        var previousText = angular.isDefined(attrs.previousText) ? scope.$parent.$eval(attrs.previousText) : config.previousText;
        var nextText = angular.isDefined(attrs.nextText) ? scope.$parent.$eval(attrs.nextText) : config.nextText;
        var align = angular.isDefined(attrs.align) ? scope.$parent.$eval(attrs.align) : config.align;
        function makePage(number, text, isDisabled, isPrevious, isNext) {
          return {
            number: number,
            text: text,
            disabled: isDisabled,
            previous: align && isPrevious,
            next: align && isNext
          };
        }
        scope.$watch('numPages + currentPage', function () {
          scope.pages = [];
          var previousPage = makePage(scope.currentPage - 1, previousText, scope.noPrevious(), true, false);
          scope.pages.unshift(previousPage);
          var nextPage = makePage(scope.currentPage + 1, nextText, scope.noNext(), false, true);
          scope.pages.push(nextPage);
          if (scope.currentPage > scope.numPages) {
            scope.selectPage(scope.numPages);
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.position', []).factory('$position', [
  '$document',
  '$window',
  function ($document, $window) {
    var mouseX, mouseY;
    $document.bind('mousemove', function mouseMoved(event) {
      mouseX = event.pageX;
      mouseY = event.pageY;
    });
    function getStyle(el, cssprop) {
      if (el.currentStyle) {
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      return el.style[cssprop];
    }
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static') === 'static';
    }
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };
    return {
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = {
            top: 0,
            left: 0
          };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop;
          offsetParentBCR.left += offsetParentEl.clientLeft;
        }
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft)
        };
      },
      mouse: function () {
        return {
          x: mouseX,
          y: mouseY
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.tooltip', ['ui.bootstrap.position']).provider('$tooltip', function () {
  var defaultOptions = {
      placement: 'top',
      animation: true,
      popupDelay: 0
    };
  var triggerMap = {
      'mouseenter': 'mouseleave',
      'click': 'click',
      'focus': 'blur'
    };
  var globalOptions = {};
  this.options = function (value) {
    angular.extend(globalOptions, value);
  };
  this.setTriggers = function setTriggers(triggers) {
    angular.extend(triggerMap, triggers);
  };
  function snake_case(name) {
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }
  this.$get = [
    '$window',
    '$compile',
    '$timeout',
    '$parse',
    '$document',
    '$position',
    '$interpolate',
    function ($window, $compile, $timeout, $parse, $document, $position, $interpolate) {
      return function $tooltip(type, prefix, defaultTriggerShow) {
        var options = angular.extend({}, defaultOptions, globalOptions);
        function setTriggers(trigger) {
          var show, hide;
          show = trigger || options.trigger || defaultTriggerShow;
          if (angular.isDefined(options.trigger)) {
            hide = triggerMap[options.trigger] || show;
          } else {
            hide = triggerMap[show] || show;
          }
          return {
            show: show,
            hide: hide
          };
        }
        var directiveName = snake_case(type);
        var triggers = setTriggers(undefined);
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        var template = '<' + directiveName + '-popup ' + 'title="' + startSym + 'tt_title' + endSym + '" ' + 'content="' + startSym + 'tt_content' + endSym + '" ' + 'placement="' + startSym + 'tt_placement' + endSym + '" ' + 'animation="tt_animation()" ' + 'is-open="tt_isOpen"' + '>' + '</' + directiveName + '-popup>';
        return {
          restrict: 'EA',
          scope: true,
          link: function link(scope, element, attrs) {
            var tooltip = $compile(template)(scope);
            var transitionTimeout;
            var popupTimeout;
            var $body;
            var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
            scope.tt_isOpen = false;
            function toggleTooltipBind() {
              if (!scope.tt_isOpen) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }
            function showTooltipBind() {
              if (scope.tt_popupDelay) {
                popupTimeout = $timeout(show, scope.tt_popupDelay);
              } else {
                scope.$apply(show);
              }
            }
            function hideTooltipBind() {
              scope.$apply(function () {
                hide();
              });
            }
            function show() {
              var position, ttWidth, ttHeight, ttPosition;
              if (!scope.tt_content) {
                return;
              }
              if (transitionTimeout) {
                $timeout.cancel(transitionTimeout);
              }
              tooltip.css({
                top: 0,
                left: 0,
                display: 'block'
              });
              if (appendToBody) {
                $body = $body || $document.find('body');
                $body.append(tooltip);
              } else {
                element.after(tooltip);
              }
              position = options.appendToBody ? $position.offset(element) : $position.position(element);
              ttWidth = tooltip.prop('offsetWidth');
              ttHeight = tooltip.prop('offsetHeight');
              switch (scope.tt_placement) {
              case 'mouse':
                var mousePos = $position.mouse();
                ttPosition = {
                  top: mousePos.y,
                  left: mousePos.x
                };
                break;
              case 'right':
                ttPosition = {
                  top: position.top + position.height / 2 - ttHeight / 2,
                  left: position.left + position.width
                };
                break;
              case 'bottom':
                ttPosition = {
                  top: position.top + position.height,
                  left: position.left + position.width / 2 - ttWidth / 2
                };
                break;
              case 'left':
                ttPosition = {
                  top: position.top + position.height / 2 - ttHeight / 2,
                  left: position.left - ttWidth
                };
                break;
              default:
                ttPosition = {
                  top: position.top - ttHeight,
                  left: position.left + position.width / 2 - ttWidth / 2
                };
                break;
              }
              ttPosition.top += 'px';
              ttPosition.left += 'px';
              tooltip.css(ttPosition);
              scope.tt_isOpen = true;
            }
            function hide() {
              scope.tt_isOpen = false;
              $timeout.cancel(popupTimeout);
              if (angular.isDefined(scope.tt_animation) && scope.tt_animation()) {
                transitionTimeout = $timeout(function () {
                  tooltip.remove();
                }, 500);
              } else {
                tooltip.remove();
              }
            }
            attrs.$observe(type, function (val) {
              scope.tt_content = val;
            });
            attrs.$observe(prefix + 'Title', function (val) {
              scope.tt_title = val;
            });
            attrs.$observe(prefix + 'Placement', function (val) {
              scope.tt_placement = angular.isDefined(val) ? val : options.placement;
            });
            attrs.$observe(prefix + 'Animation', function (val) {
              scope.tt_animation = angular.isDefined(val) ? $parse(val) : function () {
                return options.animation;
              };
            });
            attrs.$observe(prefix + 'PopupDelay', function (val) {
              var delay = parseInt(val, 10);
              scope.tt_popupDelay = !isNaN(delay) ? delay : options.popupDelay;
            });
            attrs.$observe(prefix + 'Trigger', function (val) {
              element.unbind(triggers.show);
              element.unbind(triggers.hide);
              triggers = setTriggers(val);
              if (triggers.show === triggers.hide) {
                element.bind(triggers.show, toggleTooltipBind);
              } else {
                element.bind(triggers.show, showTooltipBind);
                element.bind(triggers.hide, hideTooltipBind);
              }
            });
            attrs.$observe(prefix + 'AppendToBody', function (val) {
              appendToBody = angular.isDefined(val) ? $parse(val)(scope) : appendToBody;
            });
            if (appendToBody) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess() {
                if (scope.tt_isOpen) {
                  hide();
                }
              });
            }
            scope.$on('$destroy', function onDestroyTooltip() {
              if (scope.tt_isOpen) {
                hide();
              } else {
                tooltip.remove();
              }
            });
          }
        };
      };
    }
  ];
}).directive('tooltipPopup', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
}).directive('tooltip', [
  '$tooltip',
  function ($tooltip) {
    return $tooltip('tooltip', 'tooltip', 'mouseenter');
  }
]).directive('tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
}).directive('tooltipHtmlUnsafe', [
  '$tooltip',
  function ($tooltip) {
    return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
  }
]);
angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip']).directive('popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      title: '@',
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/popover/popover.html'
  };
}).directive('popover', [
  '$compile',
  '$timeout',
  '$parse',
  '$window',
  '$tooltip',
  function ($compile, $timeout, $parse, $window, $tooltip) {
    return $tooltip('popover', 'popover', 'click');
  }
]);
angular.module('ui.bootstrap.progressbar', ['ui.bootstrap.transition']).constant('progressConfig', {
  animate: true,
  autoType: false,
  stackedTypes: [
    'success',
    'info',
    'warning',
    'danger'
  ]
}).controller('ProgressBarController', [
  '$scope',
  '$attrs',
  'progressConfig',
  function ($scope, $attrs, progressConfig) {
    var animate = angular.isDefined($attrs.animate) ? $scope.$eval($attrs.animate) : progressConfig.animate;
    var autoType = angular.isDefined($attrs.autoType) ? $scope.$eval($attrs.autoType) : progressConfig.autoType;
    var stackedTypes = angular.isDefined($attrs.stackedTypes) ? $scope.$eval('[' + $attrs.stackedTypes + ']') : progressConfig.stackedTypes;
    this.makeBar = function (newBar, oldBar, index) {
      var newValue = angular.isObject(newBar) ? newBar.value : newBar || 0;
      var oldValue = angular.isObject(oldBar) ? oldBar.value : oldBar || 0;
      var type = angular.isObject(newBar) && angular.isDefined(newBar.type) ? newBar.type : autoType ? getStackedType(index || 0) : null;
      return {
        from: oldValue,
        to: newValue,
        type: type,
        animate: animate
      };
    };
    function getStackedType(index) {
      return stackedTypes[index];
    }
    this.addBar = function (bar) {
      $scope.bars.push(bar);
      $scope.totalPercent += bar.to;
    };
    this.clearBars = function () {
      $scope.bars = [];
      $scope.totalPercent = 0;
    };
    this.clearBars();
  }
]).directive('progress', function () {
  return {
    restrict: 'EA',
    replace: true,
    controller: 'ProgressBarController',
    scope: {
      value: '=percent',
      onFull: '&',
      onEmpty: '&'
    },
    templateUrl: 'template/progressbar/progress.html',
    link: function (scope, element, attrs, controller) {
      scope.$watch('value', function (newValue, oldValue) {
        controller.clearBars();
        if (angular.isArray(newValue)) {
          for (var i = 0, n = newValue.length; i < n; i++) {
            controller.addBar(controller.makeBar(newValue[i], oldValue[i], i));
          }
        } else {
          controller.addBar(controller.makeBar(newValue, oldValue));
        }
      }, true);
      scope.$watch('totalPercent', function (value) {
        if (value >= 100) {
          scope.onFull();
        } else if (value <= 0) {
          scope.onEmpty();
        }
      }, true);
    }
  };
}).directive('progressbar', [
  '$transition',
  function ($transition) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        width: '=',
        old: '=',
        type: '=',
        animate: '='
      },
      templateUrl: 'template/progressbar/bar.html',
      link: function (scope, element) {
        scope.$watch('width', function (value) {
          if (scope.animate) {
            element.css('width', scope.old + '%');
            $transition(element, { width: value + '%' });
          } else {
            element.css('width', value + '%');
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.rating', []).constant('ratingConfig', { max: 5 }).directive('rating', [
  'ratingConfig',
  '$parse',
  function (ratingConfig, $parse) {
    return {
      restrict: 'EA',
      scope: { value: '=' },
      templateUrl: 'template/rating/rating.html',
      replace: true,
      link: function (scope, element, attrs) {
        var maxRange = angular.isDefined(attrs.max) ? scope.$eval(attrs.max) : ratingConfig.max;
        scope.range = [];
        for (var i = 1; i <= maxRange; i++) {
          scope.range.push(i);
        }
        scope.rate = function (value) {
          if (!scope.readonly) {
            scope.value = value;
          }
        };
        scope.enter = function (value) {
          if (!scope.readonly) {
            scope.val = value;
          }
        };
        scope.reset = function () {
          scope.val = angular.copy(scope.value);
        };
        scope.reset();
        scope.$watch('value', function (value) {
          scope.val = value;
        });
        scope.readonly = false;
        if (attrs.readonly) {
          scope.$parent.$watch($parse(attrs.readonly), function (value) {
            scope.readonly = !!value;
          });
        }
      }
    };
  }
]);
angular.module('ui.bootstrap.tabs', []).directive('tabs', function () {
  return function () {
    throw new Error('The `tabs` directive is deprecated, please migrate to `tabset`. Instructions can be found at http://github.com/angular-ui/bootstrap/tree/master/CHANGELOG.md');
  };
}).controller('TabsetController', [
  '$scope',
  '$element',
  function TabsetCtrl($scope, $element) {
    var ctrl = this, tabs = ctrl.tabs = $scope.tabs = [];
    ctrl.select = function (tab) {
      angular.forEach(tabs, function (tab) {
        tab.active = false;
      });
      tab.active = true;
    };
    ctrl.addTab = function addTab(tab) {
      tabs.push(tab);
      if (tabs.length == 1) {
        ctrl.select(tab);
      }
    };
    ctrl.removeTab = function removeTab(tab) {
      var index = tabs.indexOf(tab);
      if (tab.active && tabs.length > 1) {
        var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
        ctrl.select(tabs[newActiveIndex]);
      }
      tabs.splice(index, 1);
    };
  }
]).directive('tabset', function () {
  return {
    restrict: 'EA',
    transclude: true,
    scope: {},
    controller: 'TabsetController',
    templateUrl: 'template/tabs/tabset.html',
    link: function (scope, element, attrs) {
      scope.vertical = angular.isDefined(attrs.vertical) ? scope.$eval(attrs.vertical) : false;
      scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : 'tabs';
    }
  };
}).directive('tab', [
  '$parse',
  '$http',
  '$templateCache',
  '$compile',
  function ($parse, $http, $templateCache, $compile) {
    return {
      require: '^tabset',
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/tabs/tab.html',
      transclude: true,
      scope: {
        heading: '@',
        onSelect: '&select'
      },
      controller: function () {
      },
      compile: function (elm, attrs, transclude) {
        return function postLink(scope, elm, attrs, tabsetCtrl) {
          var getActive, setActive;
          scope.active = false;
          if (attrs.active) {
            getActive = $parse(attrs.active);
            setActive = getActive.assign;
            scope.$parent.$watch(getActive, function updateActive(value) {
              if (!!value && scope.disabled) {
                setActive(scope.$parent, false);
              } else {
                scope.active = !!value;
              }
            });
          } else {
            setActive = getActive = angular.noop;
          }
          scope.$watch('active', function (active) {
            setActive(scope.$parent, active);
            if (active) {
              tabsetCtrl.select(scope);
              scope.onSelect();
            }
          });
          scope.disabled = false;
          if (attrs.disabled) {
            scope.$parent.$watch($parse(attrs.disabled), function (value) {
              scope.disabled = !!value;
            });
          }
          scope.select = function () {
            if (!scope.disabled) {
              scope.active = true;
            }
          };
          tabsetCtrl.addTab(scope);
          scope.$on('$destroy', function () {
            tabsetCtrl.removeTab(scope);
          });
          if (scope.active) {
            setActive(scope.$parent, true);
          }
          transclude(scope.$parent, function (clone) {
            var contents = [], heading;
            angular.forEach(clone, function (el) {
              if (el.tagName && (el.hasAttribute('tab-heading') || el.hasAttribute('data-tab-heading') || el.tagName.toLowerCase() == 'tab-heading' || el.tagName.toLowerCase() == 'data-tab-heading')) {
                heading = el;
              } else {
                contents.push(el);
              }
            });
            if (heading) {
              scope.headingElement = angular.element(heading);
            }
            scope.contentElement = angular.element(contents);
          });
        };
      }
    };
  }
]).directive('tabHeadingTransclude', [function () {
    return {
      restrict: 'A',
      require: '^tab',
      link: function (scope, elm, attrs, tabCtrl) {
        scope.$watch('headingElement', function updateHeadingElement(heading) {
          if (heading) {
            elm.html('');
            elm.append(heading);
          }
        });
      }
    };
  }]).directive('tabContentTransclude', [
  '$parse',
  function ($parse) {
    return {
      restrict: 'A',
      require: '^tabset',
      link: function (scope, elm, attrs, tabsetCtrl) {
        scope.$watch($parse(attrs.tabContentTransclude), function (tab) {
          elm.html('');
          if (tab) {
            elm.append(tab.contentElement);
          }
        });
      }
    };
  }
]);
;
angular.module('ui.bootstrap.timepicker', []).filter('pad', function () {
  return function (input) {
    if (angular.isDefined(input) && input.toString().length < 2) {
      input = '0' + input;
    }
    return input;
  };
}).constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  showMeridian: true,
  meridians: [
    'AM',
    'PM'
  ],
  readonlyInput: false,
  mousewheel: true
}).directive('timepicker', [
  'padFilter',
  '$parse',
  'timepickerConfig',
  function (padFilter, $parse, timepickerConfig) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      replace: true,
      templateUrl: 'template/timepicker/timepicker.html',
      scope: { model: '=ngModel' },
      link: function (scope, element, attrs, ngModelCtrl) {
        var selected = new Date(), meridians = timepickerConfig.meridians;
        var hourStep = timepickerConfig.hourStep;
        if (attrs.hourStep) {
          scope.$parent.$watch($parse(attrs.hourStep), function (value) {
            hourStep = parseInt(value, 10);
          });
        }
        var minuteStep = timepickerConfig.minuteStep;
        if (attrs.minuteStep) {
          scope.$parent.$watch($parse(attrs.minuteStep), function (value) {
            minuteStep = parseInt(value, 10);
          });
        }
        scope.showMeridian = timepickerConfig.showMeridian;
        if (attrs.showMeridian) {
          scope.$parent.$watch($parse(attrs.showMeridian), function (value) {
            scope.showMeridian = !!value;
            if (!scope.model) {
              var dt = new Date(selected);
              var hours = getScopeHours();
              if (angular.isDefined(hours)) {
                dt.setHours(hours);
              }
              scope.model = new Date(dt);
            } else {
              refreshTemplate();
            }
          });
        }
        function getScopeHours() {
          var hours = parseInt(scope.hours, 10);
          var valid = scope.showMeridian ? hours > 0 && hours < 13 : hours >= 0 && hours < 24;
          if (!valid) {
            return;
          }
          if (scope.showMeridian) {
            if (hours === 12) {
              hours = 0;
            }
            if (scope.meridian === meridians[1]) {
              hours = hours + 12;
            }
          }
          return hours;
        }
        var inputs = element.find('input');
        var hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1);
        var mousewheel = angular.isDefined(attrs.mousewheel) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;
        if (mousewheel) {
          var isScrollingUp = function (e) {
            if (e.originalEvent) {
              e = e.originalEvent;
            }
            return e.detail || e.wheelDelta > 0;
          };
          hoursInputEl.bind('mousewheel', function (e) {
            scope.$apply(isScrollingUp(e) ? scope.incrementHours() : scope.decrementHours());
            e.preventDefault();
          });
          minutesInputEl.bind('mousewheel', function (e) {
            scope.$apply(isScrollingUp(e) ? scope.incrementMinutes() : scope.decrementMinutes());
            e.preventDefault();
          });
        }
        var keyboardChange = false;
        scope.readonlyInput = angular.isDefined(attrs.readonlyInput) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput;
        if (!scope.readonlyInput) {
          scope.updateHours = function () {
            var hours = getScopeHours();
            if (angular.isDefined(hours)) {
              keyboardChange = 'h';
              if (scope.model === null) {
                scope.model = new Date(selected);
              }
              scope.model.setHours(hours);
            } else {
              scope.model = null;
              scope.validHours = false;
            }
          };
          hoursInputEl.bind('blur', function (e) {
            if (scope.validHours && scope.hours < 10) {
              scope.$apply(function () {
                scope.hours = padFilter(scope.hours);
              });
            }
          });
          scope.updateMinutes = function () {
            var minutes = parseInt(scope.minutes, 10);
            if (minutes >= 0 && minutes < 60) {
              keyboardChange = 'm';
              if (scope.model === null) {
                scope.model = new Date(selected);
              }
              scope.model.setMinutes(minutes);
            } else {
              scope.model = null;
              scope.validMinutes = false;
            }
          };
          minutesInputEl.bind('blur', function (e) {
            if (scope.validMinutes && scope.minutes < 10) {
              scope.$apply(function () {
                scope.minutes = padFilter(scope.minutes);
              });
            }
          });
        } else {
          scope.updateHours = angular.noop;
          scope.updateMinutes = angular.noop;
        }
        scope.$watch(function getModelTimestamp() {
          return +scope.model;
        }, function (timestamp) {
          if (!isNaN(timestamp) && timestamp > 0) {
            selected = new Date(timestamp);
            refreshTemplate();
          }
        });
        function refreshTemplate() {
          var hours = selected.getHours();
          if (scope.showMeridian) {
            hours = hours === 0 || hours === 12 ? 12 : hours % 12;
          }
          scope.hours = keyboardChange === 'h' ? hours : padFilter(hours);
          scope.validHours = true;
          var minutes = selected.getMinutes();
          scope.minutes = keyboardChange === 'm' ? minutes : padFilter(minutes);
          scope.validMinutes = true;
          scope.meridian = scope.showMeridian ? selected.getHours() < 12 ? meridians[0] : meridians[1] : '';
          keyboardChange = false;
        }
        function addMinutes(minutes) {
          var dt = new Date(selected.getTime() + minutes * 60000);
          if (dt.getDate() !== selected.getDate()) {
            dt.setDate(dt.getDate() - 1);
          }
          selected.setTime(dt.getTime());
          scope.model = new Date(selected);
        }
        scope.incrementHours = function () {
          addMinutes(hourStep * 60);
        };
        scope.decrementHours = function () {
          addMinutes(-hourStep * 60);
        };
        scope.incrementMinutes = function () {
          addMinutes(minuteStep);
        };
        scope.decrementMinutes = function () {
          addMinutes(-minuteStep);
        };
        scope.toggleMeridian = function () {
          addMinutes(12 * 60 * (selected.getHours() < 12 ? 1 : -1));
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.position']).factory('typeaheadParser', [
  '$parse',
  function ($parse) {
    var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;
    return {
      parse: function (input) {
        var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
        if (!match) {
          throw new Error('Expected typeahead specification in form of \'_modelValue_ (as _label_)? for _item_ in _collection_\'' + ' but got \'' + input + '\'.');
        }
        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
  }
]).directive('typeahead', [
  '$compile',
  '$parse',
  '$q',
  '$timeout',
  '$document',
  '$position',
  'typeaheadParser',
  function ($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {
    var HOT_KEYS = [
        9,
        13,
        27,
        38,
        40
      ];
    return {
      require: 'ngModel',
      link: function (originalScope, element, attrs, modelCtrl) {
        var selected;
        var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;
        var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;
        var parserResult = typeaheadParser.parse(attrs.typeahead);
        var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
        var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;
        var onSelectCallback = $parse(attrs.typeaheadOnSelect);
        var popUpEl = angular.element('<typeahead-popup></typeahead-popup>');
        popUpEl.attr({
          matches: 'matches',
          active: 'activeIdx',
          select: 'select(activeIdx)',
          query: 'query',
          position: 'position'
        });
        var scope = originalScope.$new();
        originalScope.$on('$destroy', function () {
          scope.$destroy();
        });
        var resetMatches = function () {
          scope.matches = [];
          scope.activeIdx = -1;
        };
        var getMatchesAsync = function (inputValue) {
          var locals = { $viewValue: inputValue };
          isLoadingSetter(originalScope, true);
          $q.when(parserResult.source(scope, locals)).then(function (matches) {
            if (inputValue === modelCtrl.$viewValue) {
              if (matches.length > 0) {
                scope.activeIdx = 0;
                scope.matches.length = 0;
                for (var i = 0; i < matches.length; i++) {
                  locals[parserResult.itemName] = matches[i];
                  scope.matches.push({
                    label: parserResult.viewMapper(scope, locals),
                    model: matches[i]
                  });
                }
                scope.query = inputValue;
                scope.position = $position.position(element);
                scope.position.top = scope.position.top + element.prop('offsetHeight');
              } else {
                resetMatches();
              }
              isLoadingSetter(originalScope, false);
            }
          }, function () {
            resetMatches();
            isLoadingSetter(originalScope, false);
          });
        };
        resetMatches();
        scope.query = undefined;
        modelCtrl.$parsers.push(function (inputValue) {
          var timeoutId;
          resetMatches();
          if (selected) {
            return inputValue;
          } else {
            if (inputValue && inputValue.length >= minSearch) {
              if (waitTime > 0) {
                if (timeoutId) {
                  $timeout.cancel(timeoutId);
                }
                timeoutId = $timeout(function () {
                  getMatchesAsync(inputValue);
                }, waitTime);
              } else {
                getMatchesAsync(inputValue);
              }
            }
          }
          return isEditable ? inputValue : undefined;
        });
        modelCtrl.$render = function () {
          var locals = {};
          locals[parserResult.itemName] = selected || modelCtrl.$viewValue;
          element.val(parserResult.viewMapper(scope, locals) || modelCtrl.$viewValue);
          selected = undefined;
        };
        scope.select = function (activeIdx) {
          var locals = {};
          var model, item;
          locals[parserResult.itemName] = item = selected = scope.matches[activeIdx].model;
          model = parserResult.modelMapper(scope, locals);
          modelCtrl.$setViewValue(model);
          modelCtrl.$render();
          onSelectCallback(scope, {
            $item: item,
            $model: model,
            $label: parserResult.viewMapper(scope, locals)
          });
          element[0].focus();
        };
        element.bind('keydown', function (evt) {
          if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
            return;
          }
          evt.preventDefault();
          if (evt.which === 40) {
            scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
            scope.$digest();
          } else if (evt.which === 38) {
            scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1;
            scope.$digest();
          } else if (evt.which === 13 || evt.which === 9) {
            scope.$apply(function () {
              scope.select(scope.activeIdx);
            });
          } else if (evt.which === 27) {
            evt.stopPropagation();
            resetMatches();
            scope.$digest();
          }
        });
        $document.bind('click', function () {
          resetMatches();
          scope.$digest();
        });
        element.after($compile(popUpEl)(scope));
      }
    };
  }
]).directive('typeaheadPopup', function () {
  return {
    restrict: 'E',
    scope: {
      matches: '=',
      query: '=',
      active: '=',
      position: '=',
      select: '&'
    },
    replace: true,
    templateUrl: 'template/typeahead/typeahead.html',
    link: function (scope, element, attrs) {
      scope.isOpen = function () {
        return scope.matches.length > 0;
      };
      scope.isActive = function (matchIdx) {
        return scope.active == matchIdx;
      };
      scope.selectActive = function (matchIdx) {
        scope.active = matchIdx;
      };
      scope.selectMatch = function (activeIdx) {
        scope.select({ activeIdx: activeIdx });
      };
    }
  };
}).filter('typeaheadHighlight', function () {
  function escapeRegexp(queryToEscape) {
    return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  }
  return function (matchItem, query) {
    return query ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : query;
  };
});
angular.module('template/accordion/accordion-group.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/accordion/accordion-group.html', '<div class="accordion-group">\n' + '  <div class="accordion-heading" ><a class="accordion-toggle" ng-click="isOpen = !isOpen" accordion-transclude="heading">{{heading}}</a></div>\n' + '  <div class="accordion-body" collapse="!isOpen">\n' + '    <div class="accordion-inner" ng-transclude></div>  </div>\n' + '</div>');
  }
]);
angular.module('template/accordion/accordion.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/accordion/accordion.html', '<div class="accordion" ng-transclude></div>');
  }
]);
angular.module('template/alert/alert.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/alert/alert.html', '<div class=\'alert\' ng-class=\'type && "alert-" + type\'>\n' + '    <button ng-show=\'closeable\' type=\'button\' class=\'close\' ng-click=\'close()\'>&times;</button>\n' + '    <div ng-transclude></div>\n' + '</div>\n' + '');
  }
]);
angular.module('template/carousel/carousel.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/carousel/carousel.html', '<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel">\n' + '    <ol class="carousel-indicators" ng-show="slides().length > 1">\n' + '        <li ng-repeat="slide in slides()" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n' + '    </ol>\n' + '    <div class="carousel-inner" ng-transclude></div>\n' + '    <a ng-click="prev()" class="carousel-control left" ng-show="slides().length > 1">&lsaquo;</a>\n' + '    <a ng-click="next()" class="carousel-control right" ng-show="slides().length > 1">&rsaquo;</a>\n' + '</div>\n' + '');
  }
]);
angular.module('template/carousel/slide.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/carousel/slide.html', '<div ng-class="{\n' + '    \'active\': leaving || (active && !entering),\n' + '    \'prev\': (next || active) && direction==\'prev\',\n' + '    \'next\': (next || active) && direction==\'next\',\n' + '    \'right\': direction==\'prev\',\n' + '    \'left\': direction==\'next\'\n' + '  }" class="item" ng-transclude></div>\n' + '');
  }
]);
angular.module('template/datepicker/datepicker.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/datepicker/datepicker.html', '<table class="well well-large">\n' + '  <thead>\n' + '    <tr class="text-center">\n' + '      <th><button class="btn pull-left" ng-click="move(-1)"><i class="icon-chevron-left"></i></button></th>\n' + '      <th colspan="{{rows[0].length - 2 + showWeekNumbers}}"><button class="btn btn-block" ng-click="toggleMode()"><strong>{{title}}</strong></button></th>\n' + '      <th><button class="btn pull-right" ng-click="move(1)"><i class="icon-chevron-right"></i></button></th>\n' + '    </tr>\n' + '    <tr class="text-center" ng-show="labels.length > 0">\n' + '      <th ng-show="showWeekNumbers">#</th>\n' + '      <th ng-repeat="label in labels">{{label}}</th>\n' + '    </tr>\n' + '  </thead>\n' + '  <tbody>\n' + '    <tr ng-repeat="row in rows">\n' + '      <td ng-show="showWeekNumbers" class="text-center"><em>{{ getWeekNumber(row) }}</em></td>\n' + '      <td ng-repeat="dt in row" class="text-center">\n' + '        <button style="width:100%;" class="btn" ng-class="{\'btn-info\': dt.isSelected}" ng-click="select(dt.date)" ng-disabled="dt.disabled"><span ng-class="{muted: ! dt.isCurrent}">{{dt.label}}</span></button>\n' + '      </td>\n' + '    </tr>\n' + '  </tbody>\n' + '</table>\n' + '');
  }
]);
angular.module('template/dialog/message.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/dialog/message.html', '<div class="modal-header">\n' + '\t<h3>{{ title }}</h3>\n' + '</div>\n' + '<div class="modal-body">\n' + '\t<p>{{ message }}</p>\n' + '</div>\n' + '<div class="modal-footer">\n' + '\t<button ng-repeat="btn in buttons" ng-click="close(btn.result)" class="btn" ng-class="btn.cssClass">{{ btn.label }}</button>\n' + '</div>\n' + '');
  }
]);
angular.module('template/modal/backdrop.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/modal/backdrop.html', '<div class="modal-backdrop"></div>');
  }
]);
angular.module('template/modal/window.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/modal/window.html', '<div class="modal in" ng-transclude></div>');
  }
]);
angular.module('template/pagination/pager.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/pagination/pager.html', '<div class="pager">\n' + '  <ul>\n' + '    <li ng-repeat="page in pages" ng-class="{disabled: page.disabled, previous: page.previous, next: page.next}"><a ng-click="selectPage(page.number)">{{page.text}}</a></li>\n' + '  </ul>\n' + '</div>\n' + '');
  }
]);
angular.module('template/pagination/pagination.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/pagination/pagination.html', '<div class="pagination"><ul>\n' + '  <li ng-repeat="page in pages" ng-class="{active: page.active, disabled: page.disabled}"><a ng-click="selectPage(page.number)">{{page.text}}</a></li>\n' + '  </ul>\n' + '</div>\n' + '');
  }
]);
angular.module('template/tooltip/tooltip-html-unsafe-popup.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/tooltip/tooltip-html-unsafe-popup.html', '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n' + '  <div class="tooltip-arrow"></div>\n' + '  <div class="tooltip-inner" ng-bind-html-unsafe="content"></div>\n' + '</div>\n' + '');
  }
]);
angular.module('template/tooltip/tooltip-popup.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/tooltip/tooltip-popup.html', '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n' + '  <div class="tooltip-arrow"></div>\n' + '  <div class="tooltip-inner" ng-bind="content"></div>\n' + '</div>\n' + '');
  }
]);
angular.module('template/popover/popover.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/popover/popover.html', '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n' + '  <div class="arrow"></div>\n' + '\n' + '  <div class="popover-inner">\n' + '      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n' + '      <div class="popover-content" ng-bind="content"></div>\n' + '  </div>\n' + '</div>\n' + '');
  }
]);
angular.module('template/progressbar/bar.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/progressbar/bar.html', '<div class="bar" ng-class=\'type && "bar-" + type\'></div>');
  }
]);
angular.module('template/progressbar/progress.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/progressbar/progress.html', '<div class="progress"><progressbar ng-repeat="bar in bars" width="bar.to" old="bar.from" animate="bar.animate" type="bar.type"></progressbar></div>');
  }
]);
angular.module('template/rating/rating.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/rating/rating.html', '<span ng-mouseleave="reset()">\n' + '\t<i ng-repeat="number in range" ng-mouseenter="enter(number)" ng-click="rate(number)" ng-class="{\'icon-star\': number <= val, \'icon-star-empty\': number > val}"></i>\n' + '</span>\n' + '');
  }
]);
angular.module('template/tabs/pane.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/tabs/pane.html', '<div class="tab-pane" ng-class="{active: selected}" ng-show="selected" ng-transclude></div>\n' + '');
  }
]);
angular.module('template/tabs/tab.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/tabs/tab.html', '<li ng-class="{active: active, disabled: disabled}">\n' + '  <a ng-click="select()" tab-heading-transclude>{{heading}}</a>\n' + '</li>\n' + '');
  }
]);
angular.module('template/tabs/tabs.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/tabs/tabs.html', '<div class="tabbable">\n' + '  <ul class="nav nav-tabs">\n' + '    <li ng-repeat="pane in panes" ng-class="{active:pane.selected}">\n' + '      <a ng-click="select(pane)">{{pane.heading}}</a>\n' + '    </li>\n' + '  </ul>\n' + '  <div class="tab-content" ng-transclude></div>\n' + '</div>\n' + '');
  }
]);
angular.module('template/tabs/tabset.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/tabs/tabset.html', '\n' + '<div class="tabbable">\n' + '  <ul class="nav {{type && \'nav-\' + type}}" ng-class="{\'nav-stacked\': vertical}" ng-transclude>\n' + '  </ul>\n' + '  <div class="tab-content">\n' + '    <div class="tab-pane" \n' + '         ng-repeat="tab in tabs" \n' + '         ng-class="{active: tab.active}"\n' + '         tab-content-transclude="tab" tt="tab">\n' + '    </div>\n' + '  </div>\n' + '</div>\n' + '');
  }
]);
angular.module('template/timepicker/timepicker.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/timepicker/timepicker.html', '<table class="form-inline">\n' + '\t<tr class="text-center">\n' + '\t\t<td><a ng-click="incrementHours()" class="btn btn-link"><i class="icon-chevron-up"></i></a></td>\n' + '\t\t<td>&nbsp;</td>\n' + '\t\t<td><a ng-click="incrementMinutes()" class="btn btn-link"><i class="icon-chevron-up"></i></a></td>\n' + '\t\t<td ng-show="showMeridian"></td>\n' + '\t</tr>\n' + '\t<tr>\n' + '\t\t<td class="control-group" ng-class="{\'error\': !validHours}"><input type="text" ng-model="hours" ng-change="updateHours()" class="span1 text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2" /></td>\n' + '\t\t<td>:</td>\n' + '\t\t<td class="control-group" ng-class="{\'error\': !validMinutes}"><input type="text" ng-model="minutes" ng-change="updateMinutes()" class="span1 text-center" ng-readonly="readonlyInput" maxlength="2"></td>\n' + '\t\t<td ng-show="showMeridian"><button ng-click="toggleMeridian()" class="btn text-center">{{meridian}}</button></td>\n' + '\t</tr>\n' + '\t<tr class="text-center">\n' + '\t\t<td><a ng-click="decrementHours()" class="btn btn-link"><i class="icon-chevron-down"></i></a></td>\n' + '\t\t<td>&nbsp;</td>\n' + '\t\t<td><a ng-click="decrementMinutes()" class="btn btn-link"><i class="icon-chevron-down"></i></a></td>\n' + '\t\t<td ng-show="showMeridian"></td>\n' + '\t</tr>\n' + '</table>');
  }
]);
angular.module('template/typeahead/typeahead.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('template/typeahead/typeahead.html', '<ul class="typeahead dropdown-menu" ng-style="{display: isOpen()&&\'block\' || \'none\', top: position.top+\'px\', left: position.left+\'px\'}">\n' + '    <li ng-repeat="match in matches" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)">\n' + '        <a tabindex="-1" ng-click="selectMatch($index)" ng-bind-html-unsafe="match.label | typeaheadHighlight:query"></a>\n' + '    </li>\n' + '</ul>');
  }
]);
(function ($) {
  function UTCDate() {
    return new Date(Date.UTC.apply(Date, arguments));
  }
  function UTCToday() {
    var today = new Date();
    return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  }
  var Datepicker = function (element, options) {
    var that = this;
    this._process_options(options);
    this.element = $(element);
    this.isInline = false;
    this.isInput = this.element.is('input');
    this.component = this.element.is('.date') ? this.element.find('.add-on, .btn') : false;
    this.hasInput = this.component && this.element.find('input').length;
    if (this.component && this.component.length === 0)
      this.component = false;
    this.picker = $(DPGlobal.template);
    this._buildEvents();
    this._attachEvents();
    if (this.isInline) {
      this.picker.addClass('datepicker-inline').appendTo(this.element);
    } else {
      this.picker.addClass('datepicker-dropdown dropdown-menu');
    }
    if (this.o.rtl) {
      this.picker.addClass('datepicker-rtl');
      this.picker.find('.prev i, .next i').toggleClass('icon-arrow-left icon-arrow-right');
    }
    this.viewMode = this.o.startView;
    if (this.o.calendarWeeks)
      this.picker.find('tfoot th.today').attr('colspan', function (i, val) {
        return parseInt(val) + 1;
      });
    this._allow_update = false;
    this.setStartDate(this.o.startDate);
    this.setEndDate(this.o.endDate);
    this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);
    this.fillDow();
    this.fillMonths();
    this._allow_update = true;
    this.update();
    this.showMode();
    if (this.isInline) {
      this.show();
    }
  };
  Datepicker.prototype = {
    constructor: Datepicker,
    _process_options: function (opts) {
      this._o = $.extend({}, this._o, opts);
      var o = this.o = $.extend({}, this._o);
      var lang = o.language;
      if (!dates[lang]) {
        lang = lang.split('-')[0];
        if (!dates[lang])
          lang = $.fn.datepicker.defaults.language;
      }
      o.language = lang;
      switch (o.startView) {
      case 2:
      case 'decade':
        o.startView = 2;
        break;
      case 1:
      case 'year':
        o.startView = 1;
        break;
      default:
        o.startView = 0;
      }
      switch (o.minViewMode) {
      case 1:
      case 'months':
        o.minViewMode = 1;
        break;
      case 2:
      case 'years':
        o.minViewMode = 2;
        break;
      default:
        o.minViewMode = 0;
      }
      o.startView = Math.max(o.startView, o.minViewMode);
      o.weekStart %= 7;
      o.weekEnd = (o.weekStart + 6) % 7;
      var format = DPGlobal.parseFormat(o.format);
      if (o.startDate !== -Infinity) {
        o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
      }
      if (o.endDate !== Infinity) {
        o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
      }
      o.daysOfWeekDisabled = o.daysOfWeekDisabled || [];
      if (!$.isArray(o.daysOfWeekDisabled))
        o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
      o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function (d) {
        return parseInt(d, 10);
      });
    },
    _events: [],
    _secondaryEvents: [],
    _applyEvents: function (evs) {
      for (var i = 0, el, ev; i < evs.length; i++) {
        el = evs[i][0];
        ev = evs[i][1];
        el.on(ev);
      }
    },
    _unapplyEvents: function (evs) {
      for (var i = 0, el, ev; i < evs.length; i++) {
        el = evs[i][0];
        ev = evs[i][1];
        el.off(ev);
      }
    },
    _buildEvents: function () {
      if (this.isInput) {
        this._events = [[
            this.element,
            {
              focus: $.proxy(this.show, this),
              keyup: $.proxy(this.update, this),
              keydown: $.proxy(this.keydown, this)
            }
          ]];
      } else if (this.component && this.hasInput) {
        this._events = [
          [
            this.element.find('input'),
            {
              focus: $.proxy(this.show, this),
              keyup: $.proxy(this.update, this),
              keydown: $.proxy(this.keydown, this)
            }
          ],
          [
            this.component,
            { click: $.proxy(this.show, this) }
          ]
        ];
      } else if (this.element.is('div')) {
        this.isInline = true;
      } else {
        this._events = [[
            this.element,
            { click: $.proxy(this.show, this) }
          ]];
      }
      this._secondaryEvents = [
        [
          this.picker,
          { click: $.proxy(this.click, this) }
        ],
        [
          $(window),
          { resize: $.proxy(this.place, this) }
        ],
        [
          $(document),
          {
            mousedown: $.proxy(function (e) {
              if (!(this.element.is(e.target) || this.element.find(e.target).size() || this.picker.is(e.target) || this.picker.find(e.target).size())) {
                this.hide();
              }
            }, this)
          }
        ]
      ];
    },
    _attachEvents: function () {
      this._detachEvents();
      this._applyEvents(this._events);
    },
    _detachEvents: function () {
      this._unapplyEvents(this._events);
    },
    _attachSecondaryEvents: function () {
      this._detachSecondaryEvents();
      this._applyEvents(this._secondaryEvents);
    },
    _detachSecondaryEvents: function () {
      this._unapplyEvents(this._secondaryEvents);
    },
    _trigger: function (event, altdate) {
      var date = altdate || this.date, local_date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      this.element.trigger({
        type: event,
        date: local_date,
        format: $.proxy(function (altformat) {
          var format = altformat || this.o.format;
          return DPGlobal.formatDate(date, format, this.o.language);
        }, this)
      });
    },
    show: function (e) {
      if (!this.isInline)
        this.picker.appendTo('body');
      this.picker.show();
      this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
      this.place();
      this._attachSecondaryEvents();
      if (e) {
        e.preventDefault();
      }
      this._trigger('show');
    },
    hide: function (e) {
      if (this.isInline)
        return;
      if (!this.picker.is(':visible'))
        return;
      this.picker.hide().detach();
      this._detachSecondaryEvents();
      this.viewMode = this.o.startView;
      this.showMode();
      if (this.o.forceParse && (this.isInput && this.element.val() || this.hasInput && this.element.find('input').val()))
        this.setValue();
      this._trigger('hide');
    },
    remove: function () {
      this.hide();
      this._detachEvents();
      this._detachSecondaryEvents();
      this.picker.remove();
      delete this.element.data().datepicker;
      if (!this.isInput) {
        delete this.element.data().date;
      }
    },
    getDate: function () {
      var d = this.getUTCDate();
      return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    },
    getUTCDate: function () {
      return this.date;
    },
    setDate: function (d) {
      this.setUTCDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000));
    },
    setUTCDate: function (d) {
      this.date = d;
      this.setValue();
    },
    setValue: function () {
      var formatted = this.getFormattedDate();
      if (!this.isInput) {
        if (this.component) {
          this.element.find('input').val(formatted);
        }
      } else {
        this.element.val(formatted);
      }
    },
    getFormattedDate: function (format) {
      if (format === undefined)
        format = this.o.format;
      return DPGlobal.formatDate(this.date, format, this.o.language);
    },
    setStartDate: function (startDate) {
      this._process_options({ startDate: startDate });
      this.update();
      this.updateNavArrows();
    },
    setEndDate: function (endDate) {
      this._process_options({ endDate: endDate });
      this.update();
      this.updateNavArrows();
    },
    setDaysOfWeekDisabled: function (daysOfWeekDisabled) {
      this._process_options({ daysOfWeekDisabled: daysOfWeekDisabled });
      this.update();
      this.updateNavArrows();
    },
    place: function () {
      if (this.isInline)
        return;
      var zIndex = parseInt(this.element.parents().filter(function () {
          return $(this).css('z-index') != 'auto';
        }).first().css('z-index')) + 10;
      var offset = this.component ? this.component.parent().offset() : this.element.offset();
      var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(true);
      this.picker.css({
        top: offset.top + height,
        left: offset.left,
        zIndex: zIndex
      });
    },
    _allow_update: true,
    update: function () {
      if (!this._allow_update)
        return;
      var date, fromArgs = false;
      if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
        date = arguments[0];
        fromArgs = true;
      } else {
        date = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
        delete this.element.data().date;
      }
      this.date = DPGlobal.parseDate(date, this.o.format, this.o.language);
      if (fromArgs)
        this.setValue();
      if (this.date < this.o.startDate) {
        this.viewDate = new Date(this.o.startDate);
      } else if (this.date > this.o.endDate) {
        this.viewDate = new Date(this.o.endDate);
      } else {
        this.viewDate = new Date(this.date);
      }
      this.fill();
    },
    fillDow: function () {
      var dowCnt = this.o.weekStart, html = '<tr>';
      if (this.o.calendarWeeks) {
        var cell = '<th class="cw">&nbsp;</th>';
        html += cell;
        this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
      }
      while (dowCnt < this.o.weekStart + 7) {
        html += '<th class="dow">' + dates[this.o.language].daysMin[dowCnt++ % 7] + '</th>';
      }
      html += '</tr>';
      this.picker.find('.datepicker-days thead').append(html);
    },
    fillMonths: function () {
      var html = '', i = 0;
      while (i < 12) {
        html += '<span class="month">' + dates[this.o.language].monthsShort[i++] + '</span>';
      }
      this.picker.find('.datepicker-months td').html(html);
    },
    setRange: function (range) {
      if (!range || !range.length)
        delete this.range;
      else
        this.range = $.map(range, function (d) {
          return d.valueOf();
        });
      this.fill();
    },
    getClassNames: function (date) {
      var cls = [], year = this.viewDate.getUTCFullYear(), month = this.viewDate.getUTCMonth(), currentDate = this.date.valueOf(), today = new Date();
      if (date.getUTCFullYear() < year || date.getUTCFullYear() == year && date.getUTCMonth() < month) {
        cls.push('old');
      } else if (date.getUTCFullYear() > year || date.getUTCFullYear() == year && date.getUTCMonth() > month) {
        cls.push('new');
      }
      if (this.o.todayHighlight && date.getUTCFullYear() == today.getFullYear() && date.getUTCMonth() == today.getMonth() && date.getUTCDate() == today.getDate()) {
        cls.push('today');
      }
      if (currentDate && date.valueOf() == currentDate) {
        cls.push('active');
      }
      if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate || $.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1) {
        cls.push('disabled');
      }
      if (this.range) {
        if (date > this.range[0] && date < this.range[this.range.length - 1]) {
          cls.push('range');
        }
        if ($.inArray(date.valueOf(), this.range) != -1) {
          cls.push('selected');
        }
      }
      return cls;
    },
    fill: function () {
      var d = new Date(this.viewDate), year = d.getUTCFullYear(), month = d.getUTCMonth(), startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity, startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity, endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity, endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity, currentDate = this.date && this.date.valueOf(), tooltip;
      this.picker.find('.datepicker-days thead th.datepicker-switch').text(dates[this.o.language].months[month] + ' ' + year);
      this.picker.find('tfoot th.today').text(dates[this.o.language].today).toggle(this.o.todayBtn !== false);
      this.picker.find('tfoot th.clear').text(dates[this.o.language].clear).toggle(this.o.clearBtn !== false);
      this.updateNavArrows();
      this.fillMonths();
      var prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0), day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
      prevMonth.setUTCDate(day);
      prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7) % 7);
      var nextMonth = new Date(prevMonth);
      nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
      nextMonth = nextMonth.valueOf();
      var html = [];
      var clsName;
      while (prevMonth.valueOf() < nextMonth) {
        if (prevMonth.getUTCDay() == this.o.weekStart) {
          html.push('<tr>');
          if (this.o.calendarWeeks) {
            var ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 86400000), th = new Date(+ws + (7 + 4 - ws.getUTCDay()) % 7 * 86400000), yth = new Date(+(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay()) % 7 * 86400000), calWeek = (th - yth) / 86400000 / 7 + 1;
            html.push('<td class="cw">' + calWeek + '</td>');
          }
        }
        clsName = this.getClassNames(prevMonth);
        clsName.push('day');
        var before = this.o.beforeShowDay(prevMonth);
        if (before === undefined)
          before = {};
        else if (typeof before === 'boolean')
          before = { enabled: before };
        else if (typeof before === 'string')
          before = { classes: before };
        if (before.enabled === false)
          clsName.push('disabled');
        if (before.classes)
          clsName = clsName.concat(before.classes.split(/\s+/));
        if (before.tooltip)
          tooltip = before.tooltip;
        clsName = $.unique(clsName);
        html.push('<td class="' + clsName.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + '>' + prevMonth.getUTCDate() + '</td>');
        if (prevMonth.getUTCDay() == this.o.weekEnd) {
          html.push('</tr>');
        }
        prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
      }
      this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
      var currentYear = this.date && this.date.getUTCFullYear();
      var months = this.picker.find('.datepicker-months').find('th:eq(1)').text(year).end().find('span').removeClass('active');
      if (currentYear && currentYear == year) {
        months.eq(this.date.getUTCMonth()).addClass('active');
      }
      if (year < startYear || year > endYear) {
        months.addClass('disabled');
      }
      if (year == startYear) {
        months.slice(0, startMonth).addClass('disabled');
      }
      if (year == endYear) {
        months.slice(endMonth + 1).addClass('disabled');
      }
      html = '';
      year = parseInt(year / 10, 10) * 10;
      var yearCont = this.picker.find('.datepicker-years').find('th:eq(1)').text(year + '-' + (year + 9)).end().find('td');
      year -= 1;
      for (var i = -1; i < 11; i++) {
        html += '<span class="year' + (i == -1 ? ' old' : i == 10 ? ' new' : '') + (currentYear == year ? ' active' : '') + (year < startYear || year > endYear ? ' disabled' : '') + '">' + year + '</span>';
        year += 1;
      }
      yearCont.html(html);
    },
    updateNavArrows: function () {
      if (!this._allow_update)
        return;
      var d = new Date(this.viewDate), year = d.getUTCFullYear(), month = d.getUTCMonth();
      switch (this.viewMode) {
      case 0:
        if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
          this.picker.find('.prev').css({ visibility: 'hidden' });
        } else {
          this.picker.find('.prev').css({ visibility: 'visible' });
        }
        if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
          this.picker.find('.next').css({ visibility: 'hidden' });
        } else {
          this.picker.find('.next').css({ visibility: 'visible' });
        }
        break;
      case 1:
      case 2:
        if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()) {
          this.picker.find('.prev').css({ visibility: 'hidden' });
        } else {
          this.picker.find('.prev').css({ visibility: 'visible' });
        }
        if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()) {
          this.picker.find('.next').css({ visibility: 'hidden' });
        } else {
          this.picker.find('.next').css({ visibility: 'visible' });
        }
        break;
      }
    },
    click: function (e) {
      e.preventDefault();
      var target = $(e.target).closest('span, td, th');
      if (target.length == 1) {
        switch (target[0].nodeName.toLowerCase()) {
        case 'th':
          switch (target[0].className) {
          case 'datepicker-switch':
            this.showMode(1);
            break;
          case 'prev':
          case 'next':
            var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1);
            switch (this.viewMode) {
            case 0:
              this.viewDate = this.moveMonth(this.viewDate, dir);
              break;
            case 1:
            case 2:
              this.viewDate = this.moveYear(this.viewDate, dir);
              break;
            }
            this.fill();
            break;
          case 'today':
            var date = new Date();
            date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            this.showMode(-2);
            var which = this.o.todayBtn == 'linked' ? null : 'view';
            this._setDate(date, which);
            break;
          case 'clear':
            var element;
            if (this.isInput)
              element = this.element;
            else if (this.component)
              element = this.element.find('input');
            if (element)
              element.val('').change();
            this._trigger('changeDate');
            this.update();
            if (this.o.autoclose)
              this.hide();
            break;
          }
          break;
        case 'span':
          if (!target.is('.disabled')) {
            this.viewDate.setUTCDate(1);
            if (target.is('.month')) {
              var day = 1;
              var month = target.parent().find('span').index(target);
              var year = this.viewDate.getUTCFullYear();
              this.viewDate.setUTCMonth(month);
              this._trigger('changeMonth', this.viewDate);
              if (this.o.minViewMode === 1) {
                this._setDate(UTCDate(year, month, day, 0, 0, 0, 0));
              }
            } else {
              var year = parseInt(target.text(), 10) || 0;
              var day = 1;
              var month = 0;
              this.viewDate.setUTCFullYear(year);
              this._trigger('changeYear', this.viewDate);
              if (this.o.minViewMode === 2) {
                this._setDate(UTCDate(year, month, day, 0, 0, 0, 0));
              }
            }
            this.showMode(-1);
            this.fill();
          }
          break;
        case 'td':
          if (target.is('.day') && !target.is('.disabled')) {
            var day = parseInt(target.text(), 10) || 1;
            var year = this.viewDate.getUTCFullYear(), month = this.viewDate.getUTCMonth();
            if (target.is('.old')) {
              if (month === 0) {
                month = 11;
                year -= 1;
              } else {
                month -= 1;
              }
            } else if (target.is('.new')) {
              if (month == 11) {
                month = 0;
                year += 1;
              } else {
                month += 1;
              }
            }
            this._setDate(UTCDate(year, month, day, 0, 0, 0, 0));
          }
          break;
        }
      }
    },
    _setDate: function (date, which) {
      if (!which || which == 'date')
        this.date = new Date(date);
      if (!which || which == 'view')
        this.viewDate = new Date(date);
      this.fill();
      this.setValue();
      this._trigger('changeDate');
      var element;
      if (this.isInput) {
        element = this.element;
      } else if (this.component) {
        element = this.element.find('input');
      }
      if (element) {
        element.change();
        if (this.o.autoclose && (!which || which == 'date')) {
          this.hide();
        }
      }
    },
    moveMonth: function (date, dir) {
      if (!dir)
        return date;
      var new_date = new Date(date.valueOf()), day = new_date.getUTCDate(), month = new_date.getUTCMonth(), mag = Math.abs(dir), new_month, test;
      dir = dir > 0 ? 1 : -1;
      if (mag == 1) {
        test = dir == -1 ? function () {
          return new_date.getUTCMonth() == month;
        } : function () {
          return new_date.getUTCMonth() != new_month;
        };
        new_month = month + dir;
        new_date.setUTCMonth(new_month);
        if (new_month < 0 || new_month > 11)
          new_month = (new_month + 12) % 12;
      } else {
        for (var i = 0; i < mag; i++)
          new_date = this.moveMonth(new_date, dir);
        new_month = new_date.getUTCMonth();
        new_date.setUTCDate(day);
        test = function () {
          return new_month != new_date.getUTCMonth();
        };
      }
      while (test()) {
        new_date.setUTCDate(--day);
        new_date.setUTCMonth(new_month);
      }
      return new_date;
    },
    moveYear: function (date, dir) {
      return this.moveMonth(date, dir * 12);
    },
    dateWithinRange: function (date) {
      return date >= this.o.startDate && date <= this.o.endDate;
    },
    keydown: function (e) {
      if (this.picker.is(':not(:visible)')) {
        if (e.keyCode == 27)
          this.show();
        return;
      }
      var dateChanged = false, dir, day, month, newDate, newViewDate;
      switch (e.keyCode) {
      case 27:
        this.hide();
        e.preventDefault();
        break;
      case 37:
      case 39:
        if (!this.o.keyboardNavigation)
          break;
        dir = e.keyCode == 37 ? -1 : 1;
        if (e.ctrlKey) {
          newDate = this.moveYear(this.date, dir);
          newViewDate = this.moveYear(this.viewDate, dir);
        } else if (e.shiftKey) {
          newDate = this.moveMonth(this.date, dir);
          newViewDate = this.moveMonth(this.viewDate, dir);
        } else {
          newDate = new Date(this.date);
          newDate.setUTCDate(this.date.getUTCDate() + dir);
          newViewDate = new Date(this.viewDate);
          newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir);
        }
        if (this.dateWithinRange(newDate)) {
          this.date = newDate;
          this.viewDate = newViewDate;
          this.setValue();
          this.update();
          e.preventDefault();
          dateChanged = true;
        }
        break;
      case 38:
      case 40:
        if (!this.o.keyboardNavigation)
          break;
        dir = e.keyCode == 38 ? -1 : 1;
        if (e.ctrlKey) {
          newDate = this.moveYear(this.date, dir);
          newViewDate = this.moveYear(this.viewDate, dir);
        } else if (e.shiftKey) {
          newDate = this.moveMonth(this.date, dir);
          newViewDate = this.moveMonth(this.viewDate, dir);
        } else {
          newDate = new Date(this.date);
          newDate.setUTCDate(this.date.getUTCDate() + dir * 7);
          newViewDate = new Date(this.viewDate);
          newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir * 7);
        }
        if (this.dateWithinRange(newDate)) {
          this.date = newDate;
          this.viewDate = newViewDate;
          this.setValue();
          this.update();
          e.preventDefault();
          dateChanged = true;
        }
        break;
      case 13:
        this.hide();
        e.preventDefault();
        break;
      case 9:
        this.hide();
        break;
      }
      if (dateChanged) {
        this._trigger('changeDate');
        var element;
        if (this.isInput) {
          element = this.element;
        } else if (this.component) {
          element = this.element.find('input');
        }
        if (element) {
          element.change();
        }
      }
    },
    showMode: function (dir) {
      if (dir) {
        this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
      }
      this.picker.find('>div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
      this.updateNavArrows();
    }
  };
  var DateRangePicker = function (element, options) {
    this.element = $(element);
    this.inputs = $.map(options.inputs, function (i) {
      return i.jquery ? i[0] : i;
    });
    delete options.inputs;
    $(this.inputs).datepicker(options).bind('changeDate', $.proxy(this.dateUpdated, this));
    this.pickers = $.map(this.inputs, function (i) {
      return $(i).data('datepicker');
    });
    this.updateDates();
  };
  DateRangePicker.prototype = {
    updateDates: function () {
      this.dates = $.map(this.pickers, function (i) {
        return i.date;
      });
      this.updateRanges();
    },
    updateRanges: function () {
      var range = $.map(this.dates, function (d) {
          return d.valueOf();
        });
      $.each(this.pickers, function (i, p) {
        p.setRange(range);
      });
    },
    dateUpdated: function (e) {
      var dp = $(e.target).data('datepicker'), new_date = dp.getUTCDate(), i = $.inArray(e.target, this.inputs), l = this.inputs.length;
      if (i == -1)
        return;
      if (new_date < this.dates[i]) {
        while (i >= 0 && new_date < this.dates[i]) {
          this.pickers[i--].setUTCDate(new_date);
        }
      } else if (new_date > this.dates[i]) {
        while (i < l && new_date > this.dates[i]) {
          this.pickers[i++].setUTCDate(new_date);
        }
      }
      this.updateDates();
    },
    remove: function () {
      $.map(this.pickers, function (p) {
        p.remove();
      });
      delete this.element.data().datepicker;
    }
  };
  function opts_from_el(el, prefix) {
    var data = $(el).data(), out = {}, inkey, replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])'), prefix = new RegExp('^' + prefix.toLowerCase());
    for (var key in data)
      if (prefix.test(key)) {
        inkey = key.replace(replace, function (_, a) {
          return a.toLowerCase();
        });
        out[inkey] = data[key];
      }
    return out;
  }
  function opts_from_locale(lang) {
    var out = {};
    if (!dates[lang]) {
      lang = lang.split('-')[0];
      if (!dates[lang])
        return;
    }
    var d = dates[lang];
    $.each($.fn.datepicker.locale_opts, function (i, k) {
      if (k in d)
        out[k] = d[k];
    });
    return out;
  }
  var old = $.fn.datepicker;
  $.fn.datepicker = function (option) {
    var args = Array.apply(null, arguments);
    args.shift();
    var internal_return, this_return;
    this.each(function () {
      var $this = $(this), data = $this.data('datepicker'), options = typeof option == 'object' && option;
      if (!data) {
        var elopts = opts_from_el(this, 'date'), xopts = $.extend({}, $.fn.datepicker.defaults, elopts, options), locopts = opts_from_locale(xopts.language), opts = $.extend({}, $.fn.datepicker.defaults, locopts, elopts, options);
        if ($this.is('.input-daterange') || opts.inputs) {
          var ropts = { inputs: opts.inputs || $this.find('input').toArray() };
          $this.data('datepicker', data = new DateRangePicker(this, $.extend(opts, ropts)));
        } else {
          $this.data('datepicker', data = new Datepicker(this, opts));
        }
      }
      if (typeof option == 'string' && typeof data[option] == 'function') {
        internal_return = data[option].apply(data, args);
        if (internal_return !== undefined)
          return false;
      }
    });
    if (internal_return !== undefined)
      return internal_return;
    else
      return this;
  };
  $.fn.datepicker.defaults = {
    autoclose: false,
    beforeShowDay: $.noop,
    calendarWeeks: false,
    clearBtn: false,
    daysOfWeekDisabled: [],
    endDate: Infinity,
    forceParse: true,
    format: 'mm/dd/yyyy',
    keyboardNavigation: true,
    language: 'en',
    minViewMode: 0,
    rtl: false,
    startDate: -Infinity,
    startView: 0,
    todayBtn: false,
    todayHighlight: false,
    weekStart: 0
  };
  $.fn.datepicker.locale_opts = [
    'format',
    'rtl',
    'weekStart'
  ];
  $.fn.datepicker.Constructor = Datepicker;
  var dates = $.fn.datepicker.dates = {
      en: {
        days: [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        daysShort: [
          'Sun',
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
          'Sun'
        ],
        daysMin: [
          'Su',
          'Mo',
          'Tu',
          'We',
          'Th',
          'Fr',
          'Sa',
          'Su'
        ],
        months: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ],
        monthsShort: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ],
        today: 'Today',
        clear: 'Clear'
      }
    };
  var DPGlobal = {
      modes: [
        {
          clsName: 'days',
          navFnc: 'Month',
          navStep: 1
        },
        {
          clsName: 'months',
          navFnc: 'FullYear',
          navStep: 1
        },
        {
          clsName: 'years',
          navFnc: 'FullYear',
          navStep: 10
        }
      ],
      isLeapYear: function (year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      },
      getDaysInMonth: function (year, month) {
        return [
          31,
          DPGlobal.isLeapYear(year) ? 29 : 28,
          31,
          30,
          31,
          30,
          31,
          31,
          30,
          31,
          30,
          31
        ][month];
      },
      validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
      nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
      parseFormat: function (format) {
        var separators = format.replace(this.validParts, '\0').split('\0'), parts = format.match(this.validParts);
        if (!separators || !separators.length || !parts || parts.length === 0) {
          throw new Error('Invalid date format.');
        }
        return {
          separators: separators,
          parts: parts
        };
      },
      parseDate: function (date, format, language) {
        if (date instanceof Date)
          return date;
        if (typeof format === 'string')
          format = DPGlobal.parseFormat(format);
        if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
          var part_re = /([\-+]\d+)([dmwy])/, parts = date.match(/([\-+]\d+)([dmwy])/g), part, dir;
          date = new Date();
          for (var i = 0; i < parts.length; i++) {
            part = part_re.exec(parts[i]);
            dir = parseInt(part[1]);
            switch (part[2]) {
            case 'd':
              date.setUTCDate(date.getUTCDate() + dir);
              break;
            case 'm':
              date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
              break;
            case 'w':
              date.setUTCDate(date.getUTCDate() + dir * 7);
              break;
            case 'y':
              date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
              break;
            }
          }
          return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
        }
        var parts = date && date.match(this.nonpunctuation) || [], date = new Date(), parsed = {}, setters_order = [
            'yyyy',
            'yy',
            'M',
            'MM',
            'm',
            'mm',
            'd',
            'dd'
          ], setters_map = {
            yyyy: function (d, v) {
              return d.setUTCFullYear(v);
            },
            yy: function (d, v) {
              return d.setUTCFullYear(2000 + v);
            },
            m: function (d, v) {
              v -= 1;
              while (v < 0)
                v += 12;
              v %= 12;
              d.setUTCMonth(v);
              while (d.getUTCMonth() != v)
                d.setUTCDate(d.getUTCDate() - 1);
              return d;
            },
            d: function (d, v) {
              return d.setUTCDate(v);
            }
          }, val, filtered, part;
        setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
        setters_map['dd'] = setters_map['d'];
        date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        var fparts = format.parts.slice();
        if (parts.length != fparts.length) {
          fparts = $(fparts).filter(function (i, p) {
            return $.inArray(p, setters_order) !== -1;
          }).toArray();
        }
        if (parts.length == fparts.length) {
          for (var i = 0, cnt = fparts.length; i < cnt; i++) {
            val = parseInt(parts[i], 10);
            part = fparts[i];
            if (isNaN(val)) {
              switch (part) {
              case 'MM':
                filtered = $(dates[language].months).filter(function () {
                  var m = this.slice(0, parts[i].length), p = parts[i].slice(0, m.length);
                  return m == p;
                });
                val = $.inArray(filtered[0], dates[language].months) + 1;
                break;
              case 'M':
                filtered = $(dates[language].monthsShort).filter(function () {
                  var m = this.slice(0, parts[i].length), p = parts[i].slice(0, m.length);
                  return m == p;
                });
                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                break;
              }
            }
            parsed[part] = val;
          }
          for (var i = 0, s; i < setters_order.length; i++) {
            s = setters_order[i];
            if (s in parsed && !isNaN(parsed[s]))
              setters_map[s](date, parsed[s]);
          }
        }
        return date;
      },
      formatDate: function (date, format, language) {
        if (typeof format === 'string')
          format = DPGlobal.parseFormat(format);
        var val = {
            d: date.getUTCDate(),
            D: dates[language].daysShort[date.getUTCDay()],
            DD: dates[language].days[date.getUTCDay()],
            m: date.getUTCMonth() + 1,
            M: dates[language].monthsShort[date.getUTCMonth()],
            MM: dates[language].months[date.getUTCMonth()],
            yy: date.getUTCFullYear().toString().substring(2),
            yyyy: date.getUTCFullYear()
          };
        val.dd = (val.d < 10 ? '0' : '') + val.d;
        val.mm = (val.m < 10 ? '0' : '') + val.m;
        var date = [], seps = $.extend([], format.separators);
        for (var i = 0, cnt = format.parts.length; i <= cnt; i++) {
          if (seps.length)
            date.push(seps.shift());
          date.push(val[format.parts[i]]);
        }
        return date.join('');
      },
      headTemplate: '<thead>' + '<tr>' + '<th class="prev"><i class="icon-arrow-left"/></th>' + '<th colspan="5" class="datepicker-switch"></th>' + '<th class="next"><i class="icon-arrow-right"/></th>' + '</tr>' + '</thead>',
      contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
      footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr><tr><th colspan="7" class="clear"></th></tr></tfoot>'
    };
  DPGlobal.template = '<div class="datepicker">' + '<div class="datepicker-days">' + '<table class=" table-condensed">' + DPGlobal.headTemplate + '<tbody></tbody>' + DPGlobal.footTemplate + '</table>' + '</div>' + '<div class="datepicker-months">' + '<table class="table-condensed">' + DPGlobal.headTemplate + DPGlobal.contTemplate + DPGlobal.footTemplate + '</table>' + '</div>' + '<div class="datepicker-years">' + '<table class="table-condensed">' + DPGlobal.headTemplate + DPGlobal.contTemplate + DPGlobal.footTemplate + '</table>' + '</div>' + '</div>';
  $.fn.datepicker.DPGlobal = DPGlobal;
  $.fn.datepicker.noConflict = function () {
    $.fn.datepicker = old;
    return this;
  };
  $(document).on('focus.datepicker.data-api click.datepicker.data-api', '[data-provide="datepicker"]', function (e) {
    var $this = $(this);
    if ($this.data('datepicker'))
      return;
    e.preventDefault();
    $this.datepicker('show');
  });
  $(function () {
    $('[data-provide="datepicker-inline"]').datepicker();
  });
}(window.jQuery));