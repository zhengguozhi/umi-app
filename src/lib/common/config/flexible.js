/* eslint-disable */
(function (win, lib) {
  var doc = win.document
  var docEl = doc.documentElement
  var metaEl = doc.querySelector('meta[name="viewport"]')
  var flexibleEl = doc.querySelector('meta[name="flexible"]')
  var dpr = 0
  var scale = 0
  var tid
  var flexible = lib.flexible || (lib.flexible = {})
  var maxView = 0;
  var radio = 1
  var isChecked = false
  // var realfz = 0
  if (metaEl) {
    // console.warn('将根据已有的meta标签来设置缩放比例');
    var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/)
    /**
     * 修正 大屏显示突兀问题
     * 添加maxView属性  只需在meta[name="viewport"] 的content内添加max-view 值；最大屏幕适配尺寸
     */
    var max_view = metaEl.getAttribute('content').match(/max\-view=([\d\.]+)/)
    if (match) {
      scale = parseFloat(match[1])
      dpr = parseInt(1 / scale)
    }
    if (max_view) {
      maxView = max_view[1]
    }
  } else if (flexibleEl) {
    var content = flexibleEl.getAttribute('content')
    if (content) {
      var initialDpr = content.match(/initial\-dpr=([\d\.]+)/)
      var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/)
      if (initialDpr) {
        dpr = parseFloat(initialDpr[1])
        scale = parseFloat((1 / dpr).toFixed(2))
      }
      if (maximumDpr) {
        dpr = parseFloat(maximumDpr[1])
        scale = parseFloat((1 / dpr).toFixed(2))
      }
    }
  }

  if (!dpr && !scale) {
    // var isAndroid = win.navigator.appVersion.match(/android/gi)
    var isIPhone = win.navigator.appVersion.match(/iphone/gi)
    var devicePixelRatio = win.devicePixelRatio
    if (isIPhone) {
      // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
      if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
        dpr = 3
      } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
        dpr = 2
      } else {
        dpr = 1
      }
    } else {
      // 其他设备下，仍旧使用1倍的方案
      dpr = 1
    }
    scale = 1 / dpr
  }

  docEl.setAttribute('data-dpr', dpr)
  if (!metaEl) {
    metaEl = doc.createElement('meta')
    metaEl.setAttribute('name', 'viewport')
    metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no')
    if (docEl.firstElementChild) {
      docEl.firstElementChild.appendChild(metaEl)
    } else {
      var wrap = doc.createElement('div')
      wrap.appendChild(metaEl)
      doc.write(wrap.innerHTML)
    }
  }

  function refreshRem () {
    var width = docEl.getBoundingClientRect().width
    var maxWidth = width
    /**
     * 修正 大屏显示突兀问题
     * 添加maxView属性 
     */
    if (maxView) {
      maxWidth = width > maxView ? maxView : width;
    } else {
      console.log('refreshRem---', width, dpr, width / dpr, maxView)
      if (width / dpr > 768) {
        maxWidth = 768 * dpr
      }
    }
    var rem = ~~(maxWidth / 10 * 10000) / 10000
    flexible.rem = win.rem = rem
    docEl.style.fontSize = rem * radio + 'px'
    resetValueRem()
  }
  function resetValueRem () {
    // 针对非正常字号处理
    if (!isChecked) {
      isChecked = true
      setTimeout(() => {
        var realfz = ~~(+window.getComputedStyle(document.getElementsByTagName("html")[0]).fontSize.replace('px', '') * 10000) / 10000
        if (rem !== realfz) {
          radio = rem / realfz
          docEl.style.fontSize = rem * radio + 'px'
          console.log(radio, realfz, rem)
        }
        // isChecked = true
      }, 100)
    }
  }
  win.addEventListener('resize', function () {
    clearTimeout(tid)
    tid = setTimeout(refreshRem, 300)
  }, false)
  win.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      clearTimeout(tid)
      tid = setTimeout(refreshRem, 300)
    }
  }, false)
  if (doc.body) {
    doc.body.style.fontSize = 12 * dpr + 'px'
  }
  if (doc.readyState === 'complete') {
    doc.body.style.fontSize = 12 * dpr + 'px'
  } else {
    doc.addEventListener('DOMContentLoaded', function (e) {
      doc.body.style.fontSize = 12 * dpr + 'px'
    }, false)
  }

  refreshRem()

  flexible.dpr = win.dpr = dpr
  flexible.refreshRem = refreshRem
  flexible.rem2px = function (d) {
    var val = parseFloat(d) * this.rem
    if (typeof d === 'string' && d.match(/rem$/)) {
      val += 'px'
    }
    return val
  }
  flexible.px2rem = function (d) {
    var val = parseFloat(d) / this.rem
    if (typeof d === 'string' && d.match(/px$/)) {
      val += 'rem'
    }
    return val
  }
})(window, window['lib'] || (window['lib'] = {}))
// 载入公共代码的地方
// require('./index')
